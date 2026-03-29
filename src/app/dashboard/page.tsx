import { createServerClient } from "@/lib/supabase";
import { Report, Risk, Task, Objective, Metric } from "@/lib/types";
import { Header } from "@/components/layout/Header";
import { Banner } from "@/components/system/Banner";
import { CriticalZone } from "@/components/dashboard/CriticalZone";
import { ExecutionZone } from "@/components/dashboard/ExecutionZone";
import { StrategicZone } from "@/components/dashboard/StrategicZone";
import { ContextMetrics } from "@/components/dashboard/ContextMetrics";
import { CoachingCard } from "@/components/dashboard/CoachingCard";
import { EmptyState } from "@/components/system/EmptyState";
import { FileTextIcon } from "lucide-react";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

function dedupeByTitle<T extends { title: string; created_at: string }>(
  rows: T[]
): T[] {
  const map = new Map<string, T>();
  const sorted = [...rows].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  for (const row of sorted) {
    if (!map.has(row.title)) {
      map.set(row.title, row);
    }
  }
  return Array.from(map.values());
}

interface DashboardData {
  latestReport: Report | null;
  tasks: Task[];
  risks: Risk[];
  objectives: Objective[];
  metrics: Metric[];
  metricsReportDate: string | null;
}

async function getDashboardData(): Promise<DashboardData> {
  const supabase = createServerClient();

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();

  const { data: latestReport } = await supabase
    .from("reports")
    .select("*")
    .order("report_date", { ascending: false })
    .limit(1)
    .single();

  const [tasksRes, risksRes, objectivesRes] = await Promise.all([
    supabase
      .from("tasks")
      .select("*")
      .eq("completed", false)
      .gte("created_at", thirtyDaysAgo)
      .order("created_at", { ascending: false }),
    supabase
      .from("risks")
      .select("*")
      .gte("created_at", thirtyDaysAgo)
      .order("created_at", { ascending: false }),
    supabase
      .from("objectives")
      .select("*")
      .neq("status", "completed")
      .gte("created_at", ninetyDaysAgo)
      .order("created_at", { ascending: false }),
  ]);

  const tasks = dedupeByTitle((tasksRes.data ?? []) as Task[]);
  const risks = dedupeByTitle((risksRes.data ?? []) as Risk[]);
  const objectives = dedupeByTitle((objectivesRes.data ?? []) as Objective[]);

  let metrics: Metric[] = [];
  let metricsReportDate: string | null = null;

  if (latestReport) {
    const { data: latestMetrics } = await supabase
      .from("metrics")
      .select("*")
      .eq("report_id", latestReport.id)
      .order("created_at");

    if (latestMetrics && latestMetrics.length > 0) {
      metrics = latestMetrics as Metric[];
      metricsReportDate = latestReport.report_date;
    }
  }

  if (metrics.length === 0) {
    const { data: reportsWithMetrics } = await supabase
      .from("reports")
      .select("id, report_date")
      .order("report_date", { ascending: false })
      .limit(10);

    for (const rpt of reportsWithMetrics ?? []) {
      const { data: rptMetrics } = await supabase
        .from("metrics")
        .select("*")
        .eq("report_id", rpt.id)
        .order("created_at");

      if (rptMetrics && rptMetrics.length > 0) {
        metrics = rptMetrics as Metric[];
        metricsReportDate = rpt.report_date;
        break;
      }
    }
  }

  return {
    latestReport: latestReport as Report | null,
    tasks,
    risks,
    objectives,
    metrics,
    metricsReportDate,
  };
}

export default async function DashboardPage() {
  const { latestReport, tasks, risks, objectives, metrics, metricsReportDate } =
    await getDashboardData();

  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const isStale = latestReport && latestReport.report_date !== today;

  let staleHours = 0;
  if (latestReport?.ingested_at) {
    staleHours = Math.round(
      (now.getTime() - new Date(latestReport.ingested_at).getTime()) / (1000 * 60 * 60)
    );
  }
  const isCriticallyStale = staleHours > 36;

  const staleAge =
    staleHours < 1
      ? "less than an hour ago"
      : staleHours < 24
        ? `${staleHours} hour${staleHours === 1 ? "" : "s"} ago`
        : `${Math.round(staleHours / 24)} day${Math.round(staleHours / 24) === 1 ? "" : "s"} ago`;

  const hasAnyData = latestReport || tasks.length > 0 || risks.length > 0 || objectives.length > 0;

  const metricsNote =
    metricsReportDate && metricsReportDate !== today
      ? `Metrics from ${new Date(metricsReportDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
      : null;

  return (
    <div className="page-container">
      <Header
        ingestionTime={latestReport?.ingested_at}
        performanceScore={latestReport?.performance_score ?? null}
      />

      {!hasAnyData && (
        <EmptyState
          title="No intelligence available"
          description="Waiting for first report ingestion from Cowork AI"
          icon={<FileTextIcon size={40} strokeWidth={1.5} />}
        />
      )}

      {latestReport && isStale && (
        <Banner
          message={`Last updated ${staleAge}`}
          detail={
            isCriticallyStale
              ? "The nightly intelligence run may have failed. Check your email for an error report."
              : undefined
          }
          variant={isCriticallyStale ? "critical" : "warning"}
        />
      )}

      {hasAnyData && (
        <>
          {latestReport?.coaching_insight && (
            <CoachingCard insight={latestReport.coaching_insight} />
          )}
          <CriticalZone risks={risks} />
          <ExecutionZone tasks={tasks} />
          <StrategicZone objectives={objectives} />
          <ContextMetrics metrics={metrics} note={metricsNote} />
        </>
      )}
    </div>
  );
}
