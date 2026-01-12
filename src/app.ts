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

const app = express();

const corsOptions: cors.CorsOptions = {
  origin: (origin, cb) => {
    // Permite requests sin origin (Postman, curl, etc.)
    if (!origin) return cb(null, true);

    const allowed =
      origin.includes("http://localhost") ||
      origin.includes("http://127.0.0.1") ||
      origin.endsWith(".use.devtunnels.ms");

    return allowed ? cb(null, true) : cb(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // preflight

app.use(express.json());

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/health", (_, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/perfiles", perfilesRoutes);
app.use("/api/catalogos", catalogosRoutes);

app.use("/api/solicitudes", solicitudesRoutes);
app.use("/api/servicios", serviciosRoutes);


app.use(errorHandler);
export default app;
