"use client";

import { useState } from "react";
import Link from "next/link";

// Simple staff auth - in production use Supabase Auth or similar
const STAFF_PIN = process.env.NEXT_PUBLIC_STAFF_PIN || "1234";

export default function StaffLoginPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === STAFF_PIN) {
      sessionStorage.setItem("staff_auth", "true");
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Invalid PIN");
    }
  };

  // Check if already logged in (either from session or just logged in)
  if (typeof window !== "undefined" && (sessionStorage.getItem("staff_auth") || isAuthenticated)) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <Link href="/" className="text-treadstone-400 hover:text-treadstone-300">
              ← Home
            </Link>
            <button
              onClick={() => {
                sessionStorage.removeItem("staff_auth");
                window.location.reload();
              }}
              className="text-stone-500 hover:text-stone-400 text-sm"
            >
              Log out
            </button>
          </div>
          <h1 className="text-2xl font-bold text-treadstone-400 mb-6">
            Staff Portal
          </h1>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/staff/checkin"
              className="p-6 rounded-xl bg-stone-800/50 border border-stone-700 hover:border-treadstone-500/50 transition-all"
            >
              <span className="text-lg font-semibold">Check-In</span>
              <p className="text-stone-500 text-sm mt-1">
                Member & visitor check-in
              </p>
            </Link>
            <Link
              href="/staff/membership"
              className="p-6 rounded-xl bg-stone-800/50 border border-stone-700 hover:border-treadstone-500/50 transition-all"
            >
              <span className="text-lg font-semibold">Membership Application</span>
              <p className="text-stone-500 text-sm mt-1">
                Add new members (prepaid)
              </p>
            </Link>
            <Link
              href="/staff/pos"
              className="p-6 rounded-xl bg-stone-800/50 border border-stone-700 hover:border-treadstone-500/50 transition-all"
            >
              <span className="text-lg font-semibold">Point of Sale</span>
              <p className="text-stone-500 text-sm mt-1">
                Day passes, retail, memberships
              </p>
            </Link>
            <Link
              href="/staff/members"
              className="p-6 rounded-xl bg-stone-800/50 border border-stone-700 hover:border-treadstone-500/50 transition-all"
            >
              <span className="text-lg font-semibold">Members</span>
              <p className="text-stone-500 text-sm mt-1">
                Search & manage customers
              </p>
            </Link>
            <Link
              href="/staff/waivers"
              className="p-6 rounded-xl bg-stone-800/50 border border-stone-700 hover:border-treadstone-500/50 transition-all"
            >
              <span className="text-lg font-semibold">Waivers</span>
              <p className="text-stone-500 text-sm mt-1">
                View & search signed waivers
              </p>
            </Link>
            <Link
              href="/staff/classes"
              className="p-6 rounded-xl bg-stone-800/50 border border-stone-700 hover:border-treadstone-500/50 transition-all"
            >
              <span className="text-lg font-semibold">Classes & Rosters</span>
              <p className="text-stone-500 text-sm mt-1">
                Schedule, registrations
              </p>
            </Link>
            <Link
              href="/staff/reports"
              className="p-6 rounded-xl bg-stone-800/50 border border-stone-700 hover:border-treadstone-500/50 transition-all"
            >
              <span className="text-lg font-semibold">Reports</span>
              <p className="text-stone-500 text-sm mt-1">
                Visits, revenue, analytics
              </p>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <Link href="/" className="text-treadstone-400 hover:text-treadstone-300 mb-6 inline-block">
          ← Back
        </Link>
        <h1 className="text-2xl font-bold text-treadstone-400 mb-2">
          Staff Login
        </h1>
        <p className="text-stone-500 mb-6">
          Enter PIN to access staff portal
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            placeholder="PIN"
            className="w-full px-4 py-3 rounded-lg bg-stone-800 border border-stone-600 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-treadstone-500"
            autoFocus
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-treadstone-600 hover:bg-treadstone-500 text-white font-semibold transition-colors"
          >
            Enter
          </button>
        </form>
        <p className="mt-4 text-stone-600 text-xs">
          Default PIN: 1234 (set NEXT_PUBLIC_STAFF_PIN to change)
        </p>
      </div>
    </div>
  );
}
