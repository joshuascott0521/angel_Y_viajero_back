import { Router } from "express";
import { authJwt } from "../../middlewares/authJwt";
import { chatController } from "./chat.controller";

const router = Router();

/**
 * @swagger
 * /api/chat/inbox:
 *   get:
 *     summary: Obtener inbox de chats
 *     description: |
 *       Retorna la lista de conversaciones (chats) asociadas al usuario autenticado.
 *       Incluye:
 *       - Usuario con el que se conversa
 *       - Último mensaje
 *       - Estado de la solicitud
 *       - Contador de mensajes no leídos
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inbox de chats obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ChatInboxItem'
 *       401:
 *         description: Usuario no autenticado
 */
router.get("/inbox", authJwt, chatController.inbox);

/**
 * @swagger
 * /api/chat/solicitud/{solicitudId}/mensaje:
 *   post:
 *     summary: Enviar un mensaje en una solicitud
 *     description: |
 *       Envía un mensaje en el chat asociado a una solicitud.
 *       El usuario autenticado debe pertenecer a la solicitud.
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: solicitudId
 *         in: path
 *         required: true
 *         description: ID de la solicitud
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [mensaje]
 *             properties:
 *               mensaje:
 *                 type: string
 *                 example: "Hola, ¿cómo estás?"
 *     responses:
 *       200:
 *         description: Mensaje enviado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatMensaje'
 *       400:
 *         description: Error de validación
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: El usuario no pertenece a la solicitud
 */
router.post(
  "/solicitud/:solicitudId/mensaje",
  authJwt,
  chatController.enviarMensaje
);

/** @swagger
 * /api/chat/solicitud/{solicitudId}:
 *   get:
 *     summary: Obtener historial de mensajes de una solicitud
 *     description: |
 *       Obtiene el historial de mensajes del chat asociado a una solicitud.
 *       Solo pueden acceder los usuarios que pertenecen a la solicitud.
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: solicitudId
 *         in: path
 *         required: true
 *         description: ID de la solicitud
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: take
 *         in: query
 *         required: false
 *         description: Cantidad máxima de mensajes a retornar (máx. 200)
 *         schema:
 *           type: integer
 *           example: 50
 *     responses:
 *       200:
 *         description: Historial de mensajes obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ChatMensaje'
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: El usuario no pertenece a la solicitud
 */
router.get(
  "/solicitud/:solicitudId",
  authJwt,
  chatController.mensajesBySolicitud
);

/**
 * @swagger
 * /api/chat/solicitud/{solicitudId}/leer:
 *   post:
 *     summary: Marcar mensajes como leídos
 *     description: |
 *       Marca como leídos los mensajes de una solicitud hasta un mensaje específico.
 *       Endpoint de respaldo cuando no se usa Socket.IO.
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: solicitudId
 *         in: path
 *         required: true
 *         description: ID de la solicitud
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               hastaChatMensajeId:
 *                 type: integer
 *                 example: 120
 *     responses:
 *       200:
 *         description: Mensajes marcados como leídos correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 mensaje:
 *                   type: string
 *                   example: Mensajes marcados como leídos
 *                 mensajesMarcados:
 *                   type: integer
 *                   example: 3
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: El usuario no pertenece a la solicitud
 */
router.post(
  "/solicitud/:solicitudId/leer",
  authJwt,
  chatController.marcarLeidos
);

/**
 * @swagger
 * /api/chat/solicitud/{solicitudId}/noleidos:
 *   get:
 *     summary: Obtener cantidad de mensajes no leídos
 *     description: |
 *       Retorna la cantidad de mensajes no leídos de una solicitud para el usuario autenticado.
 *       Endpoint opcional para refrescar badges sin recargar el inbox completo.
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: solicitudId
 *         in: path
 *         required: true
 *         description: ID de la solicitud
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Cantidad de mensajes no leídos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 noLeidos:
 *                   type: integer
 *                   example: 5
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: El usuario no pertenece a la solicitud
 */
router.get(
  "/solicitud/:solicitudId/noleidos",
  authJwt,
  chatController.noLeidos
);

export default router;
