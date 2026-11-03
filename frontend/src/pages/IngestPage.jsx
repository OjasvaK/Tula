import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Upload, Link2, ImageUp, X, ArrowRight } from "lucide-react";
import { ingestListing } from "../api/ingest";
import { useSummary } from "../hooks/useSummary";
import { useListing } from "../hooks/useListing";
import { useToast } from "../context/ToastContext";
import { errorMessage } from "../api/client";
import { PageHeader } from "../components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Field } from "../components/ui/Field";
import { SegmentedControl } from "../components/ui/SegmentedControl";
import { StatusBadge } from "../components/ui/Badge";
import { DeclarationSheet, ingestResultsToRows } from "../components/FieldChecklist";
import { DECLARATIONS } from "../lib/rules";
import { cn } from "../lib/cn";

const STAGES = ["Uploading the image", "Reading the label (OCR)", "Checking the six declarations"];

export function IngestPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const summary = useSummary();
  const fileInputRef = useRef(null);

  const [platform, setPlatform] = useState("");
  const [productName, setProductName] = useState("");
  const [mode, setMode] = useState("file");
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const knownPlatforms = (summary.data?.platforms || []).map((p) => p.platform);

  function pickFile(f) {
    if (f && f.type.startsWith("image/")) {
      setFile(f);
      setError(null);
    } else if (f) {
      setError("That file is not an image. Choose a PNG or JPG photo of the label.");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (mode === "file" && !file) return setError("Choose a photo of the label first.");
    if (mode === "url" && !imageUrl.trim()) return setError("Enter the address of the label image.");

    setSubmitting(true);
    setStage(0);
    const tick = setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), 900);

    try {
      const formData = new FormData();
      formData.append("platform", platform);
      formData.append("product_name", productName);
      if (mode === "file") formData.append("file", file);
      else formData.append("image_url", imageUrl.trim());

      const data = await ingestListing(formData);
      setResult({ ...data, product_name: productName });
      toast.success(`Checked. Saved as listing #${data.listing_id}.`);
      setPlatform("");
      setProductName("");
      setFile(null);
      setImageUrl("");
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["trends"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    } catch (err) {
      setError(errorMessage(err, "The check failed. Is the API running?"));
    } finally {
      clearInterval(tick);
      setSubmitting(false);
    }
  }

  const record = useListing(result ? result.listing_id : null);
  const rows = result ? ingestResultsToRows(result.results) : [];
  const missingCount = rows.filter((r) => !r.present).length;

  return (
    <div>
      <PageHeader
        title="Check a label"
        description="Supply a photo of a packaged-goods label. The check reads it and issues a sheet of six declarations."
      />

      <div className="grid items-start gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-5">
          <CardHeader title="New check" />
          <CardBody>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              <Field label="Platform" hint="Where the listing is sold.">
                <Input
                  list="known-platforms"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  placeholder="Amazon, Flipkart, …"
                  required
                />
              </Field>
              <datalist id="known-platforms">
                {knownPlatforms.map((p) => <option key={p} value={p} />)}
              </datalist>
              <Field label="Product name">
                <Input
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Siddh Mahakal Bura, 1 kg"
                  required
                />
              </Field>

              <SegmentedControl
                label="Image source"
                value={mode}
                onChange={setMode}
                options={[
                  { value: "file", label: "Upload a photo", icon: Upload },
                  { value: "url", label: "Image address", icon: Link2 },
                ]}
              />

              {mode === "file" ? (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    tabIndex={-1}
                    aria-hidden="true"
                    onChange={(e) => pickFile(e.target.files?.[0])}
                  />
                  {file ? (
                    <div className="flex items-center gap-4 rounded-[8px] border border-border bg-raised p-3">
                      {preview && <img src={preview} alt="" className="size-16 rounded-[4px] object-cover" />}
                      <div className="min-w-0 flex-1">
                        <p className="m-0 truncate text-[15px] font-medium text-ink">{file.name}</p>
                        <p className="m-0 text-[13px] text-muted tabular">{(file.size / 1024).toFixed(0)} KB</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="press flex size-8 items-center justify-center rounded-[6px] text-faint hover:bg-active hover:text-ink"
                        aria-label="Remove the chosen photo"
                      >
                        <X className="size-4" strokeWidth={1.6} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragging(true);
                      }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragging(false);
                        pickFile(e.dataTransfer.files?.[0]);
                      }}
                      className={cn(
                        "press flex w-full flex-col items-center gap-2 rounded-[8px] border-2 border-dashed px-6 py-10 text-center",
                        dragging ? "border-blue bg-blue-soft" : "border-control hover:border-blue hover:bg-raised"
                      )}
                    >
                      <ImageUp className="size-6 text-faint" strokeWidth={1.6} aria-hidden="true" />
                      <span className="text-[15px] font-semibold text-ink">Drop a label photo, or choose a file</span>
                      <span className="text-[13px] text-muted">PNG or JPG. A straight-on photo of the back panel reads best.</span>
                    </button>
                  )}
                </div>
              ) : (
                <Field label="Image address" hint="A direct link to one image file. Private and internal addresses are refused.">
                  <Input
                    type="url"
                    placeholder="https://cdn.yourshop.in/products/bura-1kg-back.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </Field>
              )}

              {error && (
                <p role="alert" className="m-0 rounded-[6px] bg-pill-negative-bg px-3 py-2 text-[14px] text-pill-negative-ink">
                  {error}
                </p>
              )}

              {submitting ? (
                <div role="status" className="rounded-[8px] border border-border bg-raised p-4">
                  <div className="h-1.5 overflow-hidden rounded-full bg-active">
                    <div
                      className="h-full origin-left rounded-full bg-blue transition-transform duration-500"
                      style={{ transform: `scaleX(${(stage + 1) / STAGES.length})`, transitionTimingFunction: "var(--ease-out)" }}
                    />
                  </div>
                  <ol className="m-0 mt-3 list-none space-y-1.5 p-0">
                    {STAGES.map((label, i) => (
                      <li key={label} className={cn("text-[14px]", i <= stage ? "text-ink" : "text-faint")}>
                        {label}
                        {i === stage && "…"}
                      </li>
                    ))}
                  </ol>
                  <p className="m-0 mt-2 text-[13px] text-muted">The first check downloads the OCR model, so it takes longer.</p>
                </div>
              ) : (
                <Button type="submit" size="lg" className="self-start">
                  Run the check
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
              )}
            </form>
          </CardBody>
        </Card>

        <Card className="lg:col-span-7">
          {result ? (
            <>
              <CardHeader
                title={result.product_name || `Listing #${result.listing_id}`}
                subtitle={missingCount === 0 ? "All six declarations found." : `${6 - missingCount} of 6 found. ${missingCount} missing.`}
                action={<StatusBadge compliant={missingCount === 0} />}
              />
              <CardBody>
                <DeclarationSheet results={rows} rawText={record.data?.raw_ocr_text || ""} print />
                <Button as={Link} to={`/app/listings/${result.listing_id}`} variant="secondary" className="mt-5">
                  Open the full record
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
              </CardBody>
            </>
          ) : (
            <>
              <CardHeader title="What the sheet checks" subtitle="Six declarations from LMPC Rules 2011, Rule 6" />
              <CardBody className="pt-2">
                <ul className="m-0 list-none p-0">
                  {DECLARATIONS.map((d, i) => (
                    <li key={d.field} className={cn("flex items-baseline justify-between gap-4 py-2.5", i > 0 && "border-t border-rule")}>
                      <span className="min-w-0">
                        <span className="block text-[15px] font-medium text-ink">{d.name}</span>
                        <span className="block text-[13px] text-muted">{d.requires}</span>
                      </span>
                      <span className="shrink-0 text-[14px] text-muted tabular">{d.clause}</span>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
