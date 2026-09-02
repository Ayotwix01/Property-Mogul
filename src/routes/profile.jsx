import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth, useRole } from "@/hooks/use-auth";
import { useServerFn } from "@tanstack/react-start";
import {
  createIdentityVerificationSession,
  getIdentityVerificationStatus,
  requestManualVerification,
} from "@/lib/verification.functions";
import { getMyProfile, updateMyProfile } from "@/lib/profile.functions";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Trust Profile | Property Mogul" },
      {
        name: "description",
        content: "Manage the information you choose to share and request account verification.",
      },
    ],
  }),
  component: TrustProfilePage,
});

function TrustProfilePage() {
  const navigate = useNavigate();
  const { authed, name, ready: authReady } = useAuth();
  const roleState = useRole();
  const [profile, setProfile] = useState({});
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [manualStatus, setManualStatus] = useState("");
  const [biometricConsent, setBiometricConsent] = useState(false);
  const [verificationSession, setVerificationSession] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const createSession = useServerFn(createIdentityVerificationSession);
  const getStatus = useServerFn(getIdentityVerificationStatus);
  const getProfile = useServerFn(getMyProfile);
  const updateProfile = useServerFn(updateMyProfile);
  const createManualRequest = useServerFn(requestManualVerification);

  useEffect(() => {
    if (authReady && !authed) navigate({ to: "/login" });
    if (!authReady || !authed) return;
    let active = true;
    setProfileLoading(true);
    getProfile()
      .then((result) => {
        if (!active) return;
        const savedProfile = result.profile || {};
        const disclosure =
          savedProfile.disclosure && typeof savedProfile.disclosure === "object"
            ? savedProfile.disclosure
            : {};
        setProfile({
          ...disclosure,
          name: savedProfile.displayName || name || "",
          phone: savedProfile.phone || "",
          bio: savedProfile.bio || "",
          location: savedProfile.location || "",
        });
        setVerificationStatus(savedProfile.trustStatus || "");
      })
      .catch((error) => {
        if (active) {
          setProfileError(error instanceof Error ? error.message : "Unable to load profile.");
        }
      })
      .finally(() => {
        if (active) setProfileLoading(false);
      });
    try {
      setVerificationSession(localStorage.getItem("pm_identity_session"));
    } catch {
      // Keep the page usable when browser storage is unavailable.
    }
    return () => {
      active = false;
    };
  }, [authed, authReady, getProfile, navigate, name]);

  const update = (field, value) => {
    setProfile((current) => ({ ...current, [field]: value }));
    setSaved(false);
  };

  const save = async (event) => {
    event.preventDefault();
    setProfileError("");
    try {
      const { name: displayName, phone, bio, location, ...disclosure } = profile;
      await updateProfile({
        data: { displayName: displayName || name || "", phone, bio, location, disclosure },
      });
      setSaved(true);
      setMessage("Your profile was saved.");
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "Unable to save profile.");
    }
  };

  const requestReview = async () => {
    setProfileError("");
    try {
      const result = await createManualRequest({
        data: {
          type: isOwner ? "PROPERTY" : "IDENTITY",
          metadata: {
            location: profile.location || profile.propertyCity || "",
            ownershipType: profile.ownershipType || "",
          },
        },
      });
      setManualStatus(result.status);
      setMessage("Manual review requested. Status: " + result.status.toLowerCase());
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "Unable to request manual review.");
    }
  };

  const startIdentityVerification = async () => {
    if (!biometricConsent) return;
    setVerificationError("");
    try {
      const storedVendorId = localStorage.getItem("pm_verification_vendor_id");
      const vendorData =
        storedVendorId || (crypto.randomUUID ? crypto.randomUUID() : "pm-" + Date.now());
      localStorage.setItem("pm_verification_vendor_id", vendorData);
      const result = await createSession({ data: { vendorData } });
      localStorage.setItem("pm_identity_session", result.sessionId);
      setVerificationSession(result.sessionId);
      window.open(result.url, "_blank", "noopener,noreferrer");
      setMessage("Verification opened in a new tab. Return here when you finish.");
    } catch (error) {
      setVerificationError(
        error instanceof Error ? error.message : "Unable to start verification.",
      );
    }
  };

  const refreshIdentityStatus = async () => {
    if (!verificationSession) return;
    setVerificationError("");
    try {
      const result = await getStatus({ data: { sessionId: verificationSession } });
      setVerificationStatus(result.status);
      setMessage("Identity verification status: " + result.status);
    } catch (error) {
      setVerificationError(
        error instanceof Error ? error.message : "Unable to refresh verification.",
      );
    }
  };

  if (!authReady || !authed) return null;

  const isOwner = roleState.isOwner;
  const isSeeker = roleState.isSeeker;

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <header className="border-b border-border-muted bg-surface-glass backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
          <Link to="/" className="font-display font-bold text-primary">
            Property Mogul
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/browse" className="text-sm text-on-surface-variant hover:text-primary">
              Browse
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 py-10 space-y-6">
        <div>
          <p className="font-label-caps text-xs tracking-widest text-primary-container uppercase">
            Trust profile
          </p>
          <h1 className="font-display font-bold text-3xl mt-2">Share with confidence</h1>
          <p className="text-on-surface-variant mt-2 max-w-2xl">
            Choose the information that helps the other party understand you. Private documents are
            never shown publicly in this prototype.
          </p>
        </div>

        <div className="rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm leading-relaxed">
          <strong>Safety and privacy:</strong> Property Mogul should only collect information needed
          to support a rental decision. Never share passwords, OTPs, or unnecessary identity details
          in chat.
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <form
            onSubmit={save}
            className="rounded-2xl border border-border-muted bg-surface-container-lowest p-6 space-y-5"
          >
            <h2 className="font-display font-bold text-xl">Information you choose to share</h2>
            <p className="text-sm text-on-surface-variant">
              Account roles: {roleState.roles.join(", ") || "Loading…"}
            </p>
            {profileLoading && <p className="text-sm text-on-surface-variant">Loading profile…</p>}

            {isSeeker && (
              <section className="space-y-4">
                <h3 className="text-sm font-bold text-primary-container">Seeker details</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Occupation category"
                    value={profile.occupation}
                    onChange={(value) => update("occupation", value)}
                    placeholder="Professional, business owner…"
                  />
                  <Field
                    label="Income range"
                    value={profile.incomeRange}
                    onChange={(value) => update("incomeRange", value)}
                    placeholder="Optional"
                  />
                  <Field
                    label="Yearly rental budget"
                    value={profile.budget}
                    onChange={(value) => update("budget", value)}
                    placeholder="e.g. ₦5m–₦8m"
                  />
                  <Field
                    label="Number of occupants"
                    value={profile.occupants}
                    onChange={(value) => update("occupants", value)}
                    placeholder="e.g. 2"
                  />
                  <Field
                    label="Preferred move-in date"
                    type="date"
                    value={profile.moveInDate}
                    onChange={(value) => update("moveInDate", value)}
                  />
                </div>
              </section>
            )}

            {isOwner && (
              <section className="space-y-4">
                <h3 className="text-sm font-bold text-primary-container">Landlord details</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Ownership type"
                    value={profile.ownershipType}
                    onChange={(value) => update("ownershipType", value)}
                    placeholder="Owner, family representative, agent…"
                  />
                  <Field
                    label="Property city"
                    value={profile.propertyCity}
                    onChange={(value) => update("propertyCity", value)}
                    placeholder="Lagos or Abuja"
                  />
                  <Field
                    label="Property address"
                    value={profile.propertyAddress}
                    onChange={(value) => update("propertyAddress", value)}
                    placeholder="Address for review"
                  />
                  <Field
                    label="Company or agency name"
                    value={profile.agencyName}
                    onChange={(value) => update("agencyName", value)}
                    placeholder="Optional"
                  />
                </div>
              </section>
            )}

            {!isOwner && !isSeeker && (
              <p className="text-sm text-on-surface-variant">
                Select a seeker or owner role first to complete your trust profile.
              </p>
            )}

            <button
              type="submit"
              className="w-full sm:w-auto rounded-xl bg-primary-container px-5 py-3 font-bold text-on-primary-container hover:brightness-110 transition"
            >
              Save profile
            </button>
            {saved && <span className="ml-3 text-sm text-success-cyan">Saved</span>}
          </form>

          <aside className="rounded-2xl border border-border-muted bg-surface-container-lowest p-6 h-fit space-y-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary-container">
                verified_user
              </span>
              <h2 className="font-display font-bold text-xl">Verification</h2>
            </div>
            <p className="text-sm text-on-surface-variant">
              Verification is currently a manual review process. Nothing is marked verified until
              documents and identity are checked by Property Mogul.
            </p>
            <div className="space-y-2 text-sm">
              <Status label="Identity" value="Not submitted" />
              <Status label="Selfie / liveness" value={verificationStatus || "Not started"} />
              <Status
                label="Ownership / authority"
                value={isOwner ? "Not submitted" : "Not applicable"}
              />
              <Status
                label="Seeker profile"
                value={isSeeker ? "Self-disclosed" : "Not applicable"}
              />
            </div>
            {isOwner && (
              <p className="text-xs text-on-surface-variant">
                A secure identity provider should compare the selfie to the government ID and
                confirm liveness. Property Mogul does not store face images in this prototype.
              </p>
            )}
            <label className="flex items-start gap-2 text-xs text-on-surface-variant cursor-pointer">
              <input
                type="checkbox"
                checked={biometricConsent}
                onChange={(event) => setBiometricConsent(event.target.checked)}
                className="accent-primary-container mt-0.5"
              />
              <span>
                I consent to a secure third-party identity check using my ID photo and
                selfie/liveness capture for account safety. I understand Property Mogul does not
                process face images directly.
              </span>
            </label>
            <button
              type="button"
              onClick={startIdentityVerification}
              disabled={!biometricConsent}
              className="w-full rounded-xl bg-primary-container px-4 py-3 text-sm font-bold text-on-primary-container disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Start ID + selfie verification
            </button>
            {verificationSession && (
              <button
                type="button"
                onClick={refreshIdentityStatus}
                className="w-full rounded-xl border border-border-muted px-4 py-3 text-sm font-bold hover:border-primary-container"
              >
                Refresh verification status
              </button>
            )}
            {verificationError && <p className="text-xs text-error">{verificationError}</p>}
            <button
              type="button"
              onClick={requestReview}
              className="w-full rounded-xl border border-primary-container/40 px-4 py-3 text-sm font-bold text-primary-container hover:bg-primary-container/10 transition"
            >
              Request manual review
            </button>
            {manualStatus && (
              <p className="text-xs text-on-surface-variant">
                Review status: <strong className="text-warning">{manualStatus}</strong>
              </p>
            )}
            {profileError && <p className="text-xs text-error">{profileError}</p>}
          </aside>
        </div>

        {message && <p className="text-sm text-success-cyan">{message}</p>}
      </main>
    </div>
  );
}

function Field({ label, value = "", onChange, placeholder, type = "text" }) {
  return (
    <label className="block text-sm">
      <span className="block mb-2 text-on-surface-variant">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border-muted bg-background px-4 py-3 outline-none focus:border-primary-container"
      />
    </label>
  );
}

function Status({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border-muted pb-2">
      <span className="text-on-surface-variant">{label}</span>
      <span className="text-xs font-mono-data text-warning">{value}</span>
    </div>
  );
}
