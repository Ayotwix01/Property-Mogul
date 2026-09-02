import { useEffect, useState } from "react";

const emptyValues = {
  title: "",
  description: "",
  propertyType: "Apartment",
  listingType: "RENT",
  price: "",
  rentPeriod: "per year",
  bedrooms: "",
  bathrooms: "",
  toilets: "",
  squareFeet: "",
  address: "",
  neighborhood: "",
  city: "",
  state: "Lagos",
  amenities: "",
};

function toFormValues(property) {
  if (!property) return emptyValues;
  return {
    ...emptyValues,
    title: property.title || "",
    description: property.description || "",
    propertyType: property.propertyType || property.category || "Apartment",
    listingType: property.listingType || "RENT",
    price: property.price ? String(property.price) : "",
    rentPeriod: property.rentPeriod || "per year",
    bedrooms: property.bedrooms ?? property.beds ?? "",
    bathrooms: property.bathrooms ?? property.baths ?? "",
    toilets: property.toilets ?? "",
    squareFeet: property.squareFeet ?? property.sqft ?? "",
    address: property.address || "",
    neighborhood: property.neighborhood || "",
    city: property.city || "",
    state: property.state || "Lagos",
    amenities: Array.isArray(property.amenities) ? property.amenities.join(", ") : "",
  };
}

function toPayload(values) {
  const payload = {
    title: values.title.trim(),
    description: values.description.trim() || undefined,
    propertyType: values.propertyType.trim(),
    listingType: values.listingType,
    price: Number(values.price),
    currency: "NGN",
    rentPeriod: values.rentPeriod.trim() || undefined,
    address: values.address.trim() || undefined,
    neighborhood: values.neighborhood.trim() || undefined,
    city: values.city.trim(),
    state: values.state.trim(),
    amenities: values.amenities
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  };

  for (const [key, value] of [
    ["bedrooms", values.bedrooms],
    ["bathrooms", values.bathrooms],
    ["toilets", values.toilets],
    ["squareFeet", values.squareFeet],
  ]) {
    if (String(value).trim()) payload[key] = Number(value);
  }

  return payload;
}

export function PropertyForm({ property, onSave, onStatusChange, saving = false }) {
  const [values, setValues] = useState(() => toFormValues(property));
  const [error, setError] = useState("");

  useEffect(() => {
    setValues(toFormValues(property));
  }, [property]);

  const update = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await onSave(toPayload(values));
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save property.");
    }
  };

  const inputClass =
    "w-full rounded-xl border border-border-muted bg-surface-container px-3 py-2.5 text-sm outline-none focus:border-primary-container";

  return (
    <form onSubmit={submit} className="space-y-6">
      {error && (
        <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="md:col-span-2 text-sm font-bold">
          Title
          <input
            className={inputClass}
            name="title"
            value={values.title}
            onChange={update}
            required
          />
        </label>
        <label className="md:col-span-2 text-sm font-bold">
          Description
          <textarea
            className={inputClass}
            name="description"
            value={values.description}
            onChange={update}
            rows={5}
          />
        </label>
        <label className="text-sm font-bold">
          Property type
          <input
            className={inputClass}
            name="propertyType"
            value={values.propertyType}
            onChange={update}
            required
          />
        </label>
        <label className="text-sm font-bold">
          Listing type
          <select
            className={inputClass}
            name="listingType"
            value={values.listingType}
            onChange={update}
          >
            <option value="RENT">Rent</option>
            <option value="SALE">Sale</option>
          </select>
        </label>
        <label className="text-sm font-bold">
          Price (₦)
          <input
            className={inputClass}
            name="price"
            type="number"
            min="1"
            value={values.price}
            onChange={update}
            required
          />
        </label>
        <label className="text-sm font-bold">
          Rent period
          <input
            className={inputClass}
            name="rentPeriod"
            value={values.rentPeriod}
            onChange={update}
          />
        </label>
        <label className="text-sm font-bold">
          Bedrooms
          <input
            className={inputClass}
            name="bedrooms"
            type="number"
            min="0"
            value={values.bedrooms}
            onChange={update}
          />
        </label>
        <label className="text-sm font-bold">
          Bathrooms
          <input
            className={inputClass}
            name="bathrooms"
            type="number"
            min="0"
            value={values.bathrooms}
            onChange={update}
          />
        </label>
        <label className="text-sm font-bold">
          Size (sq ft)
          <input
            className={inputClass}
            name="squareFeet"
            type="number"
            min="1"
            value={values.squareFeet}
            onChange={update}
          />
        </label>
        <label className="text-sm font-bold">
          Toilets
          <input
            className={inputClass}
            name="toilets"
            type="number"
            min="0"
            value={values.toilets}
            onChange={update}
          />
        </label>
        <label className="text-sm font-bold">
          Amenities
          <input
            className={inputClass}
            name="amenities"
            value={values.amenities}
            onChange={update}
            placeholder="Parking, Generator"
          />
        </label>
        <label className="text-sm font-bold">
          Address
          <input className={inputClass} name="address" value={values.address} onChange={update} />
        </label>
        <label className="text-sm font-bold">
          Area / neighborhood
          <input
            className={inputClass}
            name="neighborhood"
            value={values.neighborhood}
            onChange={update}
          />
        </label>
        <label className="text-sm font-bold">
          City
          <input
            className={inputClass}
            name="city"
            value={values.city}
            onChange={update}
            required
          />
        </label>
        <label className="text-sm font-bold">
          State
          <input
            className={inputClass}
            name="state"
            value={values.state}
            onChange={update}
            required
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-primary-container px-5 py-3 font-bold text-on-primary-container disabled:opacity-60"
        >
          {saving ? "Saving…" : property ? "Save changes" : "Save draft"}
        </button>
        {property && property.status !== "ARCHIVED" && (
          <button
            type="button"
            disabled={saving}
            onClick={() =>
              onStatusChange(property.status === "PUBLISHED" ? "UNPUBLISHED" : "PUBLISHED")
            }
            className="rounded-xl border border-border-muted px-5 py-3 font-bold disabled:opacity-60"
          >
            {property.status === "PUBLISHED" ? "Unpublish" : "Publish"}
          </button>
        )}
      </div>
    </form>
  );
}
