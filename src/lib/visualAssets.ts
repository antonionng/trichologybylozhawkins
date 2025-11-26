export const textureAssets = {
  linen: "/textures/linen.svg",
  veinedPaper: "/textures/veined-paper.svg",
};

export const illustrationAssets = {
  fernSilhouette: "/illustrations/fern-silhouette.svg",
  strandOrbit: "/illustrations/strand-orbit.svg",
};

export const photography = {
  hero: {
    src: "/images/hero-placeholder.png",
    alt: "Placeholder hero image — replace public/images/hero-placeholder.png with branded photography.",
  },
  consultation: {
    src: "/images/cta-consultation-placeholder.png",
    alt: "Trichologist reviewing scalp diagnostics with a client in a calm studio.",
  },
  education: {
    src: "/images/course-fundamentals-placeholder.png",
    alt: "Professional trichology education and training materials",
  },
  salonTeam: {
    src: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80",
    alt: "Stylists collaborating in a modern salon with natural textures.",
  },
};

import type { CSSProperties } from "react";

type BlendMode = CSSProperties["mixBlendMode"];

export const collageLayers = [
  {
    type: "texture" as const,
    src: textureAssets.linen,
    blendMode: "multiply" as BlendMode,
    opacity: 0.75,
  },
  {
    type: "illustration" as const,
    src: illustrationAssets.fernSilhouette,
    blendMode: "screen" as BlendMode,
    opacity: 0.42,
  },
  {
    type: "illustration" as const,
    src: illustrationAssets.strandOrbit,
    blendMode: "soft-light" as BlendMode,
    opacity: 0.55,
  },
];

export type CollageLayer = (typeof collageLayers)[number];

