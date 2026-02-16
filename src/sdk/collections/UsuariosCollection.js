import { Collection } from "../core/Collection";
import { Usuario } from "../models/Usuario";

export class UsuariosCollection extends Collection {
    constructor(client) {
        super(client, { path: "/usuarios", Model: Usuario });
    }

       async updateFoto(payload) {
        return this.client.http.put("/usuarios/me/foto", payload);
    }
    
}
