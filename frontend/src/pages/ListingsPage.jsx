import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Download, Trash2, ScanLine } from "lucide-react";
import { useListings } from "../hooks/useListings";
import { useSummary } from "../hooks/useSummary";
import { useDeleteListing } from "../hooks/useDeleteListing";
import { useDebounce } from "../hooks/useDebounce";
import { downloadListingsCsv } from "../api/listings";
import { useToast } from "../context/ToastContext";
import { errorMessage } from "../api/client";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { Input, Select } from "../components/ui/Input";
import { SkeletonRows } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { StatusBadge } from "../components/ui/Badge";
import { ConfirmModal } from "../components/ui/Modal";
import { StampStrip, StripKey } from "../components/stamp/StampStrip";
import { formatISODate } from "../lib/format";
import { cn } from "../lib/cn";

const PAGE_SIZE = 25;
const TABS = [
  { id: "all", label: "All" },
  { id: "flagged", label: "Flagged" },
  { id: "compliant", label: "Compliant" },
];

export function ListingsPage() {
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const tab = TABS.some((t) => t.id === params.get("tab")) ? params.get("tab") : "all";
  const [searchInput, setSearchInput] = useState(params.get("q") || "");
  const search = useDebounce(searchInput, 300);
  const [platform, setPlatform] = useState("");
  const [shownCount, setShownCount] = useState(PAGE_SIZE);
  const [toDelete, setToDelete] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setSearchInput(params.get("q") || "");
  }, [params]);

  const query = useMemo(() => ({ search, platform }), [search, platform]);
  const { data: listings = [], isLoading, isError, error, refetch } = useListings(query);
  const summary = useSummary();
  const del = useDeleteListing();
  const platforms = (summary.data?.platforms || []).map((p) => p.platform);

  const counts = {
    all: listings.length,
    flagged: listings.filter((l) => !l.compliant).length,
    compliant: listings.filter((l) => l.compliant).length,
  };
  const inTab = listings.filter((l) =>
    tab === "flagged" ? !l.compliant : tab === "compliant" ? l.compliant : true
  );
  const rows = inTab.slice(0, shownCount);

  function setTab(id) {
    const next = new URLSearchParams(params);
    if (id === "all") next.delete("tab");
    else next.set("tab", id);
    setParams(next, { replace: true });
    setShownCount(PAGE_SIZE);
  }

  async function handleExport() {
    setExporting(true);
    try {
      await downloadListingsCsv({ platform, flagged_only: tab === "flagged" });
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

  return (
    <div>
      <PageHeader
        title="Listings"
        description="Every label checked, with the declarations it carries and the ones it is missing."
        actions={
          <>
            <Button variant="secondary" onClick={handleExport} loading={exporting}>
              {!exporting && <Download className="size-4" strokeWidth={1.8} aria-hidden="true" />}
              Export CSV
            </Button>
            <Button as={Link} to="/app/ingest">
              <ScanLine className="size-4" strokeWidth={1.8} aria-hidden="true" />
              Check a label
            </Button>
          </>
        }
      />

      <div role="tablist" aria-label="Filter by status" className="flex gap-6 border-b border-border">
        {TABS.map((t) => {
          const active = t.id === tab;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={cn(
                "-mb-px border-b-2 pb-2.5 text-[15px]",
                active ? "border-ink font-semibold text-ink" : "border-transparent text-muted hover:text-ink"
              )}
            >
              {t.label} <span className="tabular text-muted">{isLoading ? "" : counts[t.id]}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-[300px]">
          <label htmlFor="listing-search" className="sr-only">Search by product name</label>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" strokeWidth={1.6} aria-hidden="true" />
          <Input
            id="listing-search"
            className="h-9 pl-9"
            placeholder="Search by product name"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <label htmlFor="platform-filter" className="sr-only">Platform</label>
        <Select id="platform-filter" value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-auto min-w-[10rem]">
          <option value="">All platforms</option>
          {platforms.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </Select>
        <p className="m-0 ml-auto text-[14px] text-muted tabular">
          {isLoading ? "" : `${inTab.length} ${inTab.length === 1 ? "listing" : "listings"}`}
        </p>
      </div>

      <div className="mt-4">
        {isLoading ? (
          <SkeletonRows rows={6} cols={5} />
        ) : isError ? (
          <EmptyState
            title="Couldn’t load listings."
            description={errorMessage(error, "The API did not answer.")}
            action={<Button variant="secondary" size="sm" onClick={() => refetch()}>Retry</Button>}
          />
        ) : inTab.length === 0 ? (
          <EmptyState
            title={listings.length === 0 && !search && !platform ? "No labels checked yet." : "No listings match these filters."}
            description={
              listings.length === 0 && !search && !platform
                ? "Check a label and it appears here with its six declarations."
                : "Clear the search or the platform filter to see every listing."
            }
            action={<Button as={Link} to="/app/ingest" size="sm">Check a label</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-[14px]">
              <caption className="sr-only">Listings</caption>
              <thead>
                <tr className="text-[13px] text-muted">
                  <th scope="col" className="w-[36%] pb-2 pr-4 font-normal">Product</th>
                  <th scope="col" className="pb-2 pr-4 font-normal">Declarations</th>
                  <th scope="col" className="pb-2 pr-4 font-normal">Status</th>
                  <th scope="col" className="pb-2 pr-4 text-right font-normal">Found</th>
                  <th scope="col" className="pb-2 pr-4 text-right font-normal">Checked</th>
                  <th scope="col" className="w-10 pb-2"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((l) => (
                  <tr key={l.id} className="h-14 border-t border-rule hover:bg-raised">
                    <td className="py-2 pr-4">
                      <Link to={`/app/listings/${l.id}`} className="font-medium text-ink no-underline hover:text-blue">
                        {l.product_name}
                      </Link>
                      <span className="block text-[13px] text-muted">{l.platform}</span>
                    </td>
                    <td className="py-2 pr-4"><StampStrip missing={l.missing_fields} /></td>
                    <td className="py-2 pr-4"><StatusBadge compliant={l.compliant} /></td>
                    <td className="py-2 pr-4 text-right tabular">
                      <span className="font-semibold text-ink">{l.total_fields - l.missing_count}</span>
                      <span className="text-muted"> /{l.total_fields}</span>
                    </td>
                    <td className="py-2 pr-4 text-right text-muted tabular">{formatISODate(l.scraped_at)}</td>
                    <td className="py-2 text-right">
                      <button
                        type="button"
                        onClick={() => setToDelete(l)}
                        aria-label={`Delete ${l.product_name}`}
                        className="press inline-flex size-8 items-center justify-center rounded-[6px] text-faint hover:bg-pill-negative-bg hover:text-negative"
                      >
                        <Trash2 className="size-4" strokeWidth={1.6} aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <StripKey className="mt-4 border-t border-rule pt-4" />
            {inTab.length > rows.length && (
              <div className="mt-4 flex items-center justify-between border-t border-rule pt-4 text-[14px] text-muted">
                <span className="tabular">1–{rows.length} of {inTab.length}</span>
                <Button variant="secondary" size="sm" onClick={() => setShownCount((n) => n + PAGE_SIZE)}>
                  Show more
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        loading={del.isPending}
        title="Delete this listing?"
        description={
          toDelete
            ? `“${toDelete.product_name}” leaves the ledger and the analytics. The record is kept in the database but cannot be restored from here.`
            : ""
        }
        confirmLabel="Delete listing"
      />
    </div>
  );
}
