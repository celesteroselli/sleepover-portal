"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { SpacePageHeader } from "./SpacePageHeader";

const SPACE_PAGES = ["/schedule", "/ticket", "/memories", "/faq"];

function isSpacePage(pathname: string) {
  return SPACE_PAGES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

/** Tall / scroll-heavy space routes: start at top of viewport, not vertically centered */
function isSpacePageTopAligned(pathname: string) {
  return (
    pathname === "/memories" ||
    pathname.startsWith("/memories/") ||
    pathname === "/schedule" ||
    pathname.startsWith("/schedule/")
  );
}

export function SpacePageShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const space = isSpacePage(pathname);
  const topAligned = isSpacePageTopAligned(pathname);

  useLayoutEffect(() => {
    if (!topAligned) return;
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname, topAligned]);

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
      <div
        className={`flex flex-1 justify-center px-4 pb-10 ${
          topAligned ? "items-start pt-6" : "items-center"
        }`}
      >
        <div className="w-full max-w-3xl">{children}</div>
      </div>
    </div>
  );
}

