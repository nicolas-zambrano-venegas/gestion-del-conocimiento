import { Client } from "./client/Client";

const baseUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const token = localStorage.getItem("token");
const client = new Client({ baseUrl, token, retries: 1, retryDelay: 400 });

export { Client };
export default client;