import { getSession, isAdminSlackId } from "@/lib/auth";
import Link from "next/link";

const links = [
  { href: "/home", label: "Home" },
  { href: "/schedule", label: "Schedule" },
  { href: "/faq", label: "FAQ" },
  { href: "/ticket", label: "Ticket" },
  { href: "/memories", label: "Memories" },
] as const;

export async function PortalNav() {
  const session = await getSession();
  if (!session) return null;

  const showAdmin = isAdminSlackId(session.slackId);

  return (
    <header className="border-b border-zinc-200 bg-white px-4 py-3">
      <nav className="mx-auto flex max-w-4xl flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <span className="font-medium text-zinc-800">Sleepover Portal</span>
        <span className="text-zinc-300">|</span>
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline"
          >
            {label}
          </Link>
        ))}
        {showAdmin && (
          <>
            <span className="text-zinc-300">|</span>
            <Link
              href="/admin"
              className="text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline"
            >
              Admin
            </Link>
          </>
        )}
        <span className="ml-auto">
          <Link
            href="/api/auth/logout"
            className="text-zinc-500 underline-offset-2 hover:underline"
          >
            Sign out
          </Link>
        </span>
      </nav>
    </header>
  );
}
