import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const session = await getSession();
  const params = await searchParams;

  if (session) {
    redirect(params.next && params.next.startsWith("/") ? params.next : "/home");
  }

  const err = params.error;

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold text-zinc-900">Sign in</h1>
      <p className="text-sm text-zinc-600">
        Use your Hack Club account to access the Sleepover Portal. We request
        profile, email, name, and Slack ID so we can show your details on the
        portal and manage admin access.
      </p>
      {err && (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          Sign-in failed ({err}). Try again or check your OAuth app settings.
        </p>
      )}
      <a
        href="/api/auth/login"
        className="inline-flex w-fit items-center rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
      >
        Continue with Hack Club
      </a>
      <p className="text-xs text-zinc-500">
        OAuth is documented at{" "}
        <a
          className="underline"
          href="https://auth.hackclub.com/docs/oauth-guide"
        >
          auth.hackclub.com/docs/oauth-guide
        </a>
        .
      </p>
    </div>
  );
}
