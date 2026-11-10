<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\ArtistProfile;
use App\Models\Artwork;
use App\Models\Category;
use App\Models\CuratedCollection;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class PublicSeoTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
        config(['app.url' => 'https://rad.example']);
    }

    public function test_public_artwork_page_renders_canonical_social_and_structured_metadata(): void
    {
        [$artist, $profile] = $this->makeArtist('seo-artist', true);
        $artwork = $this->makeArtwork($profile, 'seo-approved-artwork', 'اثر سپهر', Artwork::STATUS_APPROVED);

        $this->get('/artworks/'.$artwork->slug)
            ->assertOk()
            ->assertSee('<title>اثر سپهر | راد آرت</title>', false)
            ->assertSee('<link rel="canonical" href="https://rad.example/artworks/seo-approved-artwork">', false)
            ->assertSee('property="og:image"', false)
            ->assertSee('https://rad.example/api/v1/artworks/seo-approved-artwork/image', false)
            ->assertSee('"@type":"VisualArtwork"', false)
            ->assertSee('name="robots" content="index,follow"', false);
    }

    public function test_private_artist_page_is_hidden_from_guests_and_noindexed_for_its_owner(): void
    {
        [$artist, $profile] = $this->makeArtist('seo-private-artist', false);

        $this->get('/artists/'.$profile->slug)->assertNotFound();

        $this->actingAs($artist)
            ->get('/artists/'.$profile->slug)
            ->assertOk()
            ->assertSee('name="robots" content="noindex,nofollow"', false)
            ->assertDontSee('rel="canonical"', false)
            ->assertDontSee('property="og:image"', false);
    }

    public function test_pending_artwork_page_is_hidden_from_guests_and_noindexed_for_its_owner(): void
    {
        [$artist, $profile] = $this->makeArtist('seo-pending-artist', true);
        $artwork = $this->makeArtwork($profile, 'seo-pending-owner-work', 'اثر در انتظار', Artwork::STATUS_PENDING_REVIEW);

        $this->get('/artworks/'.$artwork->slug)->assertNotFound();

        $this->actingAs($artist)
            ->get('/artworks/'.$artwork->slug)
            ->assertOk()
            ->assertSee('name="robots" content="noindex,nofollow"', false)
            ->assertDontSee('rel="canonical"', false)
            ->assertDontSee('property="og:image"', false);
    }

    public function test_published_collection_page_renders_collection_metadata(): void
    {
        [, $profile] = $this->makeArtist('seo-collection-artist', true);
        $artwork = $this->makeArtwork($profile, 'seo-collection-work', 'اثر مجموعه', Artwork::STATUS_APPROVED);
        $collection = CuratedCollection::query()->create([
            'slug' => 'seo-public-collection-page',
            'title' => 'مجموعه نور',
            'intro' => 'گزیده‌ای از آثار نورپردازی.',
            'status' => 'published',
            'position' => 1,
            'published_at' => now()->subMinute(),
        ]);
        $collection->artworks()->attach($artwork->id, ['position' => 0]);

        $this->get('/collections/'.$collection->slug)
            ->assertOk()
            ->assertSee('<title>مجموعه نور | مجموعه‌های راد آرت</title>', false)
            ->assertSee('rel="canonical"', false)
            ->assertSee('"@type":"CollectionPage"', false)
            ->assertSee('property="og:description"', false);
    }

    public function test_sitemap_contains_only_public_artists_approved_public_artworks_and_published_collections(): void
    {
        [, $publicProfile] = $this->makeArtist('seo-public-artist', true);
        [, $privateProfile] = $this->makeArtist('seo-private-artist-sitemap', false);

        $publicArtwork = $this->makeArtwork($publicProfile, 'seo-public-work', 'اثر عمومی', Artwork::STATUS_APPROVED);
        $this->makeArtwork($publicProfile, 'seo-pending-work', 'اثر در انتظار', Artwork::STATUS_PENDING_REVIEW);
        $this->makeArtwork($privateProfile, 'seo-private-work', 'اثر پروفایل خصوصی', Artwork::STATUS_APPROVED);

        $published = CuratedCollection::query()->create([
            'slug' => 'seo-published-collection',
            'title' => 'مجموعه منتشرشده',
            'intro' => 'گزیده آثار',
            'status' => 'published',
            'position' => 1,
            'published_at' => now()->subMinute(),
        ]);
        $published->artworks()->attach($publicArtwork->id, ['position' => 0]);

        CuratedCollection::query()->create([
            'slug' => 'seo-draft-collection',
            'title' => 'مجموعه پیش‌نویس',
            'status' => 'draft',
            'position' => 2,
        ]);

        $this->get('/sitemap.xml')
            ->assertOk()
            ->assertHeader('Content-Type', 'application/xml; charset=UTF-8')
            ->assertSee('https://rad.example/artists/seo-public-artist', false)
            ->assertSee('https://rad.example/artworks/seo-public-work', false)
            ->assertSee('https://rad.example/collections/seo-published-collection', false)
            ->assertDontSee('seo-private-artist-sitemap', false)
            ->assertDontSee('seo-private-work', false)
            ->assertDontSee('seo-pending-work', false)
            ->assertDontSee('seo-draft-collection', false);
    }

    public function test_robots_txt_points_to_configured_sitemap_and_excludes_authenticated_workspaces(): void
    {
        $this->get('/robots.txt')
            ->assertOk()
            ->assertHeader('Content-Type', 'text/plain; charset=UTF-8')
            ->assertSee('Disallow: /dashboard/', false)
            ->assertSee('Disallow: /admin/', false)
            ->assertSee('Sitemap: https://rad.example/sitemap.xml', false)
            ->assertDontSee('Disallow: /api/', false);
    }

    private function makeArtist(string $slug, bool $isPublic): array
    {
        $artist = User::query()->create([
            'name' => 'هنرمند آزمایشی',
            'email' => $slug.'@example.test',
            'password' => Hash::make('password'),
            'role' => User::ROLE_ARTIST,
        ]);

        $profile = $artist->artistProfile()->create([
            'slug' => $slug,
            'display_name' => 'هنرمند '.$slug,
            'bio' => 'شرح کوتاه هنرمند آزمایشی.',
            'city' => 'تهران',
            'is_public' => $isPublic,
        ]);

        return [$artist, $profile];
    }

    private function makeArtwork(ArtistProfile $profile, string $slug, string $title, string $status): Artwork
    {
        $categoryId = Category::query()->where('slug', 'painting')->value('id');

        return $profile->artworks()->create([
            'category_id' => $categoryId,
            'slug' => $slug,
            'title' => $title,
            'description' => 'توضیح اثر هنری آزمایشی.',
            'medium' => 'رنگ روغن',
            'year' => 2024,
            'status' => $status,
            'image_path' => 'artworks/'.$slug.'.jpg',
            'availability' => 'available',
        ]);
    }
}
