export function normalizeRoles(roles) {
  return [...new Set(roles.map((role) => String(role).toUpperCase()))].filter((role) =>
    ["SEEKER", "LANDLORD", "ADMIN"].includes(role),
  );
}

export function hasRole(user, role) {
  return Boolean(user && normalizeRoles(user.roles || []).includes(role));
}

export function canModifyProperty(user, property) {
  return hasRole(user, "LANDLORD") && user.id === property.ownerId;
}

export function canPublishProperty(user) {
  return hasRole(user, "LANDLORD") && user.profile?.trustStatus === "VERIFIED";
}

export function canTransitionPropertyStatus(fromStatus, toStatus) {
  if (fromStatus === toStatus) return true;
  if (fromStatus === "DRAFT") return ["PUBLISHED", "ARCHIVED"].includes(toStatus);
  if (fromStatus === "PUBLISHED") return ["UNPUBLISHED", "ARCHIVED"].includes(toStatus);
  if (fromStatus === "UNPUBLISHED") return ["PUBLISHED", "ARCHIVED"].includes(toStatus);
  return false;
}

export function canViewProperty(property) {
  return property.status === "PUBLISHED";
}

export function addUniqueFavorite(favoriteIds, propertyId) {
  return [...new Set([...favoriteIds, propertyId])];
}

export function removeFavorite(favoriteIds, propertyId) {
  return favoriteIds.filter((id) => id !== propertyId);
}

export function mapVerificationStatus(status) {
  const normalized = String(status).toLowerCase();
  if (normalized === "approved" || normalized === "verified") return "VERIFIED";
  if (normalized === "declined" || normalized === "rejected") return "REJECTED";
  if (normalized === "expired") return "EXPIRED";
  return "PENDING";
}
