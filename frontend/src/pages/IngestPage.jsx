import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Upload,
  Link2,
  ImageUp,
  X,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { ingestListing } from "../api/ingest";
import { useSummary } from "../hooks/useSummary";
import { useRules } from "../hooks/useRules";
import { useToast } from "../context/ToastContext";
import { errorMessage } from "../api/client";
import { PageHeader } from "../components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Field } from "../components/ui/Field";
import { SegmentedControl } from "../components/ui/SegmentedControl";
import { StatusBadge } from "../components/ui/Badge";
import { FieldChecklist, ingestResultsToRows } from "../components/FieldChecklist";

const STAGES = ["Uploading", "Running OCR", "Checking Rule 6"];

export function IngestPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const summary = useSummary();
  const rules = useRules();
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

  const previewUrl = useRef(null);
  useEffect(() => {
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    previewUrl.current = file ? URL.createObjectURL(file) : null;
    return () => {
      if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    };
  }, [file]);

  const knownPlatforms = (summary.data?.platforms || []).map((p) => p.platform);

  function pickFile(f) {
    if (f && f.type.startsWith("image/")) {
      setFile(f);
      setError(null);
    } else if (f) {
      setError("That doesn't look like an image file.");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (mode === "file" && !file) return setError("Choose an image file.");
    if (mode === "url" && !imageUrl.trim())
      return setError("Enter an image URL.");

    setSubmitting(true);
    setStage(0);
    const tick = setInterval(
      () => setStage((s) => Math.min(s + 1, STAGES.length - 1)),
      900
    );

    try {
      const formData = new FormData();
      formData.append("platform", platform);
      formData.append("product_name", productName);
      if (mode === "file") formData.append("file", file);
      else formData.append("image_url", imageUrl.trim());

      const data = await ingestListing(formData);
      setResult(data);
      toast.success(`Checked — listing #${data.listing_id} saved.`);
      setPlatform("");
      setProductName("");
      setFile(null);
      setImageUrl("");
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["trends"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    } catch (err) {
      setError(errorMessage(err, "Check failed."));
    } finally {
      clearInterval(tick);
      setSubmitting(false);
    }
  }

  const rows = result
    ? ingestResultsToRows(result.results, rules.data || [])
    : [];
  const missingCount = rows.filter((r) => !r.present).length;

  return (
    <div>
      <PageHeader
        title="Check a Listing"
        description="Supply a product-label image and get an instant Rule 6 compliance report."
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader title="New check" />
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Platform" required>
                  <Input
                    list="known-platforms"
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    placeholder="Amazon, Flipkart, …"
                    required
                  />
                  <datalist id="known-platforms">
                    {knownPlatforms.map((p) => (
                      <option key={p} value={p} />
                    ))}
                  </datalist>
                </Field>
                <Field label="Product name" required>
                  <Input
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g. Bura Sugar 1kg"
                    required
                  />
                </Field>
              </div>

              <div>
                <SegmentedControl
                  value={mode}
                  onChange={setMode}
                  options={[
                    { value: "file", label: "Upload image", icon: Upload },
                    { value: "url", label: "Image URL", icon: Link2 },
                  ]}
                />
              </div>

              {mode === "file" ? (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => pickFile(e.target.files?.[0])}
                  />
                  {file ? (
                    <div className="flex items-center gap-4 rounded-xl border border-line bg-surface-2 p-3">
                      <img
                        src={previewUrl.current}
                        alt=""
                        className="size-16 rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-content">
                          {file.name}
                        </p>
                        <p className="text-xs text-subtle">
                          {(file.size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="text-subtle hover:text-content"
                        aria-label="Remove file"
                      >
                        <X className="size-4" />
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
                      className={`flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
                        dragging
                          ? "border-brand bg-brand-soft"
                          : "border-line-strong hover:border-brand hover:bg-surface-2"
                      }`}
                    >
                      <ImageUp className="size-7 text-subtle" />
                      <span className="text-sm font-medium text-content">
                        Drop a label image, or click to browse
                      </span>
                      <span className="text-xs text-subtle">
                        PNG or JPG · a clear, straight-on photo works best
                      </span>
                    </button>
                  )}
                </div>
              ) : (
                <Field
                  label="Image URL"
                  hint="A direct link to one image file. Private/internal addresses are rejected."
                >
                  <Input
                    type="url"
                    placeholder="https://example.com/label.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </Field>
              )}

              {error && (
                <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
                  {error}
                </p>
              )}

              {submitting ? (
                <div className="space-y-2 rounded-lg border border-line bg-surface-2 p-4">
                  {STAGES.map((label, i) => (
                    <div
                      key={label}
                      className="flex items-center gap-2.5 text-sm"
                    >
                      <span
                        className={`flex size-5 items-center justify-center rounded-full text-xs ${
                          i < stage
                            ? "bg-success text-white"
                            : i === stage
                              ? "bg-brand text-on-brand"
                              : "bg-surface-3 text-subtle"
                        }`}
                      >
                        {i < stage ? "✓" : i + 1}
                      </span>
                      <span
                        className={
                          i <= stage ? "text-content" : "text-subtle"
                        }
                      >
                        {label}
                        {i === stage && "…"}
                      </span>
                    </div>
                  ))}
                  <p className="pt-1 text-xs text-subtle">
                    First run downloads the OCR model — it can take a bit longer.
                  </p>
                </div>
              ) : (
                <Button type="submit" size="lg">
                  <Sparkles className="size-4" />
                  Run compliance check
                </Button>
              )}
            </form>
          </CardBody>
        </Card>

        {/* Result / hint panel */}
        <div className="lg:col-span-2">
          {result ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader
                  title={`Listing #${result.listing_id}`}
                  action={<StatusBadge compliant={missingCount === 0} />}
                />
                <CardBody className="pt-0">
                  <FieldChecklist results={rows} />
                  <Button
                    as={Link}
                    to={`/app/listings/${result.listing_id}`}
                    variant="secondary"
                    size="sm"
                    className="mt-4 w-full"
                  >
                    Open full detail
                    <ArrowRight className="size-4" />
                  </Button>
                </CardBody>
              </Card>
            </motion.div>
          ) : (
            <Card>
              <CardBody>
                <h3 className="text-sm font-semibold text-content">
                  What gets checked
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-muted">
                  {(rules.data || []).map((r) => (
                    <li key={r.field} className="flex gap-2">
                      <span className="mt-1 size-1.5 shrink-0 rounded-full bg-brand" />
                      <span>
                        <span className="text-content">{r.description}</span>
                        <span className="block text-xs text-subtle">
                          {r.legal_reference}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
