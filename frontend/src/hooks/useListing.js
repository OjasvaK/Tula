import { useQuery } from "@tanstack/react-query";
import { fetchListing } from "../api/listings";

export function useListing(id) {
  return useQuery({
    queryKey: ["listing", id],
    queryFn: () => fetchListing(id),
    enabled: id != null,
    retry: false,
  });
}
