import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  auth: { token: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xJZCI6MiwiaWF0IjoxNzY4MTkzMDcxLCJleHAiOjE3NjgyMjU0NzEsInN1YiI6IkRBQzhCNkZFLTFDNDQtNDZEMi1BRDQyLUEzQTAwODVBQzAyMCJ9.6s6QSF13ijxMrdfawJsro5VjpIwuZywTIw9kR_Ud4I4" },
});

const solicitudId = "E57769CF-2FB1-4BEA-8AB7-EF2199168A13";

socket.on("connect", () => {
  console.log("😇 Ángel conectado");

  // 👀 OJO: NO hacemos join todavía
  // para simular mensajes no leídos

  setTimeout(() => {
    console.log("👀 Ángel entra al chat");
    socket.emit("solicitud:join", { solicitudId });

    socket.emit("chat:leer", {
      solicitudId,
      hastaChatMensajeId: 999999,
    });
  }, 5000);
});

socket.on("chat:nuevo", (msg) => {
  console.log("📩 (Ángel recibe)", msg.Mensaje);
});

socket.on("chat:leidos", (info) => {
  console.log("✅ Mensajes marcados leídos", info);
});
