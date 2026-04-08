import { AdminMemoriesPanel } from "@/components/AdminMemoriesPanel";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const [users, photos] = await Promise.all([
    prisma.user.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        hcSub: true,
        name: true,
        email: true,
        slackId: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { photos: true } },
      },
    }),
    prisma.memoryPhoto.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, slackId: true, email: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Admin</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Users who have signed in and memory photos. Access is limited to Slack
          IDs listed in <code className="rounded bg-zinc-100 px-1">ADMIN_SLACK_IDS</code>.
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-medium text-zinc-900">
          People who have signed in ({users.length})
        </h2>
        <div className="overflow-x-auto rounded border border-zinc-200">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50">
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Email</th>
                <th className="px-3 py-2 font-medium">Slack ID</th>
                <th className="px-3 py-2 font-medium">Hack Club sub</th>
                <th className="px-3 py-2 font-medium">Photos</th>
                <th className="px-3 py-2 font-medium">Last updated</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-zinc-100">
                  <td className="px-3 py-2">{u.name ?? "—"}</td>
                  <td className="px-3 py-2">{u.email ?? "—"}</td>
                  <td className="px-3 py-2 font-mono text-xs">{u.slackId ?? "—"}</td>
                  <td className="px-3 py-2 font-mono text-xs break-all">
                    {u.hcSub}
                  </td>
                  <td className="px-3 py-2">{u._count.photos}</td>
                  <td className="px-3 py-2 text-xs text-zinc-500">
                    {u.updatedAt.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium text-zinc-900">Memory photos</h2>
        <AdminMemoriesPanel
          initialPhotos={photos.map((p) => ({
            id: p.id,
            publicPath: p.publicPath,
            caption: p.caption,
            createdAt: p.createdAt.toISOString(),
            user: p.user,
          }))}
        />
      </section>
    </div>
  );
}
