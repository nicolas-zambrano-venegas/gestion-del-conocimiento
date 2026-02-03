import { Collection } from "../core/Collection";
import { Estado } from "../models/Estado";

export class EstadosCollection extends Collection {
    constructor(client) {
        super(client, { path: "/estados", Model: Estado });
    }
}
