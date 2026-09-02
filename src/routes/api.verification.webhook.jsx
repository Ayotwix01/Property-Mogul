import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/verification/webhook")({
  server: {
    handlers: {
      POST: async () =>
        Response.json(
          {
            error:
              "Webhook processing is not enabled until the provider payload and signature contract are configured.",
          },
          { status: 501 },
        ),
    },
  },
});
