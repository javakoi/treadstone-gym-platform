import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer_id, visit_type, membership_id, punch_card_id } = body;

    if (!customer_id || !visit_type) {
      return NextResponse.json(
        { error: "customer_id and visit_type required" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const { error } = await supabase.from("visits").insert({
      customer_id,
      visit_type,
      membership_id: membership_id || null,
      punch_card_id: punch_card_id || null,
    });

    if (error) {
      console.error("Check-in error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Check-in API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
