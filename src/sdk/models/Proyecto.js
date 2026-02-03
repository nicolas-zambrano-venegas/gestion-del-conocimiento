import { Resource } from "../core/Resource";

export class Proyecto extends Resource {
    async refresh() {
        const id = this.codigo ?? this.id;
        if (!id) return this;
        const fresh = await this.client.proyectos.get(id);
        this.update(fresh.toJSON ? fresh.toJSON() : fresh);
        return this;
    }

    async calificar(payload) {
        return this.client.calificaciones.create(payload);
    }

    async getEstudiantes() {
        const id = this.codigo ?? this.id ?? null;
        if (!id) return [];
        return this.client.proyectos.getEstudiantes(id);
    }

    get estudiantes() {
        return this.getEstudiantes();
    }
}
