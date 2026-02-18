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
      .from("waivers")
      .select("id, signed_at, waiver_type")
      .eq("customer_id", id)
      .order("signed_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return NextResponse.json({ waiver: null });
    }

    return NextResponse.json({ waiver: data });
  } catch (err) {
    return NextResponse.json({ waiver: null });
  }
}
