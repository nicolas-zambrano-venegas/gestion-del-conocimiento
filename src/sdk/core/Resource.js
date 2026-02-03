export class Resource {
    constructor(client, data = {}) {
        this.client = client;
        this.update(data);
    }

    update(data = {}) {
        Object.assign(this, data);
        return this;
    }

    toJSON() {
        const { client, ...json } = this;
        return json;
    }
}
