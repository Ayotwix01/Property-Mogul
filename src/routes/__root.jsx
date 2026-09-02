import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link to="/" className="text-primary-container hover:underline">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    console.error("Boundary error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

const queryClient = new QueryClient();

export const Route = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Property Mogul | Modern Real Estate Marketplace" },
      {
        name: "description",
        content:
          "The smarter way to find your next home or list your property. Premium verified listings, direct connections, seamless experience.",
      },
      { property: "og:title", content: "Property Mogul | Modern Real Estate Marketplace" },
      {
        property: "og:description",
        content: "Modern real estate for everyone. Find, list, and connect seamlessly.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&family=Inter:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap",
      },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

const themeInitScript = `(function(){try{var t=localStorage.getItem('theme');if(!t){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}if(t==='dark'){document.documentElement.classList.add('dark');}}catch(e){document.documentElement.classList.add('dark');}})();`;

function RouteProgress() {
  const isLoading = useRouterState({ select: (s) => s.isLoading || s.isTransitioning });
  return (
    <div
      aria-hidden
      className={`fixed top-0 inset-x-0 h-0.5 z-[200] pointer-events-none transition-opacity duration-200 ${
        isLoading ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="h-full w-1/3 bg-primary-container animate-[route-progress_1.2s_ease-in-out_infinite]" />
    </div>
  );
}

function SafetyNotice() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[90] mx-auto max-w-2xl rounded-2xl border border-warning/30 bg-surface-container-lowest/95 px-4 py-3 shadow-2xl backdrop-blur-xl">
      <div className="flex items-start gap-3">
        <span className="material-symbols-outlined text-warning">shield</span>
        <p className="flex-1 text-xs leading-relaxed text-on-surface-variant">
          <strong className="text-on-surface">Stay safe:</strong> Inspect the property and verify
          the person’s authority before paying. Never share OTPs or send money to an unrelated
          account.
        </p>
        <button
          type="button"
          onClick={() => setVisible(false)}
          aria-label="Dismiss safety notice"
          className="text-on-surface-variant hover:text-on-surface"
        >
          <span className="material-symbols-outlined text-base">close</span>
        </button>
      </div>
    </div>
  );
}

function RootComponent({ children }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <RouteProgress />
          <Outlet />
          {children}
          <SafetyNotice />
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  );
}
