# Ammaai deployment

Use Node.js 22 or later and deploy this application with a Next.js server (for example Vercel). Database-backed pages and admin APIs require a running server; a static export is not supported.

Set these environment variables in the hosting dashboard:

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | Database connection. Allow the deployment's network access in MongoDB Atlas. |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account cloud name. |
| `CLOUDINARY_API_KEY` | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | Server-only Cloudinary secret. |
| `ADMIN_USERNAME` | Admin sign-in username. |
| `ADMIN_PASSWORD` | A unique, strong password; never expose it as a NEXT_PUBLIC variable. |
| `NEXT_PUBLIC_SITE_URL` | Final HTTPS website origin, with no path. Replace the temporary Ammaai example domain before launch. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Optional fallback business number including country code, digits only. Admin Settings takes precedence. |

Production admin pages and all CMS APIs require browser HTTP Basic sign-in. They return 503 when admin credentials are absent; public pages stay available. Always use HTTPS. Development access without credentials is allowed only on localhost.

Run `npm ci`, `npm run lint`, `npm run typecheck` and `npm run build`. Start a conventional Node deployment with `npm start`. The database is read at request time, so admin changes do not require rebuilding the site. Cloudinary uploads go directly from the browser using server-generated signatures.

For an existing database, `npm run migrate:content` adds missing FAQ/card editor data and updates old brand copy without replacing products or media. This migration has already been run on the connected database. Do not use the demo seed to migrate an existing store: that script updates sample product and page content.

The current WhatsApp number `919999999999` and email `hello@ammaai.example` are dummy values requested for preview. Replace them in `/admin/settings` before taking real enquiries. The supplied Ammaai logo is bundled locally; a replacement can be selected from the Media Library in Settings.

Browser checks: install the test browser with `npx playwright install chromium`, then run `npm run test:e2e` against the running localhost server. `TEST_BROWSER_CHANNEL=chrome` can use installed Chrome. For production verification, set `TEST_BASE_URL`, `TEST_ADMIN_USERNAME`, and `TEST_ADMIN_PASSWORD` to the running test server. Tests temporarily edit FAQ/card/settings content and create their own products, categories and Cloudinary media; they restore or remove those records after checking persistence.

`npm audit --omit=dev` checks runtime dependencies. The full audit currently reports an upstream braces vulnerability in the ESLint/Next lint tooling dependency chain; npm's suggested downgrade to Next's older lint configuration is incompatible with this project's Next.js 16 setup. Recheck that upstream tooling when a compatible fix is published.
