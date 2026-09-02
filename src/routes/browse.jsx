import { createFileRoute, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";

import { AiChatWidget } from "@/components/ai-chat-widget";
import { PageSkeleton, usePreload } from "@/components/skeleton";
import { useAuth, useRole } from "@/hooks/use-auth";
import { addFavorite, listFavorites, removeFavorite } from "@/lib/favorite.functions";
import { listPublishedProperties } from "@/lib/property.functions";

const browseSearchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  type: fallback(z.string(), "All").default("All"),
  min: fallback(z.number(), 0).default(0),
  max: fallback(z.number(), 0).default(0),
  beds: fallback(z.string(), "Any").default("Any"),
  sort: fallback(z.string(), "newest").default("newest"),
  page: fallback(z.number().int(), 1).default(1),
  view: fallback(z.string(), "grid").default("grid"),
});

export const Route = createFileRoute("/browse")({
  validateSearch: zodValidator(browseSearchSchema),
  head: () => ({
    meta: [
      { title: "Browse Properties | Property Mogul" },
      {
        name: "description",
        content:
          "Search a curated collection of verified homes, offices, and commercial properties across Nigeria.",
      },
      { property: "og:title", content: "Browse Properties | Property Mogul" },
      {
        property: "og:description",
        content: "Secure, transparent, and professional real estate search.",
      },
      { property: "og:url", content: "/browse" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Browse Properties | Property Mogul" },
    ],
    links: [{ rel: "canonical", href: "/browse" }],
  }),
  component: BrowsePage,
});

const PAGE_SIZE = 9;

function useFavorites(authed, authReady) {
  const [favorites, setFavorites] = useState(() => new Set());
  const [favoriteError, setFavoriteError] = useState("");
  const getFavorites = useServerFn(listFavorites);
  const add = useServerFn(addFavorite);
  const remove = useServerFn(removeFavorite);

  useEffect(() => {
    if (!authReady) return;
    if (!authed) {
      setFavorites(new Set());
      return;
    }
    let active = true;
    getFavorites()
      .then((rows) => {
        if (active) setFavorites(new Set(rows.map((row) => row.favorite.propertyId)));
      })
      .catch(() => {
        if (active) setFavoriteError("Sign in again to load your favorites.");
      });
    return () => {
      active = false;
    };
  }, [authed, authReady, getFavorites]);

  const toggle = async (id) => {
    if (!authed) {
      setFavoriteError("Log in to save properties to your account.");
      return;
    }
    setFavoriteError("");
    const wasFavorite = favorites.has(id);
    setFavorites((prev) => {
      const next = new Set(prev);
      if (wasFavorite) next.delete(id);
      else next.add(id);
      return next;
    });
    try {
      if (wasFavorite) await remove({ data: { propertyId: id } });
      else await add({ data: { propertyId: id } });
    } catch (error) {
      setFavorites((prev) => {
        const next = new Set(prev);
        if (wasFavorite) next.add(id);
        else next.delete(id);
        return next;
      });
      setFavoriteError(error instanceof Error ? error.message : "Unable to update favorite.");
    }
  };

  return { favorites, favoriteError, toggle };
}

function parsePrice(input) {
  const trimmed = String(input ?? "")
    .trim()
    .toLowerCase();
  if (!trimmed) return 0;

  const mult = trimmed.endsWith("m") ? 1_000_000 : trimmed.endsWith("k") ? 1_000 : 1;

  const n = parseFloat(trimmed.replace(/[^0-9.]/g, ""));
  if (Number.isNaN(n)) return 0;

  return Math.round(n * mult);
}

function paginationRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const set = new Set([1, total, current, current - 1, current + 1]);
  const pages = [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);

  const out = [];
  for (let i = 0; i < pages.length; i++) {
    out.push(pages[i]);
    if (i < pages.length - 1 && pages[i + 1] - pages[i] > 1) out.push("…");
  }

  return out;
}

