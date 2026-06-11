import axios from "axios";
import {convertUTCStringsToDates} from "./date-helpers";
import {getOrCreateDeviceUUID} from "./deviceUtils";

// Navigation callback for routing outside of React components
let navigateCallback: ((path: string) => void) | null = null;
let authFailureCallback: (() => void) | null = null;

export const setNavigateCallback = (callback: (path: string) => void) => {
  navigateCallback = callback;
};

export const setAuthFailureCallback = (callback: () => void) => {
  authFailureCallback = callback;
};

export const clearStoredAuth = () => {
  sessionStorage.removeItem('authToken');
  sessionStorage.removeItem('tokenExpiration');
  delete axiosInstance.defaults.headers.common['Authorization'];
};

// Active request tracking for idle timeout awareness
let activeRequestCount = 0;

export const hasActiveRequests = (): boolean => activeRequestCount > 0;

// @ts-ignore
const envServerUrl = window.__env?.VITE_APP_SERVER_URL || import.meta.env.VITE_APP_SERVER_URL;
const isDevelopment = import.meta.env.DEV;
export const ServerUrl = isDevelopment ? envServerUrl : window.location.origin;
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

const shouldSkipAuthRedirect = (url?: string) => {
  if (!url) {
    return false;
  }

  const normalizedUrl = url.toLowerCase();
  return normalizedUrl.includes('authentication/login') ||
    normalizedUrl.includes('authentication/logout') ||
    normalizedUrl.includes('authentication/companyinfo');
};

const buildLoginRedirect = () => {
  const currentPath = `${window.location.pathname}${window.location.search}`;
  if (window.location.pathname === '/login') {
    return '/login?reason=session-expired';
  }
  return `/login?reason=session-expired&returnUrl=${encodeURIComponent(currentPath)}`;
};

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

    activeRequestCount++;

    return config;
  },
  error => {
    activeRequestCount = Math.max(0, activeRequestCount - 1);
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  response => {
    activeRequestCount = Math.max(0, activeRequestCount - 1);
    response.data = convertUTCStringsToDates(response.data);
    return response;
  },
  error => {
    activeRequestCount = Math.max(0, activeRequestCount - 1);
    const response = error.response;
    if (response) {
      const status = response.status;
      if (status === 401 && !shouldSkipAuthRedirect(error.config?.url)) {
        clearStoredAuth();
        authFailureCallback?.();
        const loginPath = buildLoginRedirect();
        if (navigateCallback) {
          navigateCallback(loginPath);
        } else {
          window.location.replace(loginPath);
        }
      } else if (status === 403 && !shouldSkipAuthRedirect(error.config?.url)) {
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
