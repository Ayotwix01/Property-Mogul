import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";

import { PageSkeleton, usePreload } from "@/components/skeleton";
import { PropertyForm } from "@/components/property-form";
import { useRole } from "@/hooks/use-auth";
import { createProperty } from "@/lib/property.functions";

export const Route = createFileRoute("/owner/listings/new")({
  component: NewListingPage,
});

function NewListingPage() {
  const ready = usePreload(300);
  const roleState = useRole();
  const navigate = useNavigate();
  const saveProperty = useServerFn(createProperty);
  const [saving, setSaving] = useState(false);
  const [accessError, setAccessError] = useState("");

  useEffect(() => {
    if (ready && roleState.ready && !roleState.isOwner) navigate({ to: "/login" });
  }, [ready, roleState.ready, roleState.isOwner, navigate]);

  if (!ready || !roleState.ready) return <PageSkeleton />;
  if (!roleState.isOwner) return <PageSkeleton />;

  const save = async (data) => {
    setSaving(true);
    setAccessError("");
    try {
      await saveProperty({ data });
      navigate({ to: "/owner" });
    } catch (error) {
      setAccessError(error instanceof Error ? error.message : "Unable to create property.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <main className="mx-auto max-w-4xl px-5 py-10 md:px-10">
        <Link to="/owner" className="text-sm text-on-surface-variant hover:text-primary">
          ← Back to owner dashboard
        </Link>
        <div className="mb-8 mt-8">
          <p className="text-xs font-mono-data uppercase tracking-widest text-primary-container">
            Owner listing
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold">Create a property draft</h1>
          <p className="mt-2 text-on-surface-variant">
            Add accurate property details. Publishing remains blocked until identity verification is
            complete.
          </p>
        </div>
        {accessError && <p className="mb-5 text-sm text-error">{accessError}</p>}
        <PropertyForm onSave={save} saving={saving} />
      </main>
    </div>
  );
}
