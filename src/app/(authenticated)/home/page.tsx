import { getSession } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";
import ParallaxBackground from "@/components/ParallaxBackground";
import { HomeAsteroid } from "@/components/HomeAsteroid";

export default async function HomePage() {
  const session = await getSession();

  const stars = [
    { left: "8%", top: "12%", size: 4, delay: "0s", duration: "2.8s" },
    { left: "17%", top: "25%", size: 3, delay: "0.5s", duration: "2.2s" },
    { left: "26%", top: "10%", size: 5, delay: "0.2s", duration: "3s" },
    { left: "34%", top: "32%", size: 3, delay: "1.1s", duration: "2.5s" },
    { left: "41%", top: "16%", size: 4, delay: "1.6s", duration: "2.7s" },
    { left: "53%", top: "8%", size: 3, delay: "0.3s", duration: "2.1s" },
    { left: "62%", top: "22%", size: 5, delay: "1.9s", duration: "2.9s" },
    { left: "71%", top: "14%", size: 4, delay: "0.8s", duration: "2.3s" },
    { left: "79%", top: "30%", size: 3, delay: "1.3s", duration: "2.6s" },
    { left: "89%", top: "18%", size: 4, delay: "0.1s", duration: "2.4s" },
    { left: "12%", top: "45%", size: 3, delay: "0.7s", duration: "2.8s" },
    { left: "23%", top: "56%", size: 5, delay: "1.5s", duration: "3.1s" },
    { left: "38%", top: "47%", size: 3, delay: "0.4s", duration: "2.2s" },
    { left: "47%", top: "58%", size: 4, delay: "1s", duration: "2.7s" },
    { left: "58%", top: "49%", size: 3, delay: "1.8s", duration: "2.3s" },
    { left: "67%", top: "60%", size: 5, delay: "0.6s", duration: "3s" },
    { left: "76%", top: "52%", size: 3, delay: "1.2s", duration: "2.1s" },
    { left: "85%", top: "63%", size: 4, delay: "0.9s", duration: "2.6s" },
    { left: "93%", top: "48%", size: 3, delay: "1.4s", duration: "2.4s" },
    { left: "14%", top: "72%", size: 4, delay: "0.4s", duration: "2.9s" },
    { left: "28%", top: "68%", size: 3, delay: "1.7s", duration: "2.3s" },
    { left: "35%", top: "78%", size: 5, delay: "0.2s", duration: "3.2s" },
    { left: "45%", top: "71%", size: 3, delay: "1.2s", duration: "2.5s" },
    { left: "54%", top: "75%", size: 4, delay: "0.8s", duration: "2.7s" },
    { left: "63%", top: "69%", size: 3, delay: "1.5s", duration: "2.1s" },
    { left: "72%", top: "77%", size: 5, delay: "0.5s", duration: "3s" },
    { left: "81%", top: "73%", size: 4, delay: "1s", duration: "2.6s" },
    { left: "90%", top: "70%", size: 3, delay: "0.3s", duration: "2.4s" },
    { left: "10%", top: "84%", size: 3, delay: "1.3s", duration: "2.8s" },
    { left: "20%", top: "88%", size: 4, delay: "0.6s", duration: "2.2s" },
    { left: "32%", top: "82%", size: 5, delay: "1.8s", duration: "3.1s" },
    { left: "42%", top: "86%", size: 3, delay: "0.1s", duration: "2.5s" },
    { left: "51%", top: "90%", size: 4, delay: "1.4s", duration: "2.7s" },
    { left: "61%", top: "85%", size: 3, delay: "0.9s", duration: "2.3s" },
    { left: "70%", top: "89%", size: 5, delay: "1.6s", duration: "3s" },
    { left: "78%", top: "83%", size: 4, delay: "0.7s", duration: "2.6s" },
    { left: "87%", top: "87%", size: 3, delay: "1.1s", duration: "2.4s" },
    { left: "95%", top: "91%", size: 4, delay: "0.4s", duration: "2.9s" },
  ];

  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2 -mb-8">
      <div className="relative h-[92vh] -mt-[31vh] min-h-[700px] w-full overflow-hidden">
        <ParallaxBackground />
        <HomeAsteroid
          src={process.env.NEXT_PUBLIC_HOME_ASTEROID_URL}
        />
      </div>

      <div className="relative z-10 -mt-[28vh] h-[50vh] min-h-[650px] w-full sm:h-[32vh]">
        <Image
          src="/clouds.png"
          alt="Clouds"
          fill
          priority
          className="object-cover object-center white-edge"
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <Image
            src="/sleepover.png"
            alt="Sleepover logo"
            width={700}
            height={700}
            priority
            className="home-logo-float h-auto w-[500px] sm:w-[500px] md:w-[820px]"
          />
        </div>
      </div>

      <div className="home-night relative -mt-58 min-h-[120vh] w-full px-6 pb-20 pt-28">
        {stars.map((star, i) => (
          <span
            key={`star-${i}`}
            className="home-star"
            style={{
              left: star.left,
              top: star.top,
              width: `${star.size*4}px`,
              height: `${star.size*4}px`,
              animationDelay: star.delay,
              animationDuration: star.duration,
            }}
          />
        ))}

        <div className="relative z-10 mt-49 mx-auto max-w-3xl space-y-3 text-center text-white/95">
          <h1 className="text-6xl font-bold text-[#9cc5f6] text-border tommy-font">Welcome {session?.name??"Unknown"}! </h1>
        </div>

        <div id="home-bottom" className="flex justify-center mt-10">

        <div className="relative z-10 me-40 icon" style={{ animation: "home-logo-float 5s ease-in-out infinite", animationDelay: "0.5s" }}>
          <Link
          href="/faq"
          >
          <Image 
          src="/faqstar.png"
          alt="faqstar"
          width={300}
          height={300}
          />
          </Link>
        </div>

        <div className="relative z-10 mt-45 me-15 icon" style={{ animation: "home-logo-float 4s ease-in-out infinite", animationDelay: "0.1s" }}>
          <Link
          href="/memories"
          >
          <Image 
          src="/memoriesstar.png"
          alt="memoriesstar"
          width={300}
          height={300}
          />
          </Link>
        </div>

        <div className="relative z-10 mb-5 ms-20 icon" style={{ animation: "home-logo-float 6s ease-in-out infinite", animationDelay: "0s" }}>
          <Link
          href="/schedule"
          >
          <Image 
          src="/schedulestar.png"
          alt="schedulestar"
          width={300}
          height={300}
          />
          </Link>
        </div>

        <div className="relative z-10 mt-40 me-10 icon" style={{ animation: "home-logo-float 3.5s ease-in-out infinite", animationDelay: "0.2s" }}>
          <Link
          href="/ticket"
          >
          <Image 
          src="/moon.png"
          alt="ticketmoon"
          width={400}
          height={400}
          />
          </Link>
        </div>
</div>
      </div>
    </div>
  );
}
