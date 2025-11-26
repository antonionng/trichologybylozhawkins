import type { ReactNode } from "react";
import clsx from "clsx";

type SectionHeadingProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  kickerIcon?: ReactNode;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  kickerIcon,
  className,
}: SectionHeadingProps) {
  return (
    <header
      className={clsx(
        "space-y-4",
        align === "center" && "mx-auto max-w-3xl text-center",
        className,
      )}
    >
      {eyebrow ? (
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.32em] text-brand-graphite/60">
          {kickerIcon ? <span className="text-brand-salmon">{kickerIcon}</span> : null}
          <span>{eyebrow}</span>
        </div>
      ) : null}
      <h2 className="font-display text-3xl leading-tight text-brand-graphite sm:text-[2.6rem]">
        {title}
      </h2>
      {description ? (
        <p className="text-base leading-relaxed text-brand-graphite/75">{description}</p>
      ) : null}
    </header>
  );
}

