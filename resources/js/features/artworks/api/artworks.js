import { httpClient } from '../../../shared/api';

const emptyFilters = { mediums: [], availability: [], sorts: [] };

export async function fetchArtworkFilters({ signal } = {}) {
    const [categoryResponse, filterResponse] = await Promise.all([
        httpClient.get('/api/v1/categories', { signal }),
        httpClient.get('/api/v1/artwork-filters', { signal }),
    ]);

    return {
        categories: categoryResponse.data.data ?? [],
        filters: filterResponse.data.data ?? emptyFilters,
    };
}

export async function fetchArtworks({ params, signal }) {
    const { data } = await httpClient.get('/api/v1/artworks', { params, signal });
    return data;
}

export async function fetchArtworkBySlug({ slug, signal }) {
    const { data } = await httpClient.get('/api/v1/artworks/' + encodeURIComponent(slug), { signal });
    return data.data;
}
