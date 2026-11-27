import { httpClient } from './shared/api/httpClient';

// Legacy consumers of window.axios use the same configured shared client.
window.axios = httpClient;
