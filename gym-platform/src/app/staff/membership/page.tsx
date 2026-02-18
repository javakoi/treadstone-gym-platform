"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export default function MembershipPage() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && !sessionStorage.getItem("staff_auth")) {
      window.location.href = "/staff";
      return;
    }
    fetch("/api/membership-plans").then((r) => r.json()).then((d) => setPlans(d.plans || []));
  }, []);

  const searchCustomers = async () => {
    if (!search.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch(`/api/customers?q=${encodeURIComponent(search.trim())}`);
      const data = await res.json();
      setResults(data.customers || []);
      setSelectedCustomer(null);
      setSelectedPlanId("");
    } catch {
      setResults([]);
    }
    setStatus("idle");
  };

  const addMembership = async () => {
    if (!selectedCustomer || !selectedPlanId) {
      setMessage("Select a customer and membership plan.");
      setStatus("error");
      return;
    }

    setStatus("submitting");
    setMessage("");
    try {
      const res = await fetch("/api/memberships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: selectedCustomer.id,
          plan_id: selectedPlanId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add membership");

      setMessage("Membership added successfully!");
      setStatus("success");
      setSelectedCustomer(null);
      setSelectedPlanId("");
      setSearch("");
      setResults([]);
    } catch (err: any) {
      setMessage(err.message || "Failed to add membership");
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

        <h1 className="text-2xl font-bold text-treadstone-400 mb-2">
          Membership Application
        </h1>
        <p className="text-stone-500 mb-6">
          Add a membership when someone prepays. Customer must have signed a waiver first.
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm text-stone-400 mb-2">Search Customer</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchCustomers()}
                placeholder="Name or email"
                className="flex-1 px-4 py-3 rounded-lg bg-stone-800 border border-stone-600"
              />
              <button
                onClick={searchCustomers}
                disabled={status === "loading"}
                className="px-6 py-3 rounded-lg bg-treadstone-600 hover:bg-treadstone-500 disabled:opacity-50"
              >
                Search
              </button>
            </div>
          </div>

          {results.length > 0 && !selectedCustomer && (
            <div className="rounded-lg border border-stone-700 divide-y divide-stone-700">
              {results.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCustomer(c)}
                  className="w-full px-4 py-3 text-left hover:bg-stone-800 flex justify-between"
                >
                  <span>{c.first_name} {c.last_name}</span>
                  <span className="text-stone-500 text-sm">{c.email}</span>
                </button>
              ))}
            </div>
          )}

          {selectedCustomer && (
            <div className="rounded-xl bg-stone-800/50 border border-stone-700 p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold">
                    {selectedCustomer.first_name} {selectedCustomer.last_name}
                  </h2>
                  <p className="text-stone-500 text-sm">{selectedCustomer.email}</p>
                </div>
                <button
                  onClick={() => { setSelectedCustomer(null); setSelectedPlanId(""); }}
                  className="text-stone-500 hover:text-stone-400 text-sm"
                >
                  Change
                </button>
              </div>

              <div>
                <label className="block text-sm text-stone-400 mb-2">Membership Plan</label>
                <div className="space-y-2">
                  {plans.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPlanId(p.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                        selectedPlanId === p.id
                          ? "border-treadstone-500 bg-treadstone-500/20"
                          : "border-stone-600 hover:bg-stone-800"
                      }`}
                    >
                      <span className="font-medium">{p.name}</span>
                      <span className="text-stone-500 text-sm ml-2">
                        {formatCurrency(p.price_cents)}/{p.billing_interval}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={addMembership}
                disabled={!selectedPlanId || status === "submitting"}
                className="w-full py-3 rounded-lg bg-treadstone-600 hover:bg-treadstone-500 disabled:opacity-50 font-semibold"
              >
                {status === "submitting" ? "Adding..." : "Add Membership"}
              </button>
            </div>
          )}
        </div>

        {message && (
          <div
            className={`mt-6 p-4 rounded-lg ${
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
