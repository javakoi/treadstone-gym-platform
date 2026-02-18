import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    if (!q) {
      return NextResponse.json({ customers: [] });
    }

    const supabase = createServerClient();

    const parts = q.split(/\s+/).filter(Boolean);
    let query = supabase
      .from("customers")
      .select("id, first_name, last_name, email, phone, key_tag_code")
      .limit(10);

    if (parts.length >= 2) {
      // "First Last" - search first_name AND last_name
      const first = parts[0];
      const last = parts.slice(1).join(" ");
      query = query
        .ilike("first_name", `%${first}%`)
        .ilike("last_name", `%${last}%`);
    } else {
      // Single word - search any field
      query = query.or(
        `first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%,key_tag_code.ilike.%${q}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("Customer search error:", error);
      return NextResponse.json({ customers: [] });
    }

    return NextResponse.json({ customers: data || [] });
  } catch (err) {
    console.error("Customers API error:", err);
    return NextResponse.json({ customers: [] });
  }
}
