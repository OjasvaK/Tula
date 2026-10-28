import { Link } from "react-router-dom";
import {
  Package,
  Gauge,
  Flag,
  AlertOctagon,
  ArrowRight,
  ScanLine,
} from "lucide-react";
import { useSummary } from "../hooks/useSummary";
import { useTrends } from "../hooks/useTrends";
import { useRules } from "../hooks/useRules";
import { useListings } from "../hooks/useListings";
import { PageHeader } from "../components/ui/PageHeader";
import { StatCard } from "../components/ui/StatCard";
import { Card, CardHeader, CardBody } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { StatusBadge } from "../components/ui/Badge";
import { ViolationBarChart } from "../components/charts/ViolationBarChart";
import { formatDate, formatPercent, fieldLabel } from "../lib/format";

export function Overview() {
  const summary = useSummary();
  const trends = useTrends();
  const rules = useRules();
  const recent = useListings({});

  const s = summary.data;

  return (
    <div>
      <PageHeader
        title="Overview"
        description="Compliance snapshot across every listing checked."
        actions={
          <Button as={Link} to="/app/ingest" size="sm">
            <ScanLine className="size-4" />
            Check a listing
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summary.isLoading || !s ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[110px] rounded-2xl" />
          ))
        ) : (
          <>
            <StatCard
              index={0}
              label="Listings checked"
              value={s.total_listings}
              icon={Package}
              accent="brand"
            />
            <StatCard
              index={1}
              label="Compliance rate"
              value={formatPercent(s.compliance_rate)}
              hint={`${s.compliant_count} of ${s.total_listings} compliant`}
              icon={Gauge}
              accent="success"
            />
            <StatCard
              index={2}
              label="Flagged"
              value={s.flagged_count}
              hint="one or more declarations missing"
              icon={Flag}
              accent="danger"
            />
            <StatCard
              index={3}
              label="Top violation"
              value={
                s.most_common_violation
                  ? fieldLabel(s.most_common_violation)
                  : "—"
              }
              icon={AlertOctagon}
              accent="warning"
            />
          </>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader
            title="Most common missing declarations"
            subtitle="Across all flagged listings"
          />
          <CardBody>
            {trends.isLoading ? (
              <Skeleton className="h-[280px]" />
            ) : (
              <ViolationBarChart
                trends={trends.data || {}}
                rules={rules.data || []}
                height={280}
              />
            )}
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title="Recent listings"
            action={
              <Link
                to="/app/listings"
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-fg"
              >
                View all <ArrowRight className="size-3" />
              </Link>
            }
          />
          <CardBody className="p-0">
            {recent.isLoading ? (
              <div className="space-y-3 p-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10" />
                ))}
              </div>
            ) : (recent.data || []).length === 0 ? (
              <EmptyState
                title="No listings yet"
                description="Run your first check to see it here."
                action={
                  <Button as={Link} to="/app/ingest" size="sm">
                    Check a listing
                  </Button>
                }
              />
            ) : (
              <ul className="divide-y divide-line">
                {(recent.data || []).slice(0, 6).map((l) => (
                  <li key={l.id}>
                    <Link
                      to={`/app/listings/${l.id}`}
                      className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-surface-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-content">
                          {l.product_name}
                        </p>
                        <p className="text-xs text-subtle">
                          {l.platform} · {formatDate(l.scraped_at)}
                        </p>
                      </div>
                      <StatusBadge compliant={l.compliant} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
