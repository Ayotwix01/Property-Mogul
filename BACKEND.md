# Property Mogul Backend Foundation

## Architecture

The application uses TanStack Start server functions for server operations, Drizzle ORM for
PostgreSQL access, and Neon’s serverless PostgreSQL HTTP driver. The database layer is lazy-loaded so public pages
can still build without a configured database. Server functions validate inputs with Zod and apply
authentication and ownership checks before mutations.

## Setup

1. Create a PostgreSQL database.
2. Copy .env.example to .env.
3. Set DATABASE_URL and a long random SESSION_SECRET.
4. Run npm run db:migrate.
5. Start the app with npm run dev.

## Environment variables

The application reads the following variables. Keep all secret values server-side; only variables
with a `VITE_` prefix are eligible for client exposure, and this project does not use `VITE_`
credentials.

| Variable                   | Required                                    | Used for                                                                    | Production                              |
| -------------------------- | ------------------------------------------- | --------------------------------------------------------------------------- | --------------------------------------- |
| `DATABASE_URL`             | Yes for server/database operations          | Neon PostgreSQL and Drizzle migrations                                      | Required                                |
| `SESSION_SECRET`           | Yes in production                           | Hashing database session and OAuth state tokens                             | Required; use a long random value       |
| `NODE_ENV`                 | Optional locally                            | Production cookie security; seed safety                                     | Set to `production`                     |
| `DIDIT_API_KEY`            | Optional until verification is enabled      | Didit session creation and status polling                                   | Required to use Didit                   |
| `DIDIT_WORKFLOW_ID`        | Optional until verification is enabled      | Didit workflow selection                                                    | Required to use Didit                   |
| `DIDIT_CALLBACK_URL`       | Optional                                    | Optional Didit callback URL                                                 | Required only if callbacks are enabled  |
| `PAYSTACK_SECRET_KEY`      | Optional until contact payments are enabled | Paystack initialization, transaction verification, and webhook verification | Required to use Paystack                |
| `PAYMENT_SECRET_KEY`       | Optional legacy fallback                    | Used only when `PAYSTACK_SECRET_KEY` is absent                              | Prefer `PAYSTACK_SECRET_KEY`            |
| `CONTACT_ACCESS_PRICE_NGN` | Optional until contact payments are enabled | Server-side contact-access amount in NGN                                    | Required to use Paystack contact access |
| `PAYMENT_CALLBACK_URL`     | Optional until contact payments are enabled | Paystack checkout return URL                                                | Required to use checkout                |
| `GOOGLE_CLIENT_ID`         | Optional until Google login is enabled      | Google authorization request and token exchange                             | Required to use Google OAuth            |
| `GOOGLE_CLIENT_SECRET`     | Optional until Google login is enabled      | Server-side Google authorization-code exchange                              | Required to use Google OAuth            |
| `GOOGLE_REDIRECT_URI`      | Optional until Google login is enabled      | Google callback URL                                                         | Required to use Google OAuth            |
| `SEED_PASSWORD`            | Development-only                            | Password for synthetic QA accounts                                          | Must be absent or unused in production  |

`PAYSTACK_PUBLIC_KEY`, `PAYMENT_PUBLIC_KEY`, `PAYMENT_WEBHOOK_SECRET`, and `PAYMENT_PROVIDER` are
not read by the current application and should not be configured as if they were active settings.
Paystack uses the server secret for API calls and verifies the exact raw webhook body with the
`x-paystack-signature` HMAC; the endpoint is `/api/payments/paystack/webhook`. Didit remains safely
disabled at its webhook endpoint (HTTP 501) until its payload and signature contract are confirmed.

Didit requires a workflow containing identity document verification, passive liveness, and face
match. Set DIDIT_API_KEY, DIDIT_WORKFLOW_ID, and DIDIT_CALLBACK_URL only on the server.

## Database

The initial migration creates users, user_roles, profiles, properties, property_images, favorites,
sessions, and verification_requests. User roles are normalized rows, favorites have a composite
uniqueness constraint, and properties have a foreign-key owner relationship.

## Authentication

Registration hashes passwords with bcryptjs. Login creates a random session token, stores only its
session-secret-derived SHA-256 hash, and sends the token in an HTTP-only, same-site cookie. Sessions
expire after seven days and logout revokes the database session.

## Authorization

Server mutations use the authenticated session and database roles. Landlords can only modify
properties whose owner_id matches their user ID. Published property reads are public; favorites
require an authenticated user and are isolated by user ID.

## Verification boundary

The app creates a Didit session server-side and stores the provider reference in
verification_requests. Status polling maps provider results to database statuses and updates the
profile server-side. The webhook endpoint intentionally returns 501 until the exact provider
payload and signature contract is configured; no guessed webhook verification is shipped.

## Payments and external identity providers

Paystack contact access is initialized and verified server-side. The server calculates the NGN
price, converts it to kobo, stores a pending payment, validates the signed webhook and Paystack
transaction details, and creates contact access idempotently. `PAYSTACK_SECRET_KEY` and
`PAYMENT_CALLBACK_URL` are server configuration.
`PAYMENT_WEBHOOK_SECRET` is not used for Paystack because Paystack signs webhooks with the secret
key; do not treat it as a substitute.

