"use client";

import { useState, useEffect } from "react";
import { FinancialEntry, FinancialSummary } from "@/lib/types";
import { SegmentedControl } from "@/components/system/SegmentedControl";
import { EmptyState } from "@/components/system/EmptyState";
import { WalletIcon, TrendingUpIcon, TrendingDownIcon } from "lucide-react";

const SEGMENTS = [
  { value: "1", label: "1 mo" },
  { value: "3", label: "3 mo" },
  { value: "6", label: "6 mo" },
];

const CATEGORY_COLORS: Record<string, string> = {
  salary: "text-severity-low",
  food: "text-severity-high",
  transport: "text-accent-blue",
  subscription: "text-accent-purple",
  medical: "text-severity-critical",
  education: "text-objective-strategic",
  misc: "text-tertiary",
};

function formatGYD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatEntryDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function FinancesPage() {
  const [months, setMonths] = useState("3");
  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/financial?months=${months}`)
      .then((res) => res.json())
      .then((data) => {
        setEntries(data.entries ?? []);
        setSummary(data.summary ?? null);
      })
      .catch(() => {
        setEntries([]);
        setSummary(null);
      })
      .finally(() => setLoading(false));
  }, [months]);

  const isPositive = (summary?.net_balance_gyd ?? 0) >= 0;

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
          <div className="card p-4"><div className="skeleton h-10 w-full mb-2" /><div className="skeleton h-10 w-full" /></div>
        </div>
      ) : entries.length === 0 && !summary ? (
        <EmptyState
          title="No financial data"
          description="No financial data tracked yet. Transactions will appear after the next intelligence run."
          icon={<WalletIcon size={24} strokeWidth={1.5} />}
        />
      ) : (
        <>
          {summary && <BalanceCard summary={summary} isPositive={isPositive} />}
          {entries.length > 0 && <TransactionList entries={entries} />}
        </>
      )}
    </div>
  );
}

function BalanceCard({ summary, isPositive }: { summary: FinancialSummary; isPositive: boolean }) {
  return (
    <div className="card p-6 mb-6 text-center animate-fade-in">
      <p className="text-caption text-tertiary uppercase tracking-widest mb-2">Net Balance</p>
      <p className={`text-[32px] font-bold tabular-nums tracking-tight ${isPositive ? "text-severity-low" : "text-severity-critical"}`}>
        {isPositive ? "" : "-"}${formatGYD(Math.abs(summary.net_balance_gyd))}
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
            ${formatGYD(summary.total_income_gyd)}
          </p>
        </div>
        <div className="w-px h-10 bg-border" />
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <TrendingDownIcon size={14} className="text-severity-critical" />
            <span className="text-caption text-tertiary">Expenses</span>
          </div>
          <p className="text-title-sm text-severity-critical tabular-nums">
            ${formatGYD(summary.total_expenses_gyd)}
          </p>
        </div>
      </div>

      {summary.total_expenses_usd > 0 && (
        <p className="text-caption text-tertiary mt-3">
          + {formatUSD(summary.total_expenses_usd)} USD expenses
        </p>
      )}
    </div>
  );
}

function TransactionList({ entries }: { entries: FinancialEntry[] }) {
  return (
    <div className="animate-fade-in">
      <p className="text-caption text-tertiary uppercase tracking-widest mb-3 px-1">
        Transactions ({entries.length})
      </p>
      <div className="card divide-y divider-soft">
        {entries.map((entry, i) => (
          <TransactionRow key={entry.id} entry={entry} index={i} />
        ))}
      </div>
    </div>
  );
}

function TransactionRow({ entry, index }: { entry: FinancialEntry; index: number }) {
  const isIncome = entry.entry_type === "income";
  const borderColor = isIncome ? "#3FBF6E" : "#E8505B";
  const amountColor = isIncome ? "text-severity-low" : "text-severity-critical";
  const sign = isIncome ? "+" : "-";
  const currencySymbol = entry.currency === "USD" ? "US$" : "$";
  const catColor = entry.category ? (CATEGORY_COLORS[entry.category] ?? "text-tertiary") : "text-tertiary";

  return (
    <div
      className="flex items-center gap-3 p-4 animate-slide-up"
      style={{
        animationDelay: `${index * 30}ms`,
        borderLeft: `3px solid ${borderColor}`,
      }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-body-md text-foreground font-medium truncate">
            {entry.description}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-caption text-tertiary">{formatEntryDate(entry.date)}</span>
          {entry.category && (
            <>
              <span className="text-tertiary text-caption">·</span>
              <span className={`status-badge ${catColor}`}>
                {entry.category}
              </span>
            </>
          )}
          {entry.source && (
            <>
              <span className="text-tertiary text-caption">·</span>
              <span className="text-caption text-tertiary">via {entry.source}</span>
            </>
          )}
        </div>
      </div>
      <p className={`text-body-md font-semibold tabular-nums flex-shrink-0 ${amountColor}`}>
        {sign}{currencySymbol}{formatGYD(Number(entry.amount))}
      </p>
    </div>
  );
}
