import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Trichology Academy",
    short_name: "Trichology",
    description:
      "Clinical trichology education, consultations, and scalp health guidance with Lorraine Hawkins.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5efe6",
    theme_color: "#b76e5d",
    icons: [
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/favicon.ico",
        sizes: "16x16 32x32 48x48",
        type: "image/x-icon",
      },
    ],
  };
}
