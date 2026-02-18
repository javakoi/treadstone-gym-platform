import Link from "next/link";

export default function MembershipInfoPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-treadstone-400 hover:text-treadstone-300 mb-6 inline-block">
          ← Back
        </Link>

        <h1 className="text-2xl font-bold text-treadstone-400 mb-2">
          Become a Member
        </h1>
        <p className="text-stone-500 mb-8">
          Sign up for a membership at the front desk when you visit.
        </p>

        <div className="rounded-xl bg-stone-800/50 border border-stone-700 p-6 space-y-4">
          <h2 className="font-semibold">How to join</h2>
          <ol className="list-decimal list-inside space-y-2 text-stone-400">
            <li>Sign the waiver online or at the desk</li>
            <li>Visit the gym and ask about membership at the front desk</li>
            <li>Choose a plan and pay — staff will add your membership</li>
            <li>Check in as a member on future visits</li>
          </ol>
        </div>

        <div className="mt-8 flex gap-4">
          <Link
            href="/waiver"
            className="px-6 py-3 rounded-lg bg-treadstone-600 hover:bg-treadstone-500 text-white font-semibold"
          >
            Sign Waiver First
          </Link>
          <Link
            href="/"
            className="px-6 py-3 rounded-lg border border-stone-600 hover:bg-stone-800"
          >
            Back to Home
          </Link>
        </div>

        <p className="mt-12 text-stone-500 text-sm">
          400 Brickyard Rd, Phenix City, AL
        </p>
      </div>
    </div>
  );
}
