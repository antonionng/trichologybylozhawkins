export const textureAssets = {
  linen: "/textures/linen.svg",
  veinedPaper: "/textures/veined-paper.svg",
};

export const illustrationAssets = {
  fernSilhouette: "/illustrations/fern-silhouette.svg",
  strandOrbit: "/illustrations/strand-orbit.svg",
};

/** If set, home/about hero uses this URL; otherwise `public/images/hero-placeholder.png`. */
const lorraineHeroSrc =
  (typeof process.env.NEXT_PUBLIC_LORRAINE_HERO_URL === "string" &&
    process.env.NEXT_PUBLIC_LORRAINE_HERO_URL.trim()) ||
  "/images/hero-placeholder.png";

export const photography = {
  hero: {
    src: lorraineHeroSrc,
    alt: "Lorraine Hawkins, clinical trichologist and educator.",
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

export const stockImages = {
  blog: {
    hairLoss: {
      src: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80",
      alt: "Woman examining her hair, representing hair loss concerns.",
    },
    scalpHealth: {
      src: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=1200&q=80",
      alt: "Healthy hair and scalp care treatment in a clinical setting.",
    },
    consultation: {
      src: "https://images.unsplash.com/photo-1559599101-f09722fb4948?auto=format&fit=crop&w=1200&q=80",
      alt: "Professional consultation between trichologist and client.",
    },
    wellness: {
      src: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=80",
      alt: "Calm wellness and self-care setting for holistic hair health.",
    },
  },
  general: {
    clinic: {
      src: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80",
      alt: "Modern clinical setting for professional treatments.",
    },
    training: {
      src: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80",
      alt: "Professional training and education environment.",
    },
    naturalHair: {
      src: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80",
      alt: "Natural healthy hair in soft lighting.",
    },
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

