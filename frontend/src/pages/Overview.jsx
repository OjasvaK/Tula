import { Link } from "react-router-dom";
import { ArrowRight, ScanLine } from "lucide-react";
import { useSummary } from "../hooks/useSummary";
import { useTrends } from "../hooks/useTrends";
import { useListings } from "../hooks/useListings";
import { PageHeader } from "../components/ui/PageHeader";
import { KpiStrip } from "../components/ui/KpiStrip";
import { Card, CardHeader, CardBody } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { StampStrip, StripKey } from "../components/stamp/StampStrip";
import { MissingBarList } from "../components/charts/MissingBarList";
import { errorMessage } from "../api/client";
import { formatISODate } from "../lib/format";
import { topGaps, joinNames } from "../lib/rules";

function finding(s, trends) {
  if (!s || s.total_listings === 0) return "No labels checked yet.";
  if (s.flagged_count === 0) return `All ${s.total_listings} listings carry every declaration.`;
  const lead = `${s.flagged_count} of ${s.total_listings} listings are flagged.`;
  const { count, decls } = topGaps(trends);
  if (!decls.length) return lead;
  const names = decls.map((d, i) => (i === 0 ? d.name : d.name.toLowerCase()));
  return decls.length === 1
    ? `${lead} ${names[0]} is missing most often, on ${count} of ${s.total_listings}.`
    : `${lead} ${joinNames(names)} are each missing on ${count} of ${s.total_listings}.`;
}

export function Overview() {
  const summary = useSummary();
  const trends = useTrends();
  const listings = useListings({});
  const s = summary.data;

  const flagged = (listings.data || []).filter((l) => !l.compliant);
  const shown = flagged.slice(0, 6);
  const empty = s && s.total_listings === 0;

  return (
    <div>
      <PageHeader
        title="Overview"
        description={summary.isLoading ? "Loading…" : finding(s, trends.data)}
        actions={
          <Button as={Link} to="/app/ingest">
            <ScanLine className="size-4" strokeWidth={1.8} aria-hidden="true" />
            Check a label
          </Button>
        }
      />

      {summary.isError ? (
        <EmptyState
          title="Couldn’t load the summary."
          description={errorMessage(summary.error, "The API did not answer.")}
          action={<Button variant="secondary" size="sm" onClick={() => summary.refetch()}>Retry</Button>}
        />
      ) : summary.isLoading || !s ? (
        <div className="grid grid-cols-3 gap-4 rounded-[8px] border border-border p-5">
          {[0, 1, 2].map((i) => (
            <div key={i}>
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="mt-3 h-7 w-16" />
            </div>
          ))}
        </div>
      ) : (
        <KpiStrip
          items={[
            {
              label: "Flagged listings",
              value: s.flagged_count.toLocaleString(),
              unit: `of ${s.total_listings.toLocaleString()} checked`,
              lead: true,
            },
            {
              label: "Compliance rate",
              value: s.total_listings ? (s.compliance_rate * 100).toFixed(1) : "—",
              unit: s.total_listings ? "%" : undefined,
              sub: `${s.compliant_count} carry all six declarations`,
            },
            (() => {
              const { count, decls } = topGaps(trends.data);
              return {
                label: "Missing most often",
                value: decls.length ? decls.map((d) => d.short).join(", ") : "—",
                text: true,
                sub: decls.length
                  ? `${decls.length > 1 ? "Each on" : "On"} ${count} of ${s.total_listings} listings`
                  : "Nothing missing yet",
              };
            })(),
          ]}
        />
      )}

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Flagged listings"
            subtitle={
              flagged.length
                ? `${flagged.length} need a seller to add a declaration`
                : "Listings missing one or more declarations"
            }
            action={
              flagged.length > 0 && (
                <Link to="/app/listings?tab=flagged" className="inline-flex items-center gap-1 text-[14px] font-medium text-blue no-underline hover:text-blue-strong">
                  View all <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              )
            }
          />
          <CardBody>
            {listings.isLoading ? (
              <div className="space-y-4">
                {[0, 1, 2].map((i) => <Skeleton key={i} className="h-4 w-full" />)}
              </div>
            ) : listings.isError ? (
              <EmptyState
                title="Couldn’t load listings."
                description={errorMessage(listings.error)}
                action={<Button variant="secondary" size="sm" onClick={() => listings.refetch()}>Retry</Button>}
              />
            ) : empty ? (
              <EmptyState
                title="No labels checked yet."
                description="Check a label and any missing declaration lands here with its clause."
                action={<Button as={Link} to="/app/ingest" size="sm">Check a label</Button>}
              />
            ) : shown.length === 0 ? (
              <EmptyState title="Nothing flagged." description="Every listing checked so far carries all six declarations." />
            ) : (
              <>
              <table className="w-full border-collapse text-left text-[14px]">
                <caption className="sr-only">Flagged listings, newest first</caption>
                <thead>
                  <tr className="text-[13px] text-muted">
                    <th scope="col" className="pb-2 pr-4 font-normal">Product</th>
                    <th scope="col" className="hidden pb-2 pr-4 font-normal sm:table-cell">Declarations</th>
                    <th scope="col" className="pb-2 pr-4 text-right font-normal">Found</th>
                    <th scope="col" className="hidden pb-2 text-right font-normal md:table-cell">Checked</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((l) => (
                    <tr key={l.id} className="border-t border-rule hover:bg-raised">
                      <td className="py-2.5 pr-4">
                        <Link to={`/app/listings/${l.id}`} className="font-medium text-ink no-underline hover:text-blue">
                          {l.product_name}
                        </Link>
                        <span className="block text-[13px] text-muted">{l.platform}</span>
                      </td>
                      <td className="hidden py-2.5 pr-4 sm:table-cell">
                        <StampStrip missing={l.missing_fields} />
                      </td>
                      <td className="py-2.5 pr-4 text-right tabular">
                        <span className="font-semibold text-ink">{l.total_fields - l.missing_count}</span>
                        <span className="text-muted"> /{l.total_fields}</span>
                      </td>
                      <td className="hidden py-2.5 text-right text-muted tabular md:table-cell">{formatISODate(l.scraped_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <StripKey className="mt-3 hidden border-t border-rule pt-3 sm:flex" />
              </>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Missing most often" subtitle="Listings missing each declaration" />
          <CardBody className="pt-2">
            {trends.isLoading || !s ? (
              <div className="space-y-4">
                {[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-3.5 w-full" />)}
              </div>
            ) : (
              <MissingBarList trends={trends.data || {}} total={s.total_listings} thin />
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
