import { apiClient } from "./client";

export async function fetchRules() {
  const response = await apiClient.get("/rules");
  return response.data; // [{ field, description, legal_reference }]
}
