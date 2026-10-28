import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Trash2,
  ChevronDown,
  ImageOff,
  FileText,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useListing } from "../hooks/useListing";
import { useListingImage } from "../hooks/useListingImage";
import { useDeleteListing } from "../hooks/useDeleteListing";
import { useToast } from "../context/ToastContext";
import { errorMessage } from "../api/client";
import { Card, CardHeader, CardBody } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { CenteredSpinner } from "../components/ui/Spinner";
import { EmptyState } from "../components/ui/EmptyState";
import { StatusBadge } from "../components/ui/Badge";
import { ConfirmModal } from "../components/ui/Modal";
import { FieldChecklist } from "../components/FieldChecklist";
import { formatDateTime } from "../lib/format";

function LabelImage({ id }) {
  const { url, loading, error } = useListingImage(id);
  if (loading)
    return (
      <div className="flex h-64 items-center justify-center rounded-xl bg-surface-2">
        <CenteredSpinner label="Loading image…" />
      </div>
    );
  if (error || !url)
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-xl bg-surface-2 text-subtle">
        <ImageOff className="size-6" />
        <p className="text-xs">Image unavailable</p>
      </div>
    );
  return (
    <a href={url} target="_blank" rel="noreferrer" className="block">
      <img
        src={url}
        alt="Product label"
        className="max-h-[520px] w-full rounded-xl border border-line object-contain bg-surface-2"
      />
    </a>
  );
}

export function ListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data, isLoading, isError, error } = useListing(id);
  const del = useDeleteListing();
  const [confirm, setConfirm] = useState(false);
  const [showOcr, setShowOcr] = useState(false);

  async function handleDelete() {
    try {
      await del.mutateAsync(id);
      toast.success("Listing deleted.");
      navigate("/app/listings", { replace: true });
    } catch (err) {
      toast.error(errorMessage(err, "Delete failed."));
    }
  }

  if (isLoading) return <CenteredSpinner label="Loading listing…" />;

  if (isError) {
    return (
      <EmptyState
        icon={FileText}
        title="Listing not found"
        description={errorMessage(error, "It may have been deleted.")}
        action={
          <Button as={Link} to="/app/listings" size="sm">
            Back to listings
          </Button>
        }
      />
    );
  }

  return (
    <div>
      <Link
        to="/app/listings"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-content"
      >
        <ArrowLeft className="size-4" />
        Listings
      </Link>

      <div className="flex flex-col gap-3 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-content sm:text-2xl">
              {data.product_name}
            </h1>
            <StatusBadge compliant={data.compliant} />
          </div>
          <p className="mt-1 text-sm text-muted">
            {data.platform} · checked {formatDateTime(data.scraped_at)} · listing
            #{data.id}
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="text-danger"
          onClick={() => setConfirm(true)}
        >
          <Trash2 className="size-4" />
          Delete
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Label image" />
          <CardBody>
            <LabelImage id={id} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Rule 6 declaration check"
            subtitle={
              data.compliant
                ? "All six declarations detected"
                : `${data.missing_fields.length} missing`
            }
          />
          <CardBody className="pt-0">
            <FieldChecklist results={data.results} />
          </CardBody>
        </Card>
      </div>

      <Card className="mt-6">
        <button
          onClick={() => setShowOcr((v) => !v)}
          className="flex w-full items-center justify-between px-5 py-4 text-left"
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-content">
            <FileText className="size-4 text-brand-fg" />
            Raw OCR text
          </span>
          <ChevronDown
            className={`size-4 text-subtle transition-transform ${
              showOcr ? "rotate-180" : ""
            }`}
          />
        </button>
        <AnimatePresence initial={false}>
          {showOcr && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <pre className="max-h-80 overflow-auto whitespace-pre-wrap border-t border-line bg-surface-2 px-5 py-4 font-mono text-xs leading-relaxed text-muted">
                {data.raw_ocr_text || "(no text extracted)"}
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
        title="Delete listing?"
        description={`“${data.product_name}” will be removed from listings and analytics.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
