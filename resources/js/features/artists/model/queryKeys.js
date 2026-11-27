export const artistKeys = {
    directory: ({ query, page }) => ['artists', { query, page }],
    profilePrefix: (slug) => ['artist-profile', slug],
    profile: (slug, userId) => ['artist-profile', slug, userId ?? 'guest'],
    workspaceArtworks: (userId) => ['artist-workspace', 'artworks', userId],
};
