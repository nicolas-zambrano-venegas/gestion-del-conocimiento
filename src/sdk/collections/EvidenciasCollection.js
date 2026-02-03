import { Collection } from "../core/Collection";
import { Evidencia } from "../models/Evidencia";

export class EvidenciasCollection extends Collection {
    constructor(client) {
        super(client, { path: "/evidencias", Model: Evidencia });
    }
}
