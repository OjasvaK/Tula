import { apiClient } from "./client";

export async function fetchTrends() {
  const response = await apiClient.get("/stats/trends");
  return response.data; // { field: count }
}

export async function fetchSummary() {
  const response = await apiClient.get("/stats/summary");
  return response.data;
}
