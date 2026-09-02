import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";

import { AiChatWidget } from "@/components/ai-chat-widget";
import { PageSkeleton, usePreload } from "@/components/skeleton";
import { getPublishedProperty } from "@/lib/property.functions";
import { createInquiry, createReport } from "@/lib/communication.functions";
import { useAuth } from "@/hooks/use-auth";
import {
  createContactPayment,
  getContactAccessPrice,
  getLandlordContact,
} from "@/lib/contact-access.functions";

export const Route = createFileRoute("/property/$id")({
  loader: async ({ params }) => {
    try {
      const property = await getPublishedProperty({ data: { id: params.id } });
      return { property };
    } catch {
      throw notFound();
    }
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Property not found | Property Mogul" },
          { name: "robots", content: "noindex" },
        ],
      };
    }

    const { property } = loaderData;
    return {
      meta: [
        { title: `${property.title} | Property Mogul` },
        {
          name: "description",
          content: property.description?.slice(0, 155) ?? "Property listing.",
        },
        { property: "og:title", content: `${property.title} | Property Mogul` },
        {
          property: "og:description",
          content: property.description?.slice(0, 155) ?? "Property listing.",
        },
        { property: "og:image", content: property.images?.[0] },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: property.images?.[0] },
      ],
      links: [{ rel: "canonical", href: `/property/${property.id}` }],
    };
  },
  component: PropertyDetailPage,
});

