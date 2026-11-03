import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Trash2, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useListing } from "../hooks/useListing";
import { useListingImage } from "../hooks/useListingImage";
import { useDeleteListing } from "../hooks/useDeleteListing";
import { useToast } from "../context/ToastContext";
import { errorMessage } from "../api/client";
import { Card, CardHeader, CardBody } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { StatusBadge } from "../components/ui/Badge";
import { ConfirmModal } from "../components/ui/Modal";
import { DeclarationSheet } from "../components/FieldChecklist";
import { DECLARATION_BY_FIELD } from "../lib/rules";
import { formatDateTime } from "../lib/format";

function LabelImage({ id, name }) {
  const { url, loading, error } = useListingImage(id);
  if (loading) return <Skeleton className="aspect-[3/4] w-full" />;
  if (error || !url)
    return (
      <EmptyState title="Image unavailable." description="The stored label photo could not be loaded." />
    );
  return (
    <a href={url} target="_blank" rel="noreferrer" className="block">
      <img src={url} alt={`Label photo for ${name}`} className="block max-h-[420px] w-full bg-raised object-contain lg:max-h-[640px]" />
    </a>
  );
}

function verdictLine(data) {
  const missing = data.missing_fields.map((f) => DECLARATION_BY_FIELD[f]?.name.toLowerCase() || f);
  if (missing.length === 0) return "All six declarations found.";
  return `${6 - missing.length} of 6 found. Missing ${missing.join(", ")}.`;
}

export function ListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data, isLoading, isError, error } = useListing(id);
  const del = useDeleteListing();
  const [confirm, setConfirm] = useState(false);
  const [showOcr, setShowOcr] = useState(true);

  async function handleDelete() {
    try {
      await del.mutateAsync(id);
      toast.success("Listing deleted.");
      navigate("/app/listings", { replace: true });
    } catch (err) {
      toast.error(errorMessage(err, "Delete failed."));
    }
  }

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-3 h-7 w-72" />
        <div className="mt-8 grid gap-4 lg:grid-cols-12">
          <Skeleton className="aspect-[3/4] lg:col-span-5" />
          <Skeleton className="h-[420px] lg:col-span-7" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        title="Listing not found."
        description={errorMessage(error, "It may have been deleted.")}
        action={<Button as={Link} to="/app/listings" size="sm">Back to listings</Button>}
      />
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-3 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <nav aria-label="Breadcrumb" className="text-[14px]">
            <Link to="/app/listings" className="text-muted no-underline hover:text-ink">Listings</Link>
            <span className="px-1.5 text-faint" aria-hidden="true">/</span>
          </nav>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="m-0 text-[24px] font-bold leading-tight text-ink">{data.product_name}</h1>
            <StatusBadge compliant={data.compliant} />
          </div>
          <p className="m-0 mt-1 text-[15px] text-muted">
            {verdictLine(data)} {data.platform} · checked {formatDateTime(data.scraped_at)} · listing{" "}
            <span className="tabular">#{data.id}</span>
          </p>
        </div>
        <Button variant="danger" className="self-start" onClick={() => setConfirm(true)}>
          <Trash2 className="size-4" strokeWidth={1.8} aria-hidden="true" />
          Delete
        </Button>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-5">
          <CardHeader title="Label photo" />
          <CardBody>
            <LabelImage id={id} name={data.product_name} />
          </CardBody>
        </Card>

        <Card className="order-first lg:order-none lg:col-span-7">
          <CardHeader title="Rule 6 sheet" subtitle="Each declaration postmarked with its clause, or overprinted when it is missing" />
          <CardBody>
            <DeclarationSheet results={data.results} rawText={data.raw_ocr_text || ""} />
          </CardBody>
        </Card>
      </div>

      <Card className="mt-4">
        <h2 className="m-0">
          <button
            type="button"
            onClick={() => setShowOcr((v) => !v)}
            aria-expanded={showOcr}
            className="flex w-full items-center justify-between px-5 py-4 text-left text-[16px] font-semibold text-ink"
          >
            Text the OCR read
            <ChevronDown className={`size-4 text-faint transition-transform duration-200 ${showOcr ? "rotate-180" : ""}`} strokeWidth={1.6} aria-hidden="true" />
          </button>
        </h2>
        <AnimatePresence initial={false}>
          {showOcr && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
              className="overflow-hidden"
            >
              <pre className="m-0 max-h-80 overflow-auto whitespace-pre-wrap border-t border-rule bg-raised px-5 py-4 text-[13px] leading-relaxed text-ink">
                <code className="font-mono">{data.raw_ocr_text || "(no text extracted)"}</code>
              </pre>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <ConfirmModal
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={handleDelete}
        loading={del.isPending}
        title="Delete this listing?"
        description={`“${data.product_name}” leaves the ledger and the analytics.`}
        confirmLabel="Delete listing"
      />
    </div>
  );
}
