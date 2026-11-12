import { ROLES } from "../constants/index.js";

// Поддържа и двата модела: поле role ("admin" / "superAdmin")
// и булеви флагове user.admin / user.superAdmin.
export const isSuperAdmin = (user) =>
  Boolean(user) &&
  (user.role === ROLES.SUPER_ADMIN || user.role === "super_admin" || user.superAdmin === true);

export const isAdmin = (user) =>
  Boolean(user) && (isSuperAdmin(user) || user.role === ROLES.ADMIN || user.admin === true);

// Може ли actor да променя роля/статус на target?
// - никой не може да променя собствената си роля/статус
// - superAdmin управлява всички
// - admin управлява само обикновени потребители
export const canManageUser = (actor, target) => {
  if (!actor || !target) return false;
  if (String(actor._id) === String(target._id)) return false;
  if (isSuperAdmin(actor)) return true;
  if (isAdmin(actor)) return !isAdmin(target);
  return false;
};

export const canAssignRole = (actor, role) => {
  if (isSuperAdmin(actor)) return true;
  if (isAdmin(actor)) return role === ROLES.USER;
  return false;
};
