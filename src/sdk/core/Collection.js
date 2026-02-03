export class Collection {
    constructor(client, { path, Model }) {
        this.client = client;
        this.path = path;
        this.Model = Model;
    }

    _getId(data) {
        return data?.codigo ?? data?.id ?? null;
    }

    async list(params = {}, { withMeta = true, invalidateCache = true, cache = true } = {}) {
        const normalized = { ...params };
        if (normalized.pageSize !== undefined && normalized.page_size === undefined) {
            normalized.page_size = normalized.pageSize;
            delete normalized.pageSize;
        }
        if (invalidateCache) {
            this.client.invalidateCacheByPrefix(`${this.path}:`);
        }
        const data = await this.client.http.get(this.path, { params: normalized });
        const items = Array.isArray(data) ? data : data?.items ?? [];
        const meta = Array.isArray(data) ? null : data?.meta ?? null;
        const models = items.map((item) => new this.Model(this.client, item));
        if (cache) {
            models.forEach((model) => {
                const id = this._getId(model);
                if (id !== null && id !== undefined) {
                    this.client.setCache(`${this.path}:${id}`, model);
                }
            });
        }
        return withMeta ? { items: models, meta } : models;
    }

    async get(id, { cache = true } = {}) {
        const cacheKey = `${this.path}:${id}`;
        if (!cache) {
            const data = await this.client.http.get(`${this.path}/${id}`);
            return new this.Model(this.client, data);
        }
        return this.client.getCached(cacheKey, async () => {
            const data = await this.client.http.get(`${this.path}/${id}`);
            return new this.Model(this.client, data);
        });
    }

    async create(payload) {
        const data = await this.client.http.post(this.path, payload);
        const model = new this.Model(this.client, data);
        const id = this._getId(model);
        if (id !== null) {
            this.client.setCache(`${this.path}:${id}`, model);
        }
        return model;
    }

    async update(id, payload) {
        const data = await this.client.http.put(`${this.path}/${id}`, payload);
        const model = new this.Model(this.client, data);
        const cacheId = this._getId(model) ?? id;
        if (cacheId !== null && cacheId !== undefined) {
            this.client.setCache(`${this.path}:${cacheId}`, model);
        }
        return model;
    }

    delete(id) {
        this.client.invalidateCache(`${this.path}:${id}`);
        return this.client.http.delete(`${this.path}/${id}`);
    }
}
