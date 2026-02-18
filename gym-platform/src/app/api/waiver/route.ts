import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      first_name,
      last_name,
      email,
      phone,
      date_of_birth,
      waiver_type,
      guardian_name,
      guardian_signature,
      signature_data,
      agreed,
    } = body;

    if (!first_name || !last_name || !signature_data || !agreed) {
      return NextResponse.json(
        { error: "Missing required fields: first_name, last_name, signature, agreement" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Check if customer exists
    // For minors: match by name only (email is often guardian's, would wrongly match another customer)
    // For adults: match by email first, then by name
    let existingCustomer = null;
    const isMinor = waiver_type === "minor";

    if (!isMinor && email) {
      const { data } = await supabase
        .from("customers")
        .select("id")
        .eq("email", email)
        .limit(1)
        .single();
      existingCustomer = data;
    }
    if (!existingCustomer) {
      const { data } = await supabase
        .from("customers")
        .select("id")
        .eq("first_name", first_name)
        .eq("last_name", last_name)
        .limit(1)
        .single();
      existingCustomer = data;
    }

    let customerId: string;

    if (existingCustomer) {
      customerId = existingCustomer.id;
      await supabase
        .from("customers")
        .update({
          email: email || null,
          phone: phone || null,
          date_of_birth: date_of_birth || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", customerId);
    } else {
      const { data: newCustomer, error: createError } = await supabase
        .from("customers")
        .insert({
          first_name,
          last_name,
          email: email || null,
          phone: phone || null,
          date_of_birth: date_of_birth || null,
        })
        .select("id")
        .single();

      if (createError || !newCustomer) {
        console.error("Customer create error:", createError);
        return NextResponse.json(
          { error: "Failed to create customer record" },
          { status: 500 }
        );
      }
      customerId = newCustomer.id;
    }

    const { error: waiverError } = await supabase.from("waivers").insert({
      customer_id: customerId,
      waiver_type: waiver_type || "adult",
      guardian_name: guardian_name || null,
      guardian_signature: guardian_signature || null,
      signature_data,
      ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || null,
      waiver_version: "1.0",
    });

    if (waiverError) {
      console.error("Waiver insert error:", waiverError);
      return NextResponse.json(
        { error: "Failed to save waiver" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      customer_id: customerId,
      message: "Waiver signed successfully",
    });
  } catch (err) {
    console.error("Waiver API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
