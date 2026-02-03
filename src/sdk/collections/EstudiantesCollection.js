import { Collection } from "../core/Collection";
import { Estudiante } from "../models/Estudiante";

export class EstudiantesCollection extends Collection {
    constructor(client) {
        super(client, { path: "/estudiantes", Model: Estudiante });
    }
}
