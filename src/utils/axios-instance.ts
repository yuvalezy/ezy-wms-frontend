import axios from "axios";

export const ServerUrl = import.meta.env.VITE_APP_SERVER_URL || "http://localhost:5000";
export const Debug = import.meta.env.VITE_APP_DEBUG === "true";
export const Test = import.meta.env.VITE_APP_TEST === "true";
export const Mockup = import.meta.env.VITE_APP_MOCKUP === "true";

export const axiosInstance = axios.create({
  baseURL: `${ServerUrl}/api/`,
  withCredentials: true
})