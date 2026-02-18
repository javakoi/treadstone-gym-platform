import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = createServerClient();
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

    const [visitsRes, salesRes] = await Promise.all([
      supabase
        .from("visits")
        .select("visit_type")
        .gte("check_in_at", `${today}T00:00:00`)
        .lt("check_in_at", `${tomorrow}T00:00:00`),
      supabase
        .from("sales")
        .select("id, total_cents, created_at")
        .gte("created_at", `${today}T00:00:00`)
        .lt("created_at", `${tomorrow}T00:00:00`)
        .eq("status", "completed"),
    ]);

    const visits = visitsRes.data || [];
    const sales = salesRes.data || [];

    const memberVisits = visits.filter((v) => v.visit_type === "member").length;
    const dayPassVisits = visits.filter((v) =>
      ["day_pass", "punch_card"].includes(v.visit_type)
    ).length;

    const revenueCents = sales.reduce((sum, s) => sum + (s.total_cents || 0), 0);

    return NextResponse.json({
      visits_count: visits.length,
      member_visits: memberVisits,
      day_pass_visits: dayPassVisits,
      revenue_cents: revenueCents,
      recent_sales: sales.slice(-10).reverse(),
    });
  } catch (err) {
    console.error("Reports error:", err);
    return NextResponse.json({});
  }
}
