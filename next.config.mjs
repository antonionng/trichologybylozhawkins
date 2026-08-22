const REQUIRED_SERVER_ENV = [
  "DATABASE_URL",
  "REDIS_URL",
  "STRIPE_SECRET_KEY",
  "OPENAI_API_KEY",
];

if (
  process.env.NODE_ENV === "production" &&
  process.env.SKIP_ENV_VALIDATION !== "true"
) {
  const missing = REQUIRED_SERVER_ENV.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}

// Historic clinic hostname. Serve this host — do not 301 it (or vercel.app) to the Academy.
const CLINIC_MARKETING_HOSTS = [
  "trichologybylorrainehawkins.co.uk",
  "www.trichologybylorrainehawkins.co.uk",
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/treatments",
        destination: "/clinic",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: CLINIC_MARKETING_HOSTS.map((host) => ({
        source: "/",
        has: [{ type: "host", value: host }],
        destination: "/clinic",
      })),
    };
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has TypeScript errors.
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: (() => {
          try {
            return new URL(process.env.SUPABASE_URL || "").hostname;
          } catch {
            return "cqnbspefjfnngmomezsp.supabase.co";
          }
        })(),
        pathname: "/storage/v1/object/**",
      },
    ],
  },
  env: {
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  },
};

export default nextConfig;
