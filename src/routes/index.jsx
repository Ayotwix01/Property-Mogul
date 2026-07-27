import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { usePreload } from "@/components/skeleton";

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

const heroCards = [
  {
    title: "Azure Sky Loft",
    location: "Victoria Island, Lagos",
    price: "₦1,250,000",
    meta: "3 BR",
    tag: "PREMIUM",
    tagTone: "success",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA4ONf2eXjU_9yQ10sr9PUvrLXxnvn0ye7uZtlM_ujuDADDDyg-Y6w9MD6KmK0BQyHC81OgZJsystmrVkblcBJdryd8NYVMm3zweQxtMv53SvWOAtMNq3GSactFM6_QdjkuEz0sEzkC3eTmIXsX6sifkp4bmx5JVkGq9UPHtdvVZz3SYu8DwVYTBPUf7M-Bz9Ycq3liZ2A51cdtEZx73TYzUoBRAefWhYp7XtsSDhZsxSXfWaKuzf_-XH4Yl2m-N3on-zhbkUFjG6jx",
  },
  {
    title: "Ocean Edge Estate",
    location: "Banana Island, Lagos",
    price: "₦850,000",
    meta: "Active",
    tag: "NEWLY LISTED",
    tagTone: "primary",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC8q4UAaXt6Wcm2aVLkwLyqsUCebtWvsAtazribjYjg-ysW6hlROOqt9Dk5fR5uxi7gWl_CcQOdQc6xamg8gnJXJ14vwhenYysTs3TfLftltyExj9HjOx0vJJPPg6CwWgmcrTA6HkThu0V2hN3bBSRt7Y-alyhhdYEAzX_UZSQclGkofmwxKYMhgKBoTSkgMefj41ImuSCmnV5JYJJXN-aVkNtRvzSJ2J7cOz2ut2G7lnOxjmSbodgW3u1u_8vq9hQuS1x2pz-sj8X7",
  },
  {
    title: "Tech Hub Plaza",
    location: "Maitama, Abuja",
    price: "₦4,500/mo",
    meta: "120m²",
    tag: "COMMERCIAL",
    tagTone: "tertiary",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCpodUeRyiywYM1qPsx8H5kPwImvT7TcjKAEhRely_S55AP0gj5eQuTIyQyku8JNXaikT2VRP95fsOYIeITRWjhUNb_XXMm39L6dpYoRmFvBR_38EAD4d74uI0mAJouzfnoUhgbCvFaME4dn6LBkmApa-gMjtrjNf4lTSRKPsQNRWXB4m9Zzy7_1qV6vGpkaRF3qXYKs3yNL2IQzGgM_Y732LW1v6WynTN1deAzroMkLK2AmvnDtvweWpi4Nzir4UgJmSrtkgy8RE8m",
  },
];

const tagStyles = {
  success: "border-success-cyan/30 text-success-cyan [&_.dot]:bg-success-cyan",
  primary: "border-primary-container/30 text-primary-container [&_.dot]:bg-primary-container",
  tertiary: "border-tertiary-container/30 text-tertiary-container [&_.dot]:bg-tertiary-container",
};

