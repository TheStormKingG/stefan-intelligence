import { createServerClient } from "@/lib/supabase";
import { ReportWithChildren } from "@/lib/types";
import { Header } from "@/components/layout/Header";
import { Banner } from "@/components/system/Banner";
import { CriticalZone } from "@/components/dashboard/CriticalZone";
import { ExecutionZone } from "@/components/dashboard/ExecutionZone";
import { StrategicZone } from "@/components/dashboard/StrategicZone";
import { ContextMetrics } from "@/components/dashboard/ContextMetrics";
import { EmptyState } from "@/components/system/EmptyState";
import { FileTextIcon } from "lucide-react";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

async function getLatestReport(): Promise<ReportWithChildren | null> {
  const supabase = createServerClient();

  const { data: report } = await supabase
    .from("reports")
    .select("*")
    .order("report_date", { ascending: false })
    .limit(1)
    .single();

  if (!report) return null;

  const [risks, tasks, objectives, metrics] = await Promise.all([
    supabase
      .from("risks")
      .select("*")
      .eq("report_id", report.id)
      .order("created_at"),
    supabase
      .from("tasks")
      .select("*")
      .eq("report_id", report.id)
      .order("created_at"),
    supabase
      .from("objectives")
      .select("*")
      .eq("report_id", report.id)
      .order("created_at"),
    supabase
      .from("metrics")
      .select("*")
      .eq("report_id", report.id)
      .order("created_at"),
  ]);

  return {
    ...report,
    risks: risks.data ?? [],
    tasks: tasks.data ?? [],
    objectives: objectives.data ?? [],
    metrics: metrics.data ?? [],
  };
}

export default async function DashboardPage() {
  const report = await getLatestReport();

  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const isStale = report && report.report_date !== today;

  let staleHours = 0;
  if (report?.ingested_at) {
    staleHours = Math.round(
      (now.getTime() - new Date(report.ingested_at).getTime()) / (1000 * 60 * 60)
    );
  }
  const isCriticallyStale = staleHours > 36;

  const staleAge =
    staleHours < 1
      ? "less than an hour ago"
      : staleHours < 24
        ? `${staleHours} hour${staleHours === 1 ? "" : "s"} ago`
        : `${Math.round(staleHours / 24)} day${Math.round(staleHours / 24) === 1 ? "" : "s"} ago`;

  return (
    <div className="page-container">
      <Header ingestionTime={report?.ingested_at} />

      {!report && (
        <EmptyState
          title="No intelligence available"
          description="Waiting for first report ingestion from Cowork AI"
          icon={<FileTextIcon size={40} strokeWidth={1.5} />}
        />
      )}

      {report && isStale && (
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

      {report && (
        <>
          <CriticalZone risks={report.risks} />
          <ExecutionZone tasks={report.tasks} />
          <StrategicZone objectives={report.objectives} />
          <ContextMetrics metrics={report.metrics} />
        </>
      )}
    </div>
  );
}
