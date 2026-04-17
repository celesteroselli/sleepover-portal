"use client";

import { usePathname } from "next/navigation";
import { SpacePageHeader } from "./SpacePageHeader";

const SPACE_PAGES = ["/schedule", "/ticket", "/memories", "/faq"];

function isSpacePage(pathname: string) {
  return SPACE_PAGES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export function SpacePageShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const space = isSpacePage(pathname);

  if (!space) {
    return (
      <div className="flex min-h-full flex-col">
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="space-page-shell flex min-h-screen w-full flex-col">
      <SpacePageHeader />
      <div className="flex flex-1 items-center justify-center px-4 pb-10 pt-6">
        <div className="w-full max-w-3xl">{children}</div>
      </div>
    </div>
  );
}

