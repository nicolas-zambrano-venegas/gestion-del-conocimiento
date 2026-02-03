export class HttpClient {
    constructor({ baseUrl = "", token = null, fetcher = window.fetch.bind(window), emitter = null, retries = 0, retryDelay = 300 } = {}) {
        this.setBaseUrl(baseUrl);
        this.token = token;
        if (fetcher && typeof fetcher.bind === "function") {
            this.fetcher = fetcher.bind(typeof globalThis !== "undefined" ? globalThis : undefined);
        } else {
            this.fetcher = fetcher;
        }
        this.emitter = emitter;
        this.retries = retries;
        this.retryDelay = retryDelay;
    }

    setBaseUrl(baseUrl) {
        this.baseUrl = String(baseUrl || "").replace(/\/+$/, "");
    }

    setToken(token) {
        this.token = token;
    }

    async request(
        method,
        path,
        {
            params = null,
            body = null,
            headers = {},
            retries = this.retries,
            retryDelay = this.retryDelay,
            retryOn = [408, 429, 500, 502, 503, 504],
        } = {},
    ) {
        const origin = typeof window !== "undefined" && window.location ? window.location.origin : "http://127.0.0.1";
        const url = new URL(path, this.baseUrl || origin);
        if (params) {
            const searchParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value === undefined || value === null) return;
                searchParams.append(key, String(value));
            });
            url.search = searchParams.toString();
        }

        const requestHeaders = {
            Accept: "application/json",
            ...headers,
        };

        if (body !== null) {
            requestHeaders["Content-Type"] = "application/json";
        }

        if (this.token) {
            requestHeaders.Authorization = `Bearer ${this.token}`;
        }

        const payload = {
            method,
            headers: requestHeaders,
            body: body !== null ? JSON.stringify(body) : undefined,
        };

        this.emitter?.emit("request", { method, url: url.toString(), options: payload });

        let attempt = 0;
        while (true) {
            try {
                const response = await this.fetcher(url.toString(), payload);
                const contentType = response.headers.get("content-type") || "";
                let data = null;

                if (contentType.includes("application/json")) {
                    data = await response.json();
                } else if (contentType) {
                    data = await response.text();
                }

                if (!response.ok) {
                    const error = new Error(data?.detail || data?.message || "Request failed");
                    error.status = response.status;
                    error.data = data;

                    if (attempt < retries && retryOn.includes(response.status)) {
                        attempt += 1;
                        await new Promise((resolve) => setTimeout(resolve, retryDelay * attempt));
                        continue;
                    }

                    this.emitter?.emit("error", { error, method, url: url.toString() });
                    throw error;
                }

                this.emitter?.emit("response", {
                    method,
                    url: url.toString(),
                    status: response.status,
                    data,
                });
                return data;
            } catch (error) {
                if (attempt < retries) {
                    attempt += 1;
                    await new Promise((resolve) => setTimeout(resolve, retryDelay * attempt));
                    continue;
                }
                this.emitter?.emit("error", { error, method, url: url.toString() });
                throw error;
            }
        }
    }

    get(path, options) {
        return this.request("GET", path, options);
    }

    post(path, body, options = {}) {
        return this.request("POST", path, { ...options, body });
    }

    put(path, body, options = {}) {
        return this.request("PUT", path, { ...options, body });
    }

    delete(path, options) {
        return this.request("DELETE", path, options);
    }
}
