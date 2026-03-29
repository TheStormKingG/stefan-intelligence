import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { FinancialEntry, FinancialSummary, CategoryBreakdown } from "@/lib/types";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function daysBetween(a: string, b: string): number {
  const ms = Math.abs(new Date(a).getTime() - new Date(b).getTime());
  return Math.max(Math.ceil(ms / (1000 * 60 * 60 * 24)), 1);
}

function generateTip(
  topCat: CategoryBreakdown | undefined,
  totalExpensesGyd: number,
  netBalance: number,
  avgDaily: number,
  totalIncomeGyd: number,
  txCount: number,
): string {
  if (txCount < 3) {
    return "Limited transaction data. Ensure receipts and bank notifications are being captured for accurate tracking.";
  }
  if (netBalance < 0) {
    return "You are spending more than you earn this period. Review discretionary expenses.";
  }
  if (totalIncomeGyd > 0 && avgDaily > totalIncomeGyd / 30) {
    return "Your daily spending rate exceeds your income rate. Adjust to stay within budget.";
  }
  if (topCat && totalExpensesGyd > 0 && topCat.percentage > 50) {
    const name = topCat.category.charAt(0).toUpperCase() + topCat.category.slice(1);
    return `Your top expense category is ${name} (${Math.round(topCat.percentage)}% of spending). Consider ways to reduce this.`;
  }
  return "Your spending is within income. Continue tracking to build a complete financial picture.";
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const months = parseInt(searchParams.get("months") ?? "3", 10);
  const validMonths = Math.min(Math.max(months, 1), 12);

  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - validMonths);
  const cutoffDate = cutoff.toISOString().split("T")[0];

  const defaultDays = validMonths * 30;

  const supabase = createServerClient();

  const { data: entries, error } = await supabase
    .from("financial_entries")
    .select("*")
    .gte("date", cutoffDate)
    .order("date", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch financial data" },
      { status: 500 }
    );
  }

  const typed = (entries ?? []) as FinancialEntry[];

  let totalIncomeGyd = 0;
  let totalExpensesGyd = 0;
  let totalExpensesUsd = 0;

  const catGyd: Record<string, number> = {};
  const catUsd: Record<string, number> = {};

  let firstDate: string | null = null;
  let lastDate: string | null = null;

  for (const entry of typed) {
    const amount = Number(entry.amount);
    const cat = entry.category ?? "misc";

    if (!lastDate || entry.date > lastDate) lastDate = entry.date;
    if (!firstDate || entry.date < firstDate) firstDate = entry.date;

    if (entry.entry_type === "income") {
      if (entry.currency === "GYD") totalIncomeGyd += amount;
    } else if (entry.entry_type === "expense") {
      if (entry.currency === "USD") {
        totalExpensesUsd += amount;
        catUsd[cat] = (catUsd[cat] ?? 0) + amount;
      } else {
        totalExpensesGyd += amount;
        catGyd[cat] = (catGyd[cat] ?? 0) + amount;
      }
    }
  }

  const periodDays =
    firstDate && lastDate ? daysBetween(firstDate, lastDate) : defaultDays;
  const effectiveDays = Math.max(periodDays, 1);

  const avgDaily = totalExpensesGyd / effectiveDays;

  const topCategories: CategoryBreakdown[] = Object.entries(catGyd)
    .map(([category, total]) => ({
      category,
      total_gyd: round2(total),
      total_usd: round2(catUsd[category] ?? 0),
      percentage: totalExpensesGyd > 0 ? round2((total / totalExpensesGyd) * 100) : 0,
    }))
    .sort((a, b) => b.total_gyd - a.total_gyd)
    .slice(0, 3);

  for (const [cat, usdTotal] of Object.entries(catUsd)) {
    if (!catGyd[cat]) {
      topCategories.push({
        category: cat,
        total_gyd: 0,
        total_usd: round2(usdTotal),
        percentage: 0,
      });
    }
  }

  const summary: FinancialSummary = {
    total_income_gyd: round2(totalIncomeGyd),
    total_expenses_gyd: round2(totalExpensesGyd),
    total_expenses_usd: round2(totalExpensesUsd),
    net_balance_gyd: round2(totalIncomeGyd - totalExpensesGyd),
    avg_daily_spend_gyd: round2(avgDaily),
    avg_weekly_spend_gyd: round2(avgDaily * 7),
    avg_monthly_spend_gyd: round2(avgDaily * 30),
    top_categories: topCategories.slice(0, 5),
    period_days: periodDays,
    transaction_count: typed.length,
    first_transaction_date: firstDate,
    last_transaction_date: lastDate,
  };

  const financial_tip = generateTip(
    topCategories[0],
    totalExpensesGyd,
    summary.net_balance_gyd,
    avgDaily,
    totalIncomeGyd,
    typed.length,
  );

  return NextResponse.json({ entries: typed, summary, financial_tip });
}
