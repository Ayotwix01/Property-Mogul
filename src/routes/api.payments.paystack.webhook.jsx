import { createFileRoute } from "@tanstack/react-router";
import { processPaystackWebhook } from "@/lib/contact-access.functions";

export const Route = createFileRoute("/api/payments/paystack/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const result = await processPaystackWebhook(
            await request.text(),
            request.headers.get("x-paystack-signature"),
          );
          return Response.json({ received: true, ...result });
        } catch {
          return Response.json({ error: "Webhook rejected." }, { status: 401 });
        }
      },
    },
  },
});
