import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Download,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  ListChecks,
} from "lucide-react";
import { useListings } from "../hooks/useListings";
import { useSummary } from "../hooks/useSummary";
import { useDeleteListing } from "../hooks/useDeleteListing";
import { useDebounce } from "../hooks/useDebounce";
import { downloadListingsCsv } from "../api/listings";
import { useToast } from "../context/ToastContext";
import { errorMessage } from "../api/client";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input, Select } from "../components/ui/Input";
import { SkeletonRows } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { StatusBadge, Badge } from "../components/ui/Badge";
import { ConfirmModal } from "../components/ui/Modal";
import { formatDate, fieldLabel } from "../lib/format";

const PAGE_SIZES = [10, 25, 50];

export function ListingsPage() {
  const toast = useToast();
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 300);
  const [platform, setPlatform] = useState("");
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [toDelete, setToDelete] = useState(null);
  const [exporting, setExporting] = useState(false);

  const params = useMemo(
    () => ({ search, platform, flagged_only: flaggedOnly }),
    [search, platform, flaggedOnly]
  );
  const { data: listings = [], isLoading, isError, error } = useListings(params);
  const summary = useSummary();
  const del = useDeleteListing();

  const platforms = (summary.data?.platforms || []).map((p) => p.platform);

  const pageCount = Math.max(1, Math.ceil(listings.length / pageSize));
  const current = Math.min(page, pageCount - 1);
  const rows = listings.slice(current * pageSize, current * pageSize + pageSize);

  async function handleExport() {
    setExporting(true);
    try {
      await downloadListingsCsv({ platform, flagged_only: flaggedOnly });
      toast.success("CSV exported.");
    } catch (err) {
      toast.error(errorMessage(err, "Export failed."));
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete() {
    try {
      await del.mutateAsync(toDelete.id);
      toast.success(`Deleted “${toDelete.product_name}”.`);
      setToDelete(null);
    } catch (err) {
      toast.error(errorMessage(err, "Delete failed."));
    }
  }

  const resetPage = () => setPage(0);

  return (
    <div>
      <PageHeader
        title="Listings"
        description="Every product label checked, with its Rule 6 status."
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExport}
            loading={exporting}
          >
            <Download className="size-4" />
            Export CSV
          </Button>
        }
      />

      <Card className="overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
            <Input
              className="pl-9"
              placeholder="Search product name…"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                resetPage();
              }}
            />
          </div>
          <Select
            value={platform}
            onChange={(e) => {
              setPlatform(e.target.value);
              resetPage();
            }}
            className="w-auto min-w-[9rem]"
          >
            <option value="">All platforms</option>
            {platforms.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
          <label className="flex items-center gap-2 whitespace-nowrap text-sm text-muted">
            <input
              type="checkbox"
              className="size-4 accent-[var(--brand)]"
              checked={flaggedOnly}
              onChange={(e) => {
                setFlaggedOnly(e.target.checked);
                resetPage();
              }}
            />
            Flagged only
          </label>
        </div>

        {isLoading ? (
          <SkeletonRows rows={8} cols={5} />
        ) : isError ? (
          <p className="p-6 text-sm text-danger">
            {errorMessage(error, "Failed to load listings.")}
          </p>
        ) : listings.length === 0 ? (
          <EmptyState
            icon={ListChecks}
            title="No listings match"
            description="Try clearing the filters, or check a new listing."
            action={
              <Button as={Link} to="/app/ingest" size="sm">
                Check a listing
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-subtle">
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Platform</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Missing</th>
                  <th className="px-4 py-3 font-semibold">Checked</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((l) => (
                  <tr key={l.id} className="transition-colors hover:bg-surface-2">
                    <td className="px-4 py-3">
                      <Link
                        to={`/app/listings/${l.id}`}
                        className="font-medium text-content hover:text-brand"
                      >
                        {l.product_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted">{l.platform}</td>
                    <td className="px-4 py-3">
                      <StatusBadge compliant={l.compliant} />
                    </td>
                    <td className="px-4 py-3">
                      {l.missing_count === 0 ? (
                        <span className="text-subtle">—</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {l.missing_fields.slice(0, 2).map((f) => (
                            <Badge key={f} tone="danger">
                              {fieldLabel(f)}
                            </Badge>
                          ))}
                          {l.missing_fields.length > 2 && (
                            <Badge tone="neutral">
                              +{l.missing_fields.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {formatDate(l.scraped_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          as={Link}
                          to={`/app/listings/${l.id}`}
                          variant="ghost"
                          size="sm"
                          aria-label="View listing"
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label="Delete listing"
                          onClick={() => setToDelete(l)}
                          className="text-danger hover:bg-danger-soft"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !isError && listings.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3 text-sm text-muted">
            <div className="flex items-center gap-2">
              <span>Rows per page</span>
              <Select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  resetPage();
                }}
                className="h-8 w-auto py-0 text-xs"
              >
                {PAGE_SIZES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <span>
                {current * pageSize + 1}–
                {Math.min((current + 1) * pageSize, listings.length)} of{" "}
                {listings.length}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={current === 0}
                  onClick={() => setPage(current - 1)}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={current >= pageCount - 1}
                  onClick={() => setPage(current + 1)}
                  aria-label="Next page"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      <ConfirmModal
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        loading={del.isPending}
        title="Delete listing?"
        description={
          toDelete
            ? `“${toDelete.product_name}” will be removed from listings and analytics. This can't be undone from the UI.`
            : ""
        }
        confirmLabel="Delete"
      />
    </div>
  );
}
