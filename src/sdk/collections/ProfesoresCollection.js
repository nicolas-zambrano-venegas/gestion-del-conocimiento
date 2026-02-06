import { Collection } from "../core/Collection";
import { Profesor } from "../models/Profesor";

export class ProfesoresCollection extends Collection {
    constructor(client) {
        super(client, { path: "/profesores", Model: Profesor });
    }

    _getId(data) {
        return data?.usuario_id ?? data?.usuarioId ?? super._getId(data);
    }
}
