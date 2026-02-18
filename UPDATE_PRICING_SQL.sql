-- Update membership plans and products to match Treadstone Climbing website
-- Run this in Supabase SQL Editor after your initial setup
-- Source: https://www.treadstoneclimbing.com/day-passes-memberships

-- Update existing membership plans
UPDATE membership_plans SET name = 'Standard Monthly', description = 'Unlimited climbing, autopay (3 mo min)', price_cents = 6500 WHERE name = 'Monthly Unlimited';
UPDATE membership_plans SET name = 'Student/Educator Monthly', description = 'Student or educator discount, autopay (3 mo min)', price_cents = 6000 WHERE name = 'Student Monthly';
UPDATE membership_plans SET name = 'Protector Monthly', description = 'Military/Police/Fire/First Responder, autopay (3 mo min)', price_cents = 5500 WHERE name = 'Annual';

-- Add additional membership plans from website
INSERT INTO membership_plans (name, description, price_cents, billing_interval) VALUES
  ('With Fitness Classes', 'Unlimited climbing + aerial silks & fitness classes, autopay (3 mo min)', 11000, 'month'),
  ('Family of Two', 'Two people, unlimited climbing, autopay (3 mo min)', 8000, 'month'),
  ('Family With Classes', 'Family of two + fitness classes, autopay. Additional $60/$50 per member', 16000, 'month');

-- Update day passes to match website ($18 no gear, $25 with gear)
UPDATE products SET name = 'Day Pass (No Gear)', description = 'Single day climbing, no gear', price_cents = 1800 WHERE name = 'Day Pass';
UPDATE products SET name = 'Day Pass + Gear', description = 'Day pass with shoe and harness rental', price_cents = 2500 WHERE name = 'Day Pass + Gear';

-- Add additional day pass options from website
INSERT INTO products (name, description, product_type, price_cents) VALUES
  ('Protector Day Pass (No Gear)', 'Military/Police/Fire/First Responder - $15', 'day_pass', 1500),
  ('Protector Day Pass + Gear', 'Military/Police/Fire/First Responder with gear - $20', 'day_pass', 2000),
  ('Student Day Pass (No Gear)', 'Student or educator - $16.50', 'day_pass', 1650),
  ('Student Day Pass + Gear', 'Student or educator with gear - $22.50', 'day_pass', 2250),
  ('Youth Day Pass (12 & Under)', 'With gear included - $15', 'day_pass', 1500);
