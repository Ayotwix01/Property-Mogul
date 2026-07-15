import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { useState } from "react";

export const Route = createFileRoute("/login")({
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
  const navigate = useNavigate();
  const [emailOrUser, setEmailOrUser] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-grow flex items-stretch">
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-surface-container-lowest items-center justify-center">
          <div className="absolute inset-0 z-0 opacity-25" style={{ background: "linear-gradient(135deg, rgba(0,240,255,0.7), rgba(122,92,255,0.6))" }} />
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
                      {idx === 0 ? "Total Managed Assets" : idx === 1 ? "Verified Properties" : "Average Annual Yield"}
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

            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault();

                // Minimal demo auth (keeps the app structure intact)
                try {
                  localStorage.setItem("pm_authed", "1");
                  localStorage.setItem("pm_role", emailOrUser.toLowerCase().includes("owner") ? "owner" : "seeker");
                } catch {
                  // ignore
                }

                const role = (() => {
                  try {
                    return localStorage.getItem("pm_role");
                  } catch {
                    return null;
                  }
                })();

                navigate({
                  to: role === "seeker" ? "/seeker" : role === "owner" ? "/owner" : "/browse",
                });
              }}
            >
              <div className="space-y-5">
                <div className="space-y-2">
                  <label
                    className="font-label-caps text-[11px] tracking-widest text-on-surface-variant uppercase"
                    htmlFor="email"
                  >
                    Email or Username
                  </label>
                  <input
                    className="w-full bg-surface-container border border-border-muted rounded-lg py-4 pl-4 pr-4 text-on-surface focus:outline-none focus:border-primary-container/50 transition-all"
                    id="email"
                    name="email"
                    placeholder="name@company.com"
                    type="text"
                    value={emailOrUser}
                    onChange={(e) => setEmailOrUser(e.target.value)}
                    autoComplete="username"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label
                      className="font-label-caps text-[11px] tracking-widest text-on-surface-variant uppercase"
                      htmlFor="password"
                    >
                      Password
                    </label>
                    <a
                      href="#"
                      className="text-sm text-primary-container hover:text-primary transition-colors"
                    >
                      Forgot Password?
                    </a>
                  </div>
                  <input
                    className="w-full bg-surface-container border border-border-muted rounded-lg py-4 pl-4 pr-4 text-on-surface focus:outline-none focus:border-primary-container/50 transition-all"
                    id="password"
                    name="password"
                    placeholder="••••••••••••"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button
                className="w-full py-4 rounded-lg font-semibold text-lg text-on-primary bg-gradient-to-r from-primary-container to-secondary flex items-center justify-center gap-3 hover:brightness-110 active:scale-[0.99] transition-all"
                type="submit"
              >
                Login
                <span className="material-symbols-outlined">login</span>
              </button>
            </form>

            <p className="text-center text-sm text-on-surface-variant">
              New to the platform?{" "}
              <Link to="/signup" className="text-primary-container hover:text-primary transition-colors">
                Create an institutional account
              </Link>
            </p>
          </div>
        </div>
      </main>

      <footer className="w-full py-6 px-5 md:px-16 flex flex-col md:flex-row justify-between items-center gap-3 border-t border-border-muted bg-surface-container-lowest z-20">
        <span className="font-display font-bold text-primary">Property Mogul</span>
        <p className="text-xs text-on-surface-variant">© 2026 Property Mogul. All rights reserved.</p>
      </footer>
    </div>
  );
}

