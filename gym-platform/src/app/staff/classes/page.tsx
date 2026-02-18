"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";

export default function ClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined" && !sessionStorage.getItem("staff_auth")) {
      window.location.href = "/staff";
      return;
    }
    fetch("/api/classes").then((r) => r.json()).then((d) => setClasses(d.classes || []));
  }, []);

  const loadRegistrations = async (classId: string) => {
    const res = await fetch(`/api/classes/${classId}/registrations`);
    const data = await res.json();
    setRegistrations(data.registrations || []);
  };

  const selectClass = (c: any) => {
    setSelectedClass(c);
    loadRegistrations(c.id);
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
          Classes & Rosters
        </h1>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Upcoming Classes</h2>
            {classes.length === 0 ? (
              <p className="text-stone-500">No classes scheduled. Add classes in the database.</p>
            ) : (
              <div className="space-y-2">
                {classes.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => selectClass(c)}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${
                      selectedClass?.id === c.id
                        ? "border-treadstone-500 bg-treadstone-500/10"
                        : "border-stone-700 hover:bg-stone-800"
                    }`}
                  >
                    <div className="font-medium">{c.name}</div>
                    <div className="text-sm text-stone-500">
                      {format(new Date(c.start_time), "EEE, MMM d 'at' h:mm a")}
                    </div>
                    <div className="text-sm text-stone-500">
                      {c.max_capacity ? `${c.max_capacity} max` : "No limit"}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Roster</h2>
            {selectedClass ? (
              <div className="rounded-xl bg-stone-800/50 border border-stone-700 p-6">
                <h3 className="font-semibold mb-4">{selectedClass.name}</h3>
                {registrations.length === 0 ? (
                  <p className="text-stone-500">No registrations yet</p>
                ) : (
                  <ul className="space-y-2">
                    {registrations.map((r: any) => (
                      <li key={r.id} className="flex justify-between items-center">
                        <span>{r.customers?.first_name} {r.customers?.last_name}</span>
                        <span className={`text-sm ${
                          r.status === "attended" ? "text-green-400" :
                          r.status === "no_show" ? "text-red-400" : "text-stone-500"
                        }`}>
                          {r.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <p className="text-stone-500">Select a class to view roster</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
