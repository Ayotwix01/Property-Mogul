import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { usePreload } from "@/components/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandLogo } from "@/components/logo";
import { listPublishedProperties } from "@/lib/property.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Property Mogul | Modern Real Estate Marketplace" },
      {
        name: "description",
        content:
          "The smarter way to find your next home or list your property. Premium verified listings for seekers, renters, and buyers.",
      },
      { property: "og:title", content: "Property Mogul | Modern Real Estate Marketplace" },
      {
        property: "og:description",
        content: "Modern real estate for everyone. Find, list, and connect seamlessly.",
      },
      {
        property: "og:image",
        content:
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Property Mogul | Modern Real Estate Marketplace" },
      {
        name: "twitter:image",
        content:
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Landing,
});

const tagStyles = {
  success: "border-success-cyan/30 text-success-cyan [&_.dot]:bg-success-cyan",
  primary: "border-primary-container/30 text-primary-container [&_.dot]:bg-primary-container",
  tertiary: "border-tertiary-container/30 text-tertiary-container [&_.dot]:bg-tertiary-container",
};

const showcaseBuildings = [
  {
    id: "showcase-lekki",
    title: "Modern Lekki Duplex",
    location: "Lekki Phase 1, Lagos",
    price: "₦185,000,000",
    beds: 4,
    baths: 4,
    sqft: "420 m²",
    image:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
    tag: { label: "Featured", tone: "primary" },
  },
  {
    id: "showcase-maitama",
    title: "Maitama Terrace Villa",
    location: "Maitama, Abuja",
    price: "₦240,000,000",
    beds: 5,
    baths: 5,
    sqft: "560 m²",
    image:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
    tag: { label: "Verified", tone: "success" },
  },
];

