<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Artwork;
use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminPaginationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_summary_endpoints_return_only_the_requested_rows_and_keep_totals(): void
    {
        $admin = $this->makeUser('admin@example.com', User::ROLE_ADMIN);
        $artist = $this->makeUser('artist@example.com', User::ROLE_ARTIST);
        $profile = $artist->artistProfile()->create([
            'slug' => 'summary-artist',
            'display_name' => 'هنرمند نمونه',
            'is_public' => true,
        ]);
        $category = Category::query()->where('slug', 'painting')->firstOrFail();

        foreach (range(1, 3) as $index) {
            $profile->artworks()->create([
                'category_id' => $category->id,
                'slug' => 'pending-summary-'.$index,
                'title' => 'اثر در انتظار '.$index,
                'image_path' => 'artworks/pending-summary-'.$index.'.jpg',
                'status' => Artwork::STATUS_PENDING_REVIEW,
                'availability' => 'available',
            ]);
        }

        foreach (range(1, 3) as $index) {
            $this->makeUser('buyer-'.$index.'@example.com', User::ROLE_BUYER);
        }

        $this->actingAs($admin)
            ->getJson('/api/v1/admin/artworks?status=pending_review&per_page=1')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('per_page', 1)
            ->assertJsonPath('total', 3);

        $this->actingAs($admin)
            ->getJson('/api/v1/admin/users?per_page=1')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('per_page', 1)
            ->assertJsonPath('total', 5);
    }

    private function makeUser(string $email, string $role): User
    {
        return User::create([
            'name' => 'Test User',
            'email' => $email,
            'password' => 'strong-password-123',
            'role' => $role,
        ]);
    }
}
