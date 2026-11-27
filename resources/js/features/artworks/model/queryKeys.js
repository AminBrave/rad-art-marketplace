export const artworkKeys = {
    filters: () => ['artwork-catalogue', 'filters'],
    list: (filters) => ['artworks', filters],
    detail: (slug, userId) => ['artwork', slug, userId ?? 'guest'],
};
