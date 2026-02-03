import { Resource } from "../core/Resource";
import { Proyecto } from "./Proyecto";

export class Estudiante extends Resource {
    async getProyecto() {
        if (this.proyecto && typeof this.proyecto === "object") {
            return new Proyecto(this.client, this.proyecto);
        }
        const estudianteId = this.id ?? this.estudiante_id ?? this.estudianteId ?? null;
        if (!estudianteId) return null;
        return this.client.getEstudianteProyecto(estudianteId);
    }

    get proyecto() {
        return this.getProyecto();
    }
}
