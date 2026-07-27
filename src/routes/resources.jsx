import { createFileRoute, Link } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/theme-toggle";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Buyer & Renter Resources | Property Mogul" },
      {
        name: "description",
        content:
          "Guides on financing, viewings, tenancy law, and neighborhood safety across Nigerian real estate.",
      },
      { property: "og:title", content: "Buyer & Renter Resources | Property Mogul" },
      {
        property: "og:description",
        content: "Guides on financing, viewings, tenancy law, and neighborhood safety.",
      },
      { property: "og:url", content: "/resources" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/resources" }],
  }),
  component,
});

const guides = [
  {
    icon: "account_balance",
    title: "Financing 101",
    body: "Mortgages, mortgage bank options in Nigeria, and how to budget your down payment.",
  },
  {
    icon: "gavel",
    title: "Tenancy Law Basics",
    body: "Understand the Lagos and FCT tenancy acts before you sign a lease.",
  },
  {
    icon: "location_searching",
    title: "Neighborhood Safety",
    body: "How to vet an area — commute, security, utilities, and community.",
  },
  {
    icon: "visibility",
    title: "The Perfect Viewing",
    body: "A checklist of things to inspect and questions to ask on your first walk-through.",
  },
  {
    icon: "trending_up",
    title: "Investing for Yield",
    body: "Cap rates, rental demand, and how to spot an under-priced listing.",
  },
  {
    icon: "handshake",
    title: "Closing the Deal",
    body: "Legal costs, agent fees, and the paperwork you should never sign without a lawyer.",
  },
];

function Icon({ name, className = "" }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}

function ResourcesPage() {
  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col">
      <header className="fixed top-0 inset-x-0 z-50 bg-surface-glass backdrop-blur-xl border-b border-border-muted">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center px-5 md:px-16 py-4 gap-4">
          <Link to="/" className="font-display font-bold text-primary text-lg">
            Property Mogul
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/browse" className="text-on-surface-variant hover:text-primary transition-colors text-sm">
              Back to Browse
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-28 pb-20 px-5 md:px-16 max-w-[1400px] mx-auto w-full flex-1">
        <div className="max-w-2xl mb-12">
          <span className="font-mono-data text-xs tracking-widest uppercase text-primary-container">
            Resources
          </span>
          <h1 className="font-display font-bold text-4xl md:text-5xl mt-2 mb-4">
            Buy smarter. Rent safer.
          </h1>
          <p className="text-on-surface-variant text-lg">
            Practical guides written by our team of agents, lawyers, and mortgage brokers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guides.map((g) => (
            <article
              key={g.title}
              className="group bg-surface-container-lowest border border-border-muted rounded-3xl p-6 hover:border-primary-container/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary-container/10 border border-primary-container/30 text-primary-container grid place-items-center mb-4 group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors">
                
              </div>
              <h2 className="font-display font-bold text-xl mb-2">{g.title}</h2>
              <p className="text-sm text-on-surface-variant">{g.body}</p>
              <button className="mt-4 text-sm font-bold text-primary-container hover:underline">
                Read guide →
              </button>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}