import axios, { AxiosInstance } from "axios";
import { env } from "process";

declare global {
    var axios_api: AxiosInstance | undefined
}

const api = globalThis.axios_api || axios.create({
  baseURL: "https://api.thinkific.com/api/public/v1",
  headers: {
  "Content-Type": "application/json",
  'X-Auth-API-Key': env["API_KEY"],
  'X-Auth-Subdomain': env["API_SUBDOMAIN"]
  }
});
if (process.env.NODE_ENV !== "production") globalThis.axios_api = api

export default api;