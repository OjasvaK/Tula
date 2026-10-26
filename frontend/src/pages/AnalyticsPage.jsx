import { useSummary } from "../hooks/useSummary";
import { useTrends } from "../hooks/useTrends";
import { useRules } from "../hooks/useRules";
import { PageHeader } from "../components/ui/PageHeader";
import { Card, CardHeader, CardBody } from "../components/ui/Card";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { ViolationBarChart } from "../components/charts/ViolationBarChart";
import { ComplianceDonut } from "../components/charts/ComplianceDonut";
import { PlatformBar } from "../components/charts/PlatformBar";
import { ActivityArea } from "../components/charts/ActivityArea";
import { BarChart3 } from "lucide-react";
import { formatPercent } from "../lib/format";

export function AnalyticsPage() {
  const summary = useSummary();
  const trends = useTrends();
  const rules = useRules();
  const s = summary.data;

  const loading = summary.isLoading || trends.isLoading;

  if (!loading && s && s.total_listings === 0) {
    return (
      <div>
        <PageHeader title="Analytics" description="Compliance trends across every check." />
        <Card>
          <EmptyState
            icon={BarChart3}
            title="No data to chart yet"
            description="Run a few compliance checks and the analytics will populate here."
          />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Compliance trends across every listing checked."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Missing declarations"
            subtitle="Which Rule 6 fields fail most often"
          />
          <CardBody>
            {loading ? (
              <Skeleton className="h-[320px]" />
            ) : (
              <ViolationBarChart
                trends={trends.data || {}}
                rules={rules.data || []}
                height={320}
              />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Compliance split"
            subtitle={
              s ? `${formatPercent(s.compliance_rate)} of listings pass` : ""
            }
          />
          <CardBody>
            {loading || !s ? (
              <Skeleton className="h-[240px]" />
            ) : (
              <ComplianceDonut
                compliant={s.compliant_count}
                flagged={s.flagged_count}
              />
            )}
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title="Activity"
            subtitle="Listings checked per day (last 30 days)"
          />
          <CardBody>
            {loading || !s ? (
              <Skeleton className="h-[260px]" />
            ) : (
              <ActivityArea activity={s.activity} />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="By platform"
            subtitle="Compliant vs flagged"
          />
          <CardBody>
            {loading || !s ? (
              <Skeleton className="h-[280px]" />
            ) : (
              <PlatformBar platforms={s.platforms} />
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
