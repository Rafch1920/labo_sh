export const ROLES = {
  PATIENT: "patient",
  LAB_ADMIN: "lab_admin",
  DOCTOR: "doctor",
  SUPER_ADMIN: "super_admin",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_ROUTES: Record<Role, string> = {
  [ROLES.PATIENT]: "/patient/dashboard",
  [ROLES.LAB_ADMIN]: "/lab/queue",
  [ROLES.DOCTOR]: "/doctor/validations",
  [ROLES.SUPER_ADMIN]: "/admin/users",
};

export const ROLE_PREFIXES: Record<Role, string> = {
  [ROLES.PATIENT]: "/patient",
  [ROLES.LAB_ADMIN]: "/lab",
  [ROLES.DOCTOR]: "/doctor",
  [ROLES.SUPER_ADMIN]: "/admin",
};

export const ROLE_LABELS: Record<Role, string> = {
  [ROLES.PATIENT]: "Patient",
  [ROLES.LAB_ADMIN]: "Laboratoire",
  [ROLES.DOCTOR]: "Médecin",
  [ROLES.SUPER_ADMIN]: "Super Admin",
};
