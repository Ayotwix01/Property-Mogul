import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";

import { PageSkeleton, usePreload } from "@/components/skeleton";
import { PropertyForm } from "@/components/property-form";
import { useRole } from "@/hooks/use-auth";
import { getOwnProperty, setOwnPropertyStatus, updateOwnProperty } from "@/lib/property.functions";
import {
  addPropertyImage,
  deletePropertyImage,
  listOwnPropertyImages,
} from "@/lib/property-image.functions";

export const Route = createFileRoute("/owner/listings/$id/edit")({
  component: EditListingPage,
});

function EditListingPage() {
  const ready = usePreload(300);
  const roleState = useRole();
  const navigate = useNavigate();
  const { id } = Route.useParams();
  const loadProperty = useServerFn(getOwnProperty);
  const saveProperty = useServerFn(updateOwnProperty);
  const changeStatus = useServerFn(setOwnPropertyStatus);
  const loadImages = useServerFn(listOwnPropertyImages);
  const addImage = useServerFn(addPropertyImage);
  const deleteImage = useServerFn(deletePropertyImage);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState([]);
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (ready && roleState.ready && !roleState.isOwner) navigate({ to: "/login" });
  }, [ready, roleState.ready, roleState.isOwner, navigate]);

  useEffect(() => {
    if (!ready || !roleState.ready || !roleState.isOwner) return;
    let active = true;
    loadProperty({ data: { id } })
      .then((result) => {
        if (active) setProperty(result);
      })
      .catch((loadError) => {
        if (active)
          setError(loadError instanceof Error ? loadError.message : "Unable to load property.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    loadImages({ data: { propertyId: id } })
      .then(setImages)
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [id, loadImages, loadProperty, ready, roleState.isOwner, roleState.ready]);

  if (!ready || !roleState.ready || loading) return <PageSkeleton />;
  if (!roleState.isOwner) return <PageSkeleton />;

  const save = async (data) => {
    setSaving(true);
    setError("");
    try {
      const result = await saveProperty({ data: { id, changes: data } });
      setProperty(result);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save property.");
      throw saveError;
    } finally {
      setSaving(false);
    }
  };

  const saveImage = async (event) => {
    event.preventDefault();
    if (!imageUrl.trim()) return;
    try {
      const image = await addImage({ data: { propertyId: id, imageUrl: imageUrl.trim() } });
      setImages((current) => [...current, image]);
      setImageUrl("");
    } catch (imageError) {
      setError(imageError instanceof Error ? imageError.message : "Unable to add image URL.");
    }
  };

  const removeImage = async (imageId) => {
    try {
      await deleteImage({ data: { imageId } });
      setImages((current) => current.filter((image) => image.id !== imageId));
    } catch (imageError) {
      setError(imageError instanceof Error ? imageError.message : "Unable to remove image.");
    }
  };

  const updateStatus = async (status) => {
    setSaving(true);
    setError("");
    try {
      const result = await changeStatus({ data: { id, status } });
      setProperty(result);
      if (status === "PUBLISHED") navigate({ to: "/owner" });
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : "Unable to update status.");
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
          <h1 className="mt-2 font-display text-3xl font-bold">Edit property</h1>
          <p className="mt-2 text-on-surface-variant">
            Update the listing details stored in your account.
          </p>
        </div>
        {error && (
          <p className="mb-5 rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
            {error}
          </p>
        )}
        {property ? (
          <>
            <PropertyForm
              property={property}
              onSave={save}
              onStatusChange={updateStatus}
              saving={saving}
            />
            <section className="mt-8 rounded-2xl border border-border-muted bg-surface-container-lowest p-6">
              <h2 className="font-display text-xl font-bold">Listing images</h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Add image URLs for now. Object storage upload will be added later.
              </p>
              <form onSubmit={saveImage} className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(event) => setImageUrl(event.target.value)}
                  placeholder="https://example.com/property.jpg"
                  className="min-w-0 flex-1 rounded-xl border border-border-muted bg-background px-4 py-3 text-sm outline-none focus:border-primary-container"
                  required
                />
                <button
                  type="submit"
                  className="rounded-xl bg-primary-container px-4 py-3 text-sm font-bold text-on-primary-container"
                >
                  Add image
                </button>
              </form>
              {images.length > 0 && (
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {images.map((image) => (
                    <div
                      key={image.id}
                      className="relative overflow-hidden rounded-xl border border-border-muted"
                    >
                      <img
                        src={image.imageUrl}
                        alt="Listing"
                        className="aspect-square w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(image.id)}
                        className="absolute right-2 top-2 rounded-lg bg-background/80 px-2 py-1 text-xs font-bold text-error"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : (
          <p className="text-on-surface-variant">{error || "Property not found."}</p>
        )}
      </main>
    </div>
  );
}
