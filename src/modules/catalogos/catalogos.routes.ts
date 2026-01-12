import { Router } from "express";
import {
  getIdiomas,
  getHabilidades,
  getTiposAsistencia,
  getTiposDiscapacidad,
  getCiudades,
  getZonas,
  getDuracionEstimada
} from "./catalogos.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Catálogos
 *     description: Datos maestros para formularios y filtros
 */

/**
 * @swagger
 * /api/catalogos/idiomas:
 *   get:
 *     summary: Listar idiomas
 *     tags: [Catálogos]
 *     responses:
 *       200:
 *         description: Lista de idiomas
 */
router.get("/idiomas", getIdiomas);

/**
 * @swagger
 * /api/catalogos/habilidades:
 *   get:
 *     summary: Listar habilidades
 *     tags: [Catálogos]
 *     responses:
 *       200:
 *         description: Lista de habilidades
 */
router.get("/habilidades", getHabilidades);

/**
 * @swagger
 * /api/catalogos/tipos-asistencia:
 *   get:
 *     summary: Listar tipos de asistencia
 *     tags: [Catálogos]
 *     responses:
 *       200:
 *         description: Lista de tipos de asistencia
 */
router.get("/tipos-asistencia", getTiposAsistencia);

/**
 * @swagger
 * /api/catalogos/tipos-discapacidad:
 *   get:
 *     summary: Listar tipos de discapacidad
 *     tags: [Catálogos]
 *     responses:
 *       200:
 *         description: Lista de tipos de discapacidad
 */
router.get("/tipos-discapacidad", getTiposDiscapacidad);

/**
 * @swagger
 * /api/catalogos/ciudades:
 *   get:
 *     summary: Listar ciudades
 *     tags: [Catálogos]
 *     responses:
 *       200:
 *         description: Lista de ciudades
 */
router.get("/ciudades", getCiudades);

/**
 * @swagger
 * /api/catalogos/duracion-estimada:
 *   get:
 *     summary: Listar duración estimada
 *     tags: [Catálogos]
 *     responses:
 *       200:
 *         description: Lista de duración estimada
 */
router.get("/duracion-estimada", getDuracionEstimada);


/**
 * @swagger
 * /api/catalogos/zonas:
 *   get:
 *     summary: Listar zonas (opcionalmente filtradas por ciudad)
 *     tags: [Catálogos]
 *     parameters:
 *       - in: query
 *         name: ciudadId
 *         schema:
 *           type: integer
 *         required: false
 *         example: 1
 *     responses:
 *       200:
 *         description: Lista de zonas
 */
router.get("/zonas", getZonas);

export default router;
