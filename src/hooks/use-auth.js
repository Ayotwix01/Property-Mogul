import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { currentUser, logout as logoutUser } from "@/lib/auth.functions";

export function useAuth() {
  const [authed, setAuthed] = useState(false);
  const [userId, setUserId] = useState(null);
  const [name, setName] = useState(null);
  const [ready, setReady] = useState(false);
  const getUser = useServerFn(currentUser);
  const signOutUser = useServerFn(logoutUser);

  useEffect(() => {
    let active = true;
    const read = async () => {
      try {
        const user = await getUser();
        if (!active) return;
        setAuthed(Boolean(user));
        setUserId(user?.id || null);
        setName(user?.profile?.displayName || user?.email?.split("@")[0] || null);
      } catch {
        if (!active) return;
        setAuthed(false);
        setUserId(null);
        setName(null);
      } finally {
        if (active) setReady(true);
      }
    };
    void read();
    return () => {
      active = false;
    };
  }, [getUser]);

  const signOut = async () => {
    try {
      await signOutUser();
      localStorage.removeItem("pm_authed");
      localStorage.removeItem("pm_user_name");
      localStorage.removeItem("pm_role");
    } catch {
      /* noop */
    }
    setAuthed(false);
    setUserId(null);
    setName(null);
  };

  return { authed, name, ready, signOut, userId };
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
  const [roleState, setRoleState] = useState({
    roles: [],
    isSeeker: false,
    isOwner: false,
    isBoth: false,
    current: null,
    trustStatus: "NOT_STARTED",
    ready: false,
  });
  const getUser = useServerFn(currentUser);

  useEffect(() => {
    let active = true;
    const update = async () => {
      try {
        const user = await getUser();
        if (!active) return;
        const roles = (user?.roles || []).map((role) => role.toLowerCase());
        const isSeeker = roles.includes("seeker");
        const isOwner = roles.includes("landlord");
        const isBoth = isSeeker && isOwner;
        const activeRole = localStorage.getItem("pm_active_role");
        setRoleState({
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
          trustStatus: user?.profile?.trustStatus || "NOT_STARTED",
          ready: true,
        });
      } catch {
        if (active) {
          setRoleState((current) => ({ ...current, ready: true }));
        }
      }
    };
    void update();
    return () => {
      active = false;
    };
  }, [getUser]);

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
