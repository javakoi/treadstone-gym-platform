import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    const id = searchParams.get("id");

    const supabase = createServerClient();

    // Single waiver by ID (full details)
    if (id) {
      const { data, error } = await supabase
        .from("waivers")
        .select(`
          id,
          waiver_type,
          guardian_name,
          guardian_signature,
          signature_data,
          signed_at,
          waiver_version,
          ip_address,
          customers (
            id,
            first_name,
            last_name,
            email,
            phone,
            date_of_birth
          )
        `)
        .eq("id", id)
        .single();

      if (error || !data) {
        return NextResponse.json({ waiver: null });
      }
      return NextResponse.json({ waiver: data });
    }

    // List waivers (with search)
    let query = supabase
      .from("waivers")
      .select(`
        id,
        waiver_type,
        signature_data,
        signed_at,
        customers (
          first_name,
          last_name,
          email
        )
      `)
      .order("signed_at", { ascending: false })
      .limit(100);

    if (q) {
      const parts = q.split(/\s+/).filter(Boolean);
      let customersQuery = supabase.from("customers").select("id");

      if (parts.length >= 2) {
        // "First Last" - search first_name AND last_name
        const first = parts[0];
        const last = parts.slice(1).join(" ");
        customersQuery = customersQuery
          .ilike("first_name", `%${first}%`)
          .ilike("last_name", `%${last}%`);
      } else {
        // Single word - search any field
        customersQuery = customersQuery.or(
          `first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%`
        );
      }

      const { data: customers } = await customersQuery;
      const ids = (customers || []).map((c) => c.id);
      if (ids.length > 0) {
        query = query.in("customer_id", ids);
      } else {
        return NextResponse.json({ waivers: [] });
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error("Waivers fetch error:", error);
      return NextResponse.json({ waivers: [] });
    }

    return NextResponse.json({ waivers: data || [] });
  } catch (err) {
    console.error("Waivers API error:", err);
    return NextResponse.json({ waivers: [] });
  }
}
