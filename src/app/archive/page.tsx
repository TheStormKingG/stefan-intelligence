import { createServerClient } from "@/lib/supabase";
import { Report } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/system/EmptyState";
import { ArchiveIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

async function getReports(): Promise<Report[]> {
  const supabase = createServerClient();

  const { data } = await supabase
    .from("reports")
    .select("*")
    .order("report_date", { ascending: false })
    .limit(90);

  return data ?? [];
}

export default async function ArchivePage() {
  const reports = await getReports();

  return (
    <div className="page-container">
      <div className="mb-6">
        <h1 className="text-title-lg text-foreground">Archive</h1>
        <p className="text-body-sm text-secondary mt-0.5">
          Historical intelligence reports
        </p>
      </div>

      {reports.length === 0 ? (
        <EmptyState
          title="No reports"
          description="Intelligence reports will appear here after ingestion"
          icon={<ArchiveIcon size={40} strokeWidth={1.5} />}
        />
      ) : (
        <div className="card divide-y divide-border">
          {reports.map((report, i) => (
            <Link
              key={report.id}
              href={`/report/${report.report_date}`}
              className="flex items-center justify-between p-4 transition-colors duration-150 active:bg-gray-50 animate-slide-up"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div>
                <p className="text-body-md text-foreground font-medium">
                  {formatDate(report.report_date)}
                </p>
                {report.summary && (
                  <p className="text-body-sm text-secondary mt-0.5 line-clamp-1">
                    {report.summary}
                  </p>
                )}
              </div>
              <ChevronRightIcon size={18} className="text-tertiary flex-shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
