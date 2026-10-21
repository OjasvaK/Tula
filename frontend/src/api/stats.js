import { apiClient } from "./client";

export async function fetchTrends() {
  const response = await apiClient.get("/stats/trends");
  return response.data;
}
