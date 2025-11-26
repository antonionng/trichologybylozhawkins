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

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  env: {
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  },
};

export default nextConfig;
