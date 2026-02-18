import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("memberships")
      .select("id, status, started_at, ends_at, membership_plans(name)")
      .eq("customer_id", id)
      .eq("status", "active")
      .single();

    if (error || !data) {
      return NextResponse.json({ membership: null });
    }

    return NextResponse.json({ membership: data });
  } catch (err) {
    return NextResponse.json({ membership: null });
  }
}
