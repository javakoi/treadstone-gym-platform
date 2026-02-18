"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function MembersPage() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [membership, setMembership] = useState<any | null>(null);
  const [waiver, setWaiver] = useState<any | null>(null);
  const [visits, setVisits] = useState<any[]>([]);
  const [removingMembership, setRemovingMembership] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !sessionStorage.getItem("staff_auth")) {
      window.location.href = "/staff";
      return;
    }
  }, []);

  const searchCustomers = async () => {
    if (!search.trim()) return;
    const res = await fetch(`/api/customers?q=${encodeURIComponent(search.trim())}`);
    const data = await res.json();
    setResults(data.customers || []);
    setSelectedCustomer(null);
  };

  const selectCustomer = async (customer: any) => {
    setSelectedCustomer(customer);
    const [memRes, waiverRes, visitsRes] = await Promise.all([
      fetch(`/api/customers/${customer.id}/membership`),
      fetch(`/api/customers/${customer.id}/waiver`),
      fetch(`/api/customers/${customer.id}/visits`),
    ]);
    const memData = await memRes.json();
    const waiverData = await waiverRes.json();
    const visitsData = await visitsRes.json();
    setMembership(memData.membership);
    setWaiver(waiverData.waiver);
    setVisits(visitsData.visits || []);
  };

  const removeMembership = async () => {
    if (!membership?.id) return;
    if (!confirm("Remove this membership? The customer will no longer have member access.")) return;
    setRemovingMembership(true);
    try {
      const res = await fetch(`/api/memberships/${membership.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove membership");
      setMembership(null);
    } catch (err: any) {
      alert(err.message || "Failed to remove membership");
    }
    setRemovingMembership(false);
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link href="/staff" className="text-treadstone-400 hover:text-treadstone-300">
            ← Staff Portal
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-treadstone-400 mb-6">
          Members & Customers
        </h1>

        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchCustomers()}
            placeholder="Search by name, email, or key tag"
            className="flex-1 px-4 py-3 rounded-lg bg-stone-800 border border-stone-600"
          />
          <button
            onClick={searchCustomers}
            className="px-6 py-3 rounded-lg bg-treadstone-600 hover:bg-treadstone-500"
          >
            Search
          </button>
        </div>

        {results.length > 0 && !selectedCustomer && (
          <div className="rounded-lg border border-stone-700 divide-y divide-stone-700 mb-6">
            {results.map((c) => (
              <button
                key={c.id}
                onClick={() => selectCustomer(c)}
                className="w-full px-4 py-3 text-left hover:bg-stone-800 flex justify-between items-center"
              >
                <span>{c.first_name} {c.last_name}</span>
                <span className="text-stone-500 text-sm">{c.email || c.key_tag_code || "—"}</span>
              </button>
            ))}
          </div>
        )}

        {selectedCustomer && (
          <div className="rounded-xl bg-stone-800/50 border border-stone-700 p-6 space-y-6">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-semibold">
                {selectedCustomer.first_name} {selectedCustomer.last_name}
              </h2>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-stone-500 hover:text-stone-400"
              >
                Close
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <p><span className="text-stone-500">Email:</span> {selectedCustomer.email || "—"}</p>
              <p><span className="text-stone-500">Phone:</span> {selectedCustomer.phone || "—"}</p>
              <p><span className="text-stone-500">Key Tag:</span> {selectedCustomer.key_tag_code || "—"}</p>
              <p><span className="text-stone-500">Waiver:</span> {waiver ? "✓ Signed" : "✗ Not signed"}</p>
              <p><span className="text-stone-500">Membership:</span> {membership?.status === "active" ? "✓ Active" : "—"}</p>
              {membership?.status === "active" && (
                <p><span className="text-stone-500">Plan:</span> {membership.membership_plans?.name || "—"}</p>
              )}
            </div>

            {membership?.status === "active" && (
              <div>
                <button
                  onClick={removeMembership}
                  disabled={removingMembership}
                  className="px-4 py-2 rounded-lg bg-red-600/80 hover:bg-red-600 disabled:opacity-50 text-sm"
                >
                  {removingMembership ? "Removing..." : "Remove Membership"}
                </button>
              </div>
            )}

            <div>
              <h3 className="font-semibold mb-2">Recent Visits ({visits.length})</h3>
              {visits.length === 0 ? (
                <p className="text-stone-500 text-sm">No visits yet</p>
              ) : (
                <ul className="space-y-1 text-sm">
                  {visits.slice(0, 10).map((v: any) => (
                    <li key={v.id} className="flex justify-between">
                      <span>{new Date(v.check_in_at).toLocaleDateString()}</span>
                      <span className="text-stone-500">{v.visit_type}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex gap-2">
              <Link
                href={`/staff/checkin?customer=${selectedCustomer.id}`}
                className="px-4 py-2 rounded-lg bg-treadstone-600 hover:bg-treadstone-500 text-sm"
              >
                Check In
              </Link>
              <Link
                href={`/staff/pos?customer=${selectedCustomer.id}`}
                className="px-4 py-2 rounded-lg border border-stone-600 hover:bg-stone-800 text-sm"
              >
                New Sale
              </Link>
              <a
                href={`/waiver`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg border border-stone-600 hover:bg-stone-800 text-sm"
              >
                Sign Waiver
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
