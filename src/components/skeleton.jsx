import { useEffect, useState } from "react";

export function Skeleton({ className = "" }) {
  return (
    <div className={`animate-pulse rounded-md bg-surface-container/70 ${className}`} aria-hidden />
  );
}

/**
 * Shows children after a short delay so users see a skeleton on mount.
 * Cheap "preload" feel without a real async loader.
 */
export function usePreload(ms = 500) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return ready;
}

export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-background text-on-surface">
      {/* Nav */}
      <div className="fixed top-0 inset-x-0 z-50 bg-surface-glass backdrop-blur-xl border-b border-border-muted">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between px-5 md:px-16 py-4 gap-4">
          <div className="flex items-center gap-3"></div>
        </div>
      </div>

      <main className="pt-24 pb-20 max-w-[1400px] mx-auto w-full px-5 md:px-16">
        {/* Hero */}

        {/* Filters row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>

        {/* Card grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-3xl border border-border-muted overflow-hidden bg-surface-container-lowest"
            >
              <Skeleton className="h-48" />
              <div className="p-6 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4" />
                <div className="flex gap-3 pt-3">
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 flex-1" />
                </div>
                <div className="grid grid-cols-2 gap-3 pt-4">
                  <Skeleton className="h-8" />
                  <Skeleton className="h-8" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
