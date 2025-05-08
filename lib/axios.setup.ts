import axios, { AxiosInstance } from "axios";

declare global {
    var axios_api: AxiosInstance | undefined
}

const api = globalThis.axios_api || axios.create({
  baseURL: "https://api.thinkific.com/api/public/v1",
  headers: {
    "Content-Type": "application/json",
    'X-Auth-API-Key': process.env.API_KEY || '',
    'X-Auth-Subdomain': process.env.API_SUBDOMAIN || ''
  }
});

if (process.env.NODE_ENV !== "production") globalThis.axios_api = api

export default api;