function Landing() {
  const ready = usePreload(400);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tagClass = useMemo(() => (tone) => tagStyles[tone] ?? tagStyles.primary, []);

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-background/60 border-b border-border-muted">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 md:px-12 h-16 sm:h-20">
          <Link to="/" className="font-display font-bold text-lg text-primary">
            Property Mogul
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm text-on-surface-variant">
            <a href="#listings" className="hover:text-primary transition-colors">Listings</a>
            <a href="#why" className="hover:text-primary transition-colors">Why Us</a>
            <a href="#how" className="hover:text-primary transition-colors">How it Works</a>
            <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/login" className="hidden md:inline-flex text-on-surface-variant hover:text-primary transition-colors">
              Sign In
            </Link>
            <Link to="/role-select" className="hidden md:inline-flex text-on-surface-variant hover:text-primary transition-colors">
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
          <div className="md:hidden border-t border-border-muted bg-background/95 backdrop-blur-xl px-4 py-4 space-y-3 text-sm">
            <a href="#listings" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-on-surface-variant">Listings</a>
            <a href="#why" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-on-surface-variant">Why Us</a>
            <a href="#how" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-on-surface-variant">How it Works</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-on-surface-variant">Contact</a>
            <div className="flex gap-2 pt-2 border-t border-border-muted">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-on-surface-variant">Sign In</Link>
              <Link to="/role-select" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-on-surface-variant">Get Started</Link>
            </div>
          </div>
        )}
      </header>

      <main className="pt-24">
        <section className="relative min-h-[80vh] py-16 flex flex-col items-center justify-center text-center px-4 sm:px-6 md:px-12 overflow-hidden">
          <div className="max-w-4xl z-10 space-y-6 sm:space-y-8">
            <span className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full border border-primary-container/40 bg-primary-container/10 text-primary-container font-mono-data text-[11px] tracking-widest uppercase">
              <span className="w-2 h-2 rounded-full bg-success-cyan animate-pulse" />
              Premium Real Estate Marketplace
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-7xl leading-tight tracking-tight">
              Modern <span className="primary-gradient-text">Real Estate</span>
              <br /> for Everyone
            </h1>
            <p className="text-base sm:text-lg text-on-surface-variant max-w-2xl mx-auto">
              The smarter way to find your next home or list your property. We connect seekers,
              renters, and buyers with premium listings through a seamless digital experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link to="/browse" className="bg-primary-container text-on-primary-container px-8 sm:px-10 py-3 rounded-xl font-bold hover:brightness-110 transition-all cyan-glow w-full sm:w-auto text-center">
                Find a Home
              </Link>
              <Link to="/role-select" className="px-8 sm:px-10 py-3 rounded-xl border border-border-muted hover:bg-surface-container transition-all font-bold w-full sm:w-auto text-center">
                List Your Property
              </Link>
            </div>
          </div>
        </section>

        <section id="listings" className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-10 sm:mb-12">
            <div>
              <h2 className="text-3xl md:text-5xl text-primary mb-2">Featured Listings</h2>
              <p className="text-on-surface-variant">Discover premium properties available for sale and rent.</p>
            </div>
            <Link to="/browse" className="text-primary-container hover:text-primary transition-colors font-bold">
              View all listings
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {heroCards.map((p) => (
              <div
                key={p.title}
                className="glass-panel rounded-2xl overflow-hidden group hover:border-primary-container/40 transition-all duration-300"
              >
                <div className="h-64 relative overflow-hidden">
                  <img
                    alt={p.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    src={p.img}
                  />
                  <div
                    className={`absolute top-4 left-4 bg-surface-glass backdrop-blur-md px-3 py-1 rounded-full border flex items-center gap-1.5 ${tagClass(p.tagTone)}`}
                  >
                    <span className="dot w-2 h-2 rounded-full animate-pulse" />
                    <span className="font-label-caps text-[10px]">{p.tag}</span>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <h3 className="text-xl text-primary">{p.title}</h3>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Location</span>
                    <span className="text-on-surface font-mono-data">{p.location}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-border-muted">
                    <div>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Price</p>
                      <p className="text-primary-container font-mono-data text-xl">{p.price}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Details</p>
                      <p className="text-success-cyan font-mono-data text-xl">{p.meta}</p>
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
            ))}
          </div>
        </section>

        <section id="why" className="py-24 bg-surface-container-lowest">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl text-primary mb-4">Why Property Mogul?</h2>
              <p className="text-on-surface-variant max-w-xl mx-auto">
                We're modernizing the real estate journey by removing friction and connecting people through technology.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:auto-rows-[280px]">
              <div className="md:col-span-2 glass-panel p-8 rounded-3xl flex flex-col justify-end relative overflow-hidden group">
                <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-primary-container/20 blur-[80px] group-hover:bg-primary-container/30 transition-all" />
                <h3 className="text-2xl text-primary mb-2">Verified Listings</h3>
                <p className="text-on-surface-variant max-w-md">
                  Every property and user on our platform undergoes a rigorous verification process.
                </p>
              </div>

              <div className="glass-panel p-8 rounded-3xl flex flex-col justify-end">
                <h3 className="text-2xl text-primary mb-2">Rapid Search</h3>
                <p className="text-on-surface-variant">Find exactly what you're looking for with AI-driven filtering.</p>
              </div>

              <div className="glass-panel p-8 rounded-3xl flex flex-col justify-end">
                <h3 className="text-2xl text-primary mb-2">Direct Connection</h3>
                <p className="text-on-surface-variant">Communicate directly, arrange viewings, and finalize deals.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="py-24 px-6 md:px-12 overflow-hidden">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl text-primary mb-4">How it Works</h2>
              <p className="text-on-surface-variant">A seamless journey for both owners and seekers.</p>
            </div>

            <div className="space-y-12 relative">
              <div className="absolute left-[24px] md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary-container/50 via-secondary/50 to-transparent md:-translate-x-1/2" />

              {[1, 2, 3].map((n) => (
                <div key={n} className="relative flex flex-col md:flex-row items-center gap-8 md:gap-24">
                  <div className={`z-10 w-12 h-12 rounded-full ${n === 2 ? "bg-secondary text-on-secondary" : "bg-primary-container text-on-primary"} flex items-center justify-center font-bold border-4 border-background`}> {n} </div>
                  <div className="flex-1 md:text-left text-left">
                    <h4 className="text-primary font-bold text-lg">
                      {n === 1 ? "Create Profile" : n === 2 ? "List or Search" : "Connect & Close"}
                    </h4>
                    <p className="text-on-surface-variant text-sm mt-1">
                      {n === 1
                        ? "Sign up and verify your identity."
                        : n === 2
                          ? "Owners list properties; seekers filter to find matches."
                          : "Communicate directly, arrange viewings, and finalize deals."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-32 px-6 md:px-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-container/5 to-transparent" />
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl text-primary mb-6">Ready for a Better Experience?</h2>
            <p className="text-on-surface-variant text-lg mb-12">
              Join thousands of users already simplifying their real estate journey on Property Mogul.
              Your next property is just a click away.
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

      <footer id="contact" className="border-t border-border-muted py-8 text-center text-sm text-on-surface-variant">
        © 2026 Property Mogul. Premium Real Estate Search.
      </footer>
    </div>
  );
}

