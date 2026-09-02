import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { useState } from "react";
import { z } from "zod";
import { useServerFn } from "@tanstack/react-start";
import { login } from "@/lib/auth.functions";
import { startGoogleOAuth } from "@/lib/google-oauth.functions";

const loginSearchSchema = z.object({ google: z.string().optional() });

export const Route = createFileRoute("/login")({
  validateSearch: loginSearchSchema,
  head: () => ({
    meta: [
      { title: "Login | Property Mogul" },
      {
        name: "description",
        content: "Access your Property Mogul real estate portfolio.",
      },
    ],
    links: [{ rel: "canonical", href: "/login" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { google } = Route.useSearch();
  const navigate = useNavigate();
  const [emailOrUser, setEmailOrUser] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [error, setError] = useState("");
  const loginUser = useServerFn(login);
  const beginGoogle = useServerFn(startGoogleOAuth);
  const [googleStarting, setGoogleStarting] = useState(false);

  const pwLength = password.length;
  const pwHasUpper = /[A-Z]/.test(password);
  const pwHasLower = /[a-z]/.test(password);
  const pwHasNumber = /[0-9]/.test(password);
  const pwValid = pwLength >= 8 && pwHasUpper && pwHasLower && pwHasNumber;
  const googleError =
    google === "account_exists"
      ? "This Google email already has a password account. Sign in with your password instead."
      : google
        ? "Google sign-in could not be completed. Please try again."
        : "";

  const handleLogin = (e) => {
    e.preventDefault();
    if (!pwValid || loggingIn) return;
    setLoggingIn(true);
    setError("");

    const signIn = async () => {
      let result;
      try {
        result = await loginUser({ data: { email: emailOrUser, password } });
        localStorage.setItem("pm_authed", "1");
        const role = result.roles
          .map((value) => (value === "LANDLORD" ? "owner" : "seeker"))
          .join(",");
        localStorage.setItem("pm_role", role);
        localStorage.setItem("pm_user_name", emailOrUser.split("@")[0]);
        localStorage.setItem("pm_user_email", emailOrUser.trim().toLowerCase());
      } catch (loginError) {
        setError(
          loginError instanceof Error ? loginError.message : "Unable to sign in. Please try again.",
        );
        setLoggingIn(false);
        return;
      }

      const roles = (() => {
        try {
          return localStorage.getItem("pm_role") || "";
        } catch {
          return "";
        }
      })();
      const rList = roles.split(",").map((r) => r.trim());
      if (result.roles.includes("ADMIN")) {
        navigate({ to: "/admin" });
      } else if (rList.includes("owner")) {
        navigate({ to: "/owner" });
      } else if (rList.includes("seeker")) {
        navigate({ to: "/seeker" });
      } else {
        navigate({ to: "/browse" });
      }
    };
    void signIn();
  };

  const handleGoogle = async () => {
    if (googleStarting) return;
    setGoogleStarting(true);
    setError("");
    try {
      const result = await beginGoogle();
      window.location.assign(result.authorizationUrl);
    } catch (googleError) {
      setError(
        googleError instanceof Error ? googleError.message : "Unable to start Google sign-in.",
      );
      setGoogleStarting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-grow flex items-stretch">
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-surface-container-lowest items-center justify-center">
          <div
            className="absolute inset-0 z-0 opacity-25"
            style={{
              background: "linear-gradient(135deg, rgba(0,240,255,0.7), rgba(122,92,255,0.6))",
            }}
          />
          <div className="relative z-10 w-full max-w-xl p-12">
            <div className="glass-panel p-8 rounded-2xl space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center text-primary-container shrink-0">
                  <span className="material-symbols-outlined">verified</span>
                </div>
                <div className="min-w-0">
                  <p className="font-label-caps text-[11px] tracking-widest text-primary-container">
                    PREMIUM INVESTMENTS
                  </p>
                  <h3 className="font-display font-semibold text-2xl text-on-surface truncate">
                    Institutional Grade Assets
                  </h3>
                </div>
              </div>
              <div className="space-y-4">
                {["₦1.42B", "12,840", "8.24%"].map((v, idx) => (
                  <div key={v} className="flex justify-between items-end">
                    <span className="text-sm text-on-surface-variant">
                      {idx === 0
                        ? "Total Managed Assets"
                        : idx === 1
                          ? "Verified Properties"
                          : "Average Annual Yield"}
                    </span>
                    <span
                      className={`font-mono-data text-sm ${idx === 0 || idx === 2 ? "text-success-cyan" : "text-on-surface"}`}
                    >
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 bg-background flex flex-col justify-center px-5 md:px-16 py-12 relative">
          <div className="max-w-md w-full mx-auto space-y-10 relative z-10">
            <div className="space-y-2">
              <h1 className="font-display font-bold text-3xl sm:text-4xl leading-tight text-on-surface">
                Welcome back to Property Mogul
              </h1>
              <p className="text-on-surface-variant">
                Access your Nigerian real estate investment portfolio.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleLogin}>
              <div className="space-y-5">
                <div className="space-y-2">
                  <label
                    className="font-label-caps text-[11px] tracking-widest text-on-surface-variant uppercase"
                    htmlFor="email"
                  >
                    Email or Username
                  </label>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-container border border-border-muted focus-within:border-primary-container transition">
                    <span className="material-symbols-outlined text-on-surface-variant text-lg">
                      person
                    </span>
                    <input
                      className="bg-transparent outline-none w-full text-on-surface placeholder:text-outline"
                      id="email"
                      name="email"
                      placeholder="name@company.com"
                      type="text"
                      value={emailOrUser}
                      onChange={(e) => setEmailOrUser(e.target.value)}
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label
                      className="font-label-caps text-[11px] tracking-widest text-on-surface-variant uppercase"
                      htmlFor="password"
                    >
                      Password{" "}
                      <span className="font-mono-data text-on-surface-variant">({pwLength})</span>
                    </label>
                    <a
                      href="#"
                      className="text-sm text-primary-container hover:text-primary transition-colors"
                    >
                      Forgot Password?
                    </a>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-container border border-border-muted focus-within:border-primary-container transition">
                    <span className="material-symbols-outlined text-on-surface-variant text-lg">
                      lock
                    </span>
                    <input
                      className="bg-transparent outline-none w-full text-on-surface placeholder:text-outline"
                      id="password"
                      name="password"
                      placeholder="••••••••••••"
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="text-on-surface-variant hover:text-on-surface"
                    >
                      <span className="material-symbols-outlined text-lg">
                        {showPw ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                  {/* Password requirements checklist */}
                  <div className="mt-2 space-y-1">
                    {[
                      { ok: pwLength >= 8, label: "At least 8 characters" },
                      { ok: pwHasUpper, label: "One uppercase letter" },
                      { ok: pwHasLower, label: "One lowercase letter" },
                      { ok: pwHasNumber, label: "One number" },
                    ].map((r) => (
                      <div
                        key={r.label}
                        className={`flex items-center gap-1.5 text-xs ${r.ok ? "text-success-cyan" : "text-on-surface-variant"}`}
                      >
                        <span
                          className="material-symbols-outlined text-sm"
                          style={{ fontVariationSettings: `'FILL' ${r.ok ? 1 : 0}, 'wght' 500` }}
                        >
                          {r.ok ? "check_circle" : "radio_button_unchecked"}
                        </span>
                        {r.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                disabled={!pwValid || loggingIn}
                className="w-full py-4 rounded-lg font-semibold text-lg text-on-primary bg-gradient-to-r from-primary-container to-secondary flex items-center justify-center gap-3 hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                type="submit"
              >
                {loggingIn ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">
                      progress_activity
                    </span>
                    Signing in...
                  </>
                ) : (
                  <>
                    Proceed
                    <span className="material-symbols-outlined">login</span>
                  </>
                )}
              </button>
            </form>
            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleStarting}
              className="mt-5 w-full rounded-lg border border-border-muted py-3 font-semibold disabled:opacity-50"
            >
              {googleStarting ? "Connecting to Google…" : "Continue with Google"}
            </button>
            {(error || googleError) && (
              <p role="alert" className="text-sm text-error mt-4">
                {error || googleError}
              </p>
            )}

            <p className="text-center text-sm text-on-surface-variant">
              New to the platform?{" "}
              <Link
                to="/signup"
                className="text-primary-container hover:text-primary transition-colors"
              >
                Create an institutional account
              </Link>
            </p>
          </div>
        </div>
      </main>

      <footer className="w-full py-6 px-5 md:px-16 flex flex-col md:flex-row justify-between items-center gap-3 border-t border-border-muted bg-surface-container-lowest z-20">
        <span className="font-display font-bold text-primary">Property Mogul</span>
        <p className="text-xs text-on-surface-variant">
          © 2026 Property Mogul. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
