import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl font-bold text-treadstone-400 mb-2">
          Treadstone Climbing
        </h1>
        <p className="text-stone-400 mb-12 text-lg">
          Gym Management Platform
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/staff"
            className="block p-6 rounded-xl bg-stone-800/50 border border-stone-700 hover:border-treadstone-500/50 hover:bg-stone-800 transition-all"
          >
            <span className="text-xl font-semibold text-treadstone-400">
              Staff Portal
            </span>
            <p className="text-stone-500 mt-1 text-sm">
              Check-in, POS, member management
            </p>
          </Link>

          <Link
            href="/waiver"
            className="block p-6 rounded-xl bg-stone-800/50 border border-stone-700 hover:border-treadstone-500/50 hover:bg-stone-800 transition-all"
          >
            <span className="text-xl font-semibold text-treadstone-400">
              Sign Waiver
            </span>
            <p className="text-stone-500 mt-1 text-sm">
              New visitors sign here before climbing
            </p>
          </Link>

          <Link
            href="/membership"
            className="block p-6 rounded-xl bg-stone-800/50 border border-stone-700 hover:border-treadstone-500/50 hover:bg-stone-800 transition-all"
          >
            <span className="text-xl font-semibold text-treadstone-400">
              Membership
            </span>
            <p className="text-stone-500 mt-1 text-sm">
              Become a member — sign up at the desk
            </p>
          </Link>
        </div>

        <p className="mt-12 text-stone-500 text-sm">
          400 Brickyard Rd, Phenix City, AL
        </p>
      </div>
    </div>
  );
}
