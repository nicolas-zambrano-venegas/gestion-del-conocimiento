import { Collection } from "../core/Collection";
import { Docente } from "../models/Docente";

export class DocentesCollection extends Collection {
    constructor(client) {
        super(client, { path: "/docentes", Model: Docente });
    }

    async getProyectos(docenteId) {
        const data = await this.client.http.get(`/docentes/${docenteId}/proyectos`);
        if (!Array.isArray(data)) return [];
        const { Proyecto } = await import("../models/Proyecto");
        return data.map((item) => new Proyecto(this.client, item));
    }
}
