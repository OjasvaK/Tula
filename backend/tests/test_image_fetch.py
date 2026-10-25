import asyncio

import pytest

from app.image_fetch import ImageFetchError, fetch_image_bytes


def _run(coro):
    return asyncio.run(coro)


def test_rejects_non_http_scheme():
    with pytest.raises(ImageFetchError):
        _run(fetch_image_bytes("ftp://example.com/image.jpg"))


def test_rejects_loopback_url():
    with pytest.raises(ImageFetchError):
        _run(fetch_image_bytes("http://127.0.0.1/image.jpg"))


def test_rejects_cloud_metadata_url():
    # 169.254.169.254 is the cloud-provider instance-metadata address on
    # AWS/GCP/DigitalOcean/etc - the classic SSRF target.
    with pytest.raises(ImageFetchError):
        _run(fetch_image_bytes("http://169.254.169.254/latest/meta-data/"))


def test_rejects_private_lan_url():
    with pytest.raises(ImageFetchError):
        _run(fetch_image_bytes("http://192.168.1.1/image.jpg"))


def test_rejects_unresolvable_host():
    with pytest.raises(ImageFetchError):
        _run(fetch_image_bytes("http://this-host-does-not-exist.invalid/image.jpg"))
