import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ThemeToggle } from "@/components/theme-toggle";
import { AiChatWidget } from "@/components/ai-chat-widget";
import { PageSkeleton, usePreload } from "@/components/skeleton";
import { useAuth, useRole, switchRole } from "@/hooks/use-auth";
import { listFavorites } from "@/lib/favorite.functions";
import {
  cancelViewingRequest,
  listMyInquiries,
  listMyViewingRequests,
} from "@/lib/communication.functions";

export const Route = createFileRoute("/seeker")({
  head: () => ({
    meta: [
      { title: "Seeker Dashboard | Property Mogul" },
      {
        name: "description",
        content:
          "Your personal property search hub — saved homes, tailored recommendations, viewing requests and market insights.",
      },
      { property: "og:title", content: "Seeker Dashboard | Property Mogul" },
      {
        property: "og:description",
        content: "Track saved homes, book viewings, and get AI-curated recommendations.",
      },
    ],
  }),
  component: SeekerDashboard,
});

function Icon({ name, className = "", filled = false }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400` }}
    >
      {name}
    </span>
  );
}

function SeekerDashboard() {
  const ready = usePreload(500);
  const authState = useAuth();
  const roleState = useRole();
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [saved, setSaved] = useState([]);
  const [savedError, setSavedError] = useState("");
  const [tours, setTours] = useState([]);
  const [messagesCount, setMessagesCount] = useState(0);
  const [tourError, setTourError] = useState("");
  const [cancellingTour, setCancellingTour] = useState("");
  const getFavorites = useServerFn(listFavorites);
  const getTours = useServerFn(listMyViewingRequests);
  const getInquiries = useServerFn(listMyInquiries);
  const cancelTour = useServerFn(cancelViewingRequest);
  const name = authState.name || "Explorer";

  // Role guard: redirect if not seeker
  useEffect(() => {
    if (ready && roleState.ready && !roleState.isSeeker) {
      navigate({ to: "/login" });
    }
  }, [ready, roleState.ready, roleState.isSeeker, navigate]);

  useEffect(() => {
    if (!authState.ready || !authState.authed || !roleState.ready || !roleState.isSeeker) return;
    let active = true;
    getFavorites()
      .then((rows) => {
        if (active) setSaved(rows.map((row) => ({ ...row.property, ...row })));
      })
      .catch((error) => {
        if (active)
          setSavedError(error instanceof Error ? error.message : "Unable to load saved homes.");
      });
    return () => {
      active = false;
    };
  }, [authState.authed, authState.ready, getFavorites, roleState.isSeeker, roleState.ready]);

  useEffect(() => {
    if (!authState.ready || !authState.authed || !roleState.ready || !roleState.isSeeker) return;
    Promise.all([getTours(), getInquiries()])
      .then(([tourRows, inquiryRows]) => {
        setTours(tourRows);
        setMessagesCount(inquiryRows.length);
      })
      .catch((error) =>
        setTourError(error instanceof Error ? error.message : "Unable to load activity."),
      );
  }, [
    authState.authed,
    authState.ready,
    getInquiries,
    getTours,
    roleState.isSeeker,
    roleState.ready,
  ]);

  const handleCancelTour = async (viewingId) => {
    setCancellingTour(viewingId);
    try {
      await cancelTour({ data: { viewingId } });
      setTours((current) => current.filter((tour) => (tour.viewing || tour).id !== viewingId));
    } catch (error) {
      setTourError(error instanceof Error ? error.message : "Unable to cancel viewing request.");
    } finally {
      setCancellingTour("");
    }
  };

  if (!ready) return <PageSkeleton />;

  // Still show loading while checking role
  if (!roleState.ready || !roleState.isSeeker) return <PageSkeleton />;

  const recommended = [];
  const stats = [
    { label: "Saved Homes", value: saved.length, icon: "favorite", tone: "text-primary-container" },
    {
      label: "Tours Booked",
      value: tours.length,
      icon: "event_available",
      tone: "text-success-cyan",
    },
    { label: "Messages", value: messagesCount, icon: "chat", tone: "text-primary" },
    { label: "Matches / week", value: "—", icon: "auto_awesome", tone: "text-primary-container" },
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
              <Link to="/seeker" className="text-primary font-bold">
                Dashboard
              </Link>
              <Link
                to="/browse"
                className="text-on-surface-variant hover:text-primary transition-colors"
              >
                Browse
              </Link>
              <a
                className="text-on-surface-variant hover:text-primary transition-colors"
                href="#saved"
              >
                Saved
              </a>
              <a
                className="text-on-surface-variant hover:text-primary transition-colors"
                href="#tours"
              >
                Tours
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Role switch button — only visible if user has BOTH roles */}
            {roleState.isBoth && (
              <button
                onClick={() => {
                  switchRole();
                  navigate({ to: "/owner" });
                }}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-container/10 border border-primary-container/30 text-primary-container text-xs font-bold hover:bg-primary-container hover:text-on-primary-container transition-all"
                type="button"
                title="Switch to Owner view"
              >
                <span className="material-symbols-outlined text-sm">swap_horiz</span>
                Owner View
              </button>
            )}

            <button
              onClick={() => setChatOpen(true)}
              aria-label="Open assistant"
              className="p-2 rounded-lg text-on-surface-variant hover:text-primary transition-colors"
            >
              <Icon name="smart_toy" />
            </button>
            <ThemeToggle />

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
                <p className="text-xs text-on-surface-variant">Property Seeker</p>
              </div>
            </div>

            <nav className="flex flex-col gap-1">
              <Link
                to="/seeker"
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
                href="#saved"
                onClick={() => setMenuOpen(false)}
                className="py-2 text-on-surface-variant hover:text-primary transition-colors"
              >
                Saved
              </a>
              <a
                href="#tours"
                onClick={() => setMenuOpen(false)}
                className="py-2 text-on-surface-variant hover:text-primary transition-colors"
              >
                Tours
              </a>
            </nav>

            {/* Role switch in mobile menu */}
            {roleState.isBoth && (
              <div className="mt-2 pt-4 border-t border-border-muted">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    switchRole();
                    navigate({ to: "/owner" });
                  }}
                  className="flex items-center gap-3 py-3 px-3 rounded-lg text-primary-container font-bold hover:bg-primary-container/10 transition-colors w-full text-left"
                  type="button"
                >
                  <span className="material-symbols-outlined">swap_horiz</span>
                  Switch to Owner View
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <main className="flex-1 pt-24 pb-16 max-w-[1400px] mx-auto w-full px-5 md:px-16">
        {/* Hero greeting */}
        <section className="relative overflow-hidden rounded-3xl border border-border-muted bg-surface-container-lowest mb-10">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1920&q=80"
              alt=""
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/40" />
          </div>
          <div className="relative p-6 sm:p-10 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] items-center gap-6">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border border-primary-container/40 bg-primary-container/10 text-primary-container mb-4">
                <Icon name="home" /> Seeker Mode
              </span>
              <h1 className="font-display font-bold text-3xl sm:text-5xl mb-2 tracking-tight">
                Welcome back, <span className="primary-gradient-text">{name}</span>
              </h1>
              <p className="text-on-surface-variant max-w-xl">
                Browse verified listings across Lagos and Abuja as the marketplace grows.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link
                to="/browse"
                className="inline-flex items-center gap-2 bg-primary-container text-on-primary px-5 py-3 rounded-xl font-bold hover:brightness-110 transition-all"
              >
                <Icon name="search" /> Browse listings
              </Link>
              <button
                onClick={() => setChatOpen(true)}
                className="inline-flex items-center gap-2 bg-surface-container border border-border-muted text-on-surface px-5 py-3 rounded-xl font-bold hover:border-primary-container transition-colors"
              >
                <Icon name="smart_toy" /> Ask Mogul AI
              </button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-surface-container-lowest border border-border-muted rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <Icon name={s.icon} className={s.tone} />
                <span className="text-[10px] font-mono-data tracking-widest text-on-surface-variant">
                  THIS MONTH
                </span>
              </div>
              <p className="font-display font-bold text-3xl">{s.value}</p>
              <p className="text-sm text-on-surface-variant">{s.label}</p>
            </div>
          ))}
        </section>

        {/* Saved */}
        <section id="saved" className="mb-14">
          <div className="flex items-end justify-between mb-6 gap-4">
            <div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl">Saved homes</h2>
              <p className="text-on-surface-variant text-sm">
                Your shortlist — ready when you are.
              </p>
            </div>
            <Link
              to="/favorites"
              className="text-primary-container hover:text-primary transition-colors font-bold text-sm"
            >
              View all &rarr;
            </Link>
          </div>
          {savedError && <p className="mb-4 text-sm text-error">{savedError}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {saved.length === 0 ? (
              <div className="sm:col-span-2 lg:col-span-3 rounded-2xl border border-dashed border-border-muted p-10 text-center text-on-surface-variant">
                No saved homes yet. Browse properties and save the ones you like.
              </div>
            ) : (
              saved.map((p) => (
                <Link
                  key={p.id}
                  to={"/property/" + p.id}
                  className="group bg-surface-container-lowest border border-border-muted rounded-2xl overflow-hidden hover:border-primary-container/40 transition-all flex flex-col"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={p.images[0]}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-background/60 backdrop-blur-md p-2 rounded-full text-primary-container">
                      <Icon name="favorite" />
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-bold truncate">{p.title}</h3>
                      <span className="font-mono-data text-primary-container font-bold text-sm shrink-0">
                        {p.price}
                      </span>
                    </div>
                    <p className="text-sm text-on-surface-variant flex items-center gap-1 min-w-0">
                      <Icon name="location_on" />
                      <span className="truncate">{p.location}</span>
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Recommended */}
        <section className="mb-14">
          <div className="flex items-end justify-between mb-6 gap-4">
            <div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl">Recommended for you</h2>
              <p className="text-on-surface-variant text-sm">
                Recommendations will appear after search preferences and activity are connected.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommended.length === 0 ? (
              <div className="md:col-span-2 rounded-2xl border border-dashed border-border-muted p-10 text-center text-on-surface-variant">
                Personalized recommendations are not available yet.
              </div>
            ) : (
              recommended.map((p) => (
                <Link
                  key={p.id}
                  to={"/property/" + p.id}
                  className="flex items-center gap-4 p-4 bg-surface-container-lowest border border-border-muted rounded-2xl hover:border-primary-container/40 transition-all"
                >
                  <img
                    src={p.images[0]}
                    alt={p.title}
                    className="w-28 h-28 shrink-0 object-cover rounded-xl"
                  />
                  <div className="min-w-0 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold truncate">{p.title}</h3>
                      <p className="text-sm text-on-surface-variant truncate">{p.location}</p>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono-data text-primary-container font-bold text-sm">
                        {p.price}
                      </span>
                      <span className="text-xs text-on-surface-variant">
                        {p.beds} bd &middot; {p.baths} ba
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Tours */}
        <section id="tours" className="mb-6">
          <div className="flex items-end justify-between mb-6 gap-4">
            <h2 className="font-display font-bold text-2xl sm:text-3xl">Upcoming tours</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tours.length === 0 ? (
              <div className="md:col-span-2 rounded-2xl border border-dashed border-border-muted p-10 text-center text-on-surface-variant">
                {tourError || "No viewing requests yet. Request a viewing from a property page."}
              </div>
            ) : (
              tours.map((item) => {
                const t = item.viewing || item;
                return (
                  <div
                    key={t.id}
                    className="flex items-center gap-4 p-5 bg-surface-container-lowest border border-border-muted rounded-2xl"
                  >
                    <div className="w-14 h-14 rounded-xl bg-primary-container/10 border border-primary-container/30 grid place-items-center text-primary-container shrink-0">
                      <Icon name="event" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold truncate">
                        {item.property?.title || "Property viewing"}
                      </p>
                      <p className="text-sm text-on-surface-variant">
                        {new Date(t.requestedDate).toLocaleString()} · {t.status}
                      </p>
                    </div>
                    {t.status === "REQUESTED" && (
                      <button
                        type="button"
                        onClick={() => handleCancelTour(t.id)}
                        disabled={cancellingTour === t.id}
                        className="text-xs font-bold text-error"
                      >
                        {cancellingTour === t.id ? "Cancelling…" : "Cancel"}
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-border-muted py-8 text-center text-sm text-on-surface-variant">
        &copy; 2026 Property Mogul &mdash; Seeker experience.
      </footer>

      <AiChatWidget open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}
