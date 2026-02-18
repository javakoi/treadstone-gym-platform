import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customer_id,
      items,
      total_cents,
      tax_cents = 0,
      payment_method = "card",
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0 || total_cents == null) {
      return NextResponse.json(
        { error: "Items and total required" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .insert({
        customer_id: customer_id || null,
        total_cents,
        tax_cents,
        payment_method,
        status: "completed",
      })
      .select("id")
      .single();

    if (saleError || !sale) {
      console.error("Sale insert error:", saleError);
      return NextResponse.json(
        { error: "Failed to create sale" },
        { status: 500 }
      );
    }

    const saleItems = items.map((item: any) => ({
      sale_id: sale.id,
      product_id: item.product_id || null,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price_cents: item.unit_price_cents,
      total_cents: item.total_cents,
    }));

    const { error: itemsError } = await supabase.from("sale_items").insert(saleItems);

    if (itemsError) {
      console.error("Sale items error:", itemsError);
      return NextResponse.json(
        { error: "Failed to save sale items" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, sale_id: sale.id });
  } catch (err) {
    console.error("Sales API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
