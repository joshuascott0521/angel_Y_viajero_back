import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import app from "./app";
import { registerSockets } from "./sockets";

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      const o = origin.toLowerCase();
      const allowed =
        o.startsWith("http://localhost") ||
        o.startsWith("http://127.0.0.1") ||
        o.startsWith("https://educamente.online") ||
        o.startsWith("https://antaresdi.com") ||
        o.startsWith("https://www.antaresdi.com") ||
        o.includes(".use.devtunnels.ms");
      cb(null, allowed);
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Authorization", "Content-Type"],
  },
});

registerSockets(io);

server.listen(process.env.PORT || 3000, () =>
  console.log(`🚀 http://localhost:${process.env.PORT || 3000}`)
);