function BrowsePage() {
  const ready = usePreload(400);
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/browse" });
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const authState = useAuth();
  const {
    favorites,
    favoriteError,
    toggle: toggleFav,
  } = useFavorites(authState.authed, authState.ready);
  const roleState = useRole();
  const getProperties = useServerFn(listPublishedProperties);

  // Auth gate: property browsing requires a signed-in account.
  useEffect(() => {
    if (authState.ready && !authState.authed) {
      navigate({ to: "/login", search: { next: "/browse" } });
    }
  }, [authState.ready, authState.authed, navigate]);

  const [chatOpen, setChatOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [serverProperties, setServerProperties] = useState([]);
  const [totalProperties, setTotalProperties] = useState(0);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [propertyError, setPropertyError] = useState("");

  const [qDraft, setQDraft] = useState(search.q);
  const [typeDraft, setTypeDraft] = useState(search.type);
  const [minDraft, setMinDraft] = useState(search.min ? String(search.min) : "");
  const [maxDraft, setMaxDraft] = useState(search.max ? String(search.max) : "");
  const [bedsDraft, setBedsDraft] = useState(search.beds);
  const [gotoInput, setGotoInput] = useState("");

  // Keep drafts in sync if navigation changes search.
  useEffect(() => {
    setQDraft(search.q);
    setTypeDraft(search.type);
    setMinDraft(search.min ? String(search.min) : "");
    setMaxDraft(search.max ? String(search.max) : "");
    setBedsDraft(search.beds);
  }, [search.q, search.type, search.min, search.max, search.beds]);

  // Body scroll lock while overlays are open
  useEffect(() => {
    if (typeof document === "undefined") return;
    const locked = menuOpen || chatOpen;
    const prev = document.body.style.overflow;
    if (locked) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen, chatOpen]);

  // Escape closes overlays
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (menuOpen) setMenuOpen(false);
      else if (chatOpen) setChatOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, chatOpen]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    let active = true;
    setLoadingProperties(true);
    setPropertyError("");
    getProperties({
      data: {
        location: search.q || undefined,
        propertyType: search.type === "All" ? undefined : search.type,
        minPrice: search.min || undefined,
        maxPrice: search.max || undefined,
        bedrooms: search.beds === "Any" ? undefined : parseInt(search.beds, 10),
        sort: search.sort,
        page: search.page,
        pageSize: PAGE_SIZE,
      },
    })
      .then((result) => {
        if (!active) return;
        setServerProperties(result.properties);
        setTotalProperties(result.total);
      })
      .catch((error) => {
        if (!active) return;
        setPropertyError(
          error instanceof Error ? error.message : "Unable to load properties right now.",
        );
        setServerProperties([]);
        setTotalProperties(0);
      })
      .finally(() => {
        if (active) setLoadingProperties(false);
      });
    return () => {
      active = false;
    };
  }, [
    getProperties,
    search.q,
    search.type,
    search.min,
    search.max,
    search.beds,
    search.sort,
    search.page,
  ]);

  const setSearch = (patch) => {
    navigate({
      search: (prev) => ({ ...prev, ...patch }),
    });
  };

  const filtered = serverProperties;
  const totalPages = Math.max(1, Math.ceil(totalProperties / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, search.page), totalPages);
  const startIdx = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered;

  const applySearch = () => {
    setSearch({
      q: qDraft.trim(),
      type: typeDraft,
      min: parsePrice(minDraft),
      max: parsePrice(maxDraft),
      beds: bedsDraft,
      page: 1,
    });
  };

  const clearAll = () => {
    setQDraft("");
    setTypeDraft("All");
    setMinDraft("");
    setMaxDraft("");
    setBedsDraft("Any");
    setSearch({ q: "", type: "All", min: 0, max: 0, beds: "Any", page: 1, view: search.view });
  };

  const changePage = (n) => {
    const clamped = Math.min(Math.max(1, n), totalPages);
    setSearch({ page: clamped });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toneClass = (tone) => {
    if (tone === "success") return "bg-success-cyan/20 text-success-cyan border-success-cyan/30";
    return "bg-primary-container/20 text-primary-container border-primary-container/30";
  };

  const activeChips = [];
  if (search.q) {
    activeChips.push({
      label: `Location: ${search.q}`,
      onRemove: () => {
        setQDraft("");
        setSearch({ q: "", page: 1 });
      },
    });
  }
  if (search.type !== "All") {
    activeChips.push({
      label: `Type: ${search.type}`,
      onRemove: () => {
        setTypeDraft("All");
        setSearch({ type: "All", page: 1 });
      },
    });
  }
  if (search.min) {
    activeChips.push({
      label: `Min: ₦${search.min.toLocaleString()}`,
      onRemove: () => {
        setMinDraft("");
        setSearch({ min: 0, page: 1 });
      },
    });
  }
  if (search.max) {
    activeChips.push({
      label: `Max: ₦${search.max.toLocaleString()}`,
      onRemove: () => {
        setMaxDraft("");
        setSearch({ max: 0, page: 1 });
      },
    });
  }
  if (search.beds !== "Any") {
    activeChips.push({
      label: `${search.beds}+ Beds`,
      onRemove: () => {
        setBedsDraft("Any");
        setSearch({ beds: "Any", page: 1 });
      },
    });
  }

  if (!ready) return <PageSkeleton />;

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col">
      <header className="fixed top-0 inset-x-0 z-50 bg-surface-glass backdrop-blur-xl border-b border-border-muted">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center px-5 md:px-16 py-4 gap-4">
          <div className="flex items-center gap-4 sm:gap-8 min-w-0">
            <Link to="/" className="font-display font-bold text-primary text-lg">
              Property Mogul
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/browse"
                className={
                  pathname === "/browse"
                    ? "text-primary"
                    : "text-on-surface-variant hover:text-primary"
                }
              >
                Browse
              </Link>
              <Link
                to="/favorites"
                className={
                  pathname === "/favorites"
                    ? "text-primary"
                    : "text-on-surface-variant hover:text-primary"
                }
              >
                <span className="inline-flex items-center gap-2">
                  Favorites
                  {favorites.size > 0 && (
                    <span className="text-[10px] font-bold bg-primary-container/20 text-primary-container px-1.5 py-0.5 rounded-full">
                      {favorites.size}
                    </span>
                  )}
                </span>
              </Link>
              {roleState.isOwner && (
                <Link
                  to="/owner"
                  className={
                    pathname === "/owner"
                      ? "text-primary"
                      : "text-on-surface-variant hover:text-primary"
                  }
                >
                  My Listings
                </Link>
              )}
              {roleState.isSeeker && (
                <Link
                  to="/seeker"
                  className={
                    pathname === "/seeker"
                      ? "text-primary"
                      : "text-on-surface-variant hover:text-primary"
                  }
                >
                  Dashboard
                </Link>
              )}
              <Link
                to="/resources"
                className={
                  pathname === "/resources"
                    ? "text-primary"
                    : "text-on-surface-variant hover:text-primary"
                }
              >
                Resources
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              className="hidden sm:flex p-2 text-on-surface-variant hover:text-primary transition-colors"
              aria-label="Notifications"
              type="button"
            >
              <span className="material-symbols-outlined">notifications</span>
            </button>

            <button
              onClick={() => setChatOpen(true)}
              className="relative p-2 text-on-surface-variant hover:text-primary transition-colors"
              aria-label="Open Mogul Assistant"
              title="Chat with Mogul AI"
              type="button"
            >
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-success-cyan animate-pulse" />
              <span className="material-symbols-outlined">smart_toy</span>
            </button>

            <Link
              to="/owner"
              className="hidden md:inline-flex items-center text-on-surface-variant hover:text-primary"
            >
              {roleState.isOwner ? "Dashboard" : roleState.isSeeker ? "Seeker" : "Dashboard"}
            </Link>

            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={menuOpen}
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg bg-surface-container border border-border-muted text-on-surface hover:border-primary-container transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div
          className="fixed inset-0 z-[60] md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-72 max-w-[85%] bg-surface-container-lowest border-l border-border-muted p-6 flex flex-col gap-4 overflow-y-auto pt-[max(1.5rem,env(safe-area-inset-top))] animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between">
              <span className="font-display font-bold text-primary">Menu</span>
              <button onClick={() => setMenuOpen(false)} aria-label="Close menu" type="button">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <nav className="flex flex-col gap-1 pt-2">
              <Link
                to="/browse"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 py-3 px-3 rounded-lg text-primary font-bold bg-primary-container/10 border border-primary-container/30"
              >
                Browse Properties
              </Link>
              <Link
                to="/favorites"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 py-3 px-3 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                Favorites ({favorites.size})
              </Link>
              {roleState.isOwner && (
                <Link
                  to="/owner"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 py-3 px-3 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
                >
                  My Listings
                </Link>
              )}
              <Link
                to="/resources"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 py-3 px-3 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                Resources
              </Link>
            </nav>
            <div className="mt-2 pt-4 border-t border-border-muted flex flex-col gap-2">
              {roleState.isSeeker && (
                <Link
                  to="/seeker"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 py-3 px-3 rounded-lg text-primary-container font-bold hover:bg-primary-container/10 transition-colors"
                >
                  Seeker Dashboard
                </Link>
              )}
              {roleState.isOwner && (
                <Link
                  to="/owner"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 py-3 px-3 rounded-lg text-primary-container font-bold hover:bg-primary-container/10 transition-colors"
                >
                  Owner Dashboard
                </Link>
              )}
              {!roleState.isOwner && !roleState.isSeeker && (
                <Link
                  to="/role-select"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 py-3 px-3 rounded-lg text-primary-container font-bold hover:bg-primary-container/10 transition-colors"
                >
                  Get Started
                </Link>
              )}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setChatOpen(true);
                }}
                className="flex items-center gap-3 py-3 px-3 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors text-left"
                type="button"
              >
                Ask Mogul AI
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="pt-24 pb-20 min-h-screen relative overflow-hidden flex-1">
        <section className="max-w-[1400px] mx-auto px-5 md:px-16 relative z-10">
          <div className="mb-12 relative overflow-hidden rounded-3xl border border-border-muted bg-surface-container-lowest">
            <div className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80"
                alt=""
                aria-hidden="true"
                className="w-full h-full object-cover"
                loading="eager"
                fetchPriority="high"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/40 dark:from-background dark:via-background/80 dark:to-background/20" />
              <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-primary-container/20 blur-3xl" />
            </div>

            <div className="relative grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] items-end gap-6 p-6 sm:p-10 lg:p-14 min-h-[280px] sm:min-h-[340px]">
              <div className="min-w-0 max-w-2xl">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border border-primary-container/40 bg-primary-container/10 text-primary-container mb-4">
                  Curated Listings
                </span>
                <h1 className="font-display font-bold text-3xl sm:text-5xl lg:text-6xl leading-tight mb-3 tracking-tight">
                  Property Search <span className="primary-gradient-text">Redefined</span>
                </h1>
                <p className="text-on-surface-variant text-sm sm:text-base lg:text-lg max-w-2xl">
                  Discover your next home or investment in our curated collection of global real
                  estate. Secure, transparent, and professional.
                </p>
              </div>

              <div
                className="flex bg-surface-container/80 backdrop-blur rounded-xl p-1 border border-border-muted shrink-0 self-start lg:self-end"
                role="group"
                aria-label="Result view"
              >
                <button
                  onClick={() => setSearch({ view: "grid" })}
                  aria-label="Grid view"
                  aria-pressed={search.view === "grid"}
                  type="button"
                  className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                    search.view === "grid"
                      ? "bg-primary-container text-on-primary-container"
                      : "text-on-surface-variant hover:text-primary"
                  }`}
                >
                  <span className="material-symbols-outlined">grid_view</span>
                </button>
                <button
                  onClick={() => setSearch({ view: "map" })}
                  aria-label="Map view"
                  aria-pressed={search.view === "map"}
                  type="button"
                  className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                    search.view === "map"
                      ? "bg-primary-container text-on-primary-container"
                      : "text-on-surface-variant hover:text-primary"
                  }`}
                >
                  <span className="material-symbols-outlined">map</span>
                </button>
              </div>
            </div>
          </div>

          <form
            className="glass-panel rounded-2xl p-6 mb-6"
            onSubmit={(e) => {
              e.preventDefault();
              applySearch();
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 md:gap-6 items-end">
              <div className="flex flex-col gap-2 lg:col-span-2">
                <label
                  className="font-mono-data text-[11px] tracking-widest uppercase text-on-surface-variant"
                  htmlFor="f-loc"
                >
                  Location
                </label>
                <div className="relative">
                  <input
                    id="f-loc"
                    value={qDraft}
                    onChange={(e) => setQDraft(e.target.value)}
                    className="w-full bg-background border border-border-muted rounded-xl py-3 pl-10 pr-4 focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all text-sm"
                    placeholder="Lagos, Abuja, Port Harcourt..."
                    type="text"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  className="font-mono-data text-[11px] tracking-widest uppercase text-on-surface-variant"
                  htmlFor="f-type"
                >
                  Type
                </label>
                <select
                  id="f-type"
                  value={typeDraft}
                  onChange={(e) => setTypeDraft(e.target.value)}
                  className="bg-background border border-border-muted rounded-xl py-3 px-4 focus:border-primary-container outline-none text-sm cursor-pointer"
                >
                  <option value="All">All</option>
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Industrial">Industrial</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-mono-data text-[11px] tracking-widest uppercase text-on-surface-variant">
                  Price (₦)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    aria-label="Minimum price"
                    value={minDraft}
                    onChange={(e) => setMinDraft(e.target.value)}
                    className="w-full bg-background border border-border-muted rounded-xl py-3 px-3 focus:border-primary-container outline-none text-sm min-w-0"
                    placeholder="Min"
                    inputMode="numeric"
                    type="text"
                  />
                  <span className="text-border-muted shrink-0">—</span>
                  <input
                    aria-label="Maximum price"
                    value={maxDraft}
                    onChange={(e) => setMaxDraft(e.target.value)}
                    className="w-full bg-background border border-border-muted rounded-xl py-3 px-3 focus:border-primary-container outline-none text-sm min-w-0"
                    placeholder="Max"
                    inputMode="numeric"
                    type="text"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  className="font-mono-data text-[11px] tracking-widest uppercase text-on-surface-variant"
                  htmlFor="f-beds"
                >
                  Bedrooms
                </label>
                <select
                  id="f-beds"
                  value={bedsDraft}
                  onChange={(e) => setBedsDraft(e.target.value)}
                  className="bg-background border border-border-muted rounded-xl py-3 px-4 focus:border-primary-container outline-none text-sm cursor-pointer"
                >
                  <option value="Any">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>

              <button
                type="submit"
                className="bg-surface-container border border-primary-container/30 text-primary py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-container hover:text-on-primary-container transition-all group active:scale-95"
              >
                Search
              </button>
            </div>
          </form>

          <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2" aria-live="polite">
              {activeChips.length > 0 ? (
                <>
                  <span className="text-xs text-on-surface-variant font-mono-data">
                    {totalProperties} match{totalProperties === 1 ? "" : "es"}:
                  </span>
                  {activeChips.map((c) => (
                    <button
                      key={c.label}
                      onClick={c.onRemove}
                      className="inline-flex items-center gap-1.5 text-xs bg-primary-container/10 border border-primary-container/30 text-primary-container px-3 py-1.5 rounded-full hover:bg-primary-container/20 transition-colors"
                      type="button"
                    >
                      {c.label}
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  ))}
                  <button
                    onClick={clearAll}
                    className="text-xs text-on-surface-variant hover:text-primary underline underline-offset-2"
                    type="button"
                  >
                    Clear all
                  </button>
                </>
              ) : (
                <span className="text-xs text-on-surface-variant font-mono-data">
                  Showing all {totalProperties} properties
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <label
                htmlFor="f-sort"
                className="text-xs text-on-surface-variant font-mono-data uppercase tracking-wider"
              >
                Sort
              </label>
              <select
                id="f-sort"
                value={search.sort}
                onChange={(e) => setSearch({ sort: e.target.value, page: 1 })}
                className="bg-surface-container border border-border-muted rounded-lg py-1.5 px-3 focus:border-primary-container outline-none text-sm cursor-pointer"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price → High</option>
                <option value="price_desc">Price → Low</option>
                <option value="beds">Most bedrooms</option>
              </select>
            </div>
          </div>

          {favoriteError && (
            <p className="mb-6 text-sm text-warning" role="status">
              {favoriteError}
            </p>
          )}

          {loadingProperties ? (
            <div className="glass-panel rounded-3xl h-[400px] flex items-center justify-center text-on-surface-variant">
              Loading properties…
            </div>
          ) : propertyError ? (
            <div className="glass-panel rounded-3xl h-[400px] flex flex-col items-center justify-center gap-3 text-center px-6">
              <p className="font-bold text-lg">Properties are unavailable</p>
              <p className="text-sm text-on-surface-variant">{propertyError}</p>
            </div>
          ) : search.view === "grid" ? (
            pageItems.length === 0 ? (
              <div className="glass-panel rounded-3xl h-[400px] flex flex-col items-center justify-center gap-3 text-on-surface-variant text-center px-6">
                <p className="font-bold text-lg">No properties match your filters</p>
                <p className="text-sm">Try widening the price range or clearing filters.</p>
                <button
                  onClick={clearAll}
                  className="mt-2 bg-primary-container text-on-primary-container px-5 py-2 rounded-xl font-bold text-sm"
                  type="button"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {pageItems.map((p) => (
                  <article
                    key={p.id}
                    className="group relative flex flex-col bg-surface-container-lowest rounded-3xl overflow-hidden border border-border-muted hover:border-primary-container/30 transition-all duration-300 hover:-translate-y-2 cyan-glow"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-surface-container">
                      <img
                        alt={p.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                        src={p.images?.[0]}
                        loading="lazy"
                        decoding="async"
                        width={800}
                        height={600}
                      />
                      <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                        {p.tags?.map((t) => (
                          <span
                            key={t.label}
                            className={`backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${toneClass(t.tone)}`}
                          >
                            {t.label}
                          </span>
                        ))}
                        <span className="bg-surface/70 text-on-surface backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border border-border-muted">
                          {p.category}
                        </span>
                      </div>
                      <button
                        onClick={() => toggleFav(p.id)}
                        aria-label={
                          favorites.has(p.id)
                            ? `Remove ${p.title} from favorites`
                            : `Add ${p.title} to favorites`
                        }
                        aria-pressed={favorites.has(p.id)}
                        className="absolute top-4 right-4 bg-background/40 backdrop-blur-md text-on-surface p-2 rounded-full hover:bg-primary-container hover:text-on-primary-container transition-colors"
                        type="button"
                      >
                        <span className="material-symbols-outlined">
                          {favorites.has(p.id) ? "favorite" : "favorite_border"}
                        </span>
                      </button>
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex justify-between items-start gap-3 mb-4">
                        <div className="min-w-0">
                          <h3 className="text-xl font-bold mb-1 group-hover:text-primary-container transition-colors truncate">
                            {p.title}
                          </h3>
                          <div className="flex items-center gap-1 text-on-surface-variant min-w-0">
                            <span className="text-sm truncate">{p.location}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-mono-data text-primary-container text-lg font-bold">
                            {p.price}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 mb-6 py-2 border-y border-border-muted/50">
                        {p.specs?.map((s) => (
                          <div
                            key={s.label}
                            className="flex items-center gap-1.5 text-on-surface-variant"
                          >
                            <span className="text-sm font-mono-data">{s.label}</span>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-auto">
                        <Link
                          to="/property/$id"
                          params={{ id: p.id }}
                          className="text-center bg-surface-container border border-border-muted text-on-surface-variant py-3 rounded-xl font-bold hover:bg-on-surface hover:text-background transition-all"
                        >
                          View Property
                        </Link>

                        <Link
                          to="/property/$id"
                          params={{ id: p.id }}
                          className="text-center bg-surface-container border border-border-muted text-on-surface-variant py-3 rounded-xl font-bold hover:bg-on-surface hover:text-background transition-all"
                        >
                          Contact Owner
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )
          ) : (
            <div className="glass-panel rounded-3xl h-[500px] flex flex-col items-center justify-center gap-3 text-on-surface-variant">
              <p className="font-bold text-lg">Map view coming soon</p>
              <p className="text-sm">Switch back to grid to browse listings.</p>
            </div>
          )}

          <div className="mt-16 flex flex-col md:flex-row items-center justify-between gap-8 py-8 border-t border-border-muted">
            <p className="text-on-surface-variant text-sm" aria-live="polite">
              Showing{" "}
              <span className="text-on-surface font-bold">
                {pageItems.length === 0 ? 0 : startIdx + 1}-{startIdx + pageItems.length}
              </span>{" "}
              of {totalProperties} properties
            </p>

            <nav
              className="flex items-center gap-2 flex-wrap justify-center"
              aria-label="Pagination"
            >
              <button
                aria-label="Previous page"
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-10 h-10 rounded-lg flex items-center justify-center border border-border-muted hover:border-primary-container text-on-surface-variant transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>

              {paginationRange(currentPage, totalPages).map((n, i) =>
                n === "…" ? (
                  <span
                    key={`e${i}`}
                    className="w-10 h-10 flex items-center justify-center text-on-surface-variant"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={n}
                    onClick={() => changePage(n)}
                    aria-current={n === currentPage ? "page" : undefined}
                    aria-label={`Page ${n}`}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold transition-colors ${
                      n === currentPage
                        ? "bg-primary-container text-on-primary-container"
                        : "border border-border-muted hover:border-primary-container text-on-surface-variant"
                    }`}
                    type="button"
                  >
                    {n}
                  </button>
                ),
              )}

              <button
                aria-label="Next page"
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-10 h-10 rounded-lg flex items-center justify-center border border-border-muted hover:border-primary-container text-on-surface-variant transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </nav>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const n = parseInt(gotoInput, 10);
                if (!Number.isNaN(n)) changePage(n);
                setGotoInput("");
              }}
              className="hidden md:flex items-center gap-4"
            >
              <label htmlFor="goto-page" className="text-on-surface-variant text-sm">
                Go to page
              </label>
              <input
                id="goto-page"
                value={gotoInput}
                onChange={(e) => setGotoInput(e.target.value)}
                className="w-14 bg-background border border-border-muted rounded-lg py-1 px-2 text-center text-sm focus:border-primary-container outline-none"
                placeholder={String(currentPage)}
                type="text"
              />
            </form>
          </div>
        </section>
      </main>

      <footer className="w-full bg-surface-container-lowest border-t border-border-muted py-12 px-5 md:px-16 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col items-center md:items-start gap-3">
          <span className="font-display font-bold text-xl text-primary">Property Mogul</span>
          <p className="text-on-surface-variant text-sm text-center md:text-left max-w-sm">
            © 2026 Property Mogul. Premium Real Estate Search. Secure. Global. Professional.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-6 md:gap-8">
          {["About Us", "Our Services", "Privacy Policy", "Contact", "Terms of Service"].map(
            (l) => (
              <a
                key={l}
                className="text-on-surface-variant hover:text-primary-container transition-colors text-sm"
                href="#"
              >
                {l}
              </a>
            ),
          )}
        </div>
      </footer>

      <AiChatWidget open={chatOpen} onOpenChange={setChatOpen} />

      <button
        onClick={() => setChatOpen(true)}
        aria-label="Chat with Mogul Assistant"
        className="hidden md:grid fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-primary-container text-on-primary-container shadow-2xl shadow-primary-container/30 place-items-center active:scale-95 transition-transform"
        type="button"
      >
        <span
          className="material-symbols-outlined"
          style={{ fontVariationSettings: "'FILL' 1, 'wght' 500" }}
          aria-hidden="true"
        >
          smart_toy
        </span>
      </button>
    </div>
  );
}
