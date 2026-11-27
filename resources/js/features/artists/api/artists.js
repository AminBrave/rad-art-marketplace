import { httpClient } from '../../../shared/api/httpClient';

export async function fetchArtists({ query, page, signal }) {
    const { data } = await httpClient.get('/api/v1/artists', {
        params: { q: query || undefined, page },
        signal,
    });
    return data;
}

export async function fetchArtistProfile({ slug, pageParam, signal }) {
    const { data } = await httpClient.get('/api/v1/artists/' + encodeURIComponent(slug), {
        params: { artworks_page: pageParam },
        signal,
    });
    return data.data;
}

export async function followArtist({ slug }) {
    return httpClient.post('/api/v1/artists/' + encodeURIComponent(slug) + '/follow');
}

export async function unfollowArtist({ slug }) {
    return httpClient.delete('/api/v1/artists/' + encodeURIComponent(slug) + '/follow');
}

export async function fetchArtistWorkspaceArtworks({ signal }) {
    const { data } = await httpClient.get('/api/v1/artist/artworks', { signal });
    return data;
}
