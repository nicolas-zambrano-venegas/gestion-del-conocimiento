import { Collection } from "../core/Collection";
import { Calificacion } from "../models/Calificacion";

export class CalificacionesCollection extends Collection {
    constructor(client) {
        super(client, { path: "/calificaciones", Model: Calificacion });
    }

        async getByProyecto(proyectoId, options = undefined) {
        return this.client.http.get(
            `/calificaciones/proyecto/${proyectoId}`,
            undefined,
            options
        );
    }
}
