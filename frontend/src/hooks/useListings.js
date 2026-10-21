import { useQuery } from "@tanstack/react-query";
import { fetchListings } from "../api/listings";

export function useListings(flaggedOnly) {
  return useQuery({
    queryKey: ["listings", flaggedOnly],
    queryFn: () => fetchListings(flaggedOnly),
  });
}
