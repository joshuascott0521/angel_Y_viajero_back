import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  auth: { token: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xJZCI6MSwiaWF0IjoxNzY4MTk0MjM1LCJleHAiOjE3NjgyMjY2MzUsInN1YiI6IkZDRjAwNEIxLTBGNkYtNDBFNS1COERGLTBCQzMyNzY5MUU3NiJ9.zqEWOjV4NIyogFSlD9zsK-KApLx7Ht44U_C2wvx9Qnw" },
});

const solicitudId = "E57769CF-2FB1-4BEA-8AB7-EF2199168A13";

socket.on("connect", () => {
  console.log("🧳 Viajero conectado");

  socket.emit("solicitud:join", { solicitudId });

  setTimeout(() => {
    socket.emit("chat:enviar", {
      solicitudId,
      mensaje: "Hola Ángel 👋",
    });
  }, 1000);

  setTimeout(() => {
    socket.emit("chat:enviar", {
      solicitudId,
      mensaje: "¿Me puedes ayudar?",
    });
  }, 2000);

  setTimeout(() => {
    socket.emit("chat:enviar", {
      solicitudId,
      mensaje: "Me perdí 😢",
    });
  }, 2000);
});

socket.on("chat:nuevo", (msg) => {
  console.log("📩 (Viajero ve)", msg.Mensaje);
});
