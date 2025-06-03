import axios from "axios";
import { convertUTCStringsToDates } from "./date-helpers";

export const ServerUrl = import.meta.env.VITE_APP_SERVER_URL || "http://localhost:5000";
export const Debug = import.meta.env.VITE_APP_DEBUG === "true";
export const Test = import.meta.env.VITE_APP_TEST === "true";
export const Mockup = import.meta.env.VITE_APP_MOCKUP === "true";

export const axiosInstance = axios.create({
  baseURL: `${ServerUrl}/api/`,
  withCredentials: true
})

// Add a response interceptor
axiosInstance.interceptors.response.use(
  response => {
    response.data = convertUTCStringsToDates(response.data);
    return response;
  }, // Pass through successful responses
  error => {
    const response = error.response;
    if (response) {
      const status = response.status;
      if (status === 401 || status == 403) {
        // Handle the error, e.g., redirect to login page
        window.location.replace('/');
      }
    }
    return Promise.reject(error); // Reject the promise to propagate the error
  }
);
