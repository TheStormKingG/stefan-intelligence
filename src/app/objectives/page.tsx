import { createServerClient } from "@/lib/supabase";
import { Objective } from "@/lib/types";
import { sortObjectivesByUrgency } from "@/lib/utils";
import { ObjectiveCard } from "@/components/objectives/ObjectiveCard";
import { EmptyState } from "@/components/system/EmptyState";
import { TargetIcon } from "lucide-react";

export const dynamic = "force-dynamic";

async function getObjectives(): Promise<Objective[]> {
  const supabase = createServerClient();

  const { data: report } = await supabase
    .from("reports")
    .select("id")
    .order("report_date", { ascending: false })
    .limit(1)
    .single();

  if (!report) return [];

  const { data: objectives } = await supabase
    .from("objectives")
    .select("*")
    .eq("report_id", report.id)
    .order("created_at");

  return objectives ?? [];
}

export default async function ObjectivesPage() {
  const objectives = await getObjectives();
  const sorted = sortObjectivesByUrgency(objectives);

  return (
    <div className="page-container">
      <div className="mb-6">
        <h1 className="text-title-lg text-foreground">Strategy</h1>
        <p className="text-body-sm text-secondary mt-0.5">
          SMART objectives and strategic initiatives
        </p>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          title="No objectives"
          description="Strategic objectives will appear after report ingestion"
          icon={<TargetIcon size={40} strokeWidth={1.5} />}
        />
      ) : (
        <div className="space-y-3">
          {sorted.map((obj, i) => (
            <ObjectiveCard key={obj.id} objective={obj} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
