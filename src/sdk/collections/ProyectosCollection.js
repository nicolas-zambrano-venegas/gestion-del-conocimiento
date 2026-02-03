import { Collection } from "../core/Collection";
import { Proyecto } from "../models/Proyecto";

export class ProyectosCollection extends Collection {
    constructor(client) {
        super(client, { path: "/proyectos", Model: Proyecto });
    }

    async getEstudiantes(proyectoId) {
        const data = await this.client.http.get(`/proyectos/${proyectoId}/estudiantes`);
        if (!Array.isArray(data)) return [];
        const { Estudiante } = await import("../models/Estudiante");
        return data.map((item) => new Estudiante(this.client, item));
    }
}
