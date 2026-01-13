import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import authRoutes from "./modules/auth/auth.routes";
import { swaggerSpec } from "./config/swagger";
import perfilesRoutes from "./modules/perfiles/perfiles.routes";
import catalogosRoutes from "./modules/catalogos/catalogos.routes";
import { errorHandler } from "./middlewares/errorHandler";
import solicitudesRoutes from "./modules/solicitudes/solicitudes.routes";
import serviciosRoutes from "./modules/servicios/servicios.routes";
import chatRoutes from "./modules/chat/chat.routes";
import recompensasRoutes from "./modules/recompensas/recompensas.routes";

const app = express();

const corsOptions: cors.CorsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // Postman/curl

    const o = origin.toLowerCase();

    const allowed =
      o.startsWith("http://localhost") ||
      o.startsWith("http://127.0.0.1") ||
      o.startsWith("https://educamente.online") ||
      o.includes(".use.devtunnels.ms");

    // ✅ NUNCA lances error aquí
    return cb(null, allowed);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // preflight

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/health", (_, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/perfiles", perfilesRoutes);
app.use("/api/catalogos", catalogosRoutes);

app.use("/api/solicitudes", solicitudesRoutes);
app.use("/api/servicios", serviciosRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/recompensas", recompensasRoutes);

app.use(errorHandler);
export default app;
