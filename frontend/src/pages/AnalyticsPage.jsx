import { Link } from "react-router-dom";
import { useSummary } from "../hooks/useSummary";
import { useTrends } from "../hooks/useTrends";
import { PageHeader } from "../components/ui/PageHeader";
import { KpiStrip } from "../components/ui/KpiStrip";
import { Card, CardHeader, CardBody } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { MissingBarList } from "../components/charts/MissingBarList";
import { ActivityColumns } from "../components/charts/ActivityColumns";
import { errorMessage } from "../api/client";
import { topGaps, joinNames } from "../lib/rules";

export function AnalyticsPage() {
  const summary = useSummary();
  const trends = useTrends();
  const s = summary.data;
  const loading = summary.isLoading || trends.isLoading;
  const last30 = (s?.activity || []).reduce((a, d) => a + d.count, 0);

  return (
    <div>
      <PageHeader
        title="Analytics"
        description={(() => {
          const { count, decls } = topGaps(trends.data);
          if (!s || s.total_listings === 0 || !decls.length)
            return "Which declarations fail most, on which platforms, and when labels were checked.";
          const names = decls.map((d, i) => (i === 0 ? d.name : d.name.toLowerCase()));
          return decls.length === 1
            ? `${names[0]} is missing most often, on ${count} of ${s.total_listings} listings.`
            : `${joinNames(names)} are each missing on ${count} of ${s.total_listings} listings.`;
        })()}
      />

      {summary.isError ? (
        <EmptyState
          title="Couldn’t load analytics."
          description={errorMessage(summary.error)}
          action={<Button variant="secondary" size="sm" onClick={() => summary.refetch()}>Retry</Button>}
        />
      ) : loading || !s ? (
        <Skeleton className="h-[92px] w-full" />
      ) : s.total_listings === 0 ? (
        <EmptyState
          title="No labels checked yet."
          description="Analytics fill in from the first check: missing declarations, platforms and daily activity."
          action={<Button as={Link} to="/app/ingest" size="sm">Check a label</Button>}
        />
      ) : (
        <>
          <KpiStrip
            items={[
              { label: "Labels checked", value: s.total_listings.toLocaleString(), lead: true },
              { label: "Flagged", value: s.flagged_count.toLocaleString(), sub: "missing one or more declarations" },
              { label: "Compliance rate", value: (s.compliance_rate * 100).toFixed(1), unit: "%", sub: `${s.compliant_count} of ${s.total_listings} carry all six` },
            ]}
          />

          <div className="mt-4 grid items-start gap-4 lg:grid-cols-12">
            <Card className="lg:col-span-7">
              <CardHeader title="Missing declarations" subtitle={`Listings missing each one, out of ${s.total_listings}`} />
              <CardBody className="pt-2">
                <MissingBarList trends={trends.data || {}} total={s.total_listings} />
              </CardBody>
            </Card>

            <Card className="lg:col-span-5">
              <CardHeader title="By platform" subtitle="Share of listings carrying all six" />
              <CardBody className="pt-2">
                <table className="w-full border-collapse text-left text-[14px]">
                  <caption className="sr-only">Compliance by platform</caption>
                  <thead>
                    <tr className="text-[13px] text-muted">
                      <th scope="col" className="pb-2 pr-3 font-normal">Platform</th>
                      <th scope="col" className="pb-2 pr-3 text-right font-normal">Checked</th>
                      <th scope="col" className="pb-2 pr-3 text-right font-normal">Flagged</th>
                      <th scope="col" className="pb-2 text-right font-normal">Compliant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {s.platforms.map((p) => (
                      <tr key={p.platform} className="border-t border-rule">
                        <th scope="row" className="py-2.5 pr-3 font-medium text-ink">{p.platform}</th>
                        <td className="py-2.5 pr-3 text-right tabular">{p.total}</td>
                        <td className={`py-2.5 pr-3 text-right tabular ${p.flagged > 0 ? "text-negative" : "text-ink"}`}>{p.flagged}</td>
                        <td className="py-2.5 text-right tabular text-ink">{(p.compliance_rate * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardBody>
            </Card>
          </div>

          <Card className="mt-4">
            <CardHeader
              title="Labels checked per day"
              subtitle={`${last30} in the last 30 days`}
            />
            <CardBody>
              <ActivityColumns activity={s.activity} />
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}
