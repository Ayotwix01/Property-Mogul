import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

export const Route = createFileRoute("/role-select")({
  head: () => ({
    meta: [
      { title: "Choose Your Role | Property Mogul" },
      {
        name: "description",
        content:
          "Tell us how you'll use Property Mogul — list your properties owner, or discover your next home seeker.",
      },
      { property: "og:title", content: "Choose Your Role | Property Mogul" },
      {
        property: "og:description",
        content: "Pick the experience that fits you: property owner or property seeker.",
      },
    ],
  }),
  component,
});

function Icon({ name, className = "" }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}
    >
      {name}
    </span>
  );
}

function RoleSelectPage() {
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  const proceed = () => {
    if (!role) return;
    try {
      // Store all selected roles (comma-separated for dual-role support)
      const currentRole = localStorage.getItem("pm_role") || "";
      const existing = currentRole ? currentRole.split(",").map((r) => r.trim().toLowerCase()) : [];
      const merged = [...new Set([...existing, role])].join(",");
      localStorage.setItem("pm_role", merged);
    } catch {
      // ignore storage errors
    }
    navigate({ to: "/signup", search: { role } });
  };

  const roles = [
    {
      key: "owner",
      title: "I'm a Property Owner",
      tagline: "List, manage, and monetize your properties.",
      icon: "domain",
      bullets: [
        "Publish verified listings",
        "Manage tours & applications",
        "Track leads and messages",
      ],
    },
    {
      key: "seeker",
      title: "I'm a Property Seeker",
      tagline: "Discover premium homes and commercial spaces.",
      icon: "explore",
      bullets: [
        "Personalized recommendations",
        "Save favorites & compare",
        "Direct chat with owners",
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      <header className="flex items-center justify-between px-4 sm:px-8 h-16 border-b border-border-muted">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 shrink-0 rounded-lg bg-gradient-to-br from-primary-container to-secondary flex items-center justify-center">
            <Icon name="real_estate_agent" />
          </div>
          <span className="font-display font-bold text-lg truncate">Property Mogul</span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12 relative overflow-hidden">
        <div className="luminous-bg top-[-20%] right-[-10%]" />
        <div className="luminous-bg bottom-[-20%] left-[-10%]" />

        <div className="w-full max-w-4xl z-10">
          <div className="text-center mb-10">
            <p className="font-mono-data text-[11px] tracking-widest uppercase text-primary-container mb-3">
              Step 1 of 2
            </p>
            <h1 className="font-display font-bold text-3xl sm:text-5xl mb-3 tracking-tight">
              How will you use{" "}
              <span className="primary-gradient-text">Property Mogul?</span>
            </h1>
            <p className="text-on-surface-variant max-w-xl mx-auto">
              Your choice tailors the experience — we'll show the tools that fit you.
              You can always switch later.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {roles.map((r) => {
              const selected = role === r.key;
              return (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setRole(r.key)}
                  aria-pressed={selected}
                  className={`text-left glass-panel rounded-3xl p-7 border transition-all duration-300 active:scale-[0.99] ${
                    selected
                      ? "border-primary-container cyan-glow -translate-y-1"
                      : "border-border-muted hover:border-primary-container/50 hover:-translate-y-0.5"
                  }`}
                >
                  <div className="flex items-start gap-4 mb-5">
                    <div
                      className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center transition-colors ${
                        selected
                          ? "bg-primary-container text-on-primary-container"
                          : "bg-surface-container text-primary-container"
                      }`}
                    >
                      <Icon name={r.icon} className="text-2xl" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="font-display font-bold text-xl sm:text-2xl mb-1">
                        {r.title}
                      </h2>
                      <p className="text-on-surface-variant text-sm">{r.tagline}</p>
                    </div>
                    <div
                      className={`w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
                        selected
                          ? "border-primary-container bg-primary-container"
                          : "border-border-muted"
                      }`}
                    >
                      {selected && (
                        <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1, 'wght' 500" }}>
                          check
                        </span>
                      )}
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {r.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-2 text-sm text-on-surface-variant">
                        <Icon name="check_circle" className="text-success-cyan text-lg" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link to="/login" className="text-sm text-on-surface-variant hover:text-primary transition-colors">
              Already have an account? <span className="text-primary-container font-semibold">Sign in</span>
            </Link>
            <button
              disabled={!role}
              onClick={proceed}
              className="w-full sm:w-auto bg-gradient-to-r from-primary-container to-secondary text-on-primary px-8 py-3.5 rounded-xl font-bold cyan-glow hover:brightness-110 active:scale-[0.99] transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Continue <Icon name="arrow_forward" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
