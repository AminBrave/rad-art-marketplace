import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60_000,
            gcTime: 10 * 60_000,
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            retry: (failureCount, error) => {
                const status = error?.response?.status;

                if (status >= 400 && status < 500 && status !== 408 && status !== 429) {
                    return false;
                }

                return failureCount < 1;
            },
        },
        mutations: {
            retry: false,
        },
    },
});
