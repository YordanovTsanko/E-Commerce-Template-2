// Поддържа и role ("admin" / "superAdmin"), и булевите флагове admin / superAdmin
export const isSuperAdmin = (user) =>
  Boolean(user) && (user.role === 'superAdmin' || user.role === 'super_admin' || user.superAdmin === true);

export const isAdmin = (user) =>
  Boolean(user) && (isSuperAdmin(user) || user.role === 'admin' || user.admin === true || user.isAdmin === true);