function ListingCard({ p, tagClass }) {
  return (
    <div className="glass-panel rounded-2xl overflow-hidden group hover:border-primary-container/40 transition-all duration-300">
      <div className="h-64 relative overflow-hidden">
        <img
          alt={p.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src={p.images?.[0]}
        />
        {p.tags?.[0] && (
          <div
            className={`absolute top-4 left-4 bg-surface-glass backdrop-blur-md px-3 py-1 rounded-full border flex items-center gap-1.5 ${tagClass(p.tags[0].tone)}`}
          >
            <span className="dot w-2 h-2 rounded-full animate-pulse" />
            <span className="font-label-caps text-[10px]">{p.tags[0].label}</span>
          </div>
        )}
      </div>
      <div className="p-6 space-y-4">
        <h3 className="text-xl text-primary">{p.title}</h3>
        <div className="flex justify-between text-sm">
          <span className="text-on-surface-variant">Location</span>
          <span className="text-on-surface font-mono-data">{p.location}</span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-border-muted">
          <div>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
              Price
            </p>
            <p className="text-primary-container font-mono-data text-xl">{p.price}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
              Details
            </p>
            <p className="text-success-cyan font-mono-data text-xl">
              {p.beds ? `${p.beds} BR` : p.category}
            </p>
          </div>
        </div>
        <Link
          to="/property/$id"
          params={{ id: p.id }}
          className="block w-full text-center py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-primary-container hover:text-on-primary-container transition-all font-bold"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

function BuildingCard({ b, tagClass }) {
  return (
    <div className="glass-panel rounded-2xl overflow-hidden group hover:border-primary-container/40 transition-all duration-300">
      <div className="h-72 relative overflow-hidden">
        <img
          alt={b.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src={b.image}
        />
        <div
          className={`absolute top-4 left-4 bg-surface-glass backdrop-blur-md px-3 py-1 rounded-full border flex items-center gap-1.5 ${tagClass(b.tag.tone)}`}
        >
          <span className="dot w-2 h-2 rounded-full animate-pulse" />
          <span className="font-label-caps text-[10px]">{b.tag.label}</span>
        </div>
      </div>
      <div className="p-6 space-y-4">
        <h3 className="text-xl text-primary">{b.title}</h3>
        <div className="flex justify-between text-sm">
          <span className="text-on-surface-variant">Location</span>
          <span className="text-on-surface font-mono-data">{b.location}</span>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center pt-2 border-t border-border-muted">
          <div>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
              Beds
            </p>
            <p className="text-success-cyan font-mono-data">{b.beds}</p>
          </div>
          <div>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
              Baths
            </p>
            <p className="text-success-cyan font-mono-data">{b.baths}</p>
          </div>
          <div>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
              Size
            </p>
            <p className="text-success-cyan font-mono-data text-sm">{b.sqft}</p>
          </div>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-border-muted">
          <div>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
              Price
            </p>
            <p className="text-primary-container font-mono-data text-xl">{b.price}</p>
          </div>
        </div>
        <Link
          to="/browse"
          className="block w-full text-center py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-primary-container hover:text-on-primary-container transition-all font-bold"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

function Landing() {
  const ready = usePreload(400);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [featured, setFeatured] = useState([]);
  const [featuredError, setFeaturedError] = useState("");
  const getProperties = useServerFn(listPublishedProperties);

  const tagClass = useMemo(() => (tone) => tagStyles[tone] ?? tagStyles.primary, []);

  useEffect(() => {
    let active = true;
    getProperties({ data: { page: 1, pageSize: 3, sort: "newest" } })
      .then((result) => {
        if (active) setFeatured(result.properties);
      })
      .catch((error) => {
        if (active)
          setFeaturedError(
            error instanceof Error ? error.message : "Unable to load featured listings.",
          );
      });
    return () => {
      active = false;
    };
  }, [getProperties]);

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border-muted">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 md:px-12 h-16 sm:h-20">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
            <BrandLogo size={32} className="sm:w-9 sm:h-9" />
            <span className="font-display font-bold text-base sm:text-lg text-primary group-hover:text-primary-container transition-colors">
              Property Mogul
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-sm">
            <a
              href="#listings"
              className="px-3 py-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-white/5 transition-colors"
            >
              Listings
            </a>
            <a
              href="#buildings"
              className="px-3 py-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-white/5 transition-colors"
            >
              Buildings
            </a>
            <a
              href="#why"
              className="px-3 py-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-white/5 transition-colors"
            >
              Why Us
            </a>
            <a
              href="#how"
              className="px-3 py-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-white/5 transition-colors"
            >
              How it Works
            </a>
            <a
              href="#contact"
              className="px-3 py-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-white/5 transition-colors"
            >
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
            <Link
              to="/login"
              className="hidden md:inline-flex px-4 py-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-white/5 transition-colors font-medium"
            >
              Sign In
            </Link>
            <Link
              to="/role-select"
              className="hidden md:inline-flex bg-primary-container text-on-primary-container px-4 py-2 rounded-xl font-bold hover:brightness-110 transition-all cyan-glow"
            >
              Get Started
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Menu"
              className="md:hidden w-9 h-9 rounded-lg border border-border-muted flex items-center justify-center"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border-muted bg-background/95 backdrop-blur-xl px-4 py-4 space-y-1 text-sm">
            <a
              href="#listings"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-white/5"
            >
              Listings
            </a>
            <a
              href="#buildings"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-white/5"
            >
              Buildings
            </a>
            <a
              href="#why"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-white/5"
            >
              Why Us
            </a>
            <a
              href="#how"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-white/5"
            >
              How it Works
            </a>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-white/5"
            >
              Contact
            </a>
            <div className="flex items-center gap-2 pt-3 mt-2 border-t border-border-muted">
              <ThemeToggle />
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 rounded-lg border border-border-muted text-on-surface-variant"
              >
                Sign In
              </Link>
              <Link
                to="/role-select"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 rounded-lg bg-primary-container text-on-primary-container font-bold"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="pt-24">
        <section className="relative min-h-[80vh] py-16 px-4 sm:px-6 md:px-12 overflow-hidden">
          <div className="luminous-bg top-[-200px] left-[-150px]" />
          <div className="luminous-bg bottom-[-200px] right-[-150px]" />

          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
            <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
              <span className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full border border-primary-container/40 bg-primary-container/10 text-primary-container font-mono-data text-[11px] tracking-widest uppercase">
                <span className="w-2 h-2 rounded-full bg-success-cyan animate-pulse" />
                Premium Real Estate Marketplace
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight tracking-tight">
                Modern <span className="primary-gradient-text">Real Estate</span>
                <br /> for Everyone
              </h1>
              <p className="text-base sm:text-lg text-on-surface-variant max-w-2xl mx-auto lg:mx-0">
                The smarter way to find your next home or list your property. We connect seekers,
                renters, and buyers with premium listings through a seamless digital experience.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center pt-4">
                <Link
                  to="/browse"
                  className="bg-primary-container text-on-primary-container px-8 sm:px-10 py-3 rounded-xl font-bold hover:brightness-110 transition-all cyan-glow w-full sm:w-auto text-center"
                >
                  Find a Home
                </Link>
                <Link
                  to="/role-select"
                  className="px-8 sm:px-10 py-3 rounded-xl border border-border-muted hover:bg-surface-container transition-all font-bold w-full sm:w-auto text-center"
                >
                  List Your Property
                </Link>
                <Link
                  to="/login"
                  className="text-on-surface-variant hover:text-primary transition-colors font-medium w-full sm:w-auto text-center py-3"
                >
                  Sign In →
                </Link>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-8 gap-y-3 pt-6 text-sm text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-success-cyan text-base">
                    verified
                  </span>
                  Verified listings
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-container text-base">
                    bolt
                  </span>
                  Direct landlord contact
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-tertiary-container text-base">
                    payments
                  </span>
                  Secure payments
                </div>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="glass-panel rounded-3xl overflow-hidden aspect-[4/5] relative">
                <img
                  alt="Modern property"
                  className="w-full h-full object-cover"
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />

                <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
                  <div className="bg-surface-glass backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10">
                    <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">
                      Featured
                    </p>
                    <p className="text-primary font-bold">Ikoyi Penthouse</p>
                  </div>
                  <div className="bg-success-cyan/20 border border-success-cyan/30 backdrop-blur-xl px-3 py-1.5 rounded-full text-success-cyan text-xs font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-success-cyan animate-pulse" />
                    Verified
                  </div>
                </div>

                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">
                      Starting from
                    </p>
                    <p className="text-primary-container font-mono-data text-2xl">₦320,000,000</p>
                  </div>
                  <Link
                    to="/browse"
                    className="bg-primary-container text-on-primary-container px-5 py-2.5 rounded-xl font-bold hover:brightness-110 transition-all cyan-glow"
                  >
                    Browse
                  </Link>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-6 glass-panel rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-container/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary-container">
                    apartment
                  </span>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">
                    Properties
                  </p>
                  <p className="text-primary font-bold">2,500+ listed</p>
                </div>
              </div>

              <div className="absolute -top-6 -right-6 glass-panel rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-success-cyan/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-success-cyan">verified_user</span>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">
                    Landlords
                  </p>
                  <p className="text-primary font-bold">100% verified</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="buildings" className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-10 sm:mb-12">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-tertiary-container/30 bg-tertiary-container/10 text-tertiary-container font-mono-data text-[10px] tracking-widest uppercase mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container" />
                Sample Showcase
              </span>
              <h2 className="text-3xl md:text-5xl text-primary mb-2">Featured Buildings</h2>
              <p className="text-on-surface-variant max-w-xl">
                A glimpse of the kind of premium properties you'll find on Property Mogul.
              </p>
            </div>
            <Link
              to="/browse"
              className="text-primary-container hover:text-primary transition-colors font-bold"
            >
              View all listings →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {showcaseBuildings.map((b) => (
              <BuildingCard key={b.id} b={b} tagClass={tagClass} />
            ))}
          </div>
        </section>

        <section id="listings" className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-10 sm:mb-12">
            <div>
              <h2 className="text-3xl md:text-5xl text-primary mb-2">Live Listings</h2>
              <p className="text-on-surface-variant">
                Discover premium properties available right now on Property Mogul.
              </p>
            </div>
            <Link
              to="/browse"
              className="text-primary-container hover:text-primary transition-colors font-bold"
            >
              View all listings →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredError ? (
              <p className="col-span-full rounded-2xl border border-dashed border-border-muted p-10 text-center text-on-surface-variant">
                Featured listings are unavailable right now.
              </p>
            ) : featured.length === 0 ? (
              <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="glass-panel rounded-2xl p-10 text-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary-container text-3xl mb-3 block">
                    real_estate_agent
                  </span>
                  <p className="font-bold text-primary mb-1">No published listings yet</p>
                  <p className="text-sm">
                    Be the first — list a property from your owner dashboard.
                  </p>
                </div>
                <div className="glass-panel rounded-2xl p-10 text-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary-container text-3xl mb-3 block">
                    search
                  </span>
                  <p className="font-bold text-primary mb-1">Browse the marketplace</p>
                  <Link
                    to="/browse"
                    className="text-primary-container text-sm hover:text-primary transition-colors"
                  >
                    Explore all properties →
                  </Link>
                </div>
                <div className="glass-panel rounded-2xl p-10 text-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary-container text-3xl mb-3 block">
                    verified
                  </span>
                  <p className="font-bold text-primary mb-1">Verified landlords only</p>
                  <p className="text-sm">Every landlord is identity-verified.</p>
                </div>
              </div>
            ) : (
              featured.map((p) => <ListingCard key={p.id} p={p} tagClass={tagClass} />)
            )}
          </div>
        </section>

        <section id="why" className="py-24 bg-surface-container-lowest">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl text-primary mb-4">Why Property Mogul?</h2>
              <p className="text-on-surface-variant max-w-xl mx-auto">
                We're modernizing the real estate journey by removing friction and connecting people
                through technology.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:auto-rows-[300px]">
              <div className="md:col-span-2 glass-panel p-8 rounded-3xl flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-primary-container/20 blur-[80px] group-hover:bg-primary-container/30 transition-all" />
                <div className="relative z-10 flex items-start justify-between gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-primary-container/15 border border-primary-container/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary-container text-2xl">
                      verified_user
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-success-cyan/15 border border-success-cyan/30 text-success-cyan text-xs font-mono-data uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-success-cyan animate-pulse" />
                    100% verified
                  </span>
                </div>
                <div className="relative z-10">
                  <h3 className="text-2xl text-primary mb-2">Verified Listings</h3>
                  <p className="text-on-surface-variant max-w-md">
                    Every property and user on our platform undergoes a rigorous verification
                    process.
                  </p>
                </div>
              </div>

              <div className="glass-panel p-8 rounded-3xl flex flex-col justify-between relative overflow-hidden group">
                <div className="relative z-10 w-14 h-14 rounded-2xl bg-tertiary-container/15 border border-tertiary-container/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-tertiary-container text-2xl">
                    travel_explore
                  </span>
                </div>
                <div className="relative z-10">
                  <h3 className="text-2xl text-primary mb-2">Rapid Search</h3>
                  <p className="text-on-surface-variant">
                    Find exactly what you're looking for with AI-driven filtering.
                  </p>
                </div>
              </div>

              <div className="glass-panel p-8 rounded-3xl flex flex-col justify-between relative overflow-hidden group">
                <div className="relative z-10 w-14 h-14 rounded-2xl bg-secondary/15 border border-secondary/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary text-2xl">forum</span>
                </div>
                <div className="relative z-10">
                  <h3 className="text-2xl text-primary mb-2">Direct Connection</h3>
                  <p className="text-on-surface-variant">
                    Communicate directly, arrange viewings, and finalize deals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="py-24 px-6 md:px-12 overflow-hidden">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl text-primary mb-4">How it Works</h2>
              <p className="text-on-surface-variant">
                A seamless journey for both owners and seekers.
              </p>
            </div>

            <div className="space-y-12 relative">
              <div className="absolute left-[24px] md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary-container/50 via-secondary/50 to-transparent md:-translate-x-1/2" />

              {[
                {
                  step: 1,
                  title: "Create Profile",
                  desc: "Sign up and verify your identity to build trust.",
                  icon: "person_add",
                  color: "primary-container",
                },
                {
                  step: 2,
                  title: "List or Search",
                  desc: "Owners list properties; seekers filter to find matches.",
                  icon: "manage_search",
                  color: "secondary",
                },
                {
                  step: 3,
                  title: "Connect & Close",
                  desc: "Communicate directly, arrange viewings, and finalize deals.",
                  icon: "handshake",
                  color: "primary-container",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="relative flex flex-col md:flex-row items-center gap-6 md:gap-10"
                >
                  <div
                    className={`z-10 w-14 h-14 rounded-full ${item.color === "secondary" ? "bg-secondary text-on-secondary" : "bg-primary-container text-on-primary"} flex items-center justify-center border-4 border-background shadow-lg`}
                  >
                    <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                  </div>
                  <div className="glass-panel p-6 rounded-2xl flex-1">
                    <h4 className="text-primary font-bold text-lg">{item.title}</h4>
                    <p className="text-on-surface-variant text-sm mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-32 px-6 md:px-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-container/5 to-transparent" />
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl text-primary mb-6">
              Ready for a Better Experience?
            </h2>
            <p className="text-on-surface-variant text-lg mb-12">
              Join thousands of users already simplifying their real estate journey on Property
              Mogul. Your next property is just a click away.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/role-select"
                className="bg-primary-container text-on-primary-container px-12 py-5 rounded-2xl font-bold text-lg hover:scale-105 transition-transform cyan-glow"
              >
                Join Property Mogul Now
              </Link>
              <Link
                to="/browse"
                className="px-12 py-5 rounded-2xl border border-white/10 hover:bg-white/5 font-bold text-lg"
              >
                Browse Properties
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" className="border-t border-border-muted bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            <div className="space-y-4">
              <Link to="/" className="flex items-center gap-3">
                <BrandLogo size={32} />
                <span className="font-display font-bold text-lg text-primary">Property Mogul</span>
              </Link>
              <p className="text-on-surface-variant text-sm max-w-xs">
                The modern Nigerian real estate marketplace. Find verified properties, connect
                directly with landlords, and close with confidence.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <a
                  href="mailto:hello@propertymogul.test"
                  aria-label="Email"
                  className="w-9 h-9 rounded-lg border border-border-muted flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary-container/40 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">mail</span>
                </a>
                <a
                  href="https://twitter.com/propertymogul"
                  aria-label="Twitter"
                  className="w-9 h-9 rounded-lg border border-border-muted flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary-container/40 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">share</span>
                </a>
                <a
                  href="https://instagram.com/propertymogul"
                  aria-label="Instagram"
                  className="w-9 h-9 rounded-lg border border-border-muted flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary-container/40 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">photo_camera</span>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-primary font-bold mb-4 text-sm uppercase tracking-widest">
                Explore
              </h4>
              <ul className="space-y-2 text-sm text-on-surface-variant">
                <li>
                  <Link to="/browse" className="hover:text-primary transition-colors">
                    Browse properties
                  </Link>
                </li>
                <li>
                  <Link to="/role-select" className="hover:text-primary transition-colors">
                    List your property
                  </Link>
                </li>
                <li>
                  <Link to="/resources" className="hover:text-primary transition-colors">
                    Safety guides
                  </Link>
                </li>
                <li>
                  <Link
                    to="/resources/how-to-spot-listing-scams"
                    className="hover:text-primary transition-colors"
                  >
                    Anti-scam tips
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-primary font-bold mb-4 text-sm uppercase tracking-widest">
                Account
              </h4>
              <ul className="space-y-2 text-sm text-on-surface-variant">
                <li>
                  <Link to="/login" className="hover:text-primary transition-colors">
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link to="/signup" className="hover:text-primary transition-colors">
                    Create account
                  </Link>
                </li>
                <li>
                  <Link to="/profile" className="hover:text-primary transition-colors">
                    Profile
                  </Link>
                </li>
                <li>
                  <Link to="/messages" className="hover:text-primary transition-colors">
                    Messages
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-primary font-bold mb-4 text-sm uppercase tracking-widest">
                Legal & Help
              </h4>
              <ul className="space-y-2 text-sm text-on-surface-variant">
                <li>
                  <Link to="/terms" className="hover:text-primary transition-colors">
                    Terms of service
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-primary transition-colors">
                    Privacy policy
                  </Link>
                </li>
                <li>
                  <a href="#contact" className="hover:text-primary transition-colors">
                    Contact support
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:hello@propertymogul.test"
                    className="hover:text-primary transition-colors"
                  >
                    hello@propertymogul.test
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-border-muted flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-on-surface-variant">
            <p>© 2026 Property Mogul. Premium Real Estate Marketplace.</p>
            <p>Built for Nigeria · Lagos · Abuja</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
