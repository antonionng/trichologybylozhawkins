export function ReflectionPrompt({ text }: { text: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-brand-clay/20 bg-gradient-to-br from-brand-clay/8 via-brand-clay/4 to-transparent">
      <div className="absolute right-4 top-4 text-4xl opacity-10 select-none">
        💭
      </div>

      <div className="px-6 py-6">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-clay/15 text-lg">
            ✍️
          </span>
          <div>
            <p className="font-display text-sm font-semibold tracking-wide text-black/80">
              Pause &amp; Reflect
            </p>
            <p className="text-xs text-black/40">
              Take a moment to think about this
            </p>
          </div>
        </div>

        <p className="text-sm italic leading-relaxed text-black/65">
          {text}
        </p>
      </div>
    </div>
  );
}
