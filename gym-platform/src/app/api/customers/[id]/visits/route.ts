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
      .from("visits")
      .select("id, check_in_at, visit_type")
      .eq("customer_id", id)
      .order("check_in_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ visits: [] });
    }

    return NextResponse.json({ visits: data || [] });
  } catch (err) {
    return NextResponse.json({ visits: [] });
  }
}
