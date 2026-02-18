import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("membership_plans")
      .select("id, name, description, price_cents, billing_interval")
      .eq("is_active", true);

    if (error) {
      return NextResponse.json({ plans: [] });
    }
    return NextResponse.json({ plans: data || [] });
  } catch (err) {
    return NextResponse.json({ plans: [] });
  }
}
