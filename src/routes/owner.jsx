import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AiChatWidget } from "@/components/ai-chat-widget";
import { PageSkeleton, usePreload } from "@/components/skeleton";
import { properties } from "@/lib/properties";
import { useRole, switchRole } from "@/hooks/use-auth";

export const Route = createFileRoute("/owner")({
  head: () => ({
    meta: [
      { title: "Owner Dashboard | Property Mogul" },
      {
        name: "description",
        content:
          "Manage your listings, track inquiries, monitor revenue, and grow your real estate portfolio.",
      },
      { property: "og:title", content: "Owner Dashboard | Property Mogul" },
      {
        property: "og:description",
        content: "List, manage and monetize your properties with Property Mogul.",
      },
    ],
  }),
  component: OwnerDashboard,
});

function OwnerDashboard() {
  const ready = usePreload(400);
  const roleState = useRole();
  const navigate = useNavigate();
  const [name, setName] = useState("Owner");
  const [chatOpen, setChatOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Role guard: redirect if not owner
  useEffect(() => {
    if (ready && localStorage.getItem("pm_authed") !== "1") {
      navigate({ to: "/login" });
    } else if (ready && roleState.isOwner === false) {
      navigate({ to: "/role-select" });
    }
  }, [ready, roleState, navigate]);

  useEffect(() => {
    try {
      const n = localStorage.getItem("pm_user_name");
      if (n) setName(String(n).split(" ")[0]);
    } catch {
      // ignore
    }
  }, []);

  if (!ready) return <PageSkeleton />;

  // Still show loading while checking role
  if (roleState.roles.length > 0 && !roleState.isOwner) return <PageSkeleton />;

  const listings = properties.slice(0, 5);
  const inquiries = [
    {
      who: "Adaobi N.",
      when: "2h ago",
      msg: "Is Azure Heights still available for viewing this weekend?",
      property: properties[0],
    },
    {
      who: "Tunde A.",
      when: "5h ago",
      msg: "Can I negotiate the price on Marina Bay?",
      property: properties[1],
    },
    {
      who: "Ifeoma C.",
      when: "1d ago",
      msg: "Requesting a virtual tour for the Ikoyi Penthouse.",
      property: properties[2],
    },
  ];

  const stats = [
    { label: "Active Listings", value: listings.length, delta: "+2 this week" },
    { label: "Portfolio Value", value: "₦482M", delta: "+4.1%" },
    { label: "Open Inquiries", value: inquiries.length, delta: "3 new" },
    { label: "Occupancy", value: "92%", delta: "Healthy" },
  ];

  const revenueMonths = [
    { m: "Jan", h: 40 },
    { m: "Feb", h: 55 },
    { m: "Mar", h: 48 },
    { m: "Apr", h: 70 },
    { m: "May", h: 62 },
    { m: "Jun", h: 85 },
    { m: "Jul", h: 95 },
  ];

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col">
      <header className="fixed top-0 inset-x-0 z-50 bg-surface-glass backdrop-blur-xl border-b border-border-muted">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4 px-5 md:px-16 py-4">
          <div className="flex items-center gap-4 sm:gap-8 min-w-0">
            <Link to="/" className="font-display font-bold text-primary">
              Property Mogul
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/owner" className="text-primary font-bold">
                Dashboard
              </Link>
              <Link
                to="/browse"
                className="text-on-surface-variant hover:text-primary transition-colors"
              >
                Browse
              </Link>
              <a
                href="#listings"
                className="text-on-surface-variant hover:text-primary transition-colors"
              >
                My Listings
              </a>
              <a
                href="#inquiries"
                className="text-on-surface-variant hover:text-primary transition-colors"
              >
                Inquiries
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Role switch button — only visible if user has BOTH roles */}
            {roleState.isBoth && (
              <button
                onClick={() => {
                  switchRole();
                  navigate({ to: "/seeker" });
                }}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-container/10 border border-primary-container/30 text-primary-container text-xs font-bold hover:bg-primary-container hover:text-on-primary-container transition-all"
                type="button"
                title="Switch to Seeker view"
              >
                <span className="material-symbols-outlined text-sm">swap_horiz</span>
                Seeker View
              </button>
            )}

            <button
              onClick={() => setChatOpen(true)}
              aria-label="Assistant"
              className="p-2 rounded-lg text-on-surface-variant hover:text-primary transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined">smart_toy</span>
            </button>

            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="md:hidden w-9 h-9 rounded-full bg-gradient-to-br from-primary-container to-secondary grid place-items-center text-on-primary-container font-bold text-sm"
              type="button"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>

            <div className="hidden md:grid w-9 h-9 rounded-full bg-gradient-to-br from-primary-container to-secondary place-items-center text-on-primary-container font-bold text-sm">
              {name.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-72 bg-surface-container-lowest border-l border-border-muted p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="font-display font-bold text-primary">Menu</span>
              <button onClick={() => setMenuOpen(false)} aria-label="Close menu" type="button">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex items-center gap-3 pb-4 border-b border-border-muted">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-container to-secondary grid place-items-center text-on-primary-container font-bold">
                {name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-bold truncate">{name}</p>
                <p className="text-xs text-on-surface-variant">Property Owner</p>
              </div>
            </div>

            <nav className="flex flex-col gap-1">
              <Link
                to="/owner"
                onClick={() => setMenuOpen(false)}
                className="py-2 font-bold text-primary"
              >
                Dashboard
              </Link>
              <Link
                to="/browse"
                onClick={() => setMenuOpen(false)}
                className="py-2 text-on-surface-variant hover:text-primary transition-colors"
              >
                Browse
              </Link>
              <a
                href="#listings"
                onClick={() => setMenuOpen(false)}
                className="py-2 text-on-surface-variant hover:text-primary transition-colors"
              >
                My Listings
              </a>
              <a
                href="#inquiries"
                onClick={() => setMenuOpen(false)}
                className="py-2 text-on-surface-variant hover:text-primary transition-colors"
              >
                Inquiries
              </a>
            </nav>

            {/* Role switch in mobile menu */}
            {roleState.isBoth && (
              <div className="mt-2 pt-4 border-t border-border-muted">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    switchRole();
                    navigate({ to: "/seeker" });
                  }}
                  className="flex items-center gap-3 py-3 px-3 rounded-lg text-primary-container font-bold hover:bg-primary-container/10 transition-colors w-full text-left"
                  type="button"
                >
                  <span className="material-symbols-outlined">swap_horiz</span>
                  Switch to Seeker View
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <main className="flex-1 pt-24 pb-16 max-w-[1400px] mx-auto w-full px-5 md:px-16">
        <section className="relative overflow-hidden rounded-3xl border border-border-muted bg-surface-container-lowest mb-10">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80"
              alt=""
              className="w-full h-full object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/40" />
          </div>

          <div className="relative p-6 sm:p-10 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] items-center gap-6">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border border-primary-container/40 bg-primary-container/10 text-primary-container mb-4">
                Owner Mode
              </span>
              <h1 className="font-display font-bold text-3xl sm:text-5xl mb-2 tracking-tight">
                Welcome back, <span className="primary-gradient-text">{name}</span>
              </h1>
              <p className="text-on-surface-variant max-w-xl">
                Your portfolio grew 4.1% this month. Three new inquiries need your attention.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 shrink-0">
              <Link
                to="/browse"
                className="inline-flex items-center gap-2 bg-primary-container text-on-primary-container px-5 py-3 rounded-xl font-bold active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined">add</span>
                New listing
              </Link>
              <Link
                to="/browse"
                className="inline-flex items-center gap-2 bg-surface-container border border-border-muted text-on-surface-variant px-5 py-3 rounded-xl font-bold hover:bg-on-surface hover:text-background transition-all"
              >
                View marketplace
              </Link>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-surface-container-lowest border border-border-muted rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono-data tracking-widest text-on-surface-variant">
                  {s.delta}
                </span>
              </div>
              <p className="font-display font-bold text-3xl">{s.value}</p>
              <p className="text-sm text-on-surface-variant">{s.label}</p>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <div className="lg:col-span-2 bg-surface-container-lowest border border-border-muted rounded-2xl p-6">
            <div className="flex items-end justify-between mb-6 gap-4">
              <div>
                <h2 className="font-display font-bold text-xl sm:text-2xl">Revenue trend</h2>
                <p className="text-sm text-on-surface-variant">Last 7 months · ₦ millions</p>
              </div>
              <span className="text-success-cyan font-mono-data text-sm">▲ 18.2%</span>
            </div>
            <div className="flex items-end gap-3 h-48">
              {revenueMonths.map((r) => (
                <div key={r.m} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-primary-container to-secondary"
                    style={{ height: `${r.h}%` }}
                  />
                  <span className="text-[10px] font-mono-data text-on-surface-variant">{r.m}</span>
                </div>
              ))}
            </div>
          </div>

          <div
            id="inquiries"
            className="bg-surface-container-lowest border border-border-muted rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-xl">Recent inquiries</h2>
              <span className="text-xs text-primary-container">{inquiries.length} new</span>
            </div>
            <div className="space-y-4">
              {inquiries.map((i) => (
                <div key={i.who} className="flex gap-3">
                  <div className="w-9 h-9 shrink-0 rounded-full bg-primary-container/15 border border-primary-container/30 grid place-items-center text-primary-container font-bold text-sm">
                    {i.who.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-sm truncate">{i.who}</p>
                      <span className="text-[10px] text-on-surface-variant shrink-0">{i.when}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant line-clamp-2">{i.msg}</p>
                    <p className="text-[10px] text-primary-container mt-1 truncate">
                      Re: {i.property.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="listings" className="mb-10">
          <div className="flex items-end justify-between mb-6 gap-4">
            <div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl">My listings</h2>
              <p className="text-sm text-on-surface-variant">
                Manage, edit, and track performance.
              </p>
            </div>
            <Link
              to="/browse"
              className="inline-flex items-center gap-2 bg-primary-container/10 border border-primary-container/30 text-primary-container px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary-container hover:text-on-primary-container transition-colors"
            >
              <span className="material-symbols-outlined">add</span>
              Add
            </Link>
          </div>

          <div className="bg-surface-container-lowest border border-border-muted rounded-2xl overflow-hidden">
            <div className="hidden md:grid grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_auto] gap-4 px-6 py-4 border-b border-border-muted text-[10px] font-mono-data tracking-widest text-on-surface-variant uppercase">
              <span>Property</span>
              <span>Price</span>
              <span>Views</span>
              <span>Status</span>
              <span className="text-right">Actions</span>
            </div>

            {listings.map((p, i) => (
              <div
                key={p.id}
                className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_auto] gap-4 px-4 sm:px-6 py-4 border-b border-border-muted/60 last:border-0 items-center hover:bg-surface-container/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={p.images?.[0]}
                    alt={p.title}
                    className="w-14 h-14 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-bold truncate">{p.title}</p>
                    <p className="text-xs text-on-surface-variant truncate">{p.location}</p>
                  </div>
                </div>

                <div className="text-sm font-mono-data text-primary-container">{p.price}</div>
                <div className="text-sm font-mono-data">{(180 + i * 47).toLocaleString()}</div>

                <div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                      i % 3 === 0
                        ? "text-success-cyan border-success-cyan/40 bg-success-cyan/10"
                        : "text-primary-container border-primary-container/40 bg-primary-container/10"
                    }`}
                  >
                    {i % 3 === 0 ? "Active" : "In review"}
                  </span>
                </div>

                <div className="flex items-center gap-2 md:justify-end">
                  <Link
                    to="/property/$id"
                    params={{ id: p.id }}
                    className="text-on-surface-variant hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined">visibility</span>
                  </Link>
                  <button
                    type="button"
                    className="p-2 rounded-lg border border-border-muted hover:border-primary-container transition-colors"
                    aria-label="Edit"
                  >
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border-muted py-8 text-center text-sm text-on-surface-variant">
        © 2026 Property Mogul — Owner experience.
      </footer>

      <AiChatWidget open={chatOpen} onOpenChange={setChatOpen} />
    </div>
  );
}
