import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms of Use | Property Mogul" }] }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalPage title="Terms of Use">
      <p>
        Property Mogul is a property marketplace that helps seekers and property owners discover one
        another. We are not a landlord, estate agent, lawyer, surveyor, bank, or guarantor of any
        transaction.
      </p>
      <p>
        Users must independently verify identity, authority, property condition, ownership, pricing,
        and all transaction terms before paying or signing anything. Verification badges are signals
        based on information available to us and are not guarantees.
      </p>
      <p>
        Never pay because of pressure. Keep records, use safe viewings, and report suspected fraud.
        Contact access payments unlock contact information only; they do not purchase or reserve a
        property and do not guarantee a rental, sale, viewing, or successful outcome.
      </p>
      <p>
        Users must provide accurate information, protect their accounts, respect other users, and
        avoid harassment, impersonation, fraud, or attempts to move unsafe activity off-platform. We
        may restrict accounts, listings, or messages that breach these rules.
      </p>
      <p>
        These terms are a product draft for review and are not legal advice. Please obtain
        appropriate Nigerian legal advice for a specific transaction.
      </p>
    </LegalPage>
  );
}

function LegalPage({ title, children }) {
  return (
    <main className="min-h-screen bg-background px-5 py-12 text-on-surface md:px-10">
      <article className="mx-auto max-w-3xl space-y-6 leading-8 text-on-surface-variant">
        <Link to="/signup" className="text-sm text-primary-container hover:underline">
          ← Back to signup
        </Link>
        <h1 className="pt-8 font-display text-4xl font-bold text-on-surface">{title}</h1>
        {children}
      </article>
    </main>
  );
}
