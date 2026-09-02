export const ADMIN_PROPERTY_STATUSES = ["DRAFT", "PUBLISHED", "UNPUBLISHED", "ARCHIVED"];
export const ADMIN_USER_STATUSES = ["ACTIVE", "SUSPENDED"];

export function isAdminUser(user) {
  return Boolean(user?.roles?.includes("ADMIN"));
}

export function assertAdminUser(user) {
  if (!isAdminUser(user)) throw new Error("Admin access required.");
  return user;
}

export function canChangeAdminUserStatus(adminId, targetId, status) {
  return adminId !== targetId && ADMIN_USER_STATUSES.includes(status);
}

export function canModeratePropertyStatus(fromStatus, toStatus, user) {
  if (!isAdminUser(user) || !ADMIN_PROPERTY_STATUSES.includes(toStatus)) return false;
  if (fromStatus === toStatus) return true;
  const allowed = {
    DRAFT: ["PUBLISHED", "ARCHIVED"],
    PUBLISHED: ["UNPUBLISHED", "ARCHIVED"],
    UNPUBLISHED: ["PUBLISHED", "ARCHIVED"],
    ARCHIVED: [],
  };
  return Boolean(allowed[fromStatus]?.includes(toStatus));
}
