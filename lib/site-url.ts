const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : process.env.NODE_ENV === "production" ? "https://ammaai.example" : "http://localhost:3000");
export const siteUrl = new URL(configuredUrl).origin;
