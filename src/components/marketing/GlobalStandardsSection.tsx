"use client";

import { useState } from "react";
import { Check, Leaf } from "lucide-react";

type StandardId = "iso9001" | "iso45001" | "iso14001" | "haccp" | "climate";

interface StandardItem {
  id: StandardId;
  title: string;
  definition: string;
  icon: "check" | "leaf";
}

const STANDARDS: StandardItem[] = [
  {
    id: "iso9001",
    title: "ISO 9001",
    definition:
      "You understand quality systems; create consistent results, improve confidently.",
    icon: "check",
  },
  {
    id: "iso45001",
    title: "ISO 45001",
    definition:
      "You protect people wisely; prevent harm, build safe workplaces daily.",
    icon: "check",
  },
  {
    id: "iso14001",
    title: "ISO 14001",
    definition:
      "You think sustainably; reduce impact, protect environment with smart choices.",
    icon: "check",
  },
  {
    id: "haccp",
    title: "HACCP",
    definition: "You ensure safe food; control risks, protect health every step.",
    icon: "check",
  },
  {
    id: "climate",
    title: "Climate-Friendliness",
    definition:
      "You act responsibly; reduce waste, protect planet, create sustainable future.",
    icon: "leaf",
  },
];

const PANEL_ID = "standards-definition-panel";

function PillIcon({ variant }: { variant: "check" | "leaf" }) {
  if (variant === "leaf") {
    return (
      <span
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center text-severity-high"
        aria-hidden
      >
        <Leaf size={22} strokeWidth={2} className="shrink-0" />
      </span>
    );
  }
  const wrap =
    "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-severity-high text-white shadow-sm";
  return (
    <span className={wrap} aria-hidden>
      <Check size={15} strokeWidth={2.5} />
    </span>
  );
}

export function GlobalStandardsSection() {
  const [openId, setOpenId] = useState<StandardId | null>(null);

  function toggle(id: StandardId) {
    setOpenId((cur) => (cur === id ? null : id));
  }

  const openItem = openId ? STANDARDS.find((s) => s.id === openId) : undefined;
  const panelLabelledBy = openItem ? `${openItem.id}-pill-label` : undefined;

  const firstRow = STANDARDS.slice(0, 4);
  const secondRow = STANDARDS[4];

  return (
    <section className="animate-fade-in" aria-labelledby="how-we-work-heading">
      <div
        className="rounded-card border border-white/60 px-4 py-5 sm:px-6 sm:py-6"
        style={{
          background: "var(--color-surface-solid)",
          boxShadow: "var(--neu-shadow)",
        }}
      >
        <p className="text-center text-[11px] font-medium uppercase tracking-[0.12em] text-tertiary sm:text-caption">
          Aligned with global standards
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {firstRow.map((item) => {
            const expanded = openId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                id={`${item.id}-pill-label`}
                aria-expanded={expanded}
                aria-controls={PANEL_ID}
                onClick={() => toggle(item.id)}
                className={`flex min-h-[52px] items-center justify-center gap-2 rounded-button px-2 py-2.5 text-left text-body-sm font-semibold transition-[color,box-shadow] duration-200 sm:min-h-0 sm:px-3 ${
                  expanded
                    ? "text-foreground ring-2 ring-severity-high/35 ring-offset-2 ring-offset-[var(--color-surface-solid)]"
                    : "text-secondary"
                }`}
                style={{
                  background: "var(--color-background)",
                  boxShadow: "var(--neu-inset)",
                }}
              >
                <PillIcon variant={item.icon} />
                <span className="truncate sm:whitespace-normal">{item.title}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex justify-center">
          <button
            type="button"
            id={`${secondRow.id}-pill-label`}
            aria-expanded={openId === secondRow.id}
            aria-controls={PANEL_ID}
            onClick={() => toggle(secondRow.id)}
            className={`flex w-full max-w-sm items-center justify-center gap-2 rounded-button px-4 py-3 text-body-sm font-semibold transition-[color,box-shadow] duration-200 sm:max-w-md ${
              openId === secondRow.id
                ? "text-foreground ring-2 ring-severity-high/35 ring-offset-2 ring-offset-[var(--color-surface-solid)]"
                : "text-secondary"
            }`}
            style={{
              background: "var(--color-background)",
              boxShadow: "var(--neu-inset)",
            }}
          >
            <PillIcon variant={secondRow.icon} />
            <span>{secondRow.title}</span>
          </button>
        </div>

        <div
          className="grid transition-[grid-template-rows] duration-300 ease-out"
          style={{ gridTemplateRows: openId ? "1fr" : "0fr" }}
        >
          <div className="min-h-0 overflow-hidden">
            <div
              id={PANEL_ID}
              role={openItem ? "region" : undefined}
              aria-labelledby={panelLabelledBy}
              aria-hidden={!openItem}
              className={
                openItem
                  ? "border-t border-[var(--color-separator)] pt-4 transition-opacity duration-200 ease-out"
                  : undefined
              }
            >
              {openItem ? (
                <div key={openItem.id} className="animate-fade-in">
                  <h3 className="text-title-sm text-foreground">{openItem.title}</h3>
                  <p className="mt-2 text-body-md text-secondary leading-relaxed">
                    {openItem.definition}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center sm:mt-10">
        <h2
          id="how-we-work-heading"
          className="text-title-md font-semibold tracking-tight text-foreground"
        >
          How We Work
        </h2>
        <p className="mt-2 text-body-md text-secondary">
          You don&apos;t have to figure this out alone.
        </p>
      </div>
    </section>
  );
}
