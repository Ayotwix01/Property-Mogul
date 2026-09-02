import { createFileRoute } from "@tanstack/react-router";
import { handleGoogleCallback } from "@/lib/google-oauth.functions";

export const Route = createFileRoute("/auth/google/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => handleGoogleCallback(request),
    },
  },
});
