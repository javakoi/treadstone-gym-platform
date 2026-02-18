"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";

export default function WaiversPage() {
  const [search, setSearch] = useState("");
  const [waivers, setWaivers] = useState<any[]>([]);
  const [selectedWaiver, setSelectedWaiver] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !sessionStorage.getItem("staff_auth")) {
      window.location.href = "/staff";
      return;
    }
    loadWaivers();
  }, []);

  const loadWaivers = (q?: string) => {
    setLoading(true);
    const url = q ? `/api/waivers?q=${encodeURIComponent(q)}` : "/api/waivers";
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        setWaivers(d.waivers || []);
        setSelectedWaiver(null);
      })
      .finally(() => setLoading(false));
  };

  const selectWaiver = (id: string) => {
    fetch(`/api/waivers?id=${id}`)
      .then((r) => r.json())
      .then((d) => setSelectedWaiver(d.waiver));
  };

  const customer = selectedWaiver?.customers;
  const isArray = Array.isArray(customer);
  const cust = isArray ? customer?.[0] : customer;

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link href="/staff" className="text-treadstone-400 hover:text-treadstone-300">
            ← Staff Portal
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-treadstone-400 mb-6">
          Waivers
        </h1>

        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadWaivers(search)}
            placeholder="Search by name or email"
            className="flex-1 px-4 py-3 rounded-lg bg-stone-800 border border-stone-600"
          />
          <button
            onClick={() => loadWaivers(search)}
            disabled={loading}
            className="px-6 py-3 rounded-lg bg-treadstone-600 hover:bg-treadstone-500 disabled:opacity-50"
          >
            Search
          </button>
          {search && (
            <button
              onClick={() => {
                setSearch("");
                loadWaivers();
              }}
              className="px-4 py-3 rounded-lg border border-stone-600 hover:bg-stone-800"
            >
              Clear
            </button>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Recent Waivers</h2>
            {loading ? (
              <p className="text-stone-500">Loading...</p>
            ) : waivers.length === 0 ? (
              <p className="text-stone-500">No waivers found</p>
            ) : (
              <div className="rounded-lg border border-stone-700 divide-y divide-stone-700 max-h-[500px] overflow-y-auto">
                {waivers.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => selectWaiver(w.id)}
                    className={`w-full text-left px-4 py-3 hover:bg-stone-800 transition-colors ${
                      selectedWaiver?.id === w.id ? "bg-treadstone-500/20 border-l-2 border-treadstone-500" : ""
                    }`}
                  >
                    <div className="font-medium">
                      {w.customers?.first_name} {w.customers?.last_name}
                    </div>
                    <div className="text-sm text-stone-500">
                      {format(new Date(w.signed_at), "MMM d, yyyy 'at' h:mm a")} • {w.waiver_type}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Waiver Details</h2>
            {selectedWaiver ? (
              <div className="rounded-xl bg-stone-800/50 border border-stone-700 p-6 space-y-4">
                <div>
                  <h3 className="text-sm text-stone-500 mb-1">Customer</h3>
                  <p className="font-semibold">{selectedWaiver.signature_data || `${cust?.first_name} ${cust?.last_name}`.trim() || "—"}</p>
                  <p className="text-sm text-stone-400">{cust?.email || "—"}</p>
                  <p className="text-sm text-stone-400">{cust?.phone || "—"}</p>
                  <p className="text-sm text-stone-400">
                    DOB: {cust?.date_of_birth ? format(new Date(cust.date_of_birth), "MMM d, yyyy") : "—"}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm text-stone-500 mb-1">Climber's Name</h3>
                  <p className="font-medium">{selectedWaiver.signature_data || `${cust?.first_name} ${cust?.last_name}`.trim() || "—"}</p>
                </div>

                <div>
                  <h3 className="text-sm text-stone-500 mb-1">Waiver Type</h3>
                  <p className="capitalize">{selectedWaiver.waiver_type}</p>
                </div>

                {selectedWaiver.waiver_type === "minor" && (
                  <div>
                    <h3 className="text-sm text-stone-500 mb-1">Guardian</h3>
                    <p>{selectedWaiver.guardian_name || "—"}</p>
                    <p className="text-sm text-stone-400">Signed: {selectedWaiver.guardian_signature || "—"}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm text-stone-500 mb-1">Signature</h3>
                  <p className="font-medium">{selectedWaiver.signature_data}</p>
                </div>

                <div>
                  <h3 className="text-sm text-stone-500 mb-1">Signed At</h3>
                  <p>{format(new Date(selectedWaiver.signed_at), "EEEE, MMMM d, yyyy 'at' h:mm a")}</p>
                </div>

                {selectedWaiver.ip_address && (
                  <div>
                    <h3 className="text-sm text-stone-500 mb-1">IP Address</h3>
                    <p className="text-sm font-mono">{selectedWaiver.ip_address}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm text-stone-500 mb-1">Waiver Version</h3>
                  <p>{selectedWaiver.waiver_version}</p>
                </div>
              </div>
            ) : (
              <p className="text-stone-500">Select a waiver to view full details</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
