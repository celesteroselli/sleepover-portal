import { getSession } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";

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
  ];

  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2 -mb-8">
      <div className="relative h-[92vh] -mt-[20vh] min-h-[700px] w-full">
        <Image
          src="/sky.png"
          alt="Sky background"
          fill
          priority
          className="object-cover object-top"
        />
      </div>

      <div className="relative z-10 -mt-[25vh] h-[50vh] min-h-[650px] w-full sm:h-[32vh]">
        <Image
          src="/clouds.png"
          alt="Clouds"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <Image
            src="/sleepover.png"
            alt="Sleepover logo"
            width={700}
            height={700}
            priority
            className="home-logo-float h-auto w-[500px] sm:w-[500px] md:w-[700px]"
          />
        </div>
      </div>

      <div className="home-night relative -mt-53 min-h-[120vh] w-full px-6 pb-20 pt-28">
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

        <div className="relative z-10 mt-53 mx-auto max-w-3xl space-y-3 text-center text-white/95">
          <h1 className="text-3xl font-semibold">Welcome {session?.name??"Unknown"}!</h1>
        </div>

        <div className="flex justify-center">

        <div className="relative z-10 me-40">
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

        <div className="relative z-10 mt-30 me-15">
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

        <div className="relative z-10 mb-5 ms-20">
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

        <div className="relative z-10 mt-50">
          <Link
          href="/ticket"
          >
          <Image 
          src="/moon.png"
          alt="ticketmoon"
          width={300}
          height={300}
          />
          </Link>
        </div>
</div>
      </div>
    </div>
  );
}
