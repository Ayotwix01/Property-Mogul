import { useEffect, useState } from "react";

export function useAuth() {
  const [authed, setAuthed] = useState(false);
  const [name, setName] = useState<string | null>(null);

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