import axios from 'axios';

// Keep the existing Axios singleton so legacy direct imports and window.axios
// continue to share the same Laravel session, CSRF and request-header defaults.
if (import.meta.env.VITE_API_BASE_URL) {
    axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
}

axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.headers.common.Accept = 'application/json';
axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;

export const httpClient = axios;
export default httpClient;
