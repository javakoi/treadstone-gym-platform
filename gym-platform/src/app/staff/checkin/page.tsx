"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CheckInPage() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [membership, setMembership] = useState<any | null>(null);
  const [waiver, setWaiver] = useState<any | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "checking" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && !sessionStorage.getItem("staff_auth")) {
      window.location.href = "/staff";
      return;
    }
  }, []);

  const searchCustomers = async () => {
    if (!search.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch(`/api/customers?q=${encodeURIComponent(search.trim())}`);
      const data = await res.json();
      setResults(data.customers || []);
      setSelectedCustomer(null);
      setMembership(null);
      setWaiver(null);
    } catch {
      setResults([]);
    }
    setStatus("idle");
  };

  const selectCustomer = async (customer: any) => {
    setSelectedCustomer(customer);
    setStatus("loading");
    try {
      const [memRes, waiverRes] = await Promise.all([
        fetch(`/api/customers/${customer.id}/membership`),
        fetch(`/api/customers/${customer.id}/waiver`),
      ]);
      const memData = await memRes.json();
      const waiverData = await waiverRes.json();
      setMembership(memData.membership);
      setWaiver(waiverData.waiver);
    } catch {
      setMembership(null);
      setWaiver(null);
    }
    setStatus("idle");
  };

  const checkIn = async (visitType: "member" | "day_pass" | "punch_card" | "guest") => {
    if (!selectedCustomer) return;
    if (!waiver) {
      setMessage("No valid waiver on file. Customer must sign waiver first.");
      setStatus("error");
      return;
    }

    if (visitType === "member" && !membership?.status) {
      setMessage("No active membership. Use Membership Application to add member, or check in as visitor.");
      setStatus("error");
      return;
    }

    setStatus("checking");
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: selectedCustomer.id,
          visit_type: visitType,
          membership_id: visitType === "member" ? membership?.id : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Check-in failed");

      setMessage(`Checked in as ${visitType.replace("_", " ")}!`);
      setStatus("success");
      setSelectedCustomer(null);
      setMembership(null);
      setWaiver(null);
      setSearch("");
      setResults([]);
    } catch (err: any) {
      setMessage(err.message || "Check-in failed");
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link href="/staff" className="text-treadstone-400 hover:text-treadstone-300">
            ← Staff Portal
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-treadstone-400 mb-6">
          Check-In
        </h1>

        <div className="space-y-4 mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchCustomers()}
              placeholder="Name, email, or key tag"
              className="flex-1 px-4 py-3 rounded-lg bg-stone-800 border border-stone-600"
              autoFocus
            />
            <button
              onClick={searchCustomers}
              disabled={status === "loading"}
              className="px-6 py-3 rounded-lg bg-treadstone-600 hover:bg-treadstone-500 disabled:opacity-50"
            >
              Search
            </button>
          </div>

          {results.length > 0 && !selectedCustomer && (
            <div className="rounded-lg border border-stone-700 divide-y divide-stone-700">
              {results.map((c) => (
                <button
                  key={c.id}
                  onClick={() => selectCustomer(c)}
                  className="w-full px-4 py-3 text-left hover:bg-stone-800 flex justify-between"
                >
                  <span>{c.first_name} {c.last_name}</span>
                  <span className="text-stone-500 text-sm">{c.email}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedCustomer && (
          <div className="rounded-xl bg-stone-800/50 border border-stone-700 p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">
              {selectedCustomer.first_name} {selectedCustomer.last_name}
            </h2>
            <div className="space-y-2 text-sm text-stone-400 mb-6">
              <p>Waiver: {waiver ? "✓ Signed" : "✗ Not signed"}</p>
              <p>Membership: {membership?.status === "active" ? "✓ Active (prepaid)" : "✗ None"}</p>
            </div>

            {!waiver && (
              <p className="text-amber-400 text-sm mb-4">
                Send to /waiver to sign before check-in
              </p>
            )}

            {/* Member Check-In — Only for prepaid members */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-stone-400 mb-2">Member Check-In</h3>
              <p className="text-stone-500 text-sm mb-2">Prepaid members only</p>
              {membership?.status === "active" ? (
                <button
                  onClick={() => checkIn("member")}
                  disabled={status === "checking"}
                  className="px-4 py-2 rounded-lg bg-green-600/80 hover:bg-green-600 disabled:opacity-50"
                >
                  Check In (Member)
                </button>
              ) : (
                <p className="text-stone-500 text-sm italic">
                  No active membership. Use Membership Application to add, or check in as visitor below.
                </p>
              )}
            </div>

            {/* Visitor Check-In — Day pass, punch card, guest */}
            <div>
              <h3 className="text-sm font-semibold text-stone-400 mb-2">Visitor Check-In</h3>
              <p className="text-stone-500 text-sm mb-2">Day pass, punch card, or guest</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => checkIn("day_pass")}
                  disabled={status === "checking"}
                  className="px-4 py-2 rounded-lg bg-treadstone-600 hover:bg-treadstone-500 disabled:opacity-50"
                >
                  Day Pass
                </button>
                <button
                  onClick={() => checkIn("punch_card")}
                  disabled={status === "checking"}
                  className="px-4 py-2 rounded-lg bg-stone-600 hover:bg-stone-500 disabled:opacity-50"
                >
                  Punch Card
                </button>
                <button
                  onClick={() => checkIn("guest")}
                  disabled={status === "checking"}
                  className="px-4 py-2 rounded-lg border border-stone-600 hover:bg-stone-800 disabled:opacity-50"
                >
                  Guest
                </button>
              </div>
            </div>
          </div>
        )}

        {message && (
          <div
            className={`p-4 rounded-lg mb-6 ${
              status === "success" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
