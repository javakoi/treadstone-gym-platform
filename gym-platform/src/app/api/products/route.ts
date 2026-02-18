import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("products")
      .select("id, name, product_type, price_cents, visits_included")
      .eq("is_active", true);

    if (error) {
      console.error("Products fetch error:", error);
      return NextResponse.json({ products: [] });
    }

    return NextResponse.json({ products: data || [] });
  } catch (err) {
    return NextResponse.json({ products: [] });
  }
}
