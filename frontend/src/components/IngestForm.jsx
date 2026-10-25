import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ingestListing } from "../api/ingest";

export function IngestForm() {
  const [platform, setPlatform] = useState("");
  const [productName, setProductName] = useState("");
  const [mode, setMode] = useState("file"); // "file" | "url"
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const queryClient = useQueryClient();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (mode === "file" && !file) {
      setError("Choose an image file.");
      return;
    }
    if (mode === "url" && !imageUrl.trim()) {
      setError("Enter an image URL.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("platform", platform);
      formData.append("product_name", productName);
      if (mode === "file") {
        formData.append("file", file);
      } else {
        formData.append("image_url", imageUrl.trim());
      }

      const data = await ingestListing(formData);
      setResult(data);
      setPlatform("");
      setProductName("");
      setFile(null);
      setImageUrl("");
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["trends"] });
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Ingest failed.");
    } finally {
      setSubmitting(false);
    }
  }

  const missingFields = result
    ? Object.entries(result.results)
        .filter(([, r]) => !r.present)
        .map(([field]) => field)
    : [];

  return (
    <form className="ingest-form" onSubmit={handleSubmit}>
      <div className="ingest-row">
        <label>
          Platform
          <input
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            placeholder="Amazon, Flipkart, ..."
            required
          />
        </label>
        <label>
          Product name
          <input
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
          />
        </label>
      </div>

      <div className="ingest-mode-toggle">
        <label>
          <input
            type="radio"
            name="ingest-mode"
            checked={mode === "file"}
            onChange={() => setMode("file")}
          />
          Upload image
        </label>
        <label>
          <input
            type="radio"
            name="ingest-mode"
            checked={mode === "url"}
            onChange={() => setMode("url")}
          />
          Image URL
        </label>
      </div>

      {mode === "file" ? (
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      ) : (
        <input
          type="url"
          placeholder="https://example.com/label.jpg"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
      )}

      {error && <p className="error">{error}</p>}
      {result && (
        <p className="ingest-success">
          Ingested as listing #{result.listing_id}.{" "}
          {missingFields.length
            ? `Missing: ${missingFields.join(", ")}`
            : "All Rule 6 fields present."}
        </p>
      )}

      <button type="submit" disabled={submitting}>
        {submitting ? "Processing (OCR takes a few seconds)..." : "Ingest"}
      </button>
    </form>
  );
}
