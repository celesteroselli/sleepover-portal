type FaqItem = { q: string; a: string };

const FAQ_LEFT: FaqItem[] = [
  {
    q: "What should I bring?",
    a: "Comfortable clothes, toiletries, a sleeping setup if noted in your ticket email, and any medications you need. We will send a full packing list before the event.",
  },
  {
    q: "When do doors open?",
    a: "Check-in typically opens an hour before the first session. Exact times will appear on your ticket and in the schedule calendar.",
  },
  {
    q: "Is food provided?",
    a: "Meals and snacks are included for the weekend. Note any dietary restrictions when you RSVP or email the organizers.",
  },
];

const FAQ_RIGHT: FaqItem[] = [
  {
    q: "How do I get there?",
    a: "We will share the venue address and transit options in your confirmation email. Carpool coordination may happen in Slack.",
  },
  {
    q: "What is the refund policy?",
    a: "Refund windows and transfer rules depend on ticket type. Contact the team listed on your ticket for specific cases.",
  },
  {
    q: "Who can I contact for accessibility needs?",
    a: "Reply to your invite email or message an organizer in Slack. We want everyone to participate comfortably.",
  },
];

function FaqColumn({ items }: { items: FaqItem[] }) {
  return (
    <div className="faq-column flex flex-col gap-4 md:gap-5">
      {items.map((item) => (
        <details
          key={item.q}
          className="faq-details group rounded-xl border border-[#f2ffb2]/35 bg-[#0e2031]/75"
        >
          <summary className="faq-summary cursor-pointer list-none px-5 py-4 text-left text-base font-medium text-[#f2ffb2] outline-none marker:content-none md:px-6 md:py-5 md:text-lg [&::-webkit-details-marker]:hidden">
            <span className="flex items-center justify-between gap-3">
              <span>{item.q}</span>
              <span className="shrink-0 text-lg text-[#f2ffb2]/80 transition-transform group-open:rotate-180 md:text-xl">
                ▼
              </span>
            </span>
          </summary>
          <div className="border-t border-[#f2ffb2]/20 px-5 pb-5 pt-3 text-base leading-relaxed text-blue-100 md:px-6 md:pb-6 md:pt-4 md:text-lg">
            {item.a}
          </div>
        </details>
      ))}
    </div>
  );
}

export default function FaqPage() {
  return (
    <div className="faq-page w-full max-w-6xl space-y-10 text-[#f2ffb2]">
      <p className="text-center text-base text-blue-100 md:text-lg">
        Tap a question to expand the answer.
      </p>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-12">
        <FaqColumn items={FAQ_LEFT} />
        <FaqColumn items={FAQ_RIGHT} />
      </div>
    </div>
  );
}
