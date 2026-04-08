import { getSession } from "@/lib/auth";

export default async function HomePage() {
  const session = await getSession();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Home</h1>
      <p className="text-zinc-600">
        You are signed in with Hack Club Auth. Here is the profile information
        we use for this portal:
      </p>
      <dl className="grid max-w-md gap-2 text-sm">
        <div className="flex gap-2">
          <dt className="w-24 shrink-0 font-medium text-zinc-700">Name</dt>
          <dd className="text-zinc-900">{session?.name ?? "—"}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-24 shrink-0 font-medium text-zinc-700">Email</dt>
          <dd className="text-zinc-900">{session?.email ?? "—"}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-24 shrink-0 font-medium text-zinc-700">Slack ID</dt>
          <dd className="font-mono text-zinc-900">{session?.slackId ?? "—"}</dd>
        </div>
      </dl>
      <p className="text-sm text-zinc-500">
        Name and Slack ID come from your Hack Club account (scopes{" "}
        <code className="rounded bg-zinc-100 px-1">name</code> and{" "}
        <code className="rounded bg-zinc-100 px-1">slack_id</code>). Update them
        in your Hack Club profile if they change.
      </p>
    </div>
  );
}
