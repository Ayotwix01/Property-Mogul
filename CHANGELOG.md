# Changelog

## Mogul Assistant property search

- Replaced the fixed chat reply with deterministic Nigerian property-search parsing, real published
  PostgreSQL listing results, factual match explanations, bounded follow-ups, and controlled
  comparison.
- Added message limits, system-message rejection, anonymous best-effort rate limiting, and public
  field filtering so the assistant cannot expose contact data or authorize business actions.

## Cloudflare deployment preparation

- Documented the existing Nitro Cloudflare worker preset, generated worker configuration, required
  production variables/secrets, callback URLs, migration procedure, and non-deployment status.

## Final environment audit

- Documented every environment variable read by the application and removed inactive payment
  placeholders from `.env.example`.
- Confirmed local Google OAuth, Neon, Didit, and Paystack configuration boundaries without exposing
  credentials or claiming an unverified payment.

## Current — Completion and hardening

- Added final provider configuration boundaries and documented Paystack, Didit, and Google OAuth
  readiness without fabricating external-service success.
- Added Google authorization-code login, one-time OAuth state storage, account linking records, and
  consent/role completion for new Google users.
- Added explicit development-only QA seed data for Nigerian property discovery and account flows.
- Added legal terms and privacy routes.
- Added functional resource detail pages and Nigerian property-safety guides.
- Added Paystack signature and payment validation coverage.
- Hardened report creation so targets must exist and be related to the reporter where required.
- Added project status documentation.

## Previous phases

- Added Neon PostgreSQL, Drizzle migrations, bcrypt sessions, role authorization, verification, property CRUD, favorites, communication, moderation, and Paystack contact-access foundations.
