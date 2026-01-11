import { Router } from "express";
import * as controller from "./solicitudes.controller";
import { authJwt } from "../../middlewares/authJwt";

const router = Router();

/**
 * @swagger
 * /api/solicitudes:
 *   post:
 *     summary: Crear una nueva solicitud
 *     description: |
 *       Permite a un **viajero** crear una solicitud de servicio hacia un ángel.
 *       - El viajero solo puede tener **una solicitud activa**.
 *       - Se valida disponibilidad y horario del ángel.
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - perfilAngelId
 *               - tipoAsistenciaId
 *               - duracionEstimadaId
 *               - fechaHoraInicio
 *               - lugar
 *             properties:
 *               perfilAngelId:
 *                 type: string
 *                 format: uuid
 *               tipoAsistenciaId:
 *                 type: integer
 *                 example: 1
 *               duracionEstimadaId:
 *                 type: integer
 *                 example: 2
 *               fechaHoraInicio:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-01-15T09:00:00"
 *               lugar:
 *                 type: string
 *                 example: "Centro comercial Buenavista"
 *               detalles:
 *                 type: string
 *                 nullable: true
 *                 example: "Necesito apoyo en movilidad"
 *     responses:
 *       201:
 *         description: Solicitud creada exitosamente
 *       400:
 *         description: Error de validación o reglas de negocio
 */
router.post("/", authJwt, controller.create);

/**
 * @swagger
 * /api/solicitudes/{solicitudId}/responder:
 *   post:
 *     summary: Responder solicitud (Ángel)
 *     description: |
 *       Permite al **ángel** aceptar o rechazar una solicitud.
 *       - Si acepta, se confirma la solicitud y se crea el servicio.
 *       - Si rechaza, la solicitud pasa a estado rechazado.
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: solicitudId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - aceptar
 *             properties:
 *               aceptar:
 *                 type: boolean
 *                 example: true
 *               motivoRechazo:
 *                 type: string
 *                 nullable: true
 *                 example: "No tengo disponibilidad ese día"
 *     responses:
 *       200:
 *         description: Solicitud respondida correctamente
 *       400:
 *         description: Error de validación o reglas de negocio
 */
router.post("/:solicitudId/responder", authJwt, controller.responderAngel);

/**
 * @swagger
 * /api/solicitudes/{solicitudId}/cancelar:
 *   post:
 *     summary: Cancelar solicitud (Viajero)
 *     description: |
 *       Permite al **viajero** cancelar una solicitud
 *       solo si está en estado *En espera de confirmación*.
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: solicitudId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               motivoCancelacion:
 *                 type: string
 *                 example: "Ya no necesito el servicio"
 *     responses:
 *       200:
 *         description: Solicitud cancelada correctamente
 */
router.post("/:solicitudId/cancelar", authJwt, controller.cancelarViajero);

/**
 * IMPORTANTE:
 * Las rutas específicas (sin params o con prefijos fijos) deben ir ANTES que las paramétricas
 * para evitar que Express haga match incorrecto.
 */

/**
 * @swagger
 * /api/solicitudes/viajero/angelesSolicitud:
 *   get:
 *     summary: Listar ángeles disponibles para solicitud
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de ángeles disponibles
 */
router.get("/viajero/angelesSolicitud", authJwt, controller.getAngelesSolicitud);

/**
 * @swagger
 * /api/solicitudes/viajero/{perfilViajeroId}:
 *   get:
 *     summary: Listar solicitudes del viajero
 *     description: Devuelve todas las solicitudes creadas por el viajero autenticado.
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: perfilViajeroId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lista de solicitudes
 */
router.get("/viajero/:perfilViajeroId", authJwt, controller.getByViajero);

/**
 * @swagger
 * /api/solicitudes/angel/reviews/{perfilAngelId}:
 *   get:
 *     summary: Listar las reseñas del ángel
 *     description: Devuelve todas las reseñas asociadas al ángel autenticado.
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: perfilAngelId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lista de reseñas
 */
router.get("/angel/reviews/:perfilAngelId", authJwt, controller.getReviews);

/**
 * @swagger
 * /api/solicitudes/angel/{perfilAngelId}:
 *   get:
 *     summary: Listar solicitudes del ángel
 *     description: Devuelve todas las solicitudes asociadas al ángel autenticado.
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: perfilAngelId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lista de solicitudes
 */
router.get("/angel/:perfilAngelId", authJwt, controller.getByAngel);

export default router;
