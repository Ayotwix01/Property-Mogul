import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";

import { PageSkeleton, usePreload } from "@/components/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { listFavorites, removeFavorite } from "@/lib/favorite.functions";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "My Favorites | Property Mogul" },
      { name: "description", content: "Properties you've saved for later." },
      { property: "og:title", content: "My Favorites | Property Mogul" },
      { property: "og:url", content: "/favorites" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/favorites" }],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const ready = usePreload(300);
  const authState = useAuth();
  const [favProperties, setFavProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const getFavorites = useServerFn(listFavorites);
  const remove = useServerFn(removeFavorite);

  useEffect(() => {
    if (!authState.ready) return;
    if (!authState.authed) {
      setLoading(false);
      return;
    }
    let active = true;
    getFavorites()
      .then((rows) => {
        if (active) setFavProperties(rows.map((row) => ({ ...row.property, ...row })));
      })
      .catch((loadError) => {
        if (active)
          setError(loadError instanceof Error ? loadError.message : "Unable to load favorites.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [authState.authed, authState.ready, getFavorites]);

  const removeFromFavorites = async (id) => {
    setError("");
    try {
      await remove({ data: { propertyId: id } });
      setFavProperties((current) => current.filter((property) => property.id !== id));
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Unable to remove favorite.");
    }
  };

  if (!ready || !authState.ready || loading) return <PageSkeleton />;

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col">
      <header className="fixed top-0 inset-x-0 z-50 bg-surface-glass backdrop-blur-xl border-b border-border-muted">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center px-5 md:px-16 py-4 gap-4">
          <Link to="/" className="font-display font-bold text-primary text-lg">
            Property Mogul
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/browse"
              className="text-on-surface-variant hover:text-primary transition-colors"
            >
              Back to Browse
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-28 pb-20 px-5 md:px-16 max-w-[1400px] mx-auto w-full flex-1">
        <div className="flex items-center gap-3 mb-8">
          <h1 className="font-display font-bold text-3xl md:text-4xl">My Favorites</h1>
          <span className="text-on-surface-variant font-mono-data">({favProperties.length})</span>
        </div>

        {!authState.authed ? (
          <div className="glass-panel rounded-3xl h-[400px] flex flex-col items-center justify-center gap-3 text-on-surface-variant text-center px-6">
            <p className="font-bold text-lg text-on-surface">Log in to view your favorites</p>
            <p className="text-sm max-w-md">
              Saved properties are securely linked to your account.
            </p>
            <Link
              to="/login"
              className="mt-4 bg-primary-container text-on-primary-container px-5 py-2 rounded-xl font-bold text-sm"
            >
              Log in
            </Link>
          </div>
        ) : error ? (
          <div className="glass-panel rounded-3xl h-[400px] flex items-center justify-center text-error text-center px-6">
            {error}
          </div>
        ) : favProperties.length === 0 ? (
          <div className="glass-panel rounded-3xl h-[400px] flex flex-col items-center justify-center gap-3 text-on-surface-variant text-center px-6">
            <p className="font-bold text-lg">No favorites yet</p>
            <p className="text-sm max-w-md">
              Tap the heart on any property in Browse to save it here for later.
            </p>
            <Link
              to="/browse"
              className="mt-4 bg-primary-container text-on-primary-container px-5 py-2 rounded-xl font-bold text-sm hover:brightness-110 transition-all"
            >
              Browse properties
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {favProperties.map((p) => (
              <article
                key={p.id}
                className="group relative flex flex-col bg-surface-container-lowest rounded-3xl overflow-hidden border border-border-muted hover:border-primary-container/30 transition-all"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={p.images?.[0]}
                    alt={p.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                    width={800}
                    height={600}
                  />
                  <button
                    onClick={() => removeFromFavorites(p.id)}
                    aria-label={`Remove ${p.title} from favorites`}
                    className="absolute top-4 right-4 bg-background/40 backdrop-blur-md text-on-surface p-2 rounded-full hover:bg-primary-container hover:text-on-primary-container transition-colors"
                    type="button"
                  >
                    <span className="material-symbols-outlined">favorite</span>
                  </button>
                </div>

                <div className="p-6 flex flex-col gap-2 flex-1">
                  <h3 className="text-xl font-bold truncate">{p.title}</h3>
                  <p className="text-sm text-on-surface-variant truncate">{p.location}</p>
                  <span className="font-mono-data text-primary-container font-bold mt-auto pt-3">
                    {p.price}
                  </span>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <Link
                      to="/property/$id"
                      params={{ id: p.id }}
                      className="text-center bg-surface-container border border-border-muted text-on-surface-variant py-3 rounded-xl font-bold hover:bg-on-surface hover:text-background transition-all"
                    >
                      View Property
                    </Link>

                    <button
                      onClick={() => removeFromFavorites(p.id)}
                      className="text-center bg-surface-container border border-border-muted text-on-surface-variant py-3 rounded-xl font-bold hover:bg-on-surface hover:text-background transition-all"
                      type="button"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
