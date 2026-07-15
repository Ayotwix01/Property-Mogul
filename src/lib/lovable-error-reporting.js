type LovableErrorOptions = {
  mechanism?: "manual" | "onerror" | "unhandledrejection" | "react_error_boundary";
  handled?;
  severity?: "error" | "warning" | "info";
};

type LovableEvents = {
  captureException?: (
    error,
    context?<string, unknown>,
    options?,
  ) => void;
};

declare global {
  interface Window {
    __lovableEvents?;
  }
}

export function reportLovableError(error, context<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.__lovableEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context,
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error",
    },
  );
}