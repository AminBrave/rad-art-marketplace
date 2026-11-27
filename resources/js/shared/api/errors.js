function isRecord(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Normalize Laravel/Axios failures for consistent UI handling.
 * The original AxiosError is retained and rejected by the shared client.
 */
export function normalizeApiError(error) {
    const response = error?.response;
    const payload = response?.data;
    const code = error?.code ?? null;
    const isCanceled = code === 'ERR_CANCELED';

    return {
        status: response?.status ?? null,
        code,
        message: typeof payload?.message === 'string'
            ? payload.message
            : (typeof error?.message === 'string' ? error.message : 'Request failed'),
        errors: isRecord(payload?.errors) ? payload.errors : {},
        isCanceled,
        isNetworkError: !response && !isCanceled,
    };
}

/** Read normalized metadata when available, with a safe fallback for raw errors. */
export function getApiError(error) {
    return error?.apiError ?? normalizeApiError(error);
}
