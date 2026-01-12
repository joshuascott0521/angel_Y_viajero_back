import jwt from "jsonwebtoken";
import type { Socket } from "socket.io";

type JwtPayload = {
  sub?: string;
  usuarioId?: string;
  correo?: string;
};

export function socketAuth(socket: Socket, next: (err?: Error) => void) {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers.authorization;

    if (!token) throw new Error("NO_TOKEN");

    const cleanToken = token.startsWith("Bearer ")
      ? token.slice(7)
      : token;

    const decoded = jwt.verify(
      cleanToken,
      process.env.JWT_SECRET!
    ) as JwtPayload;

    const usuarioId = decoded.sub || decoded.usuarioId;
    if (!usuarioId) throw new Error("NO_SUB");

    socket.data.usuarioId = usuarioId;
    socket.data.correo = decoded.correo;

    next();
  } catch {
    next(new Error("UNAUTHORIZED"));
  }
}
