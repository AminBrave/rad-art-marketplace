<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Artwork;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class DirectConversationTest extends TestCase
{
    use RefreshDatabase;

    public function test_buyer_can_start_and_reuse_a_direct_artist_conversation(): void
    {
        $buyer = $this->makeUser('buyer-direct@example.test', User::ROLE_BUYER);
        $artist = $this->makeUser('artist-direct@example.test', User::ROLE_ARTIST);
        $profile = $artist->artistProfile()->create([
            'slug' => 'artist-direct',
            'display_name' => 'هنرمند مستقیم',
            'is_public' => true,
        ]);

        $this->actingAs($buyer)
            ->postJson('/api/v1/conversations/direct', ['artist_slug' => $profile->slug])
            ->assertCreated()
            ->assertJsonStructure(['data' => ['id']]);

        $conversationId = \App\Models\Conversation::query()->value('id');

        $this->postJson('/api/v1/conversations/direct', ['artist_slug' => $profile->slug])
            ->assertCreated()
            ->assertJsonPath('data.id', $conversationId);

        $this->assertDatabaseCount('conversations', 1);
        $this->assertDatabaseHas('conversations', [
            'id' => $conversationId,
            'buyer_user_id' => $buyer->id,
            'artist_user_id' => $artist->id,
            'pair_key' => $buyer->id.':'.$artist->id,
            'inquiry_id' => null,
        ]);

        $this->actingAs($artist)
            ->getJson('/api/v1/artist/conversations')
            ->assertOk()
            ->assertJsonPath('data.0.id', $conversationId)
            ->assertJsonPath('data.0.participant.name', $buyer->name);
    }

    public function test_direct_message_can_attach_an_approved_artwork_context(): void
    {
        $buyer = $this->makeUser('buyer-artwork@example.test', User::ROLE_BUYER);
        $artist = $this->makeUser('artist-artwork@example.test', User::ROLE_ARTIST);
        $profile = $artist->artistProfile()->create([
            'slug' => 'artist-artwork',
            'display_name' => 'هنرمند اثر',
            'is_public' => true,
        ]);
        $category = \App\Models\Category::query()->where('slug', 'painting')->firstOrFail();
        $artwork = $profile->artworks()->create([
            'category_id' => $category->id,
            'slug' => 'approved-artwork',
            'title' => 'اثر تأییدشده',
            'status' => Artwork::STATUS_APPROVED,
            'image_path' => 'artworks/test.jpg',
            'availability' => 'available',
        ]);

        $this->actingAs($buyer)
            ->postJson('/api/v1/conversations/direct', [
                'artist_slug' => $profile->slug,
                'artwork_slug' => $artwork->slug,
            ])
            ->assertCreated();

        $this->assertDatabaseHas('conversation_contexts', [
            'artwork_id' => $artwork->id,
            'added_by_user_id' => $buyer->id,
        ]);
    }

    public function test_direct_message_rejects_private_artists_and_non_buyers(): void
    {
        $buyer = $this->makeUser('buyer-private@example.test', User::ROLE_BUYER);
        $artist = $this->makeUser('artist-private@example.test', User::ROLE_ARTIST);
        $profile = $artist->artistProfile()->create([
            'slug' => 'private-artist',
            'display_name' => 'پروفایل خصوصی',
            'is_public' => false,
        ]);

        $this->actingAs($buyer)
            ->postJson('/api/v1/conversations/direct', ['artist_slug' => $profile->slug])
            ->assertNotFound();

        $this->actingAs($artist)
            ->postJson('/api/v1/conversations/direct', ['artist_slug' => $profile->slug])
            ->assertForbidden();
    }

    private function makeUser(string $email, string $role): User
    {
        return User::query()->create([
            'name' => 'کاربر آزمایشی',
            'email' => $email,
            'password' => Hash::make('password'),
            'role' => $role,
        ]);
    }
}
