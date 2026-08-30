import { useEffect, useState } from "react";

export function useAuth() {
  const [authed, setAuthed] = useState(false);
  const [name, setName] = useState(null);

  useEffect(() => {
    const read = () => {
      try {
        setAuthed(localStorage.getItem("pm_authed") === "1");
        setName(localStorage.getItem("pm_user_name"));
      } catch {
        setAuthed(false);
      }
    };
    read();
    window.addEventListener("storage", read);
    return () => window.removeEventListener("storage", read);
  }, []);

  const signOut = () => {
    try {
      localStorage.removeItem("pm_authed");
      localStorage.removeItem("pm_user_name");
      localStorage.removeItem("pm_role");
    } catch {
      /* noop */
    }
    setAuthed(false);
    setName(null);
  };

  return { authed, name, signOut };
}

/**
 * Reads the current user's role(s) from localStorage.
 * Returns { roles: string[], isSeeker: boolean, isOwner: boolean, isBoth: boolean }
 */
export function getRoles() {
  try {
    const raw = localStorage.getItem("pm_role") || "";
    const roles = raw
      .split(",")
      .map((r) => r.trim().toLowerCase())
      .filter(Boolean);
    const isSeeker = roles.includes("seeker");
    const isOwner = roles.includes("owner");
    const activeRole = localStorage.getItem("pm_active_role");
    const isBoth = isSeeker && isOwner;
    return {
      roles,
      isSeeker,
      isOwner,
      isBoth,
      current:
        isBoth && (activeRole === "owner" || activeRole === "seeker")
          ? activeRole
          : isOwner
            ? "owner"
            : isSeeker
              ? "seeker"
              : null,
    };
  } catch {
    return { roles: [], isSeeker: false, isOwner: false, isBoth: false, current: null };
  }
}

/**
 * React hook that listens for role changes.
 */
export function useRole() {
  const [roleState, setRoleState] = useState(getRoles);

  useEffect(() => {
    const update = () => setRoleState(getRoles());
    update();
    window.addEventListener("storage", update);
    return () => window.removeEventListener("storage", update);
  }, []);

  return roleState;
}

/**
 * Switches the user's current active interface between owner/seeker.
 * Only works if user has both roles.
 */
export function switchRole() {
  const { isBoth } = getRoles();
  if (!isBoth) return;
  try {
    const current = localStorage.getItem("pm_active_role") || "seeker";
    const next = current === "owner" ? "seeker" : "owner";
    localStorage.setItem("pm_active_role", next);
    // Dispatch storage event so other tabs/hooks pick it up
    window.dispatchEvent(new Event("storage"));
  } catch {
    // ignore
  }
}
