import axios from "axios";
import {convertUTCStringsToDates} from "./date-helpers";
import {getOrCreateDeviceUUID} from "./deviceUtils";

// Navigation callback for routing outside of React components
let navigateCallback: ((path: string) => void) | null = null;

export const setNavigateCallback = (callback: (path: string) => void) => {
  navigateCallback = callback;
};

// @ts-ignore
const envServerUrl = window.__env?.VITE_APP_SERVER_URL || import.meta.env.VITE_APP_SERVER_URL;
export const ServerUrl = envServerUrl || window.location.origin;
export const None = "|none|";

export const axiosInstance = axios.create({
  baseURL: `${ServerUrl}/api/`,
  withCredentials: true
})

// Set token from sessionStorage on initialization
const token = sessionStorage.getItem('authToken');
if (token) {
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Add a request interceptor to include the token and device UUID
axiosInstance.interceptors.request.use(
  config => {
    const token = sessionStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add device UUID header for licensing
    const deviceUUID = getOrCreateDeviceUUID();
    config.headers['X-Device-UUID'] = deviceUUID;
    
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
        if (navigateCallback) {
          navigateCallback(`/unauthorized?errorCode=${status}`);
        } else {
          // Fallback to window.location if navigate callback is not set
          window.location.replace(`/unauthorized?errorCode=${status}`);
        }
      }
    }
    return Promise.reject(error);
  }
);