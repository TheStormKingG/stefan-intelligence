import { ReportWithChildren } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { SEVERITY_CONFIG, PRIORITY_CONFIG, OBJECTIVE_TYPE_CONFIG, STATUS_CONFIG } from "@/lib/constants";

interface ReportReaderProps {
  report: ReportWithChildren;
}

export function ReportReader({ report }: ReportReaderProps) {
  return (
    <article className="animate-fade-in">
      <header className="mb-8">
        <p className="text-caption text-tertiary uppercase tracking-widest mb-2">
          Intelligence Report
        </p>
        <h1 className="text-title-lg text-foreground tracking-tight">
          {formatDate(report.report_date)}
        </h1>
        {report.generated_at && (
          <p className="text-body-sm text-tertiary mt-1.5">
            Generated{" "}
            {new Date(report.generated_at).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
      </header>

      {report.summary && (
        <section className="mb-8">
          <h2 className="text-title-sm text-foreground mb-3">Summary</h2>
          <div className="card p-5">
            <p className="text-body-lg text-secondary leading-relaxed">
              {report.summary}
            </p>
          </div>
        </section>
      )}

      {report.risks.length > 0 && (
        <section className="mb-8">
          <h2 className="text-title-sm text-foreground mb-3 px-1">Risks</h2>
          <div className="space-y-3">
            {report.risks.map((risk) => {
              const config = SEVERITY_CONFIG[risk.severity];
              const borderClass =
                risk.severity === "critical" ? "risk-border-critical" : "risk-border-high";
              return (
                <div key={risk.id} className={`card p-4 ${risk.severity === "critical" || risk.severity === "high" ? borderClass : ""}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`status-badge ${config.color}`}>
                      {config.label}
                    </span>
                    {risk.category && (
                      <span className="text-caption text-tertiary">{risk.category}</span>
                    )}
                  </div>
                  <h3 className="text-body-md text-foreground font-medium">{risk.title}</h3>
                  {risk.description && (
                    <p className="text-body-sm text-secondary mt-1.5 leading-relaxed">{risk.description}</p>
                  )}
                  {risk.mitigation && (
                    <p className="text-body-sm text-tertiary mt-2 italic">{risk.mitigation}</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {report.tasks.length > 0 && (
        <section className="mb-8">
          <h2 className="text-title-sm text-foreground mb-3 px-1">Tasks</h2>
          <div className="card divide-y divider-soft">
            {report.tasks.map((task) => {
              const config = PRIORITY_CONFIG[task.priority];
              return (
                <div key={task.id} className="flex items-start gap-3 p-4">
                  <span className={`priority-dot mt-1.5 ${config.dotColor}`} />
                  <div>
                    <p className={`text-body-md font-medium ${task.completed ? "text-tertiary line-through" : "text-foreground"}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-body-sm text-secondary mt-0.5 leading-relaxed">{task.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {report.objectives.length > 0 && (
        <section className="mb-8">
          <h2 className="text-title-sm text-foreground mb-3 px-1">Objectives</h2>
          <div className="space-y-3">
            {report.objectives.map((obj) => {
              const typeConfig = OBJECTIVE_TYPE_CONFIG[obj.type];
              const statusConfig = STATUS_CONFIG[obj.status];
              return (
                <div key={obj.id} className="card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`status-badge ${typeConfig.color}`}>
                      {typeConfig.label}
                    </span>
                    <span className={`text-caption ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                  <h3 className="text-body-md text-foreground font-medium">{obj.title}</h3>
                  {obj.description && (
                    <p className="text-body-sm text-secondary mt-1 leading-relaxed">{obj.description}</p>
                  )}
                  {obj.notes && (
                    <p className="text-body-sm text-tertiary mt-1.5 italic">{obj.notes}</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {report.raw_content && (
        <section className="mb-8">
          <h2 className="text-title-sm text-foreground mb-3 px-1">Full Report</h2>
          <div className="card p-5">
            <div className="text-body-md text-secondary leading-relaxed whitespace-pre-wrap">
              {report.raw_content}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
