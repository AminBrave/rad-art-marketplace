<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\ArtistProfile;
use App\Models\Artwork;
use App\Models\CuratedCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Str;
use Illuminate\View\View;

class PublicPageController extends Controller
{
    public function artwork(string $slug): View
    {
        $artwork = Artwork::query()->with(['artistProfile', 'category'])->where('slug', $slug)->firstOrFail();
        $isPublic = $artwork->status === Artwork::STATUS_APPROVED
            && (bool) $artwork->artistProfile?->is_public;
        $viewer = request()->user();
        $isOwnerOrAdmin = $viewer !== null
            && ($viewer->isAdmin() || $viewer->artistProfile?->id === $artwork->artist_profile_id);
        abort_unless($isPublic || $isOwnerOrAdmin, 404);
        $artistName = $artwork->artistProfile?->display_name ?? 'هنرمند راد آرت';
        $description = Str::limit(trim(strip_tags((string) ($artwork->description ?: "اثر هنری {$artwork->title} از {$artistName}؛ جزئیات اثر و راه ارتباط با هنرمند."))), 155);
        $canonical = $isPublic ? $this->canonical('/artworks/'.$artwork->slug) : null;
        $image = $isPublic ? $this->artworkImage($artwork) : null;

        $structuredData = $isPublic ? [
            '@context' => 'https://schema.org',
            '@type' => 'VisualArtwork',
            'name' => $artwork->title,
            'description' => $description,
            'url' => $canonical,
            ...($image ? ['image' => $image] : []),
            'creator' => [
                '@type' => 'Person',
                'name' => $artistName,
                'url' => $this->canonical('/artists/'.$artwork->artistProfile->slug),
            ],
            ...($artwork->medium ? ['artMedium' => $artwork->medium] : []),
            ...($artwork->year ? ['dateCreated' => (string) $artwork->year] : []),
        ] : null;

        return view('app', ['seo' => [
            'title' => $artwork->title.' | راد آرت',
            'description' => $description,
            'canonical' => $canonical,
            'robots' => $isPublic ? 'index,follow' : 'noindex,nofollow',
            'og_type' => 'article',
            'image' => $image,
            'image_alt' => $artwork->title,
            'structured_data' => $structuredData,
        ]]);
    }

    public function artist(string $slug): View
    {
        $profile = ArtistProfile::query()->where('slug', $slug)->firstOrFail();
        $isPublic = (bool) $profile->is_public;
        $viewer = request()->user();
        $isOwnerOrAdmin = $viewer !== null
            && ($viewer->isAdmin() || (int) $viewer->id === (int) $profile->user_id);
        abort_unless($isPublic || $isOwnerOrAdmin, 404);
        $firstArtwork = $isPublic
            ? $profile->artworks()
                ->where('status', Artwork::STATUS_APPROVED)
                ->orderByDesc('id')
                ->first()
            : null;
        $description = Str::limit(trim(strip_tags((string) ($profile->bio ?: "آشنایی با آثار و فعالیت‌های {$profile->display_name} در راد آرت."))), 155);
        $canonical = $isPublic ? $this->canonical('/artists/'.$profile->slug) : null;
        $image = $firstArtwork ? $this->artworkImage($firstArtwork) : null;

        $sameAs = array_values(array_filter([
            $profile->website_url,
            $profile->instagram_handle ? 'https://www.instagram.com/'.ltrim($profile->instagram_handle, '@').'/' : null,
        ]));

        $structuredData = $isPublic ? [
            '@context' => 'https://schema.org',
            '@type' => 'Person',
            'name' => $profile->display_name,
            'description' => $description,
            'url' => $canonical,
            ...($profile->city ? ['address' => ['@type' => 'PostalAddress', 'addressLocality' => $profile->city]] : []),
            ...($sameAs ? ['sameAs' => $sameAs] : []),
        ] : null;

        return view('app', ['seo' => [
            'title' => $profile->display_name.' | هنرمندان راد آرت',
            'description' => $description,
            'canonical' => $canonical,
            'robots' => $isPublic ? 'index,follow' : 'noindex,nofollow',
            'og_type' => 'profile',
            'image' => $image,
            'image_alt' => $profile->display_name,
            'structured_data' => $structuredData,
        ]]);
    }

