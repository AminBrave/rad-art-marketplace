import axios from 'axios';
import { normalizeApiError } from './errors';

// Keep the existing Axios singleton so legacy direct imports and window.axios
// continue to share the same Laravel session, CSRF and request-header defaults.
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
if (apiBaseUrl) {
    axios.defaults.baseURL = apiBaseUrl;
}

axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.headers.common.Accept = 'application/json';
axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;

// Add a normalized view without replacing AxiosError: existing callers retain
// response, request, config, message and status semantics.
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error && typeof error === 'object') {
            error.apiError = normalizeApiError(error);
        }
        return Promise.reject(error);
    },
);

export const httpClient = axios;
export default httpClient;
