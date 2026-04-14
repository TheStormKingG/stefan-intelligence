import { createServerClient } from "@/lib/supabase";
import { Report, Objective, Metric } from "@/lib/types";
import { Header } from "@/components/layout/Header";
import { DailyGainTracker } from "@/components/president/DailyGainTracker";
import { StrategicTimeline } from "@/components/president/StrategicTimeline";
import { NetworkMap } from "@/components/president/NetworkMap";
import { CoachingHistory } from "@/components/president/CoachingHistory";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

interface PresidentData {
  latestReport: Report | null;
  recentReports: Report[];
  objectives: Objective[];
  latestMetrics: Metric[];
}

async function getPresidentData(): Promise<PresidentData> {
  const supabase = createServerClient();

  const ninetyDaysAgo = new Date(
    Date.now() - 90 * 24 * 60 * 60 * 1000
  ).toISOString();

  const [reportsRes, objectivesRes] = await Promise.all([
    supabase
      .from("reports")
      .select("*")
      .order("report_date", { ascending: false })
      .limit(30),
    supabase
      .from("objectives")
      .select("*")
      .gte("created_at", ninetyDaysAgo)
      .order("created_at", { ascending: false }),
  ]);

  const reports = (reportsRes.data ?? []) as Report[];
  const latestReport = reports[0] ?? null;

  let latestMetrics: Metric[] = [];
  if (latestReport) {
    const { data } = await supabase
      .from("metrics")
      .select("*")
      .eq("report_id", latestReport.id)
      .order("created_at");
    latestMetrics = (data ?? []) as Metric[];
  }

  return {
    latestReport,
    recentReports: reports,
    objectives: (objectivesRes.data ?? []) as Objective[],
    latestMetrics,
  };
}

export default async function PresidentPage() {
  const { latestReport, recentReports, objectives, latestMetrics } =
    await getPresidentData();

  const scores = recentReports
    .filter((r) => r.performance_score != null)
    .map((r) => ({
      date: r.report_date,
      score: Number(r.performance_score),
    }))
    .reverse();

  const coachingEntries = recentReports
    .filter((r) => r.coaching_insight)
    .map((r) => ({
      date: r.report_date,
      insight: r.coaching_insight!,
    }));

  return (
    <div className="page-container">
      <header className="mb-8 animate-fade-in">
        <p className="text-caption text-tertiary uppercase tracking-widest mb-1.5">
          Chief Operations Office
        </p>
        <h1 className="text-title-lg text-foreground tracking-tight">
          President-Maker
        </h1>
        <p className="text-body-sm text-secondary mt-1">
          Strategic command center — daily 1% compounding
        </p>
        {latestReport?.ingested_at && (
          <p className="text-caption text-tertiary mt-2">
            Last intel{" "}
            {new Date(latestReport.ingested_at).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
      </header>

      <DailyGainTracker scores={scores} currentMetrics={latestMetrics} />
      <StrategicTimeline objectives={objectives} />
      <NetworkMap />
      <CoachingHistory entries={coachingEntries} />
    </div>
  );
}
