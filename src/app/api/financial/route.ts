import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { FinancialEntry, FinancialSummary } from "@/lib/types";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const months = parseInt(searchParams.get("months") ?? "3", 10);
  const validMonths = Math.min(Math.max(months, 1), 12);

  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - validMonths);
  const cutoffDate = cutoff.toISOString().split("T")[0];

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

  for (const entry of typed) {
    const amount = Number(entry.amount);
    if (entry.entry_type === "income" && entry.currency === "GYD") {
      totalIncomeGyd += amount;
    } else if (entry.entry_type === "expense") {
      if (entry.currency === "USD") {
        totalExpensesUsd += amount;
      } else {
        totalExpensesGyd += amount;
      }
    } else if (entry.entry_type === "income" && entry.currency === "USD") {
      // USD income tracked but not included in GYD balance
    }
  }

  const summary: FinancialSummary = {
    total_income_gyd: Math.round(totalIncomeGyd * 100) / 100,
    total_expenses_gyd: Math.round(totalExpensesGyd * 100) / 100,
    total_expenses_usd: Math.round(totalExpensesUsd * 100) / 100,
    net_balance_gyd: Math.round((totalIncomeGyd - totalExpensesGyd) * 100) / 100,
  };

  return NextResponse.json({ entries: typed, summary });
}
