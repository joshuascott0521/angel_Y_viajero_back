import { Router } from "express";
import { register, login, me, forgotPassword, resetPassword } from "./auth.controller";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", me);
router.post("/password/forgot", forgotPassword);
router.post("/password/reset", resetPassword);


export default router;

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registro de usuario
 *     description: Registra un usuario con rol Viajero o Angel. La contraseña se almacena hasheada (bcrypt).
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, edad, correo, password, rol]
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Juan David
 *               edad:
 *                 type: integer
 *                 example: 22
 *               correo:
 *                 type: string
 *                 format: email
 *                 example: juancho@gmail.com
 *               password:
 *                 type: string
 *                 example: 12345678
 *               rol:
 *                 type: string
 *                 enum: [Viajero, Angel]
 *                 example: Viajero
 *     responses:
 *       201:
 *         description: Usuario creado y token JWT emitido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 usuarioId:
 *                   type: string
 *                   example: 7b5f2b8d-2b8a-4b57-9c6e-1e9b1a2f3c4d
 *                 rolId:
 *                   type: integer
 *                   example: 1
 *                 token:
 *                   type: string
 *       400:
 *         description: Error de validación (correo duplicado, rol inválido, etc.)
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Inicio de sesión
 *     description: Devuelve JWT si las credenciales son correctas. Aplica límite de intentos de login.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [correo, password]
 *             properties:
 *               correo:
 *                 type: string
 *                 format: email
 *                 example: example@gmail.com
 *               password:
 *                 type: string
 *                 example: tuclaveaca
 *
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 usuarioId:
 *                   type: string
 *                 rolId:
 *                   type: integer
 *                   example: 1
 *                 token:
 *                   type: string
 *       400:
 *         description: Credenciales inválidas o usuario bloqueado por intentos
 */

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obtener sesión actual
 *     description: Devuelve datos del usuario autenticado a partir del JWT.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión válida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 UsuarioId:
 *                   type: string
 *                 RolId:
 *                   type: integer
 *                 Correo:
 *                   type: string
 *                 Estado:
 *                   type: string
 *                   example: Activo
 *       401:
 *         description: Token requerido o inválido
 */

/**
 * @swagger
 * /api/auth/password/forgot:
 *   post:
 *     summary: Solicitar recuperación de contraseña
 *     description: Genera un token temporal. Invalida tokens anteriores activos del mismo usuario.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [correo]
 *             properties:
 *               correo:
 *                 type: string
 *                 format: email
 *                 example: juancho@gmail.com
 *     responses:
 *       200:
 *         description: Token generado (DEV lo devuelve; PROD se enviaría por correo)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 correo:
 *                   type: string
 *                 token:
 *                   type: string
 *                 expiraEn:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Datos inválidos
 */

/**
 * @swagger
 * /api/auth/password/reset:
 *   post:
 *     summary: Restablecer contraseña
 *     description: Valida token (no usado, no expirado) y actualiza la contraseña (bcrypt). Marca token como usado.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [correo, token, newPassword]
 *             properties:
 *               correo:
 *                 type: string
 *                 format: email
 *                 example: juancho@gmail.com
 *               token:
 *                 type: string
 *                 example: a3f1c9e4b7d84f8d9c2e...
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 example: NuevaClave12345
 *     responses:
 *       200:
 *         description: Contraseña actualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Contraseña actualizada correctamente
 *       400:
 *         description: Token inválido o expirado
 */





