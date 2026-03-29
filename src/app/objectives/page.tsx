import { createServerClient } from "@/lib/supabase";
import { Objective } from "@/lib/types";
import { sortObjectivesByUrgency } from "@/lib/utils";
import { ObjectiveCard } from "@/components/objectives/ObjectiveCard";
import { EmptyState } from "@/components/system/EmptyState";
import { TargetIcon } from "lucide-react";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

function dedupeByTitle(rows: Objective[]): Objective[] {
  const map = new Map<string, Objective>();
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

async function getObjectives(): Promise<Objective[]> {
  const supabase = createServerClient();

  const ninetyDaysAgo = new Date(
    Date.now() - 90 * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data: objectives } = await supabase
    .from("objectives")
    .select("*")
    .neq("status", "completed")
    .gte("created_at", ninetyDaysAgo)
    .order("created_at", { ascending: false });

  return dedupeByTitle((objectives ?? []) as Objective[]);
}

export default async function ObjectivesPage() {
  const objectives = await getObjectives();
  const sorted = sortObjectivesByUrgency(objectives);

  return (
    <div className="page-container">
      <div className="mb-8">
        <p className="text-caption text-tertiary uppercase tracking-widest mb-1">Strategic</p>
        <h1 className="text-title-lg text-foreground tracking-tight">Objectives</h1>
        <p className="text-body-sm text-secondary mt-1">
          SMART objectives and strategic initiatives
        </p>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          title="No objectives"
          description="Strategic objectives will appear after report ingestion"
          icon={<TargetIcon size={24} strokeWidth={1.5} />}
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
