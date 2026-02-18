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
      .from("class_registrations")
      .select(`
        id,
        status,
        registered_at,
        customers (
          first_name,
          last_name,
          email
        )
      `)
      .eq("class_id", id)
      .neq("status", "cancelled")
      .order("registered_at", { ascending: true });

    if (error) {
      return NextResponse.json({ registrations: [] });
    }

    return NextResponse.json({ registrations: data || [] });
  } catch (err) {
    return NextResponse.json({ registrations: [] });
  }
}
