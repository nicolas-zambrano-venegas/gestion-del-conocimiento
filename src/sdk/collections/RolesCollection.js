import { Collection } from "../core/Collection";
import { Rol } from "../models/Rol";

export class RolesCollection extends Collection {
    constructor(client) {
        super(client, { path: "/roles", Model: Rol });
    }
}
