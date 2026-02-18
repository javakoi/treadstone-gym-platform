"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export default function ReportsPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && !sessionStorage.getItem("staff_auth")) {
      window.location.href = "/staff";
      return;
    }
    fetch("/api/reports/today").then((r) => r.json()).then((d) => {
      setReport(d);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link href="/staff" className="text-treadstone-400 hover:text-treadstone-300">
            ← Staff Portal
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-treadstone-400 mb-6">
          Reports
        </h1>

        {loading ? (
          <p className="text-stone-500">Loading...</p>
        ) : report ? (
          <div className="space-y-6">
            <div className="rounded-xl bg-stone-800/50 border border-stone-700 p-6">
              <h2 className="text-lg font-semibold mb-4">Today&apos;s Summary</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-stone-500 text-sm">Total Visits</p>
                  <p className="text-2xl font-bold">{report.visits_count || 0}</p>
                </div>
                <div>
                  <p className="text-stone-500 text-sm">Members</p>
                  <p className="text-2xl font-bold">{report.member_visits || 0}</p>
                </div>
                <div>
                  <p className="text-stone-500 text-sm">Day Pass / Punch</p>
                  <p className="text-2xl font-bold">{report.day_pass_visits || 0}</p>
                </div>
                <div>
                  <p className="text-stone-500 text-sm">Revenue</p>
                  <p className="text-2xl font-bold text-treadstone-400">
                    {formatCurrency(report.revenue_cents || 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-stone-800/50 border border-stone-700 p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Sales</h2>
              {report.recent_sales?.length > 0 ? (
                <ul className="space-y-2">
                  {report.recent_sales.map((s: any) => (
                    <li key={s.id} className="flex justify-between text-sm">
                      <span>{new Date(s.created_at).toLocaleTimeString()}</span>
                      <span>{formatCurrency(s.total_cents)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-stone-500">No sales today</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-stone-500">No data</p>
        )}
      </div>
    </div>
  );
}
