<?php

declare(strict_types=1);

namespace Tests\Feature\Discovery;

use App\Models\ArtistProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class ArtistDirectorySearchNormalizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_artist_directory_search_normalizes_arabic_character_variants_and_null_columns(): void
    {
        $matchingProfile = $this->createPublicProfile(
            'arabic-variant-artist',
            'كيفيت هنر',
            null,
        );
        $this->createPublicProfile(
            'unrelated-artist',
            'هنرمند دیگر',
            'شیراز',
        );

        $this->getJson('/api/v1/artists?q='.urlencode('کیفیت'))
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', $matchingProfile->slug);
    }

    public function test_artist_directory_search_matches_normalized_city_and_escapes_like_wildcards(): void
    {
        $cityProfile = $this->createPublicProfile(
            'kashan-artist',
            'هنرمند شهر',
            'کاشان',
        );
        $literalWildcard = $this->createPublicProfile(
            'literal-percent-artist',
            'هنرمند 100% واقعی',
            null,
        );
        $this->createPublicProfile(
            'ordinary-percent-artist',
            'هنرمند 100X واقعی',
            null,
        );

        $this->getJson('/api/v1/artists?q='.urlencode('كاشان'))
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', $cityProfile->slug);

        $this->getJson('/api/v1/artists?q=%25')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', $literalWildcard->slug);
    }

    private function createPublicProfile(string $slug, string $name, ?string $city): ArtistProfile
    {
        $user = User::query()->create([
            'name' => $name,
            'email' => $slug.'@example.test',
            'password' => 'strong-password-123',
            'role' => User::ROLE_ARTIST,
        ]);

        return $user->artistProfile()->create([
            'slug' => $slug,
            'display_name' => $name,
            'city' => $city,
            'is_public' => true,
        ]);
    }
}
