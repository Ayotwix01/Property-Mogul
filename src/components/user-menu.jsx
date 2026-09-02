import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";

/**
 * Account dropdown for authenticated users.
 *
 * - Click avatar to open.
 * - Closes on outside click / Escape.
 * - Calls the same signOut() used elsewhere (clears session + pm_* keys).
 */
export function UserMenu({ className = "" }) {
  const { name, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleSignOut = async () => {
    setOpen(false);
    try {
      await signOut();
    } finally {
      try {
        localStorage.removeItem("pm_authed");
        localStorage.removeItem("pm_user_name");
        localStorage.removeItem("pm_user_email");
        localStorage.removeItem("pm_role");
        localStorage.removeItem("pm_active_role");
      } catch {
        /* noop */
      }
      navigate({ to: "/" });
    }
  };

  const initial = (name && name.charAt(0).toUpperCase()) || "?";

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        aria-label="Open account menu"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
        className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-container to-secondary grid place-items-center text-on-primary-container font-bold text-sm"
      >
        {initial}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 rounded-xl border border-border-muted bg-surface-container-lowest shadow-xl overflow-hidden z-50"
        >
          <div className="px-4 py-3 border-b border-border-muted">
            <p className="text-sm font-bold truncate">{name || "Account"}</p>
            <p className="text-xs text-on-surface-variant">Signed in</p>
          </div>
          <nav className="flex flex-col py-1">
            <Link
              role="menuitem"
              to="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-white/5 transition-colors"
            >
              <span className="material-symbols-outlined text-base">person</span>
              Profile
            </Link>
            <Link
              role="menuitem"
              to="/messages"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-white/5 transition-colors"
            >
              <span className="material-symbols-outlined text-base">chat</span>
              Messages
            </Link>
            <Link
              role="menuitem"
              to="/favorites"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-white/5 transition-colors"
            >
              <span className="material-symbols-outlined text-base">favorite</span>
              Saved
            </Link>
          </nav>
          <div className="border-t border-border-muted py-1">
            <button
              role="menuitem"
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-2 text-sm w-full text-left hover:bg-white/5 transition-colors text-error"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
