import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("classes")
      .select("*")
      .eq("is_active", true)
      .gte("start_time", new Date().toISOString())
      .order("start_time", { ascending: true })
      .limit(20);

    if (error) {
      return NextResponse.json({ classes: [] });
    }

    return NextResponse.json({ classes: data || [] });
  } catch (err) {
    return NextResponse.json({ classes: [] });
  }
}
