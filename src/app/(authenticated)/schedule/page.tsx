export default function SchedulePage() {
  const embedUrl = process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_EMBED_URL?.trim();

  return (
    <div className="schedule-page w-full max-w-5xl space-y-10 text-[#f2ffb2] mb-30">
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

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-6 -mt-10">
        <div className="schedule-cloud-panel ps-5 pt-4 pe-10">
          <div className="schedule-cloud-inner flex items-center justify-center text-center">
            <div>
              <h2 className="mb-2 text-lg font-semibold text-[#173048]">
                Workshop track A
              </h2>
              <p className="text-sm leading-relaxed text-[#173048]/95">
                Room and time TBD. Short blurb about what participants will build
                or learn in this session.
              </p>
            </div>
          </div>
        </div>
        <div className="schedule-cloud-panel ps-5 pt-4 pe-10 mt-40">
          <div className="schedule-cloud-inner flex items-center justify-center text-center">
            <div>
              <h2 className="mb-2 text-lg font-semibold text-[#173048]">
                Workshop track B
              </h2>
              <p className="text-sm leading-relaxed text-[#173048]/95">
                Room and time TBD. Short blurb about the second workshop offering.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
