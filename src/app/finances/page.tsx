"use client";

import { useState, useEffect } from "react";
import { FinancialEntry, FinancialSummary, FinancialApiResponse, PayslipData } from "@/lib/types";
import { SegmentedControl } from "@/components/system/SegmentedControl";
import { EmptyState } from "@/components/system/EmptyState";
import {
  WalletIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  CalendarIcon,
  ClockIcon,
  CalendarDaysIcon,
  LightbulbIcon,
  ChevronDownIcon,
} from "lucide-react";

const SEGMENTS = [
  { value: "1", label: "1 mo" },
  { value: "3", label: "3 mo" },
  { value: "6", label: "6 mo" },
];

const PERIOD_LABELS: Record<string, string> = {
  "1": "1 month",
  "3": "3 months",
  "6": "6 months",
};

const CATEGORY_COLORS: Record<string, string> = {
  salary: "text-severity-low",
  food: "text-severity-high",
  transport: "text-accent-blue",
  subscription: "text-accent-purple",
  medical: "text-severity-critical",
  education: "text-objective-strategic",
  misc: "text-tertiary",
};

const BAR_GRADIENTS = [
  "linear-gradient(135deg, #5B8DEF, #7B6CD9)",
  "linear-gradient(135deg, #3FBF6E, #2FA85C)",
  "linear-gradient(135deg, #F0923B, #E0802B)",
  "linear-gradient(135deg, #7B6CD9, #B06ED9)",
  "linear-gradient(135deg, #E8505B, #D8404B)",
];

function fmtGYD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

function fmtUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

function fmtDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function FinancesPage() {
  const [months, setMonths] = useState("3");
  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [tip, setTip] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/financial?months=${months}`)
      .then((res) => res.json())
      .then((data: FinancialApiResponse) => {
        setEntries(data.entries ?? []);
        setSummary(data.summary ?? null);
        setTip(data.financial_tip ?? "");
      })
      .catch(() => {
        setEntries([]);
        setSummary(null);
        setTip("");
      })
      .finally(() => setLoading(false));
  }, [months]);

  const latestPayslip = entries.find(
    (e) => e.entry_type === "income" && e.payslip_data
  )?.payslip_data ?? null;

  const isPositive = (summary?.net_balance_gyd ?? 0) >= 0;
  const hasData = entries.length > 0 || (summary && summary.transaction_count > 0);

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-caption text-tertiary uppercase tracking-widest mb-1">Financial</p>
          <h1 className="text-title-lg text-foreground tracking-tight">Finances</h1>
        </div>
        <SegmentedControl
          segments={SEGMENTS}
          value={months}
          onChange={setMonths}
        />
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="card p-6"><div className="skeleton h-16 w-48 mx-auto mb-3" /><div className="skeleton h-4 w-32 mx-auto" /></div>
          <div className="flex gap-3"><div className="card p-4 flex-1"><div className="skeleton h-8 w-full" /></div><div className="card p-4 flex-1"><div className="skeleton h-8 w-full" /></div><div className="card p-4 flex-1"><div className="skeleton h-8 w-full" /></div></div>
          <div className="card p-4"><div className="skeleton h-10 w-full mb-2" /><div className="skeleton h-10 w-full" /></div>
        </div>
      ) : !hasData ? (
        <EmptyState
          title="No financial data"
          description="No financial data tracked yet. Transactions will appear after the next intelligence run."
          icon={<WalletIcon size={24} strokeWidth={1.5} />}
        />
      ) : (
        <>
          {summary && <BalanceCard summary={summary} isPositive={isPositive} />}
          {summary && summary.total_expenses_gyd > 0 && <AnalyticsCards summary={summary} />}
          {summary && summary.top_categories.length > 0 && (
            <TopSpending categories={summary.top_categories} period={PERIOD_LABELS[months]} />
          )}
          {tip && <TipCard tip={tip} />}
          {entries.length > 0 && <SpendingLog entries={entries} />}
          {latestPayslip && <PayslipBreakdown payslip={latestPayslip} />}
        </>
      )}
    </div>
  );
}

/* ── A: Balance Card ── */

function BalanceCard({ summary, isPositive }: { summary: FinancialSummary; isPositive: boolean }) {
  return (
    <div className="card p-6 mb-4 text-center animate-fade-in">
      <p className="text-caption text-tertiary uppercase tracking-widest mb-2">Net Balance</p>
      <p className={`text-[32px] font-bold tabular-nums tracking-tight ${isPositive ? "text-severity-low" : "text-severity-critical"}`}>
        {isPositive ? "" : "-"}${fmtGYD(Math.abs(summary.net_balance_gyd))}
        <span className="text-body-sm font-normal text-tertiary ml-1">GYD</span>
      </p>
      <p className="text-caption text-tertiary mt-1">
        Based on tracked income and expenses
      </p>

      <div className="flex items-center justify-center gap-8 mt-5 pt-5 border-t divider-soft">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <TrendingUpIcon size={14} className="text-severity-low" />
            <span className="text-caption text-tertiary">Income</span>
          </div>
          <p className="text-title-sm text-severity-low tabular-nums">
            ${fmtGYD(summary.total_income_gyd)}
          </p>
        </div>
        <div className="w-px h-10 bg-border" />
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <TrendingDownIcon size={14} className="text-severity-critical" />
            <span className="text-caption text-tertiary">Expenses</span>
          </div>
          <p className="text-title-sm text-severity-critical tabular-nums">
            ${fmtGYD(summary.total_expenses_gyd)}
          </p>
        </div>
      </div>

      {summary.total_expenses_usd > 0 && (
        <p className="text-caption text-tertiary mt-3">
          + {fmtUSD(summary.total_expenses_usd)} USD expenses
        </p>
      )}
    </div>
  );
}

/* ── B: Analytics Cards ── */

function AnalyticsCards({ summary }: { summary: FinancialSummary }) {
  const items = [
    { label: "Daily Avg", value: summary.avg_daily_spend_gyd, icon: CalendarIcon },
    { label: "Weekly Avg", value: summary.avg_weekly_spend_gyd, icon: ClockIcon },
    { label: "Monthly Avg", value: summary.avg_monthly_spend_gyd, icon: CalendarDaysIcon },
  ];

  return (
    <div className="flex gap-3 mb-4 animate-fade-in">
      {items.map((item) => (
        <div key={item.label} className="card flex-1 p-3.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <item.icon size={12} className="text-tertiary" />
            <span className="text-caption text-tertiary">{item.label}</span>
          </div>
          <p className="text-title-sm text-foreground tabular-nums">
            ${fmtGYD(item.value)}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ── C: Top Spending Categories ── */

function TopSpending({ categories, period }: { categories: FinancialSummary["top_categories"]; period: string }) {
  const maxGyd = Math.max(...categories.map((c) => c.total_gyd), 1);

  return (
    <div className="mb-4 animate-fade-in">
      <p className="text-caption text-tertiary uppercase tracking-widest mb-3 px-1">
        Top Spending ({period})
      </p>
      <div className="card p-4 space-y-3.5">
        {categories.map((cat, i) => {
          const pct = maxGyd > 0 ? (cat.total_gyd / maxGyd) * 100 : 0;
          const name = cat.category.charAt(0).toUpperCase() + cat.category.slice(1);
          return (
            <div key={cat.category}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-body-sm text-foreground font-medium">{name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-body-sm text-foreground tabular-nums font-medium">
                    ${fmtGYD(cat.total_gyd)}
                  </span>
                  {cat.percentage > 0 && (
                    <span className="text-caption text-tertiary tabular-nums">
                      {Math.round(cat.percentage)}%
                    </span>
                  )}
                </div>
              </div>
              <div className="h-2 rounded-full overflow-hidden"
                style={{ background: "var(--color-background)", boxShadow: "var(--neu-inset)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max(pct, 2)}%`,
                    background: BAR_GRADIENTS[i % BAR_GRADIENTS.length],
                  }}
                />
              </div>
              {cat.total_usd > 0 && (
                <p className="text-caption text-tertiary mt-1">+ {fmtUSD(cat.total_usd)} USD</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── D: Financial Tip ── */

function TipCard({ tip }: { tip: string }) {
  return (
    <div className="glass-banner flex items-start gap-3 px-4 py-3.5 mb-4 animate-fade-in"
      style={{ borderLeft: "3px solid #EAB930" }}
    >
      <LightbulbIcon size={16} strokeWidth={2} className="flex-shrink-0 mt-0.5 text-severity-medium" />
      <p className="text-body-sm text-foreground">{tip}</p>
    </div>
  );
}

/* ── E: Spending Log ── */

function SpendingLog({ entries }: { entries: FinancialEntry[] }) {
  return (
    <div className="mb-4 animate-fade-in">
      <p className="text-caption text-tertiary uppercase tracking-widest mb-3 px-1">
        Spending Log ({entries.length})
      </p>
      <div className="card overflow-hidden">
        <div className="flex items-center px-4 py-2.5 border-b divider-soft"
          style={{ background: "var(--color-background)" }}
        >
          <span className="text-caption text-tertiary font-medium w-[60px]">Date</span>
          <span className="text-caption text-tertiary font-medium flex-1">Item</span>
          <span className="text-caption text-tertiary font-medium text-right w-[90px]">Amount</span>
          <span className="text-caption text-tertiary font-medium text-right w-[70px]">Type</span>
        </div>
        <div className="divide-y divider-soft">
          {entries.map((entry, i) => (
            <LogRow key={entry.id} entry={entry} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

function LogRow({ entry, index }: { entry: FinancialEntry; index: number }) {
  const isIncome = entry.entry_type === "income";
  const borderColor = isIncome ? "#3FBF6E" : "#E8505B";
  const amountColor = isIncome ? "text-severity-low" : "text-severity-critical";
  const sign = isIncome ? "+" : "-";
  const sym = entry.currency === "USD" ? "US$" : "$";
  const catColor = entry.category ? (CATEGORY_COLORS[entry.category] ?? "text-tertiary") : "text-tertiary";

  return (
    <div
      className="flex items-center px-4 py-3 animate-slide-up"
      style={{
        animationDelay: `${index * 25}ms`,
        borderLeft: `3px solid ${borderColor}`,
      }}
    >
      <span className="text-caption text-tertiary w-[60px] flex-shrink-0">
        {fmtDate(entry.date)}
      </span>
      <div className="flex-1 min-w-0 pr-2">
        <p className="text-body-sm text-foreground font-medium truncate">{entry.description}</p>
        {entry.source && (
          <p className="text-caption text-tertiary truncate">via {entry.source}</p>
        )}
      </div>
      <span className={`text-body-sm font-semibold tabular-nums text-right w-[90px] flex-shrink-0 ${amountColor}`}>
        {sign}{sym}{fmtGYD(Number(entry.amount))}
      </span>
      <span className="w-[70px] flex-shrink-0 text-right">
        {entry.category && (
          <span className={`status-badge ${catColor} text-[10px]`}>
            {entry.category}
          </span>
        )}
      </span>
    </div>
  );
}

/* ── F: Payslip Breakdown ── */

function PayslipBreakdown({ payslip }: { payslip: PayslipData }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="animate-fade-in">
      <button
        onClick={() => setExpanded(!expanded)}
        className="card w-full text-left p-4 flex items-center justify-between"
      >
        <div>
          <p className="text-body-sm text-foreground font-medium">
            Latest Payslip — {payslip.pay_period}
          </p>
          <p className="text-caption text-tertiary mt-0.5">{payslip.employer}</p>
        </div>
        <ChevronDownIcon
          size={18}
          className={`text-tertiary transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
        <div className="card mt-2 p-4 animate-fade-in">
          <div className="space-y-2.5">
            <PayslipRow label="Basic Pay" amount={payslip.basic_pay} />

            {payslip.allowances.map((a) => (
              <PayslipRow key={a.name} label={a.name} amount={a.amount} indent />
            ))}

            <div className="border-t divider-soft pt-2.5">
              <PayslipRow label="Gross Pay" amount={payslip.gross_pay} bold />
            </div>

            {payslip.deductions.map((d) => (
              <PayslipRow key={d.name} label={d.name} amount={-d.amount} indent />
            ))}

            <PayslipRow label="Total Deductions" amount={-payslip.total_deductions} />

            <div className="border-t divider-soft pt-2.5">
              <PayslipRow label="Net Pay" amount={payslip.net_pay} bold highlight />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PayslipRow({
  label,
  amount,
  bold,
  indent,
  highlight,
}: {
  label: string;
  amount: number;
  bold?: boolean;
  indent?: boolean;
  highlight?: boolean;
}) {
  const isNeg = amount < 0;
  const color = highlight
    ? "text-severity-low"
    : isNeg
      ? "text-severity-critical"
      : "text-foreground";

  return (
    <div className={`flex items-center justify-between ${indent ? "pl-4" : ""}`}>
      <span className={`text-body-sm ${bold ? "font-semibold text-foreground" : "text-secondary"}`}>
        {label}
      </span>
      <span className={`text-body-sm tabular-nums ${bold ? "font-semibold" : "font-medium"} ${color}`}>
        {isNeg ? "-" : ""}${fmtGYD(Math.abs(amount))}
      </span>
    </div>
  );
}
