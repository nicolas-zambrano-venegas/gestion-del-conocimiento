/**
 * @typedef {Object} ProfesorCreate
 * @property {number} usuario_id
 * @property {number | null} [curso_asignado]
 */

/**
 * @typedef {Object} ProfesorRead
 * @property {number} usuario_id
 * @property {number | null} curso_asignado
 */

/**
 * @typedef {Object} ProfesorUpdate
 * @property {number | null} [curso_asignado]
 */

/**
 * @typedef {Object} CalificacionCreate
 * @property {number} evidencia_id
 * @property {number} profesor_id
 * @property {number} nota
 * @property {number} estado_id
 * @property {string | null} [observaciones]
 */

/**
 * @typedef {Object} CalificacionRead
 * @property {number} id
 * @property {number} evidencia_id
 * @property {number} profesor_id
 * @property {number} nota
 * @property {number} estado_id
 * @property {string | null} observaciones
 */

/**
 * @typedef {Object} CalificacionUpdate
 * @property {number | null} [evidencia_id]
 * @property {number | null} [profesor_id]
 * @property {number | null} [nota]
 * @property {number | null} [estado_id]
 * @property {string | null} [observaciones]
 */

export {};
