import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";

import { AiChatWidget } from "@/components/ai-chat-widget";
import { PageSkeleton, usePreload } from "@/components/skeleton";
import { useRole, switchRole } from "@/hooks/use-auth";
import { listOwnProperties } from "@/lib/property.functions";
import {
  listReceivedInquiries,
  listReceivedViewingRequests,
  updateViewingStatus,
} from "@/lib/communication.functions";

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
  const [name] = useState("Owner");
  const [chatOpen, setChatOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [listings, setListings] = useState([]);
  const [listingError, setListingError] = useState("");
  const [inquiries, setInquiries] = useState([]);
  const [inquiryError, setInquiryError] = useState("");
  const [viewings, setViewings] = useState([]);
  const [viewingError, setViewingError] = useState("");
  const [updatingViewing, setUpdatingViewing] = useState("");
  const getOwnProperties = useServerFn(listOwnProperties);
  const getInquiries = useServerFn(listReceivedInquiries);
  const getViewings = useServerFn(listReceivedViewingRequests);
  const updateViewing = useServerFn(updateViewingStatus);

  // Role guard: redirect if not owner
  useEffect(() => {
    if (ready && roleState.ready && !roleState.isOwner) {
      navigate({ to: "/login" });
    }
  }, [ready, roleState.ready, roleState.isOwner, navigate]);

  const verificationApproved = roleState.trustStatus === "VERIFIED";

  useEffect(() => {
    if (!ready || !roleState.ready || !roleState.isOwner) return;
    let active = true;
    getOwnProperties()
      .then((result) => {
        if (active) setListings(result);
      })
      .catch((error) => {
        if (active) {
          setListingError(error instanceof Error ? error.message : "Unable to load your listings.");
        }
      });
    return () => {
      active = false;
    };
  }, [getOwnProperties, ready, roleState.isOwner, roleState.ready]);

  useEffect(() => {
    if (!ready || !roleState.ready || !roleState.isOwner) return;
    let active = true;
    getInquiries()
      .then((result) => active && setInquiries(result))
      .catch(
        (error) =>
          active &&
          setInquiryError(error instanceof Error ? error.message : "Unable to load inquiries."),
      );
    return () => {
      active = false;
    };
  }, [getInquiries, ready, roleState.isOwner, roleState.ready]);

  useEffect(() => {
    if (!ready || !roleState.ready || !roleState.isOwner) return;
    getViewings()
      .then(setViewings)
      .catch((error) =>
        setViewingError(
          error instanceof Error ? error.message : "Unable to load viewing requests.",
        ),
      );
  }, [getViewings, ready, roleState.isOwner, roleState.ready]);

  const handleViewingStatus = async (viewingId, status) => {
    setUpdatingViewing(viewingId);
    try {
      await updateViewing({ data: { viewingId, status } });
      setViewings((current) =>
        current.map((item) => {
          const viewing = item.viewing || item;
          return viewing.id === viewingId ? { ...item, viewing: { ...viewing, status } } : item;
        }),
      );
    } catch (error) {
      setViewingError(error instanceof Error ? error.message : "Unable to update viewing request.");
    } finally {
      setUpdatingViewing("");
    }
  };

  if (!ready) return <PageSkeleton />;

  // Still show loading while checking role
  if (!roleState.ready || !roleState.isOwner) return <PageSkeleton />;

  const stats = [
    {
      label: "Active Listings",
      value: listings.filter((item) => item.status === "PUBLISHED").length,
      delta: "Database total",
    },
    { label: "Portfolio Value", value: "—", delta: "Not calculated" },
    {
      label: "Open Inquiries",
      value: inquiries.filter((item) => (item.inquiry || item).status !== "CLOSED").length,
      delta: "Database total",
    },
    { label: "Occupancy", value: "—", delta: "Coming soon" },
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
                Manage your listings and verification status from one place.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 shrink-0">
              <Link
                to={verificationApproved ? "/owner/listings/new" : "/profile"}
                className="inline-flex items-center gap-2 bg-primary-container text-on-primary-container px-5 py-3 rounded-xl font-bold active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined">
                  {verificationApproved ? "add" : "verified_user"}
                </span>
                {verificationApproved ? "New listing" : "Verify to list"}
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

        {!verificationApproved && (
          <section className="mb-10 rounded-2xl border border-warning/30 bg-warning/10 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display font-bold text-lg">
                Complete verification before listing
              </h2>
              <p className="text-sm text-on-surface-variant mt-1">
                Landlords must pass identity, selfie/liveness, and ownership or authority checks
                before a listing can be published.
              </p>
            </div>
            <Link
              to="/profile"
              className="shrink-0 rounded-xl border border-warning/40 px-4 py-2.5 text-sm font-bold text-warning hover:bg-warning/10"
            >
              Open verification
            </Link>
          </section>
        )}

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
                <h2 className="font-display font-bold text-xl sm:text-2xl">Performance</h2>
                <p className="text-sm text-on-surface-variant">
                  Inquiry and transaction metrics will appear here when those workflows are
                  connected.
                </p>
              </div>
            </div>
            <div className="h-48 rounded-xl border border-dashed border-border-muted flex items-center justify-center text-sm text-on-surface-variant text-center px-6">
              No performance data yet.
            </div>
          </div>

          <div
            id="inquiries"
            className="bg-surface-container-lowest border border-border-muted rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-xl">Recent inquiries</h2>
              <span className="text-xs text-on-surface-variant">{inquiries.length} total</span>
            </div>
            {inquiryError ? (
              <p className="text-sm text-error">{inquiryError}</p>
            ) : inquiries.length === 0 ? (
              <div className="min-h-48 rounded-xl border border-dashed border-border-muted flex items-center justify-center text-sm text-on-surface-variant text-center px-6">
                No inquiries yet.
              </div>
            ) : (
              <div className="space-y-3">
                {inquiries.slice(0, 5).map((inquiry) => (
                  <div key={inquiry.id} className="rounded-xl border border-border-muted p-3">
                    <div className="flex items-center justify-between gap-3 text-xs text-on-surface-variant">
                      <span>Property inquiry</span>
                      <span>{(inquiry.inquiry || inquiry).status}</span>
                    </div>
                    <p className="mt-2 text-sm line-clamp-2">
                      {(inquiry.inquiry || inquiry).message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="mb-10 rounded-2xl border border-border-muted bg-surface-container-lowest p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-bold text-xl">Viewing requests</h2>
              <p className="text-sm text-on-surface-variant">
                Review and respond to scheduled viewings.
              </p>
            </div>
            <span className="text-xs text-on-surface-variant">{viewings.length} total</span>
          </div>
          {viewingError && <p className="mb-3 text-sm text-error">{viewingError}</p>}
          {viewings.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border-muted p-6 text-sm text-on-surface-variant">
              No viewing requests yet.
            </p>
          ) : (
            <div className="space-y-3">
              {viewings.map((item) => {
                const viewing = item.viewing || item;
                return (
                  <div
                    key={viewing.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-muted p-4"
                  >
                    <div>
                      <p className="font-bold">{item.property?.title || "Property viewing"}</p>
                      <p className="text-sm text-on-surface-variant">
                        {item.counterpart?.displayName || "Seeker"} ·{" "}
                        {new Date(viewing.requestedDate).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase text-primary-container">
                        {viewing.status}
                      </span>
                      {viewing.status === "REQUESTED" &&
                        ["ACCEPTED", "DECLINED"].map((status) => (
                          <button
                            key={status}
                            type="button"
                            disabled={updatingViewing === viewing.id}
                            onClick={() => handleViewingStatus(viewing.id, status)}
                            className="rounded-lg border border-border-muted px-3 py-1.5 text-xs font-bold hover:border-primary-container"
                          >
                            {status === "CONFIRMED" ? "Accept" : "Decline"}
                          </button>
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section id="listings" className="mb-10">
          <div className="flex items-end justify-between mb-6 gap-4">
            <div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl">My listings</h2>
              <p className="text-sm text-on-surface-variant">
                Manage your draft and published properties.
              </p>
            </div>
            <Link
              to={verificationApproved ? "/owner/listings/new" : "/profile"}
              className="inline-flex items-center gap-2 bg-primary-container/10 border border-primary-container/30 text-primary-container px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary-container hover:text-on-primary-container transition-colors"
            >
              <span className="material-symbols-outlined">
                {verificationApproved ? "add" : "verified_user"}
              </span>
              {verificationApproved ? "Add" : "Verify"}
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

            {listingError && <div className="px-6 py-5 text-sm text-error">{listingError}</div>}

            {!listingError && listings.length === 0 && (
              <div className="px-6 py-12 text-center text-on-surface-variant">
                <p className="font-bold text-lg text-on-surface">No listings yet</p>
                <p className="text-sm mt-1">
                  Create a draft after your landlord verification is complete.
                </p>
              </div>
            )}

            {listings.map((p) => (
              <div
                key={p.id}
                className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_auto] gap-4 px-4 sm:px-6 py-4 border-b border-border-muted/60 last:border-0 items-center hover:bg-surface-container/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {p.images?.[0] ? (
                    <img
                      src={p.images[0]}
                      alt={p.title}
                      className="w-14 h-14 rounded-xl object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-surface-container shrink-0 grid place-items-center text-on-surface-variant">
                      <span className="material-symbols-outlined">home_work</span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-bold truncate">{p.title}</p>
                    <p className="text-xs text-on-surface-variant truncate">{p.location}</p>
                  </div>
                </div>

                <div className="text-sm font-mono-data text-primary-container">{p.price}</div>
                <div className="text-sm font-mono-data text-on-surface-variant">—</div>

                <div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                      p.status === "PUBLISHED"
                        ? "text-success-cyan border-success-cyan/40 bg-success-cyan/10"
                        : "text-primary-container border-primary-container/40 bg-primary-container/10"
                    }`}
                  >
                    {p.status}
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
                  <Link
                    to="/owner/listings/$id/edit"
                    params={{ id: p.id }}
                    className="p-2 rounded-lg border border-border-muted hover:border-primary-container transition-colors"
                    aria-label={`Edit ${p.title}`}
                  >
                    <span className="material-symbols-outlined">edit</span>
                  </Link>
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
