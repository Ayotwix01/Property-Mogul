import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/payment/callback")({ component: PaymentCallbackPage });

function PaymentCallbackPage() {
  return (
    <main className="min-h-screen bg-background px-5 py-16 text-on-surface">
      <div className="mx-auto max-w-lg rounded-2xl border border-border-muted bg-surface-container-lowest p-8 text-center">
        <h1 className="font-display text-2xl font-bold">Payment processing</h1>
        <p className="mt-3 text-sm text-on-surface-variant">
          We are confirming your payment securely. Contact access is granted only after Paystack
          verification.
        </p>
        <Link
          to="/browse"
          className="mt-6 inline-block rounded-xl bg-primary-container px-5 py-3 font-bold text-on-primary-container"
        >
          Return to properties
        </Link>
      </div>
    </main>
  );
}