Didit session creation and status polling are server-side. No identity images or facial data are
stored. The webhook route remains safely disabled until the exact Didit payload and signature
contract is confirmed from provider documentation and configured credentials.

Google OAuth uses the authorization-code flow at `/auth/google/callback`. State is generated with
cryptographically secure randomness, stored hashed in `oauth_states`, and bound to an HTTP-only
state cookie. Google identity records are stored in `oauth_accounts` with a unique provider/subject
constraint. Existing email accounts are never silently taken over; they are sent back to password
login. New users complete Terms/Privacy consent and choose SEEKER, LANDLORD, or both. ADMIN is never
available through Google signup. Configure `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and
`GOOGLE_REDIRECT_URI` only on the server.

For local development, the configured origin is `http://localhost:8080`, so use
`http://localhost:8080/auth/google/callback` as `GOOGLE_REDIRECT_URI`. Register
`http://localhost:8080` as the Authorized JavaScript origin and
`http://localhost:8080/auth/google/callback` as the Authorized redirect URI in Google Cloud Console.
If port `8080` is occupied and Vite selects another port, use the actual displayed origin and
callback consistently in both places. Production should use the deployed HTTPS origin and its
matching `/auth/google/callback` path.

## Security boundary

HTTP-only same-site sessions are backed by the `sessions` table and revoked on logout. Server
functions enforce authentication, role, ownership, and conversation checks. CSRF middleware applies
to server-function requests. Landlord contact data is queried only after a successful, unexpired
contact-access entitlement tied to the current seeker, property, and payment.

## Cloudflare deployment

The existing build uses Nitro's `cloudflare-module` preset and generates `.output/server/wrangler.json`.
The generated worker name is `ayotwix01-property-mogul`, with `nodejs_compat` and the generated
`ASSETS` binding. No database, Redis, or queue binding is required; Neon is accessed through its
serverless HTTP driver.

After authenticating Wrangler, build and deploy the existing prebuilt output:

```bash
npm run build
npx nitro deploy --prebuilt
```

Configure production values in Cloudflare Worker Variables/Secrets, never in committed files.
Use Secrets for `DATABASE_URL`, `SESSION_SECRET`, `GOOGLE_CLIENT_SECRET`, `PAYSTACK_SECRET_KEY`,
and enabled `DIDIT_API_KEY`. Configure `NODE_ENV=production`, callback URLs, provider IDs, and
`CONTACT_ACCESS_PRICE_NGN` as Worker Variables. Required production values are
`DATABASE_URL`, `SESSION_SECRET`, `NODE_ENV`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
`GOOGLE_REDIRECT_URI`, `PAYSTACK_SECRET_KEY`, `CONTACT_ACCESS_PRICE_NGN`, and
`PAYMENT_CALLBACK_URL`. Add the three `DIDIT_*` variables only when Didit is enabled. Never add
`SEED_PASSWORD` to production.

Use the eventual HTTPS domain, which is not known yet:

- Google: `https://<production-domain>/auth/google/callback`
- Paystack callback: `https://<production-domain>/payment/callback`
- Paystack webhook: `https://<production-domain>/api/payments/paystack/webhook`

Register the Google origin/callback and Paystack webhook after the production domain exists. Run
`npm run db:migrate` against production Neon before launch. Use Paystack TEST credentials for
staging; no LIVE payment is enabled or claimed. Didit's webhook remains disabled until its exact
provider payload and signature contract is confirmed.

## Development seed data

The explicit `npm run db:seed` command creates four test-only accounts and synthetic Lagos and
Abuja listings. It requires `DATABASE_URL`, `NODE_ENV` is forced to `development`, and a temporary
`SEED_PASSWORD` value in `.env`. It never runs automatically and refuses production mode. Re-running
it replaces only the seeded landlord's properties and refreshes the four reserved QA accounts.

Test emails are `qa.seeker@propertymogul.test`, `qa.landlord@propertymogul.test`,
`qa.both@propertymogul.test`, and `qa.admin@propertymogul.test`; all use the temporary value supplied
as `SEED_PASSWORD`. Remove these records before production use.

Signup and login call the backend functions. Dashboard guards use the backend session and roles.
Property discovery, property details, and favorites read from PostgreSQL when `DATABASE_URL` is
configured; public property responses exclude private landlord contact fields.

## Mogul Assistant

`src/lib/chat.functions.js` accepts only bounded `user` and `assistant` messages. It rejects client
system messages, limits requests to 12 messages with 2,000 characters each, and applies a server-
side best-effort anonymous rate limit. Search intent is parsed deterministically by
`src/lib/property-search.logic.js`, validated with Zod, and passed to the reusable
`searchPublishedProperties` PostgreSQL query. That query enforces `PUBLISHED` status. Comparison
requests re-fetch the supplied listing IDs and again enforce published status, so the client cannot
turn stale or draft data into assistant results.

The assistant returns public listing fields only: it does not return landlord contact details,
payment state, verification decisions, private profile data, or authorization actions. It does not
call an external AI provider and therefore has no AI credential requirement. Chat history and search
context are currently stored in browser `sessionStorage`; users should not place sensitive data in
chat. The in-memory rate limit is per runtime instance and should be replaced with a durable edge
limiter before high-volume production use.
