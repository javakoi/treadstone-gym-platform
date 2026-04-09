"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { WAIVER_AGREEMENT_TEXT } from "@/lib/waiver-content";

type CustomerRow = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
};

type WaiverRow = {
  id: string;
  waiver_type: string;
  guardian_name: string | null;
  guardian_signature: string | null;
  signature_data: string;
  signed_at: string;
  waiver_version: string;
  ip_address: string | null;
  customers: CustomerRow | CustomerRow[] | null;
};

function normalizeCustomer(w: WaiverRow): CustomerRow | null {
  const c = w.customers;
  if (!c) return null;
  return Array.isArray(c) ? c[0] ?? null : c;
}

export default function WaiverPrintPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : params.id?.[0];
  const [waiver, setWaiver] = useState<WaiverRow | null | undefined>(undefined);

  useEffect(() => {
    if (!id) {
      setWaiver(null);
      return;
    }
    fetch(`/api/waivers?id=${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((d) => setWaiver(d.waiver ?? null))
      .catch(() => setWaiver(null));
  }, [id]);

  if (waiver === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center text-stone-400">
        Loading…
      </div>
    );
  }

  if (waiver === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-stone-400">
        <p>Waiver not found.</p>
        <Link href="/waiver" className="text-treadstone-400 hover:text-treadstone-300">
          Sign a waiver
        </Link>
      </div>
    );
  }

  const cust = normalizeCustomer(waiver);
  const dob = cust?.date_of_birth
    ? format(new Date(cust.date_of_birth), "MMMM d, yyyy")
    : "—";

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 pb-16 print:bg-white print:text-black print:pb-0">
      <div className="print:hidden sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 bg-stone-900/95 px-4 py-3 backdrop-blur">
        <p className="text-sm text-stone-400">
          Use Print to send to a printer or save as PDF (⌘P / Ctrl+P).
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg bg-treadstone-600 px-4 py-2 text-sm font-semibold text-white hover:bg-treadstone-500"
          >
            Print / Save PDF
          </button>
          <Link
            href="/"
            className="rounded-lg border border-stone-600 px-4 py-2 text-sm text-stone-200 hover:bg-stone-800"
          >
            Home
          </Link>
        </div>
      </div>

      <article className="mx-auto max-w-3xl bg-white px-6 py-8 text-black shadow-xl print:shadow-none print:max-w-none sm:my-8 sm:rounded-lg sm:mx-4 md:mx-auto">
        <header className="border-b border-stone-300 pb-4 mb-6">
          <h1 className="text-xl font-bold tracking-tight">Treadstone Climbing</h1>
          <p className="text-sm text-stone-600">Signed liability waiver (electronic)</p>
        </header>

        <section className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-500 mb-2">
            Agreement text
          </h2>
          <div className="text-sm leading-relaxed whitespace-pre-wrap border border-stone-200 rounded-md p-4 bg-stone-50">
            {WAIVER_AGREEMENT_TEXT}
          </div>
        </section>

        <section className="space-y-4 text-sm border border-stone-300 rounded-md p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            Signer information
          </h2>
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-stone-500">Climber / participant name</dt>
              <dd className="font-medium">{waiver.signature_data}</dd>
            </div>
            <div>
              <dt className="text-stone-500">Customer record (legal name)</dt>
              <dd className="font-medium">
                {cust ? `${cust.first_name} ${cust.last_name}`.trim() : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-stone-500">Date of birth</dt>
              <dd>{dob}</dd>
            </div>
            <div>
              <dt className="text-stone-500">Email</dt>
              <dd>{cust?.email || "—"}</dd>
            </div>
            <div>
              <dt className="text-stone-500">Phone</dt>
              <dd>{cust?.phone || "—"}</dd>
            </div>
            <div>
              <dt className="text-stone-500">Waiver type</dt>
              <dd className="capitalize">{waiver.waiver_type}</dd>
            </div>
          </dl>

          {waiver.waiver_type === "minor" && (
            <div className="pt-2 border-t border-stone-200 space-y-2">
              <p className="text-xs font-semibold uppercase text-stone-500">Guardian</p>
              <p>
                <span className="text-stone-500">Name: </span>
                {waiver.guardian_name || "—"}
              </p>
              <p>
                <span className="text-stone-500">Signature (typed): </span>
                <span className="font-medium">{waiver.guardian_signature || "—"}</span>
              </p>
            </div>
          )}

          <div className="pt-2 border-t border-stone-200">
            <p className="text-stone-500">Electronic signature (typed)</p>
            <p className="text-lg font-semibold mt-1 border-b border-stone-800 pb-1 inline-block min-w-[12rem]">
              {waiver.signature_data}
            </p>
          </div>

          <dl className="grid gap-2 pt-4 text-xs text-stone-600 border-t border-stone-200">
            <div className="flex flex-wrap gap-x-6 gap-y-1">
              <div>
                <dt className="inline text-stone-500">Signed at: </dt>
                <dd className="inline">
                  {format(new Date(waiver.signed_at), "MMMM d, yyyy 'at' h:mm a")}
                </dd>
              </div>
              <div>
                <dt className="inline text-stone-500">Waiver version: </dt>
                <dd className="inline">{waiver.waiver_version}</dd>
              </div>
            </div>
            {waiver.ip_address && (
              <div>
                <dt className="inline text-stone-500">IP address: </dt>
                <dd className="inline font-mono">{waiver.ip_address}</dd>
              </div>
            )}
            <div>
              <dt className="inline text-stone-500">Record ID: </dt>
              <dd className="inline font-mono">{waiver.id}</dd>
            </div>
          </dl>
        </section>

        <p className="mt-8 text-xs text-stone-500 text-center print:mt-6">
          This document was generated from the electronic waiver on file at Treadstone Climbing.
        </p>
      </article>
    </div>
  );
}
