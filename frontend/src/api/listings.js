import { apiClient } from "./client";

export async function fetchListings(flaggedOnly) {
  const response = await apiClient.get("/listings", {
    params: { flagged_only: flaggedOnly },
  });
  return response.data;
}
