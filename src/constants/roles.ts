export const ROL_ID = {
  Viajero: 1,
  Angel: 2,
} as const;

export type RolId = (typeof ROL_ID)[keyof typeof ROL_ID];
