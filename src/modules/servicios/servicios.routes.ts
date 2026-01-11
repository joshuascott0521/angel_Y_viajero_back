import { Router } from "express";
import * as controller from "./servicios.controller";
import { authJwt } from "../../middlewares/authJwt";

const router = Router();

/**
 * @swagger
 * /api/servicios/solicitud/{solicitudId}:
 *   get:
 *     summary: Obtener servicio por solicitud
 *     description: Devuelve el detalle completo del servicio asociado a una solicitud.
 *     tags: [Servicios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: solicitudId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Detalle del servicio
 */
router.get("/solicitud/:solicitudId", authJwt, controller.getBySolicitudId);

/**
 * @swagger
 * /api/servicios/{solicitudId}/completar:
 *   post:
 *     summary: Completar servicio
 *     description: |
 *       Marca el servicio como completado.
 *       Puede hacerlo el **ángel o el viajero** involucrado.
 *     tags: [Servicios]
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
 *               observacionFinal:
 *                 type: string
 *                 example: "Servicio completado sin inconvenientes"
 *     responses:
 *       200:
 *         description: Servicio completado correctamente
 */
router.post("/:solicitudId/completar", authJwt, controller.completar);

/**
 * @swagger
 * /api/servicios/{solicitudId}/calificar:
 *   post:
 *     summary: Calificar servicio
 *     description: Permite al **viajero** calificar un servicio completado.
 *     tags: [Servicios]
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
 *               - calificacion
 *             properties:
 *               calificacion:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               comentario:
 *                 type: string
 *                 example: "Excelente servicio"
 *     responses:
 *       200:
 *         description: Servicio calificado correctamente
 */
router.post("/:solicitudId/calificar", authJwt, controller.calificar);

/**
 * @swagger
 * /api/servicios/angel/{perfilAngelId}:
 *   get:
 *     summary: Listar servicios del ángel
 *     tags: [Servicios]
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
 *         description: Lista de servicios
 */
router.get("/angel/:perfilAngelId", authJwt, controller.getByAngel);

/**
 * @swagger
 * /api/servicios/viajero/{perfilViajeroId}:
 *   get:
 *     summary: Listar servicios del viajero
 *     tags: [Servicios]
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
 *         description: Lista de servicios del viajero
 */
router.get("/viajero/:perfilViajeroId", authJwt, controller.getByViajero);

export default router;
