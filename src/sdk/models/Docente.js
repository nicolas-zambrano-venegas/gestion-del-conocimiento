import { Resource } from "../core/Resource";

export class Docente extends Resource {
	async getProyectos() {
		const id = this.id ?? this.docente_id ?? this.docenteId ?? null;
		if (!id) return [];
		return this.client.docentes.getProyectos(id);
	}

	get proyectos() {
		return this.getProyectos();
	}
}
