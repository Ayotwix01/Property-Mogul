import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Notice | Property Mogul" }] }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background px-5 py-12 text-on-surface md:px-10">
      <article className="mx-auto max-w-3xl space-y-6 leading-8 text-on-surface-variant">
        <a href="/signup" className="text-sm text-primary-container hover:underline">
          ← Back to signup
        </a>
        <h1 className="pt-8 font-display text-4xl font-bold text-on-surface">Privacy Notice</h1>
        <p>
          We may process account details, profile information, property listings, verification
          information, messages, inquiries, viewing requests, reports, and payment records to
          provide and secure the marketplace.
        </p>
        <p>
          Passwords are stored using one-way hashing. Sessions use HTTP-only cookies. Payment card
          details are handled by the payment provider; Property Mogul stores relevant payment
          records and entitlement status, not card secrets.
        </p>
        <p>
          We retain information while needed for accounts, safety, dispute handling, legal
          obligations, and service operations, then delete or anonymise it where appropriate. We do
          not publish private landlord contact details before the applicable access rules are
          satisfied.
        </p>
        <p>
          You may request access, correction, or deletion of eligible personal information and ask
          questions about processing. This notice is a product draft for review and is not legal
          advice.
        </p>
      </article>
    </main>
  );
}
