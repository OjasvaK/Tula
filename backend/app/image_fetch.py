import ipaddress
import socket
from urllib.parse import urlparse

import httpx

MAX_IMAGE_BYTES = 10 * 1024 * 1024  # 10 MB
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif", "image/bmp"}


class ImageFetchError(ValueError):
    """A user-facing reason an image URL could not be fetched."""


def _is_unsafe_host(hostname: str) -> bool:
    # Resolve before connecting and block private/loopback/link-local/reserved
    # ranges - this is the app's only outbound-fetch-from-a-user-supplied-URL
    # path, so it's the one place an SSRF attempt (e.g. a URL pointing at
    # 169.254.169.254, a cloud metadata endpoint, or an internal service on
    # localhost) would land once this is deployed on the internet.
    try:
        infos = socket.getaddrinfo(hostname, None)
    except socket.gaierror:
        return True
    for info in infos:
        ip = ipaddress.ip_address(info[4][0])
        # Deliberately not using ip.is_reserved: it also flags things like
        # the NAT64 well-known prefix (64:ff9b::/96), which a resolver can
        # legitimately synthesize for a perfectly public IPv4 host on an
        # IPv6-only network - that's not an SSRF target, just a routable
        # public address in another form.
        if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_multicast or ip.is_unspecified:
            return True
    return False


async def fetch_image_bytes(url: str) -> bytes:
    """Download an image from a user-supplied URL, with SSRF and
    size/content-type guards. Raises ImageFetchError with a user-facing
    message on any rejection."""
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https"):
        raise ImageFetchError("Only http:// and https:// URLs are supported.")
    if not parsed.hostname or _is_unsafe_host(parsed.hostname):
        raise ImageFetchError(
            "This URL points to a private, local, or unresolvable address and can't be fetched."
        )

    try:
        # Redirects are not followed automatically: a redirect could point
        # at a private address even when the original URL didn't
        # (DNS-rebinding-style bypass of the check above).
        async with httpx.AsyncClient(follow_redirects=False, timeout=10.0) as client:
            async with client.stream("GET", url) as response:
                if response.has_redirect_location:
                    raise ImageFetchError(
                        "This URL redirects elsewhere - please provide a direct image link."
                    )
                response.raise_for_status()

                content_type = (
                    response.headers.get("content-type", "").split(";")[0].strip().lower()
                )
                if content_type not in ALLOWED_CONTENT_TYPES:
                    raise ImageFetchError(
                        f"That URL didn't return an image (content-type: {content_type or 'unknown'})."
                    )

                chunks = bytearray()
                async for chunk in response.aiter_bytes():
                    chunks.extend(chunk)
                    if len(chunks) > MAX_IMAGE_BYTES:
                        raise ImageFetchError("Image exceeds the 10 MB size limit.")
                return bytes(chunks)
    except httpx.HTTPError as e:
        raise ImageFetchError(f"Could not fetch that URL: {e}") from e
