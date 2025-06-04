import axios from "axios";
import { convertUTCStringsToDates } from "./date-helpers";

export const ServerUrl = import.meta.env.VITE_APP_SERVER_URL || "http://localhost:5000";
export const Debug = import.meta.env.VITE_APP_DEBUG === "true";
export const Test = import.meta.env.VITE_APP_TEST === "true";
export const Mockup = import.meta.env.VITE_APP_MOCKUP === "true";
export const None = "|none|";

export const axiosInstance = axios.create({
  baseURL: `${ServerUrl}/api/`,
  withCredentials: true
})

// Set token from localStorage on initialization
const token = localStorage.getItem('authToken');
if (token) {
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Add a request interceptor to include the token
axiosInstance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  response => {
    response.data = convertUTCStringsToDates(response.data);
    return response;
  },
  error => {
    const response = error.response;
    if (response) {
      const status = response.status;
      if (status === 401 || status == 403) {
        // Clear tokens on authentication failure
        localStorage.removeItem('authToken');
        localStorage.removeItem('tokenExpiration');
        // Clear default header
        delete axiosInstance.defaults.headers.common['Authorization'];
        // Handle the error, e.g., redirect to login page
        window.location.replace('/');
      }
    }
    return Promise.reject(error);
  }
);