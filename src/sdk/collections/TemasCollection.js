import { Collection } from "../core/Collection";
import { Tema } from "../models/Tema";

export class TemasCollection extends Collection {
    constructor(client) {
        super(client, { path: "/temas", Model: Tema });
    }
}
