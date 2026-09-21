type Props = {
  title: string;
  href: string | null;
  mimeType?: string | null;
  isEndOfModule?: boolean;
};

export function LessonDownloadCta({ title, href, mimeType, isEndOfModule }: Props) {
  const ready = Boolean(href);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-black/40">
          {isEndOfModule ? "End of module" : "Downloads"}
        </p>
        <h2 className="text-xl font-semibold text-black">
          {isEndOfModule ? "Chair-side one-pager" : "Files"}
        </h2>
        {isEndOfModule ? (
          <p className="mt-1 text-sm text-black/55">
            Take this referral script back to the salon. Print it or keep it on your phone.
          </p>
        ) : null}
      </div>

      {ready ? (
        <a
          href={href ?? "#"}
          className="group flex items-center justify-between rounded-2xl border border-black/5 bg-white/80 p-4 transition hover:border-brand-salmon/30 hover:bg-brand-salmon/5"
        >
          <div>
            <p className="font-semibold text-black group-hover:text-brand-salmon">{title}</p>
            <p className="text-xs text-black/50">{mimeType ?? "Download"}</p>
          </div>
          <span className="rounded-full bg-[#fab826] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-white">
            Download
          </span>
        </a>
      ) : (
        <p className="text-sm text-black/50">Download is being prepared.</p>
      )}
    </div>
  );
}
