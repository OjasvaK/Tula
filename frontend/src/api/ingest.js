import { apiClient } from "./client";

export async function ingestListing(formData) {
  const response = await apiClient.post("/ingest", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}
