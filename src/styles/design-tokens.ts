export const palette = {
  sand: "#FDF8F0",
  ivory: "#FFF9F2",
  salmon: "#ED908D",
  sage: "#C1D780",
  graphite: "#000000",
  clay: "#D7ADCC",
  mist: "#80CCDD",
  night: "#1a1a19",
  curry: "#FAB826",
} as const;

export const shadows = {
  glass: "0 32px 80px -40px rgba(23, 24, 27, 0.35)",
  card: "0 18px 48px -24px rgba(23, 24, 27, 0.28)",
  softTop: "0 8px 24px -12px rgba(35, 34, 32, 0.18)",
} as const;

export const radii = {
  glassLg: "28px",
  glassMd: "20px",
  glassSm: "14px",
} as const;

export const motion = {
  luxEase: [0.25, 0.95, 0.45, 1] as const,
  glide: [0.33, 1, 0.68, 1] as const,
  durations: {
    short: 0.45,
    medium: 0.9,
    long: 1.4,
  },
} as const;

export const textures = {
  linen: "/textures/linen.svg",
  veinedPaper: "/textures/veined-paper.svg",
} as const;

export const illustrations = {
  fern: "/illustrations/fern-silhouette.svg",
  strandOrbit: "/illustrations/strand-orbit.svg",
} as const;

export type PaletteColor = keyof typeof palette;

