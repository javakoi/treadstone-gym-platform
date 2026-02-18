export interface Customer {
  id: string;
  email: string | null;
  phone: string | null;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  key_tag_code: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Waiver {
  id: string;
  customer_id: string;
  waiver_type: "adult" | "minor";
  guardian_name: string | null;
  guardian_signature: string | null;
  signature_data: string;
  ip_address: string | null;
  signed_at: string;
  waiver_version: string;
}

export interface Membership {
  id: string;
  customer_id: string;
  plan_id: string;
  status: "active" | "cancelled" | "past_due" | "trialing";
  started_at: string;
  ends_at: string | null;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  product_type: "day_pass" | "punch_card" | "retail" | "rental" | "class" | "event";
  price_cents: number;
  visits_included: number | null;
  is_active: boolean;
}

export interface Visit {
  id: string;
  customer_id: string;
  check_in_at: string;
  check_out_at: string | null;
  visit_type: "member" | "day_pass" | "punch_card" | "guest" | "event";
}

export interface Class {
  id: string;
  name: string;
  description: string | null;
  max_capacity: number | null;
  start_time: string;
  end_time: string;
  recurrence: string | null;
}
