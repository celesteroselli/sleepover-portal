export default function SchedulePage() {
  const embedUrl = process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_EMBED_URL?.trim();

  return (
    <div className="schedule-page mb-30 w-full max-w-5xl space-y-10 text-[#f2ffb2] max-md:space-y-20">
      {embedUrl ? (
        <div className="schedule-calendar-shell overflow-hidden rounded-lg border border-[#f2ffb2]/30 bg-[#0e2031]/80 shadow-lg">
          <iframe
            title="Sleepover schedule calendar"
            src={embedUrl}
            className="schedule-calendar-iframe block w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      ) : (
        <div className="rounded-lg border border-[#f2ffb2]/30 bg-[#0e2031]/80 px-4 py-10 text-center text-sm text-blue-100">
          <p className="mb-2">
            Add your Google Calendar embed URL to show the schedule here.
          </p>
          <p>
            Set{" "}
            <code className="rounded bg-black/30 px-1.5 py-0.5 text-[#f2ffb2]">
              NEXT_PUBLIC_GOOGLE_CALENDAR_EMBED_URL
            </code>{" "}
            in <code className="rounded bg-black/30 px-1.5 py-0.5">.env</code>{" "}
            (use the iframe <code className="rounded bg-black/30 px-1">src</code>{" "}
            from Google Calendar&apos;s embed dialog).
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 max-md:gap-8 md:grid-cols-2 md:gap-6">
        <div className="schedule-cloud-panel mx-auto w-full md:mt-50">
          <div className="schedule-cloud-inner flex flex-col items-center justify-center">
            <div className="w-full space-y-2 text-center p-5">
              <h2 className="text-lg font-semibold text-[#173048]">
                Keychain/Friendship Bracelet Workshops
              </h2>
              <p className="text-sm leading-relaxed text-[#173048]/95">
                <strong>11am Sat</strong> and <strong>6pm Sat</strong> (respectively) - come, bond, and have fun!
              </p>
            </div>
          </div>
        </div>
        <div className="schedule-cloud-panel mx-auto w-full">
          <div className="schedule-cloud-inner flex flex-col items-center justify-center">
            <div className="w-full space-y-2 text-center p-5">
              <h2 className="text-lg font-semibold text-[#173048]">
                Lightning Talks
              </h2>
              <p className="text-sm leading-relaxed text-[#173048]/95">
                <strong>8pm Sat</strong> during dinner. Learn or share something you love!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
