import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { ThemeToggle } from "@/components/theme-toggle";

const signupSearchSchema = z.object({
  role: z.enum(["owner", "seeker"]).optional(),
});

export const Route = createFileRoute("/signup")({
  validateSearch: signupSearchSchema,
  head: () => ({
    meta: [
      { title: "Create Account | Property Mogul" },
      {
        name: "description",
        content:
          "Create your Property Mogul account and start listing or searching properties.",
      },
    ],
  }),
  component,
});

function Icon({ name, className = "" }: { name; className? }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}
    >
      {name}
    </span>
  );
}

function SignupPage() {
  const { role } = Route.useSearch();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");

  const roleLabel = role === "owner" ? "Property Owner" : role === "seeker" ? "Property Seeker" : null;

  const handleSubmit = (e.FormEvent) => {
    e.preventDefault();
    try {
      if (role) localStorage.setItem("pm_role", role);
      if (name) localStorage.setItem("pm_user_name", name);
      localStorage.setItem("pm_authed", "1");
    } catch {
      // ignore
    }
    navigate({ to: role === "seeker" ? "/seeker" : role === "owner" ? "/owner" : "/browse" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-4 sm:px-8 h-16 border-b border-border-muted">
        
          <div className="w-8 h-8 shrink-0 rounded-lg bg-gradient-to-br from-primary-container to-secondary flex items-center justify-center">
            
          </div>
          <span className="font-display font-bold text-lg truncate">Property Mogul</span>
        </Link>
        
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12 relative overflow-hidden">
        <div className="luminous-bg top-[-20%] right-[-20%]" />
        <div className="luminous-bg bottom-[-20%] left-[-20%]" />

        <div className="w-full max-w-md glass-panel rounded-3xl p-6 sm:p-10 z-10">
          {!role && (
            <div className="mb-6 rounded-xl border border-border-muted bg-surface-container p-4 text-sm text-on-surface-variant">
              Not sure yet?{" "}
              
                Pick your role
              </Link>{" "}
              first for a tailored experience.
            </div>
          )}

          <div className="text-center mb-8">
            {roleLabel && (
              <span className="inline-block mb-3 px-3 py-1 rounded-full bg-primary-container/15 border border-primary-container/30 text-primary-container font-mono-data text-[11px] tracking-widest uppercase">
                {roleLabel}
              </span>
            )}
            <h1 className="text-3xl mb-2 text-primary">Create account</h1>
            <p className="text-on-surface-variant text-sm">
              Join Property Mogul in less than a minute
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-label-caps text-on-surface-variant mb-2">
                Full name
              </label>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-container border border-border-muted focus-within:border-primary-container transition">
                
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="bg-transparent outline-none w-full text-on-surface placeholder:text-outline"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-label-caps text-on-surface-variant mb-2">
                Email
              </label>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-container border border-border-muted focus-within:border-primary-container transition">
                
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="bg-transparent outline-none w-full text-on-surface placeholder:text-outline"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-label-caps text-on-surface-variant mb-2">
                Password
              </label>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-container border border-border-muted focus-within:border-primary-container transition">
                
                <input
                  type={show ? "text" : "password"}
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
                  className="bg-transparent outline-none w-full text-on-surface placeholder:text-outline"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="text-on-surface-variant hover:text-on-surface"
                >
                  
                </button>
              </div>
            </div>

            <label className="flex items-start gap-2 text-xs text-on-surface-variant cursor-pointer">
              <input type="checkbox" required className="accent-primary-container mt-0.5" />
              <span>
                I agree to the{" "}
                <a href="#" className="text-primary-container hover:underline">
                  Terms
                </a>{" "}
                and{" "}
                <a href="#" className="text-primary-container hover:underline">
                  Privacy Policy
                </a>
                .
              </span>
            </label>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-primary-container to-secondary text-on-primary py-3.5 rounded-xl font-bold cyan-glow hover:brightness-110 active:scale-[0.99] transition"
            >
              Create Account
            </button>

            <div className="flex items-center gap-3 text-xs text-on-surface-variant">
              <div className="flex-1 h-px bg-border-muted" />
              OR
              <div className="flex-1 h-px bg-border-muted" />
            </div>

            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border-muted hover:bg-white/5 font-semibold text-sm"
            >
               Sign up with Google
            </button>
          </form>

          <p className="text-center text-sm text-on-surface-variant mt-8">
            Already have an account?{" "}
            
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}