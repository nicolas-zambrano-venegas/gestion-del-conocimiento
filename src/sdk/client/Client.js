import { HttpClient } from "../core/HttpClient";
import { EventEmitter } from "../core/EventEmitter";
import { UsuariosCollection } from "../collections/UsuariosCollection";
import { EstudiantesCollection } from "../collections/EstudiantesCollection";
import { DocentesCollection } from "../collections/DocentesCollection";
import { ProyectosCollection } from "../collections/ProyectosCollection";
import { CalificacionesCollection } from "../collections/CalificacionesCollection";
import { Proyecto } from "../models/Proyecto";

const decodeJwt = (token) => {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;
    try {
        const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const json = atob(base64);
        return JSON.parse(json);
    } catch (error) {
        return null;
    }
};

export class Client {
    constructor({ baseUrl = "", token = null, fetcher, retries = 0, retryDelay = 300, cacheTtl = 30000 } = {}) {
        this.emitter = new EventEmitter();
        this.http = new HttpClient({ baseUrl, token, fetcher, emitter: this.emitter, retries, retryDelay });
        this.token = token;
        this.role = null;
        this._tokenPayload = decodeJwt(token);
        this._usuario = null;
        this._estudiante = null;
        this._docente = null;
        this._cache = new Map();
        this._inflight = new Map();
        this.cacheTtl = cacheTtl;

        this.usuarios = new UsuariosCollection(this);
        this.estudiantes = new EstudiantesCollection(this);
        this.docentes = new DocentesCollection(this);
        this.proyectos = new ProyectosCollection(this);
        this.calificaciones = new CalificacionesCollection(this);

        if (this._tokenPayload?.role) {
            this.role = this._tokenPayload.role;
        }
    }

    on(event, handler) {
        return this.emitter.on(event, handler);
    }

    once(event, handler) {
        return this.emitter.once(event, handler);
    }

    off(event, handler) {
        return this.emitter.off(event, handler);
    }

    getCached(key, loader) {
        if (this._cache.has(key)) {
            const entry = this._cache.get(key);
            if (!entry || (entry.expiresAt && Date.now() > entry.expiresAt)) {
                this._cache.delete(key);
            } else {
                return Promise.resolve(entry.value);
            }
        }
        if (this._inflight.has(key)) {
            return this._inflight.get(key);
        }
        const promise = Promise.resolve(loader())
            .then((value) => {
                this.setCache(key, value);
                this._inflight.delete(key);
                return value;
            })
            .catch((error) => {
                this._inflight.delete(key);
                throw error;
            });
        this._inflight.set(key, promise);
        return promise;
    }

    setCache(key, value, ttl = undefined) {
        let expiresAt = null;
        if (ttl === undefined) {
            ttl = this.cacheTtl;
        }
        if (ttl !== null) {
            expiresAt = Date.now() + Number(ttl);
        }
        this._cache.set(key, { value, expiresAt });
    }

    invalidateCache(key) {
        this._cache.delete(key);
        this._inflight.delete(key);
    }

    invalidateCacheByPrefix(prefix) {
        for (const key of this._cache.keys()) {
            if (key.startsWith(prefix)) {
                this._cache.delete(key);
                this._inflight.delete(key);
            }
        }
    }

    setToken(token) {
        this.token = token;
        this.http.setToken(token);
        this._tokenPayload = decodeJwt(token);
        if (this._tokenPayload?.role) {
            this.role = this._tokenPayload.role;
        }
        return this;
    }

    setBaseUrl(url) {
        this.http.setBaseUrl(url);
        return this;
    }

    async login({ cedula, password }) {
        const data = await this.http.post("/login", { cedula, password });
        
        if (data?.access_token) {
            this.setToken(data.access_token);
        }
        if (data?.role) {
            this.role = data.role;
        }
        return data;
    }

    async fetchUsuarioByCedula(cedula = this._tokenPayload?.sub) {
        if (!cedula) return null;
        const { items: usuarios } = await this.usuarios.list();
        const usuario = usuarios.find((item) => String(item.cedula) === String(cedula));
        this._usuario = usuario || null;
        return this._usuario;
    }

    async getUsuario() {
        if (this._usuario) return this._usuario;
        return this.fetchUsuarioByCedula();
    }

    get usuario() {
        return this.getUsuario();
    }

    async fetchCurrentEstudiante() {
        if (this._estudiante) return this._estudiante;
        const usuario = await this.getUsuario().catch(() => null);
        const { items: estudiantes } = await this.estudiantes.list();
        let estudiante = null;

        if (usuario) {
            estudiante = estudiantes.find(
                (item) => item.usuario_id === usuario.id || item.usuarioId === usuario.id,
            );
        }

        if (!estudiante && estudiantes.length === 1) {
            estudiante = estudiantes[0];
        }

        this._estudiante = estudiante || null;
        return this._estudiante;
    }

    get estudiante() {
        return this.fetchCurrentEstudiante();
    }

    async fetchCurrentDocente() {
        if (this._docente) return this._docente;
        const usuario = await this.getUsuario().catch(() => null);
        const { items: docentes } = await this.docentes.list();
        let docente = null;

        if (usuario) {
            docente = docentes.find(
                (item) => item.id_usuario === usuario.id || item.idUsuario === usuario.id,
            );
        }

        if (!docente && docentes.length === 1) {
            docente = docentes[0];
        }

        this._docente = docente || null;
        return this._docente;
    }

    get docente() {
        return this.fetchCurrentDocente();
    }

    async getEstudianteProyecto(estudianteId) {
        if (!estudianteId) return null;
        const data = await this.http.get(`/estudiantes/${estudianteId}/proyecto`);
        return new Proyecto(this, data);
    }
}
