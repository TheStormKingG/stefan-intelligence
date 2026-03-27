import { createServerClient } from "@/lib/supabase";
import { ReportWithChildren } from "@/lib/types";
import { ReportReader } from "@/components/report/ReportReader";
import { EmptyState } from "@/components/system/EmptyState";
import { FileTextIcon, ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getReport(date: string): Promise<ReportWithChildren | null> {
  const supabase = createServerClient();

  const { data: report } = await supabase
    .from("reports")
    .select("*")
    .eq("report_date", date)
    .single();

  if (!report) return null;

  const [risks, tasks, objectives, metrics] = await Promise.all([
    supabase.from("risks").select("*").eq("report_id", report.id).order("created_at"),
    supabase.from("tasks").select("*").eq("report_id", report.id).order("created_at"),
    supabase.from("objectives").select("*").eq("report_id", report.id).order("created_at"),
    supabase.from("metrics").select("*").eq("report_id", report.id).order("created_at"),
  ]);

  return {
    ...report,
    risks: risks.data ?? [],
    tasks: tasks.data ?? [],
    objectives: objectives.data ?? [],
    metrics: metrics.data ?? [],
  };
}

export default async function ReportPage({
  params,
}: {
  params: { date: string };
}) {
  const report = await getReport(params.date);

  return (
    <div className="page-container">
      <Link
        href="/archive"
        className="inline-flex items-center gap-1.5 text-body-sm text-objective-revenue mb-6"
      >
        <ArrowLeftIcon size={16} />
        Archive
      </Link>

      {!report ? (
        <EmptyState
          title="Report not found"
          description={`No intelligence report found for ${params.date}`}
          icon={<FileTextIcon size={40} strokeWidth={1.5} />}
        />
      ) : (
        <ReportReader report={report} />
      )}
    </div>
  );
}
