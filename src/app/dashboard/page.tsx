import { createServerClient } from "@/lib/supabase";
import {
  Report,
  Risk,
  Task,
  Objective,
  Metric,
  type CalendarEventSnapshot,
} from "@/lib/types";
import { Header } from "@/components/layout/Header";
import { Banner } from "@/components/system/Banner";
import { CriticalZone } from "@/components/dashboard/CriticalZone";
import { ExecutionZone } from "@/components/dashboard/ExecutionZone";
import { StrategicZone } from "@/components/dashboard/StrategicZone";
import { ContextMetrics } from "@/components/dashboard/ContextMetrics";
import { CoachingCard } from "@/components/dashboard/CoachingCard";
import { WhatsAppInsights } from "@/components/dashboard/WhatsAppInsights";
import { ScoreSparkline } from "@/components/dashboard/ScoreSparkline";
import { CalendarCard } from "@/components/dashboard/CalendarCard";
import { EmptyState } from "@/components/system/EmptyState";
import { FileTextIcon } from "lucide-react";

function parseCalendarEvents(raw: unknown): CalendarEventSnapshot[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (e): e is CalendarEventSnapshot =>
      e !== null &&
      typeof e === "object" &&
      "title" in e &&
      typeof (e as CalendarEventSnapshot).title === "string"
  );
}

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

function dedupeByTitle<T extends { title: string; created_at: string }>(
  rows: T[]
): T[] {
  const map = new Map<string, T>();
  // Sort: completed tasks first, then newest first within same completion status.
  // This ensures a user-completed task is never overridden by a newer
  // incomplete version re-sent by Cowork in the next nightly run.
  const sorted = [...rows].sort((a, b) => {
    const aCompleted = "completed" in a && (a as { completed: boolean }).completed;
    const bCompleted = "completed" in b && (b as { completed: boolean }).completed;
    if (aCompleted !== bCompleted) return aCompleted ? -1 : 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
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
  whatsappInsights: string | null;
  scoreSeries: { date: string; score: number }[];
  calendarEvents: CalendarEventSnapshot[];
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

  const [tasksRes, risksRes, objectivesRes, scoreReportsRes] = await Promise.all([
    // Fetch ALL tasks (complete + incomplete) before dedup.
    // Dedup prefers completed=true rows, then we filter them out.
    // This prevents completed tasks from reappearing when Cowork
    // re-sends them as incomplete in the next nightly run.
    supabase
      .from("tasks")
      .select("*")
      .gte("created_at", thirtyDaysAgo)
      .order("created_at", { ascending: false }),
    latestReport
      ? supabase
          .from("risks")
          .select("*")
          .eq("report_id", latestReport.id)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as Risk[] | null, error: null }),
    supabase
      .from("objectives")
      .select("*")
      .neq("status", "completed")
      .gte("created_at", ninetyDaysAgo)
      .order("created_at", { ascending: false }),
    supabase
      .from("reports")
      .select("report_date, performance_score")
      .not("performance_score", "is", null)
      .order("report_date", { ascending: true })
      .limit(60),
  ]);

  const allTasks = dedupeByTitle((tasksRes.data ?? []) as Task[]);
  const tasks = allTasks.filter((t) => !t.completed);
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

  const whatsappInsights =
    (latestReport as Report | null)?.whatsapp_insights ??
    (latestReport as Report | null)?.raw_content ??
    null;

  const scoreRows = (scoreReportsRes.data ?? [])
    .filter((r) => r.performance_score != null)
    .map((r) => ({
      date: r.report_date,
      score: Number(r.performance_score),
    }));
  const scoreSeries = scoreRows.slice(-14);

  const calendarEvents = parseCalendarEvents(latestReport?.calendar_events);

  return {
    latestReport: latestReport as Report | null,
    tasks,
    risks,
    objectives,
    metrics,
    metricsReportDate,
    whatsappInsights,
    scoreSeries,
    calendarEvents,
  };
}

export default async function DashboardPage() {
  const {
    latestReport,
    tasks,
    risks,
    objectives,
    metrics,
    metricsReportDate,
    whatsappInsights,
    scoreSeries,
    calendarEvents,
  } = await getDashboardData();

  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const isStale = latestReport && latestReport.report_date !== today;

  let staleHours = 0;
  if (latestReport?.ingested_at) {
    staleHours = Math.round(
      (now.getTime() - new Date(latestReport.ingested_at).getTime()) / (1000 * 60 * 60)
    );
  }
  const isCriticallyStale = staleHours > 48;

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
        reportDate={latestReport?.report_date ?? null}
        runNumber={latestReport?.run_number ?? null}
      />

      {scoreSeries.length >= 2 && <ScoreSparkline scores={scoreSeries} />}

      {calendarEvents.length > 0 && <CalendarCard events={calendarEvents} />}

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
              ? "Nightly run appears to have failed. Open Cowork and trigger the Daily Intelligence Report manually to refresh."
              : "Intelligence data may be incomplete. A fresh run is expected tonight."
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
          {whatsappInsights && (
            <WhatsAppInsights insights={whatsappInsights} />
          )}
        </>
      )}
    </div>
  );
}
