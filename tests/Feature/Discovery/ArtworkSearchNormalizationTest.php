<?php

declare(strict_types=1);

namespace Tests\Feature\Discovery;

use App\Models\Artwork;
use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class ArtworkSearchNormalizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_search_matches_arabic_and_persian_character_variants(): void
    {
        $profile = $this->publicArtistProfile();
        $artwork = $profile->artworks()->create([
            'category_id' => $this->category()->id,
            'slug' => 'arabic-keyboard-title',
            'title' => 'كيفيت آبى',
            'description' => 'اثر آزمایشی',
            'image_path' => 'artworks/arabic-keyboard-title.jpg',
            'status' => Artwork::STATUS_APPROVED,
            'availability' => 'available',
        ]);

        $this->getJson('/api/v1/artworks?q='.urlencode('کیفیت آبی'))
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', $artwork->slug);
    }

    public function test_public_search_treats_sql_like_wildcards_as_literal_characters(): void
    {
        $profile = $this->publicArtistProfile();
        $literalPercent = $profile->artworks()->create([
            'category_id' => $this->category()->id,
            'slug' => 'literal-percent',
            'title' => 'اثر با تخفیف 100% واقعی',
            'image_path' => 'artworks/literal-percent.jpg',
            'status' => Artwork::STATUS_APPROVED,
            'availability' => 'available',
        ]);
        $ordinary = $profile->artworks()->create([
            'category_id' => $this->category()->id,
            'slug' => 'ordinary-percent',
            'title' => 'اثر با تخفیف 100X واقعی',
            'image_path' => 'artworks/ordinary-percent.jpg',
            'status' => Artwork::STATUS_APPROVED,
            'availability' => 'available',
        ]);

        $this->getJson('/api/v1/artworks?q=%25')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', $literalPercent->slug)
            ->assertJsonMissing(['slug' => $ordinary->slug]);
    }

    private function publicArtistProfile(): \App\Models\ArtistProfile
    {
        $user = User::query()->create([
            'name' => 'هنرمند جست‌وجو',
            'email' => 'artwork-search@example.test',
            'password' => 'strong-password-123',
            'role' => User::ROLE_ARTIST,
        ]);

        return $user->artistProfile()->create([
            'slug' => 'artwork-search-artist',
            'display_name' => 'هنرمند جست‌وجو',
            'is_public' => true,
        ]);
    }

    private function category(): Category
    {
        return Category::query()->firstOrCreate(
            ['slug' => 'search-test-category'],
            ['name' => 'دسته آزمایش جست‌وجو', 'is_active' => true],
        );
    }
}
