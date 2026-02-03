export class EventEmitter {
    constructor() {
        this.listeners = new Map();
    }

    on(event, handler) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(handler);
        return () => this.off(event, handler);
    }

    once(event, handler) {
        const wrapper = (...args) => {
            this.off(event, wrapper);
            handler(...args);
        };
        return this.on(event, wrapper);
    }

    off(event, handler) {
        const handlers = this.listeners.get(event);
        if (!handlers) return;
        handlers.delete(handler);
        if (handlers.size === 0) {
            this.listeners.delete(event);
        }
    }

    emit(event, payload) {
        const handlers = this.listeners.get(event);
        if (!handlers) return;
        handlers.forEach((handler) => handler(payload));
    }
}
