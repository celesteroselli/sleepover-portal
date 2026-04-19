"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  /** Defaults to `/asteroid.png` in `public/`. Set `NEXT_PUBLIC_HOME_ASTEROID_URL` for a remote asset. */
  src?: string;
};

/** User has scrolled far enough from the top that a return should replay the asteroid */
const SCROLL_AWAY_PX = 220;
/** Treat as "back at top" when scrollY is at or below this */
const SCROLL_TOP_PX = 72;

export function HomeAsteroid({ src }: Props) {
  const resolved = src?.trim() || "/asteroid.png";
  const [playKey, setPlayKey] = useState(0);
  const awayFromTop = useRef(false);

  const onScroll = useCallback(() => {
    const y = window.scrollY;
    if (y > SCROLL_AWAY_PX) {
      awayFromTop.current = true;
      return;
    }
    if (awayFromTop.current && y <= SCROLL_TOP_PX) {
      awayFromTop.current = false;
      setPlayKey((k) => k + 1);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  return (
    <div className="home-asteroid-layer pointer-events-none" aria-hidden>
      {/* Remounting restarts the CSS animation (including delay) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img key={playKey} src={resolved} alt="" className="home-asteroid-img" />
    </div>
  );
}
