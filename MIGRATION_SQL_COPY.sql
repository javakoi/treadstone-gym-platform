-- Treadstone Gym Platform - Initial Schema
-- Copy everything below this line and paste into Supabase SQL Editor → New Query → Run

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Staff/Users table (for admin login)
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff', 'manager')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers/Members (gym visitors and members)
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT,
  phone TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  key_tag_code TEXT UNIQUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_key_tag ON customers(key_tag_code);
CREATE INDEX idx_customers_name ON customers(last_name, first_name);

-- Waivers
CREATE TABLE waivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  waiver_type TEXT NOT NULL DEFAULT 'adult' CHECK (waiver_type IN ('adult', 'minor')),
  guardian_name TEXT,
  guardian_signature TEXT,
  signature_data TEXT NOT NULL,
  ip_address TEXT,
  signed_at TIMESTAMPTZ DEFAULT NOW(),
  waiver_version TEXT NOT NULL DEFAULT '1.0'
);

CREATE INDEX idx_waivers_customer ON waivers(customer_id);
CREATE INDEX idx_waivers_signed_at ON waivers(signed_at);

-- Membership plans (e.g., Monthly Unlimited, Annual, Family)
CREATE TABLE membership_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL,
  billing_interval TEXT NOT NULL CHECK (billing_interval IN ('week', 'month', 'year')),
  stripe_price_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer memberships (active subscriptions)
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES membership_plans(id),
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id)
);

CREATE INDEX idx_memberships_customer ON memberships(customer_id);
CREATE INDEX idx_memberships_status ON memberships(status);

-- Products (day passes, punch cards, retail, rentals)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  product_type TEXT NOT NULL CHECK (product_type IN ('day_pass', 'punch_card', 'retail', 'rental', 'class', 'event')),
  price_cents INTEGER NOT NULL,
  stripe_price_id TEXT,
  visits_included INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Punch card usage tracking
CREATE TABLE punch_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  visits_remaining INTEGER NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX idx_punch_cards_customer ON punch_cards(customer_id);

-- Visits/Check-ins
CREATE TABLE visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  check_in_at TIMESTAMPTZ DEFAULT NOW(),
  check_out_at TIMESTAMPTZ,
  visit_type TEXT NOT NULL CHECK (visit_type IN ('member', 'day_pass', 'punch_card', 'guest', 'event')),
  membership_id UUID REFERENCES memberships(id),
  punch_card_id UUID REFERENCES punch_cards(id),
  sale_id UUID,
  staff_id UUID REFERENCES staff(id),
  notes TEXT
);

CREATE INDEX idx_visits_customer ON visits(customer_id);
CREATE INDEX idx_visits_check_in ON visits(check_in_at);

-- Sales/Transactions (POS)
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id),
  staff_id UUID REFERENCES staff(id),
  total_cents INTEGER NOT NULL,
  tax_cents INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'refunded', 'pending')),
  stripe_payment_intent_id TEXT,
  payment_method TEXT CHECK (payment_method IN ('card', 'cash', 'other')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sales_customer ON sales(customer_id);
CREATE INDEX idx_sales_created ON sales(created_at);

-- Line items for each sale
CREATE TABLE sale_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price_cents INTEGER NOT NULL,
  total_cents INTEGER NOT NULL
);

-- Classes and events
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  product_id UUID REFERENCES products(id),
  max_capacity INTEGER,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  recurrence TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_classes_start ON classes(start_time);

-- Class/event registrations (rosters)
CREATE TABLE class_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  sale_id UUID REFERENCES sales(id),
  status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'no_show', 'cancelled')),
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, customer_id)
);

CREATE INDEX idx_class_registrations_class ON class_registrations(class_id);
CREATE INDEX idx_class_registrations_customer ON class_registrations(customer_id);

-- Insert default membership plans
INSERT INTO membership_plans (name, description, price_cents, billing_interval) VALUES
  ('Monthly Unlimited', 'Unlimited climbing access', 6500, 'month'),
  ('Annual', '12 months unlimited', 65000, 'year'),
  ('Student Monthly', 'Student discount', 5500, 'month');

-- Sample classes (Ladies Night, Homeschool Fridays)
INSERT INTO classes (name, description, max_capacity, start_time, end_time, recurrence) VALUES
  ('Ladies Night', 'Climbing and rental gear for $10', 50, NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day' + INTERVAL '4 hours', 'weekly'),
  ('Homeschool Fridays', 'For homeschool families', 30, NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days' + INTERVAL '3 hours', NULL);

-- Insert default products
INSERT INTO products (name, description, product_type, price_cents) VALUES
  ('Day Pass', 'Single day climbing access', 'day_pass', 1800),
  ('Day Pass + Gear', 'Day pass with shoe and harness rental', 'day_pass', 2500),
  ('5-Punch Card', '5 visits', 'punch_card', 7500),
  ('10-Punch Card', '10 visits', 'punch_card', 13000),
  ('Shoe Rental', 'Climbing shoe rental', 'rental', 500),
  ('Harness Rental', 'Harness rental', 'rental', 500),
  ('Chalk Bag', 'Chalk bag', 'retail', 2500);
