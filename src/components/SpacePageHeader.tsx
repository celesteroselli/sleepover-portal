"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TITLES: Record<string, string> = {
  "/schedule": "SCHEDULE",
  "/ticket": "TICKET",
  "/memories": "MEMORIES",
  "/faq": "FAQ",
};

const STAR_POSITIONS = [
  { left: "11%", top: "24%", size: 14, delay: "0.1s", duration: "2.6s" },
  { left: "24%", top: "16%", size: 16, delay: "0.8s", duration: "3.1s" },
  { left: "33%", top: "38%", size: 8, delay: "1.5s", duration: "2.2s" },
  { left: "46%", top: "10%", size: 12, delay: "0.4s", duration: "2.9s" },
  { left: "66%", top: "18%", size: 18, delay: "1.2s", duration: "2.4s" },
  { left: "75%", top: "35%", size: 16, delay: "0.7s", duration: "3s" },
  { left: "88%", top: "16%", size: 14, delay: "1.7s", duration: "2.7s" },
  { left: "93%", top: "38%", size: 17, delay: "0.2s", duration: "2.5s" },
];

function titleFromPath(pathname: string): string | null {
  if (TITLES[pathname]) return TITLES[pathname];
  const key = Object.keys(TITLES).find(
    (prefix) => pathname !== prefix && pathname.startsWith(`${prefix}/`)
  );
  return key ? TITLES[key] : null;
}

export function SpacePageHeader() {
  const pathname = usePathname();
  const title = titleFromPath(pathname);
  if (!title) return null;

  return (
    <header className="space-header relative h-48 w-full overflow-hidden">
      {STAR_POSITIONS.map((star, i) => (
        <span
          key={`space-header-star-${i}`}
          className="space-header-star"
          style={{
            left: star.left,
            top: star.top,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: star.delay,
            animationDuration: star.duration,
          }}
        />
      ))}

      <Link
        href="/home#home-bottom"
        className="space-header-back"
        aria-label="Back to home"
      />

      <h1 className="space-header-title">{title}</h1>
    </header>
  );
}
