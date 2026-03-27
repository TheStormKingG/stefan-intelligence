import { getGreeting, formatDate } from "@/lib/utils";

interface HeaderProps {
  name?: string;
  ingestionTime?: string | null;
}

export function Header({ name = "Stefan", ingestionTime }: HeaderProps) {
  const greeting = getGreeting();
  const today = formatDate(new Date().toISOString());

  return (
    <header className="mb-8 animate-fade-in">
      <p className="text-caption text-tertiary uppercase tracking-widest mb-1.5">
        Executive Intelligence
      </p>
      <h1 className="text-title-lg text-foreground tracking-tight">
        {greeting}, {name}
      </h1>
      <p className="text-body-sm text-secondary mt-1">{today}</p>
      {ingestionTime && (
        <p className="text-caption text-tertiary mt-2">
          Last sync{" "}
          {new Date(ingestionTime).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      )}
    </header>
  );
}
