import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { useServerFn } from "@tanstack/react-start";
import { completeGoogleSignup } from "@/lib/google-oauth.functions";

export const Route = createFileRoute("/auth/google/complete")({
  validateSearch: z.object({ state: z.coerce.string().min(20).max(100) }),
  component: GoogleCompletionPage,
});

function GoogleCompletionPage() {
  const { state } = Route.useSearch();
  const navigate = useNavigate();
  const complete = useServerFn(completeGoogleSignup);
  const [role, setRole] = useState(null);
  const [both, setBoth] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!termsAccepted || submitting) return;
    const chosenRoles = both ? ["SEEKER", "LANDLORD"] : role ? [role] : null;
    if (!chosenRoles) {
      setError("Choose how you’ll use Property Mogul before continuing.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await complete({
        data: {
          state,
          roles: both ? ["SEEKER", "LANDLORD"] : [role],
          termsAccepted: true,
        },
      });
      navigate({ to: both || role === "LANDLORD" ? "/owner" : "/seeker" });
    } catch (completionError) {
      setError(
        completionError instanceof Error
          ? completionError.message
          : "Unable to complete Google signup.",
      );
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-12 text-on-surface">
      <form
        onSubmit={submit}
        className="w-full max-w-md space-y-6 rounded-3xl border border-border-muted bg-surface-container-lowest p-8"
      >
        <div>
          <Link to="/" className="text-primary">
            Property Mogul
          </Link>
          <h1 className="mt-6 text-3xl font-bold">Finish your account</h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Choose how you’ll use Property Mogul.
          </p>
        </div>
        <div className="space-y-3">
          {["SEEKER", "LANDLORD"].map((value) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-border-muted p-4"
            >
              <input
                type="radio"
                name="role"
                value={value}
                checked={role === value}
                onChange={() => {
                  setRole(value);
                  setBoth(false);
                }}
              />
              <span>{value === "SEEKER" ? "Find a property" : "List a property"}</span>
            </label>
          ))}
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border-muted p-4">
            <input
              type="checkbox"
              checked={both}
              onChange={(event) => setBoth(event.target.checked)}
            />
            <span>Both — find and list properties</span>
          </label>
        </div>
        <label className="flex items-start gap-3 text-sm text-on-surface-variant">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(event) => setTermsAccepted(event.target.checked)}
          />
          <span>
            I agree to the{" "}
            <Link to="/terms" className="text-primary">
              Terms
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-primary">
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        {error && <p className="text-sm text-error">{error}</p>}
        <button
          type="submit"
          disabled={!termsAccepted || submitting}
          className="w-full rounded-xl bg-primary-container px-4 py-3 font-bold text-on-primary-container disabled:opacity-50"
        >
          {submitting ? "Creating account…" : "Continue"}
        </button>
      </form>
    </main>
  );
}
