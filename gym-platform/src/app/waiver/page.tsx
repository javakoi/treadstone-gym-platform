"use client";

import { useState } from "react";
import Link from "next/link";
import { WAIVER_AGREEMENT_TEXT } from "@/lib/waiver-content";

export default function WaiverPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    isMinor: false,
    guardianName: "",
    guardianSignature: "",
    agreed: false,
    signature: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [waiverId, setWaiverId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // Validate required fields (step 1 fields are hidden on step 2, so HTML5 validation doesn't run)
    const missing: string[] = [];
    if (!formData.email?.trim()) missing.push("Email");
    const phoneDigits = formData.phone?.replace(/\D/g, "") || "";
    if (phoneDigits.length !== 10) missing.push("Phone (10 digits required)");
    if (!formData.dateOfBirth) missing.push("Date of Birth");
    if (missing.length > 0) {
      setStatus("error");
      setErrorMessage(`Please fill in: ${missing.join(", ")}`);
      return;
    }

    setStatus("submitting");

    try {
      const res = await fetch("/api/waiver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email || null,
          phone: formData.phone || null,
          date_of_birth: formData.dateOfBirth || null,
          waiver_type: formData.isMinor ? "minor" : "adult",
          guardian_name: formData.isMinor ? formData.guardianName : null,
          guardian_signature: formData.isMinor ? formData.guardianSignature : null,
          signature_data: formData.signature,
          agreed: formData.agreed,
        }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload.error || "Failed to submit waiver");
      }

      let printId: string | null =
        typeof payload.waiver_id === "string" ? payload.waiver_id : null;
      if (!printId && typeof payload.customer_id === "string") {
        const wr = await fetch(`/api/customers/${payload.customer_id}/waiver`);
        const j = await wr.json().catch(() => ({}));
        const latest = j.waiver?.id;
        if (typeof latest === "string") printId = latest;
      }
      setWaiverId(printId);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again or sign at the front desk.");
      console.error(err);
    }
  };

  if (status === "success") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-treadstone-400 mb-2">
            Waiver Signed!
          </h1>
          <p className="text-stone-400 mb-6">
            You're all set. Head to the front desk to check in and start climbing.
          </p>
          <div className="flex flex-col gap-3 justify-center max-w-sm mx-auto">
            {waiverId ? (
              <Link
                href={`/waiver/print/${waiverId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 rounded-lg bg-treadstone-600 hover:bg-treadstone-500 text-white font-semibold text-center order-first"
              >
                View / print signed waiver
              </Link>
            ) : (
              <p className="text-sm text-stone-500 text-center">
                Printable copy: ask the front desk to open your waiver in Staff → Waivers, or ensure this site is updated to the latest version.
              </p>
            )}
            <Link
              href="/"
              className="inline-block px-6 py-3 rounded-lg border border-stone-600 hover:bg-stone-800 text-stone-100 font-semibold text-center"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-treadstone-400 hover:text-treadstone-300 mb-6 inline-block">
          ← Back
        </Link>

        <h1 className="text-2xl font-bold text-treadstone-400 mb-2">
          Sign Waiver
        </h1>
        <p className="text-stone-500 mb-8">
          Required before climbing. Takes about 2 minutes.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <>
              <div className="p-4 rounded-lg bg-stone-800/50 border border-stone-700 overflow-y-auto max-h-64 text-sm text-stone-300 whitespace-pre-wrap">
                {WAIVER_AGREEMENT_TEXT}
              </div>

              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm text-stone-400 mb-1">Climber's First Name *</label>
                    <input
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-stone-800 border border-stone-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-stone-400 mb-1">Climber's Last Name *</label>
                    <input
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-stone-800 border border-stone-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-stone-400 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-stone-800 border border-stone-600"
                  />
                </div>

                <div>
                  <label className="block text-sm text-stone-400 mb-1">Phone * (10 digits)</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                    placeholder="5551234567"
                    maxLength={10}
                    className="w-full px-4 py-2 rounded-lg bg-stone-800 border border-stone-600"
                  />
                </div>

                <div>
                  <label className="block text-sm text-stone-400 mb-1">Climber's Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-stone-800 border border-stone-600"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isMinor}
                    onChange={(e) => setFormData({ ...formData, isMinor: e.target.checked })}
                    className="rounded border-stone-600"
                  />
                  <span className="text-stone-400">I am signing for a minor (under 18)</span>
                </label>

                {formData.isMinor && (
                  <div>
                    <label className="block text-sm text-stone-400 mb-1">Parent/Guardian Full Name *</label>
                    <input
                      required
                      value={formData.guardianName}
                      onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-stone-800 border border-stone-600"
                    />
                  </div>
                )}

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={formData.agreed}
                    onChange={(e) => setFormData({ ...formData, agreed: e.target.checked })}
                    className="rounded border-stone-600"
                  />
                  <span className="text-stone-400">I have read and agree to the waiver *</span>
                </label>
              </div>

              {status === "error" && errorMessage && (
                <p className="text-red-400 text-sm">
                  {errorMessage}
                </p>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage("");
                    const missing: string[] = [];
                    if (!formData.firstName?.trim()) missing.push("Climber's First Name");
                    if (!formData.lastName?.trim()) missing.push("Climber's Last Name");
                    if (!formData.email?.trim()) missing.push("Email");
                    const phoneDigits = formData.phone?.replace(/\D/g, "") || "";
                    if (phoneDigits.length !== 10) missing.push("Phone (10 digits required)");
                    if (!formData.dateOfBirth) missing.push("Climber's Date of Birth");
                    if (formData.isMinor && !formData.guardianName?.trim()) missing.push("Parent/Guardian Full Name");
                    if (!formData.agreed) missing.push("agreement to the waiver");
                    if (missing.length > 0) {
                      setStatus("error");
                      setErrorMessage(`Please fill in: ${missing.join(", ")}`);
                      return;
                    }
                    setStatus("idle");
                    setFormData((prev) => ({
                      ...prev,
                      signature: `${prev.firstName} ${prev.lastName}`.trim(),
                      guardianSignature: prev.isMinor ? prev.guardianName : prev.guardianSignature,
                    }));
                    setStep(2);
                  }}
                  className="flex-1 py-3 rounded-lg bg-treadstone-600 hover:bg-treadstone-500 text-white font-semibold"
                >
                  Continue to Sign
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label className="block text-sm text-stone-400 mb-1">
                  {formData.isMinor ? "Climber's Name *" : "Signature — Type your full legal name *"}
                </label>
                <input
                  required
                  value={formData.signature}
                  onChange={(e) => setFormData({ ...formData, signature: e.target.value })}
                  placeholder={formData.isMinor ? "Climber's first and last name" : "Full legal name"}
                  className="w-full px-4 py-3 rounded-lg bg-stone-800 border border-stone-600 text-lg"
                />
              </div>

              {formData.isMinor && (
                <div>
                  <label className="block text-sm text-stone-400 mb-1">
                    Guardian signature (Type your full legal name) *
                  </label>
                  <input
                    required
                    value={formData.guardianSignature}
                    onChange={(e) => setFormData({ ...formData, guardianSignature: e.target.value })}
                    placeholder="Guardian full legal name"
                    className="w-full px-4 py-3 rounded-lg bg-stone-800 border border-stone-600"
                  />
                </div>
              )}

              {status === "error" && (
                <p className="text-red-400 text-sm">
                  {errorMessage}
                </p>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => { setStep(1); setErrorMessage(""); }}
                  className="px-6 py-3 rounded-lg border border-stone-600 hover:bg-stone-800"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="flex-1 py-3 rounded-lg bg-treadstone-600 hover:bg-treadstone-500 text-white font-semibold disabled:opacity-50"
                >
                  {status === "submitting" ? "Submitting..." : "Submit Waiver"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
