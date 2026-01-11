import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import app from "./app";
import { registerSockets } from "./sockets";

const server = http.createServer(app);

export const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] },
});

registerSockets(io);

server.listen(process.env.PORT || 3000, () =>
  console.log(`🚀 http://localhost:${process.env.PORT || 3000}`)
);
