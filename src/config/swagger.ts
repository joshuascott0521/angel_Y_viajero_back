import swaggerJSDoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Ángeles Viajeros API",
      version: "1.0.0",
      description: "API Backend - Ángeles Viajeros",
    },
    servers: [
      {
        url: "/",
        description: "Servidor local",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        ApiError: {
          type: "object",
          properties: {
            ok: { type: "boolean", example: false },
            message: { type: "string", example: "Credenciales inválidas" },
            code: { type: "string", example: "AUTH_INVALID_CREDENTIALS" },
            details: {
              type: "array",
              items: { type: "string" },
              example: ["correo es requerido", "password mínimo 6 caracteres"],
            },
          },
          required: ["ok", "message"],
        },
        ChatInboxItem: {
          type: "object",
          properties: {
            solicitudId: { type: "string", format: "uuid" },
            solicitudEstadoId: { type: "integer" },
            estadoSolicitud: { type: "string" },
            otroUsuarioId: { type: "string", format: "uuid" },
            otroNombre: { type: "string" },
            ultimoChatMensajeId: { type: "integer", nullable: true },
            ultimoMensaje: { type: "string", nullable: true },
            fechaUltimoMensaje: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
            noLeidos: { type: "integer", example: 2 },
          },
        },
        ChatMensaje: {
          type: "object",
          properties: {
            chatMensajeId: { type: "integer" },
            solicitudId: { type: "string", format: "uuid" },
            emisorUsuarioId: { type: "string", format: "uuid" },
            emisorNombre: { type: "string" },
            mensaje: { type: "string" },
            fechaEnvio: { type: "string", format: "date-time" },
            leidoPorMi: { type: "boolean" },
            fechaLectura: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/modules/**/*.routes.ts"], // donde leerá los comentarios
});