function PropertyDetailPage() {
  const ready = usePreload(400);
  const { property } = Route.useLoaderData();
  const navigate = useNavigate();
  const authState = useAuth();
  const sendInquiry = useServerFn(createInquiry);
  const reportProperty = useServerFn(createReport);
  const startPayment = useServerFn(createContactPayment);
  const loadPrice = useServerFn(getContactAccessPrice);
  const loadContact = useServerFn(getLandlordContact);

  const [tab, setTab] = useState("description");
  const [activeImage, setActiveImage] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [tourModalOpen, setTourModalOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messageSent, setMessageSent] = useState(false);
  const [inquiryError, setInquiryError] = useState("");
  const [inquirySending, setInquirySending] = useState(false);
  const [contactPrice, setContactPrice] = useState(null);
  const [contact, setContact] = useState(null);
  const [contactState, setContactState] = useState("");
  const [reportState, setReportState] = useState("");

  const others = [];

  const submitInquiry = async (event) => {
    event.preventDefault();
    if (!authState.ready || !authState.authed) {
      navigate({ to: "/login" });
      return;
    }
    if (!messageText.trim()) return;
    setInquirySending(true);
    setInquiryError("");
    try {
      await sendInquiry({ data: { propertyId: property.id, message: messageText } });
      setMessageSent(true);
      setMessageText("");
    } catch (error) {
      setInquiryError(error instanceof Error ? error.message : "Unable to send inquiry.");
    } finally {
      setInquirySending(false);
    }
  };

  useEffect(() => {
    setActiveImage(0);
  }, [property.id]);

  const images = property.images ?? [];

  useEffect(() => {
    if (!authState.ready || !authState.authed) return;
    loadPrice()
      .then(setContactPrice)
      .catch(() => undefined);
    loadContact({ data: { propertyId: property.id } })
      .then(setContact)
      .catch(() => undefined);
  }, [authState.authed, authState.ready, loadContact, loadPrice, property.id]);

  const unlockContact = async () => {
    if (!authState.authed) {
      navigate({ to: "/login" });
      return;
    }
    setContactState("Initializing secure Paystack checkout…");
    try {
      const result = await startPayment({ data: { propertyId: property.id } });
      if (result.alreadyGranted) {
        setContactState("Contact access already granted. Refreshing…");
        setContact(await loadContact({ data: { propertyId: property.id } }));
      } else if (result.authorizationUrl) {
        setContactState("Redirecting to Paystack…");
        window.location.assign(result.authorizationUrl);
      }
    } catch (error) {
      setContactState(error instanceof Error ? error.message : "Unable to initialize payment.");
    }
  };

  if (!ready) return <PageSkeleton />;

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col">
      <header className="fixed top-0 inset-x-0 z-50 bg-surface-glass backdrop-blur-xl border-b border-border-muted">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center px-5 md:px-16 py-4 gap-4">
          <Link to="/" className="font-display font-bold text-primary">
            Property Mogul
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/browse"
              className="text-on-surface-variant hover:text-primary transition-colors"
            >
              Properties
            </Link>
            <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">
              Agents
            </a>
            <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">
              Resources
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setChatOpen(true)}
              aria-label="Assistant"
              className="p-2 rounded-lg text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">smart_toy</span>
            </button>

            <Link
              to="/browse"
              className="hidden md:inline-flex text-on-surface-variant hover:text-primary transition-colors"
            >
              Browse
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-20 px-5 md:px-16 max-w-[1400px] mx-auto w-full flex-1">
        <div className="mb-6">
          <Link
            to="/browse"
            className="text-on-surface-variant hover:text-primary transition-colors"
          >
            Back to browse
          </Link>
        </div>

        <div className="mb-10 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] md:items-end gap-6">
          <div className="min-w-0">
            <div className="flex gap-2 mb-4 flex-wrap">
              {property.tags?.map((t) => (
                <span
                  key={t.label}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${
                    t.tone === "success"
                      ? "bg-success-cyan/10 border-success-cyan text-success-cyan"
                      : "bg-primary/10 border-primary text-primary-container"
                  }`}
                >
                  {t.label}
                </span>
              ))}
              <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border border-white/10 bg-background/60">
                {property.category}
              </span>
            </div>

            <h1 className="font-display font-bold text-3xl sm:text-5xl mb-2 tracking-tight">
              {property.title}
            </h1>

            <div className="flex items-center gap-2 text-on-surface-variant min-w-0">
              <span className="truncate">{property.address}</span>
            </div>
          </div>

          <div className="flex gap-3 shrink-0">
            <div className="glass-panel p-4 rounded-xl text-center min-w-[120px]">
              <p className="text-[10px] tracking-widest uppercase text-on-surface-variant mb-1">
                Price
              </p>
              <p className="font-mono-data text-xl text-primary-container font-bold">
                {property.price}
              </p>
              <p className="text-[10px] text-on-surface-variant mt-0.5">{property.priceUnit}</p>
            </div>
            <div className="glass-panel p-4 rounded-xl text-center min-w-[120px]">
              <p className="text-[10px] tracking-widest uppercase text-on-surface-variant mb-1">
                Total Units
              </p>
              <p className="font-mono-data text-xl text-primary-container font-bold">
                {property.totalUnits}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6 min-w-0">
            <div className="grid grid-cols-4 grid-rows-2 gap-3 h-[320px] md:h-[520px]">
              <button
                type="button"
                onClick={() => setActiveImage(0)}
                className="col-span-4 md:col-span-3 row-span-2 relative overflow-hidden rounded-2xl group cursor-pointer"
              >
                <img
                  alt={property.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src={images[activeImage] ?? images[0]}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </button>

              {images.slice(0, 2).map((img, i) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`hidden md:block col-span-1 row-span-1 relative overflow-hidden rounded-2xl group cursor-pointer border-2 transition-colors ${
                    activeImage === i ? "border-primary-container" : "border-transparent"
                  }`}
                >
                  <img
                    alt={`${property.title} view ${i + 1}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    src={img}
                  />
                  {i === 1 && images.length > 2 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="font-bold text-white">+{images.length - 2} Photos</span>
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="glass-panel p-6 sm:p-8 rounded-2xl">
              <div className="flex gap-6 border-b border-border-muted mb-6 overflow-x-auto">
                {[
                  ["description", "Description"],
                  ["features", "Features"],
                  ["floor", "Floor Plans"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTab(key)}
                    className={`pb-3 whitespace-nowrap font-bold transition-colors ${
                      tab === key
                        ? "text-primary-container border-b-2 border-primary-container"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {tab === "description" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Reimagining Urban Living</h2>
                  <p className="text-on-surface-variant leading-relaxed">{property.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4">
                    {[
                      ["YEAR BUILT", String(property.yearBuilt)],
                      ["TOTAL UNITS", String(property.totalUnits)],
                      ["PET FRIENDLY", property.petFriendly],
                      ["CERTIFICATION", property.certification],
                    ].map(([label, value]) => (
                      <div key={label} className="flex flex-col">
                        <span className="text-[10px] tracking-widest uppercase text-on-surface-variant">
                          {label}
                        </span>
                        <span className="font-mono-data text-on-surface">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tab === "features" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {property.specs?.map((s) => (
                    <div
                      key={s.label}
                      className="flex items-center gap-3 p-4 rounded-xl bg-surface-container border border-border-muted"
                    >
                      <span>{s.label}</span>
                    </div>
                  ))}
                </div>
              )}

              {tab === "floor" && (
                <div className="text-center py-12 text-on-surface-variant">
                  <p className="font-bold">Floor plans available on tour</p>
                  <p className="text-sm mt-1">Schedule a visit to view detailed plans.</p>
                </div>
              )}
            </div>

            <div className="glass-panel p-6 sm:p-8 rounded-2xl">
              <h3 className="text-2xl font-bold mb-4">Neighborhood Insight</h3>
              <div className="w-full h-72 rounded-xl overflow-hidden relative bg-surface-container-high">
                <iframe
                  title="Map"
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(property.address)}&output=embed`}
                />
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-on-surface-variant">
                Traffic Score: <span className="text-on-surface font-bold">85</span> (Commuter's
                Hub)
              </div>
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border-primary-container/20">
              <h3 className="text-xl font-bold mb-5">Take the Next Step</h3>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setTourModalOpen(true)}
                  className="w-full py-3.5 rounded-xl font-bold text-on-primary bg-gradient-to-r from-primary-container to-secondary hover:brightness-110 active:scale-[0.99] transition"
                >
                  Schedule a Tour
                </button>
                <button
                  type="button"
                  onClick={() => document.getElementById("contact-form")?.focus()}
                  className="w-full py-3.5 rounded-xl font-bold text-primary-container border border-primary-container hover:bg-primary-container/10 active:scale-[0.99] transition"
                >
                  Contact Landlord
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!authState.authed) {
                      navigate({ to: "/login" });
                      return;
                    }
                    if (!window.confirm("Report this listing for moderation review?")) return;
                    try {
                      await reportProperty({
                        data: {
                          targetType: "PROPERTY",
                          targetId: property.id,
                          category: "OTHER",
                          description: "Reported from the property details page.",
                        },
                      });
                      setReportState("Listing reported to the moderation team.");
                    } catch (error) {
                      setReportState(
                        error instanceof Error ? error.message : "Unable to report listing.",
                      );
                    }
                  }}
                  className="w-full py-2 text-xs font-bold text-warning hover:underline"
                >
                  Report this listing
                </button>
                {reportState && <p className="text-xs text-on-surface-variant">{reportState}</p>}
              </div>

              <div className="pt-6 mt-6 border-t border-border-muted">
                <p className="text-[10px] tracking-widest uppercase text-on-surface-variant mb-3">
                  Contact Owner
                </p>
                <div className="flex items-start gap-3 mb-5">
                  <div className="w-12 h-12 shrink-0 rounded-full bg-surface-container-high flex items-center justify-center border border-border-muted text-primary-container font-bold text-lg">
                    {property.owner?.name?.charAt(0) || "O"}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold truncate">{property.owner?.name}</p>
                    <p className="text-xs text-on-surface-variant">{property.owner?.title}</p>
                    <p className="text-xs text-success-cyan">Identity Verified</p>
                    {contact ? (
                      <div className="mt-3 space-y-1 text-sm">
                        {contact.phone && (
                          <a className="block text-primary-container" href={`tel:${contact.phone}`}>
                            {contact.phone}
                          </a>
                        )}
                        {contact.whatsapp && (
                          <a
                            className="block text-primary-container"
                            href={`https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`}
                          >
                            Open WhatsApp
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="mt-3 rounded-xl border border-warning/30 bg-warning/10 p-3 text-xs text-on-surface-variant">
                        <p>Landlord contact details are protected.</p>
                        {contactPrice && (
                          <p className="mt-1 font-bold text-on-surface">
                            Unlock for ₦{contactPrice.amount.toLocaleString()}
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={unlockContact}
                          className="mt-3 rounded-lg bg-primary-container px-3 py-2 font-bold text-on-primary-container"
                        >
                          Unlock landlord contact
                        </button>
                        {contactState && <p className="mt-2">{contactState}</p>}
                      </div>
                    )}
                  </div>
                </div>

                <form className="space-y-3" id="contact-form" onSubmit={submitInquiry}>
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Write a message..."
                    className="w-full bg-background border border-border-muted rounded-xl p-3 text-sm focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none resize-none min-h-[80px]"
                    rows={3}
                  />
                  {inquiryError && <p className="text-xs text-error">{inquiryError}</p>}
                  <button
                    type="submit"
                    disabled={!messageText.trim() || inquirySending}
                    className="w-full py-3 bg-surface-container-highest hover:bg-surface-variant transition-colors font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {inquirySending ? "Sending…" : messageSent ? "Inquiry Sent! ✓" : "Send Inquiry"}
                  </button>
                </form>
              </div>
            </div>

            {/* Tour modal */}
            {tourModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                  className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                  onClick={() => setTourModalOpen(false)}
                />
                <div className="relative bg-surface-container-lowest border border-border-muted rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold">Schedule a Tour</h3>
                    <button
                      type="button"
                      onClick={() => setTourModalOpen(false)}
                      className="p-1 rounded-lg hover:bg-surface-container transition-colors"
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!authState.ready || !authState.authed) {
                        navigate({ to: "/login" });
                        return;
                      }
                      const formData = new FormData(e.target);
                      const date = formData.get("tour-date");
                      const time = formData.get("tour-time");
                      const requestedDate = new Date(`${date}T${time}`);
                      if (Number.isNaN(requestedDate.getTime())) {
                        throw new Error("Choose a valid viewing date and time.");
                      }
                      try {
                        await sendInquiry({
                          data: {
                            propertyId: property.id,
                            message: "I would like to schedule a viewing at " + time + ".",
                            requestedDate,
                          },
                        });
                        setTourModalOpen(false);
                        setMessageSent(true);
                      } catch (error) {
                        setInquiryError(
                          error instanceof Error ? error.message : "Unable to request viewing.",
                        );
                      }
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-bold mb-1">Preferred Date</label>
                      <input
                        type="date"
                        name="tour-date"
                        required
                        className="w-full bg-background border border-border-muted rounded-xl p-3 text-sm focus:border-primary-container outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1">Preferred Time</label>
                      <input
                        type="time"
                        name="tour-time"
                        required
                        className="w-full bg-background border border-border-muted rounded-xl p-3 text-sm focus:border-primary-container outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-xl font-bold text-on-primary bg-gradient-to-r from-primary-container to-secondary hover:brightness-110 active:scale-[0.99] transition"
                    >
                      Request Tour
                    </button>
                  </form>
                </div>
              </div>
            )}

            <div className="glass-panel p-6 rounded-2xl space-y-3">
              <h4 className="text-[10px] tracking-widest uppercase text-on-surface-variant">
                Quick Links
              </h4>
              {[
                { title: "Floor Plans & Pricing", sub: "Available Models" },
                { title: "Neighborhood Guide", sub: "Local amenities" },
                { title: "Owner Documents", sub: "Verified paperwork" },
              ].map((q) => (
                <button
                  key={q.title}
                  type="button"
                  className="w-full flex items-center justify-between p-4 bg-surface-container rounded-xl hover:bg-surface-container-high transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium">{q.title}</p>
                      <p className="text-xs text-on-surface-variant">{q.sub}</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant">
                    chevron_right
                  </span>
                </button>
              ))}
            </div>
          </aside>
        </div>

        <section className="mt-16">
          <h2 className="font-display font-bold text-2xl sm:text-3xl mb-6">Similar properties</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {others.map((p) => (
              <div
                key={p.id}
                className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-border-muted"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={p.images?.[0]}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-bold mb-1 group-hover:text-primary-container transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-sm text-on-surface-variant truncate">{p.location}</p>
                  <p className="mt-3 font-mono-data text-primary-container font-bold">{p.price}</p>
                  <div className="mt-4">
                    <Link
                      to="/property/$id"
                      params={{ id: p.id }}
                      className="inline-flex items-center gap-2 text-primary-container hover:underline"
                    >
                      View
                      <span className="material-symbols-outlined">open_in_new</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="w-full bg-surface-container-lowest border-t border-border-muted py-8 px-5 md:px-16 text-center text-sm text-on-surface-variant">
        © 2026 Property Mogul. Premium Real Estate Search.
      </footer>

      <AiChatWidget open={chatOpen} onOpenChange={setChatOpen} />
    </div>
  );
}
