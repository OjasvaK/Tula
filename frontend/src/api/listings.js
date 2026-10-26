import { apiClient } from "./client";

function cleanParams(params = {}) {
  const out = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "" && v !== false) out[k] = v;
  }
  return out;
}

export async function fetchListings(params = {}) {
  const response = await apiClient.get("/listings", { params: cleanParams(params) });
  return response.data;
}

export async function fetchListing(id) {
  const response = await apiClient.get(`/listings/${id}`);
  return response.data;
}

export async function deleteListing(id) {
  await apiClient.delete(`/listings/${id}`);
}

export async function fetchListingImageBlob(id) {
  const response = await apiClient.get(`/listings/${id}/image`, {
    responseType: "blob",
  });
  return response.data;
}

export async function downloadListingsCsv(params = {}) {
  const response = await apiClient.get("/listings/export.csv", {
    params: cleanParams(params),
    responseType: "blob",
  });
  const url = URL.createObjectURL(response.data);
  const a = document.createElement("a");
  a.href = url;
  a.download = "listings.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