    public function collection(string $slug): View
    {
        $collection = CuratedCollection::query()->where('slug', $slug)->firstOrFail();
        abort_unless($collection->isPublished(), 404);

        $collection->load(['artworks' => fn ($query) => $query
            ->where('status', Artwork::STATUS_APPROVED)
            ->whereHas('artistProfile', fn ($artist) => $artist->where('is_public', true))
            ->with('artistProfile')
            ->orderByPivot('position')]);
        $firstArtwork = $collection->artworks->first();
        $description = Str::limit(trim(strip_tags((string) ($collection->intro ?: "مجموعه {$collection->title}؛ گزیده‌ای از آثار هنری منتشرشده در راد آرت."))), 155);
        $canonical = $this->canonical('/collections/'.$collection->slug);
        $image = $firstArtwork ? $this->artworkImage($firstArtwork) : null;

        $structuredData = [
            '@context' => 'https://schema.org',
            '@type' => 'CollectionPage',
            'name' => $collection->title,
            'description' => $description,
            'url' => $canonical,
            ...($image ? ['image' => $image] : []),
            'hasPart' => $collection->artworks->map(fn (Artwork $artwork): array => [
                '@type' => 'VisualArtwork',
                'name' => $artwork->title,
                'url' => $this->canonical('/artworks/'.$artwork->slug),
            ])->values()->all(),
        ];

        return view('app', ['seo' => [
            'title' => $collection->title.' | مجموعه‌های راد آرت',
            'description' => $description,
            'canonical' => $canonical,
            'robots' => 'index,follow',
            'og_type' => 'website',
            'image' => $image,
            'image_alt' => $collection->title,
            'structured_data' => $structuredData,
        ]]);
    }

    public function sitemap(): Response
    {
        $staticPaths = ['/', '/artworks', '/artists', '/collections', '/about', '/help', '/contact'];
        $urls = collect($staticPaths)->map(fn (string $path): array => [
            'loc' => $this->canonical($path),
            'lastmod' => now()->toAtomString(),
        ]);

        $urls = $urls->concat(
            Artwork::query()
                ->where('status', Artwork::STATUS_APPROVED)
                ->whereHas('artistProfile', fn ($artist) => $artist->where('is_public', true))
                ->get(['slug', 'updated_at'])
                ->map(fn (Artwork $artwork): array => [
                    'loc' => $this->canonical('/artworks/'.$artwork->slug),
                    'lastmod' => $artwork->updated_at?->toAtomString(),
                ])
        )->concat(
            ArtistProfile::query()->where('is_public', true)->get(['slug', 'updated_at'])
                ->map(fn (ArtistProfile $profile): array => [
                    'loc' => $this->canonical('/artists/'.$profile->slug),
                    'lastmod' => $profile->updated_at?->toAtomString(),
                ])
        )->concat(
            CuratedCollection::query()
                ->where('status', 'published')
                ->whereNotNull('published_at')
                ->where('published_at', '<=', now())
                ->get(['slug', 'updated_at'])
                ->map(fn (CuratedCollection $collection): array => [
                    'loc' => $this->canonical('/collections/'.$collection->slug),
                    'lastmod' => $collection->updated_at?->toAtomString(),
                ])
        )->values();

        return response()->view('sitemap', ['urls' => $urls])
            ->header('Content-Type', 'application/xml; charset=UTF-8');
    }

    public function robots(): Response
    {
        $origin = rtrim((string) config('app.url'), '/');
        $content = implode("\n", [
            'User-agent: *',
            'Allow: /',
            'Disallow: /dashboard',
            'Disallow: /admin',
            'Sitemap: '.$origin.'/sitemap.xml',
            '',
        ]);

        return response($content)->header('Content-Type', 'text/plain; charset=UTF-8');
    }

    private function canonical(string $path): string
    {
        return rtrim((string) config('app.url'), '/').'/'.ltrim($path, '/');
    }

    private function artworkImage(Artwork $artwork): ?string
    {
        return Storage::disk('local')->exists($artwork->image_path)
            ? $this->canonical('/api/v1/artworks/'.$artwork->slug.'/image')
            : null;
    }
}
