import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer_id, plan_id } = body;

    if (!customer_id || !plan_id) {
      return NextResponse.json(
        { error: "customer_id and plan_id required" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Check if customer already has active membership
    const { data: existing } = await supabase
      .from("memberships")
      .select("id")
      .eq("customer_id", customer_id)
      .eq("status", "active")
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Customer already has an active membership" },
        { status: 400 }
      );
    }

    const { data: membership, error } = await supabase
      .from("memberships")
      .insert({
        customer_id,
        plan_id,
        status: "active",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Membership create error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, membership_id: membership.id });
  } catch (err) {
    console.error("Memberships API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
