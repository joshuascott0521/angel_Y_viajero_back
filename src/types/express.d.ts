import { RolId } from "../constants/roles";

declare global {
  namespace Express {
    interface Request {
      user?: { usuarioId: string; rolId: RolId };
    }
  }
}
export {};
