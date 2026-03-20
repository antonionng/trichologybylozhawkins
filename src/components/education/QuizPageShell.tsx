import React, { type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { Container } from "@/components/layout/Container";
import { PageSection } from "@/components/layout/PageSection";
import { Surface } from "@/components/layout/Surface";
import { SectionHeading } from "@/components/typography/SectionHeading";
import {
  illustrationAssets,
  photography,
  textureAssets,
} from "@/lib/visualAssets";

type QuizPageShellStat = {
  label: string;
  value: ReactNode;
};

type QuizPageShellProps = {
  variant?: "public" | "academy";
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  backHref?: string;
  backLabel?: string;
  heroUrl?: string | null;
  heroAlt: string;
  stats?: QuizPageShellStat[];
  highlights?: string[];
  supportingPanel?: ReactNode;
  children: ReactNode;
};

const sectionToneClasses = {
  public: {
    tone: "sand" as const,
    texture: "linen" as const,
    className: "min-h-screen",
  },
  academy: {
    tone: "mist" as const,
    texture: "linen" as const,
    className: "min-h-screen",
  },
};

export function QuizPageShell({
  variant = "public",
  eyebrow,
  title,
  description,
  backHref,
  backLabel,
  heroUrl,
  heroAlt,
  stats = [],
  highlights = [],
  supportingPanel,
  children,
}: QuizPageShellProps) {
  const section = sectionToneClasses[variant];
  const imageUrl = heroUrl ?? photography.consultation.src;
  const imageAlt = heroUrl ? heroAlt : photography.consultation.alt;

  return (
    <main className={clsx("min-h-screen", variant === "public" && "overflow-x-hidden")}>
      <PageSection
        tone={section.tone}
        texture={section.texture}
        padding="compact"
        className={section.className}
        collage={{
          parallax: variant === "public",
          layers: [
            {
              type: "texture",
              src: textureAssets.linen,
              blendMode: "multiply",
              opacity: variant === "public" ? 0.42 : 0.3,
            },
            {
              type: "illustration",
              src: illustrationAssets.fernSilhouette,
              blendMode: "screen",
              opacity: variant === "public" ? 0.24 : 0.16,
            },
            {
              type: "illustration",
              src: illustrationAssets.strandOrbit,
              blendMode: "soft-light",
              opacity: variant === "public" ? 0.32 : 0.22,
            },
          ],
        }}
      >
        <Container
          className={clsx(
            "relative z-10 grid gap-8 lg:items-start",
            variant === "public"
              ? "lg:grid-cols-1 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]"
              : "lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]",
          )}
        >
          <div className="min-w-0 space-y-6 xl:sticky xl:top-24">
            {backHref && backLabel ? (
              <Link
                href={backHref}
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-brand-graphite/55 transition hover:text-brand-graphite"
              >
                <span aria-hidden>←</span>
                <span>{backLabel}</span>
              </Link>
            ) : null}

            <div className="space-y-4">
              <SectionHeading
                eyebrow={eyebrow}
                title={title}
                description={description}
              />

              {highlights.length ? (
                <div className="flex flex-wrap gap-2">
                  {highlights.map((highlight) => (
                    <span
                      key={highlight}
                      className="rounded-full border border-brand-graphite/10 bg-white/80 px-4 py-2 text-xs font-medium text-brand-graphite/70"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            {stats.length ? (
              <Surface
                variant={variant === "public" ? "glass" : "card"}
                padding="md"
                className={clsx(
                  "grid gap-3 sm:grid-cols-3",
                  stats.length < 3 && "sm:grid-cols-2",
                )}
              >
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-[1.35rem] border border-brand-graphite/8 bg-white/75 p-4 text-center"
                  >
                    <p className="text-2xl font-semibold text-brand-graphite">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-brand-graphite/45">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </Surface>
            ) : null}

            {supportingPanel ? supportingPanel : null}

            <Surface
              variant={variant === "public" ? "glass" : "card"}
              padding="none"
              className="overflow-hidden rounded-[2rem]"
            >
              <Image
                src={imageUrl}
                alt={imageAlt}
                width={1200}
                height={960}
                priority
                className="h-[260px] w-full object-cover sm:h-[320px] lg:h-[360px]"
              />
            </Surface>
          </div>

          <div className="min-w-0">{children}</div>
        </Container>
      </PageSection>
    </main>
  );
}
