import { Router } from "express";
import { authJwt } from "../../middlewares/authJwt";
import { ROL_ID } from "../../constants/roles";
import {
  getMiPerfilViajero,
  getMiPerfilAngel,
  patchMiPerfilAngel,
  patchMiPerfilViajero,
} from "./perfiles.controller";
import { requireRole } from "../../middlewares/requireRol";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Perfiles
 *     description: Gestión de perfil del Viajero y del Ángel
 */

/**
 * @swagger
 * /api/perfiles/viajero/me:
 *   get:
 *     summary: Obtener mi perfil de viajero
 *     tags: [Perfiles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del viajero (o null si aún no existe)
 *       401:
 *         description: Token requerido o inválido
 *       403:
 *         description: No autorizado por rol
 */
router.get(
  "/viajero/me",
  authJwt,
  requireRole(ROL_ID.Viajero),
  getMiPerfilViajero
);

/**
 * @swagger
 * /api/perfiles/viajero/me:
 *   patch:
 *     summary: Actualizar parcialmente mi perfil de viajero
 *     description: >
 *       Permite actualizar solo los campos enviados del perfil del viajero.
 *       No es necesario enviar toda la información.
 *       Las listas (idiomas, asistencias) se reemplazan completamente si se envían.
 *     tags: [Perfiles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               personal:
 *                 type: object
 *                 description: Información personal del usuario
 *                 properties:
 *                   nombre:
 *                     type: string
 *                     example: "Juan David"
 *                   correo:
 *                     type: string
 *                     example: "juan@email.com"
 *                   telefono:
 *                     type: string
 *                     example: "3001234567"
 *                   edad:
 *                     type: integer
 *                     example: 22
 *                   paisOrigen:
 *                     type: string
 *                     example: "Colombia"
 *
 *               zonaId:
 *                 type: integer
 *                 example: 2
 *
 *               tipoDiscapacidadId:
 *                 type: integer
 *                 description: Tipo de discapacidad principal del viajero (solo uno)
 *                 example: 1
 *
 *               asistenciasIds:
 *                 type: array
 *                 description: Tipos de asistencia requeridos por el viajero
 *                 items:
 *                   type: integer
 *                 example: [1, 3]
 *
 *               contactoEmergencia:
 *                 type: object
 *                 description: Contacto de emergencia del viajero
 *                 properties:
 *                   nombre:
 *                     type: string
 *                     example: "Ana Pérez"
 *                   telefono:
 *                     type: string
 *                     example: "3019876543"
 *                   parentesco:
 *                     type: string
 *                     example: "Hermana"
 *
 *               idiomaIds:
 *                 type: array
 *                 description: Idiomas que habla el viajero
 *                 items:
 *                   type: integer
 *                 example: [1, 2]
 *
 *               interesesTuristicos:
 *                 type: string
 *                 example: "Playas, museos y turismo cultural"
 *
 *               requerimientosAdicionales:
 *                 type: string
 *                 example: "Necesito ayuda con transporte público"
 *
 *     responses:
 *       200:
 *         description: Perfil del viajero actualizado
 *       400:
 *         description: Error de validación
 *       401:
 *         description: Token inválido o ausente
 *       403:
 *         description: El usuario no tiene rol Viajero
 */

router.patch(
  "/viajero/me",
  authJwt,
  requireRole(ROL_ID.Viajero),
  patchMiPerfilViajero
);

/**
 * @swagger
 * /api/perfiles/angel/me:
 *   get:
 *     summary: Obtener mi perfil de ángel
 *     tags: [Perfiles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del ángel (o null si aún no existe)
 *       401:
 *         description: Token requerido o inválido
 *       403:
 *         description: No autorizado por rol
 */
router.get("/angel/me", authJwt, requireRole(ROL_ID.Angel), getMiPerfilAngel);

// /**
//  * @swagger
//  * /api/perfiles/angel/me:
//  *   put:
//  *     summary: Crear/Actualizar (Upsert) mi perfil de ángel
//  *     tags: [Perfiles]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: false
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               disponibilidad:
//  *                 type: boolean
//  *                 example: true
//  *               zonaBaseId:
//  *                 type: integer
//  *                 nullable: true
//  *                 example: 2
//  *               biografia:
//  *                 type: string
//  *                 nullable: true
//  *                 example: "Me gusta ayudar a viajeros, conozco rutas accesibles."
//  *     responses:
//  *       200:
//  *         description: Perfil ángel actualizado
//  *       401:
//  *         description: Token requerido o inválido
//  *       403:
//  *         description: No autorizado por rol
//  */
// router.put(
//   "/angel/me",
//   authJwt,
//   requireRole(ROL_ID.Angel),
//   upsertMiPerfilAngel
// );

/**
 * @swagger
 * /api/perfiles/angel/me:
 *   patch:
 *     summary: Actualizar parcialmente mi perfil de ángel (PATCH)
 *     description: |
 *       Envía solo lo que quieras actualizar:
 *       - perfil: { biografia?, disponibilidad?, zonaBaseId? }
 *       - habilidadIds?: [] (si se envía, reemplaza)
 *       - idiomaIds?: [] (si se envía, reemplaza)
 *       - zonaIds?: [] (si se envía, reemplaza)
 *       - disponibilidadSemanal?: [] (si se envía, upsert por día)
 *     tags: [Perfiles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               perfil:
 *                 type: object
 *                 properties:
 *                   biografia:
 *                     type: string
 *                     nullable: true
 *                   disponibilidad:
 *                     type: boolean
 *                   zonaBaseId:
 *                     type: integer
 *                     nullable: true
 *               habilidadIds:
 *                 type: array
 *                 items: { type: integer }
 *               idiomaIds:
 *                 type: array
 *                 items: { type: integer }
 *               zonaIds:
 *                 type: array
 *                 items: { type: integer }
 *               disponibilidadSemanal:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     diaSemana: { type: integer, example: 1 }
 *                     activo: { type: boolean, example: true }
 *                     horaInicio: { type: string, nullable: true, example: "09:00" }
 *                     horaFin: { type: string, nullable: true, example: "18:00" }
 *     responses:
 *       200:
 *         description: Perfil ángel actualizado (devuelve FULL)
 *       401:
 *         description: Token requerido o inválido
 *       403:
 *         description: No autorizado por rol
 */
router.patch(
  "/angel/me",
  authJwt,
  requireRole(ROL_ID.Angel),
  patchMiPerfilAngel
);

export default router;
