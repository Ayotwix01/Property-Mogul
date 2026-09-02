export function parseGoogleIdentity(identity) {
  if (!identity || !identity.sub || !identity.email || identity.email_verified !== true)
    return null;
  const email = String(identity.email).trim().toLowerCase();
  if (!email.includes("@")) return null;
  return {
    providerAccountId: String(identity.sub),
    email,
    displayName: String(identity.name || email.split("@")[0]).slice(0, 160),
    profileImageUrl: identity.picture ? String(identity.picture).slice(0, 1000) : null,
  };
}

export function normalizeGoogleRoles(roles) {
  const allowedRoles = new Set(["SEEKER", "LANDLORD"]);
  const uniqueRoles = [...new Set(roles)].filter((role) => allowedRoles.has(role));
  if (uniqueRoles.length === 0 || uniqueRoles.length !== roles.length) {
    throw new Error("Invalid Google account role selection.");
  }
  return uniqueRoles;
}
