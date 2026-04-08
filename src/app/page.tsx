import { getSession } from "@/lib/auth";
import Link from "next/link";

export default async function LandingPage() {
  const session = await getSession();

  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col justify-center gap-6 px-4 py-20">
      <h1 className="text-2xl font-semibold text-zinc-900">Sleepover Portal</h1>
      <p className="text-zinc-600">
        Sign in with Hack Club to open the schedule, FAQ, ticket info, and
        shared memories.
      </p>
      {session ? (
        <Link
          href="/home"
          className="inline-flex w-fit rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
        >
          Go to portal
        </Link>
      ) : (
        <Link
          href="/login"
          className="inline-flex w-fit rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
        >
          Sign in with Hack Club
        </Link>
      )}
    </div>
  );
}
