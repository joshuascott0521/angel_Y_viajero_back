import { Router } from "express";
import { authJwt } from "../../middlewares/authJwt";
import { recompensasController } from "./recompensas.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Recompensas
 *     description: Catálogo de recompensas, canjes y saldo de alas
 */

/**
 * @swagger
 * /api/recompensas/categorias/activas:
 *   get:
 *     summary: Listar categorías activas
 *     tags: [Recompensas]
 *     responses:
 *       200:
 *         description: Lista de categorías activas
 */
router.get("/categorias/activas", recompensasController.getCategoriasActivas);

/**
 * @swagger
 * /api/recompensas:
 *   get:
 *     summary: Listar recompensas disponibles
 *     description: Devuelve recompensas activas, con categoría activa y stock disponible (si aplica).
 *     tags: [Recompensas]
 *     parameters:
 *       - in: query
 *         name: categoriaRecompensaId
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filtra por categoría
 *     responses:
 *       200:
 *         description: Lista de recompensas disponibles
 */
router.get("/", recompensasController.getRecompensasDisponibles);

/**
 * @swagger
 * /api/recompensas/canjear:
 *   post:
 *     summary: Canjear una recompensa (solo Ángel)
 *     tags: [Recompensas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [recompensaId]
 *             properties:
 *               recompensaId:
 *                 type: integer
 *                 example: 2
 *               observacion:
 *                 type: string
 *                 example: "Entregar en próxima visita"
 *     responses:
 *       201:
 *         description: Canje creado (Completado) + saldo actual
 *       400:
 *         description: Error de negocio (saldo insuficiente, agotado, etc.)
 *       403:
 *         description: No autorizado (no es ángel)
 */
router.post("/canjear", authJwt, recompensasController.canjear);

/**
 * @swagger
 * /api/recompensas/mis-canjes:
 *   get:
 *     summary: Ver mis canjes (solo Ángel)
 *     tags: [Recompensas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de canjes del ángel (desc)
 *       403:
 *         description: No autorizado (no es ángel)
 */
router.get("/mis-canjes", authJwt, recompensasController.misCanjes);

/**
 * @swagger
 * /api/recompensas/mi-saldo:
 *   get:
 *     summary: Ver mi saldo de alas (solo Ángel)
 *     tags: [Recompensas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Saldo actual
 *       403:
 *         description: No autorizado (no es ángel)
 */
router.get("/mi-saldo", authJwt, recompensasController.miSaldo);

/**
 * @swagger
 * /api/recompensas/categorias:
 *   post:
 *     summary: Crear categoría (pendiente asegurar rol admin)
 *     tags: [Recompensas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre]
 *             properties:
 *               nombre: { type: string, example: "Merchandising" }
 *               descripcion: { type: string, example: "Productos físicos de la marca" }
 *     responses:
 *       201:
 *         description: Categoría creada
 *       400:
 *         description: Validación o duplicado
 */
router.post("/categorias", recompensasController.createCategoria);

/**
 * @swagger
 * /api/recompensas/categorias/{categoriaRecompensaId}/desactivar:
 *   patch:
 *     summary: Desactivar categoría (pendiente asegurar rol admin)
 *     tags: [Recompensas]
 *     parameters:
 *       - in: path
 *         name: categoriaRecompensaId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Categoría desactivada
 *       400:
 *         description: Categoría inválida o no existe
 */
router.patch("/categorias/:categoriaRecompensaId/desactivar", recompensasController.desactivarCategoria);

/**
 * @swagger
 * /api/recompensas/admin/recompensas:
 *   post:
 *     summary: Crear recompensa (pendiente asegurar rol admin)
 *     tags: [Recompensas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [categoriaRecompensaId, nombre, costoAlas]
 *             properties:
 *               categoriaRecompensaId: { type: integer, example: 1 }
 *               nombre: { type: string, example: "Camiseta" }
 *               descripcion: { type: string, example: "Camiseta oficial AngelsTravelers" }
 *               costoAlas: { type: integer, example: 50 }
 *               stock: { type: integer, nullable: true, example: 10 }
 *     responses:
 *       201:
 *         description: Recompensa creada
 */
router.post("/admin/recompensas", recompensasController.createRecompensa);

export default router;
