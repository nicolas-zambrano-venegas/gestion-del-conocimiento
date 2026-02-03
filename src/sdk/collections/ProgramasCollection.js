    import { Collection } from "../core/Collection";
import { Programa } from "../models/Programa";

export class ProgramasCollection extends Collection {
    constructor(client) {
        super(client, { path: "/programas", Model: Programa });
    }
}
