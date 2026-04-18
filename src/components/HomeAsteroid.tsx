"use client";

type Props = {
  src?: string;
};

export function HomeAsteroid({ src }: Props) {
  const resolved = src?.trim() || "/asteroid.png";

  return (
    <div className="home-asteroid-layer pointer-events-none" aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={resolved} alt="" className="home-asteroid-img" />
    </div>
  );
}
