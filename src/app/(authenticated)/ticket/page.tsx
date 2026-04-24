export default function TicketPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col items-center space-y-5 px-2 pb-4">
      <h1 className="text-center text-4xl font-bold text-white md:text-5xl">
        Hack Club Attend
      </h1>
      <div className="w-full max-w-4xl rounded-2xl border border-[#f2ffb2]/50 bg-[#0f2238]/70 px-6 py-10 text-center shadow-[0_0_30px_rgba(242,255,178,0.2)]">
        <p className="mx-auto mb-6 max-w-2xl text-sm text-blue-100/90 md:text-base">
          Open Hack Club Attend to manage your boaring pass, check in to events, etc.
        </p>
        <a
          href="https://attend.hackclub.com/dashboard/events/31ee3f44-4f82-4218-ad5c-f1b10ec752d2"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-xl border border-[#f2ffb2]/70 bg-[#f2ffb2] px-6 py-3 text-base font-semibold text-[#173048] transition hover:scale-[1.02] hover:bg-[#f6ffc5]"
        >
          Open Hack Club Attend
        </a>
      </div>
    </div>
  );
}
