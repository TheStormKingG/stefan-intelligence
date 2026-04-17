import type { CalendarEventSnapshot } from "@/lib/types";
import { CalendarDaysIcon } from "lucide-react";
import { SectionContainer } from "@/components/system/SectionContainer";

interface CalendarCardProps {
  events: CalendarEventSnapshot[];
}

function isToday(dateStr: string | undefined): boolean {
  if (!dateStr) return false;
  const eventDate = new Date(dateStr);
  const today = new Date();
  return (
    eventDate.getFullYear() === today.getFullYear() &&
    eventDate.getMonth() === today.getMonth() &&
    eventDate.getDate() === today.getDate()
  );
}

export function CalendarCard({ events }: CalendarCardProps) {
  const todayEvents = events.filter(ev => isToday(ev.start ?? ev.end));
  if (!todayEvents.length) return null;

  return (
    <SectionContainer title={"Today's schedule"} subtitle="From intelligence run (calendar fallback)">
      <div className="card p-5 space-y-3">
        {todayEvents.map((ev, i) => (
          <div key={`${ev.title}-${i}`} className="flex gap-3 items-start">
            <CalendarDaysIcon
              size={18}
              strokeWidth={1.5}
              className="text-accent-blue shrink-0 mt-0.5"
            />
            <div>
              <p className="text-body-md text-foreground font-medium">{ev.title}</p>
              {(ev.start || ev.end) && (
                <p className="text-body-sm text-secondary mt-0.5">
                  {[ev.start, ev.end].filter(Boolean).join(" → ")}
                  {ev.all_day ? " · All day" : ""}
                </p>
              )}
              {ev.location && (
                <p className="text-caption text-tertiary mt-0.5">{ev.location}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </SectionContainer>
  );
}
