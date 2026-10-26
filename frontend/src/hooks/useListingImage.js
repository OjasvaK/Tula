import { useEffect, useState } from "react";
import { fetchListingImageBlob } from "../api/listings";

/** Fetches a listing's label image (auth-protected) and returns an object URL,
 *  revoking it on unmount / id change. */
export function useListingImage(id) {
  const [state, setState] = useState({ url: null, loading: true, error: null });

  useEffect(() => {
    if (id == null) return undefined;
    let objectUrl;
    let cancelled = false;
    setState({ url: null, loading: true, error: null });

    fetchListingImageBlob(id)
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setState({ url: objectUrl, loading: false, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState({ url: null, loading: false, error });
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [id]);

  return state;
}
