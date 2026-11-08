<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\ArtistInquiry;
use App\Models\ArtistProfile;
use App\Models\Artwork;
use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ArtistInquiryTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_authenticated_buyers_can_send_artist_inquiries(): void
    {
        [$artist, $profile] = $this->artistWithProfile();

        $this->postJson('/api/v1/artists/'.$profile->slug.'/inquiries', $this->validInquiry())
            ->assertUnauthorized();

        $this->actingAs($artist)
            ->postJson('/api/v1/artists/'.$profile->slug.'/inquiries', $this->validInquiry())
            ->assertForbidden();

        $buyer = $this->makeUser('buyer@example.com', User::ROLE_BUYER);

        $this->actingAs($buyer)
            ->postJson('/api/v1/artists/'.$profile->slug.'/inquiries', $this->validInquiry())
            ->assertCreated()
            ->assertJsonPath('data.status', ArtistInquiry::STATUS_NEW)
            ->assertJsonMissingPath('data.buyer.email');

        $this->assertDatabaseHas('artist_inquiries', [
            'artist_profile_id' => $profile->id,
            'sender_user_id' => $buyer->id,
            'status' => ArtistInquiry::STATUS_NEW,
        ]);
    }

    public function test_buyers_can_only_list_and_view_their_own_inquiries(): void
    {
        [, $profile] = $this->artistWithProfile();
        $buyer = $this->makeUser('buyer@example.com', User::ROLE_BUYER);
        $otherBuyer = $this->makeUser('other-buyer@example.com', User::ROLE_BUYER);
        $inquiry = $this->createInquiry($profile, $buyer);

        $this->actingAs($buyer)
            ->getJson('/api/v1/buyer/inquiries')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.artist.slug', $profile->slug);

        $this->actingAs($otherBuyer)
            ->getJson('/api/v1/buyer/inquiries/'.$inquiry->id)
            ->assertNotFound();
    }

    public function test_artists_can_read_and_manage_only_their_own_inquiries(): void
    {
        [$artist, $profile] = $this->artistWithProfile();
        [, $otherProfile] = $this->artistWithProfile('other-artist@example.com');
        $buyer = $this->makeUser('buyer@example.com', User::ROLE_BUYER);
        $inquiry = $this->createInquiry($profile, $buyer);
        $otherInquiry = $this->createInquiry($otherProfile, $buyer, 'پیام برای هنرمند دیگر');

        $this->actingAs($artist)
            ->getJson('/api/v1/artist/inquiries')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.buyer.name', $buyer->name)
            ->assertJsonMissingPath('data.0.buyer.email');

        $this->patchJson('/api/v1/artist/inquiries/'.$inquiry->id, ['status' => ArtistInquiry::STATUS_READ])
            ->assertOk()
            ->assertJsonPath('data.status', ArtistInquiry::STATUS_READ);

        $this->assertNotNull($inquiry->fresh()->read_at);

        $this->patchJson('/api/v1/artist/inquiries/'.$inquiry->id, ['status' => ArtistInquiry::STATUS_ARCHIVED])
            ->assertOk()
            ->assertJsonPath('data.status', ArtistInquiry::STATUS_ARCHIVED);

        $this->getJson('/api/v1/artist/inquiries/'.$otherInquiry->id)->assertNotFound();
        $this->patchJson('/api/v1/artist/inquiries/'.$otherInquiry->id, ['status' => ArtistInquiry::STATUS_READ])
            ->assertNotFound();
    }

    public function test_inquiries_require_a_public_artist_and_valid_message_content(): void
    {
        [, $privateProfile] = $this->artistWithProfile('private@example.com', false);
        $buyer = $this->makeUser('buyer@example.com', User::ROLE_BUYER);

        $this->actingAs($buyer)
            ->postJson('/api/v1/artists/'.$privateProfile->slug.'/inquiries', $this->validInquiry())
            ->assertNotFound();

        [, $publicProfile] = $this->artistWithProfile('public@example.com');
        $this->postJson('/api/v1/artists/'.$publicProfile->slug.'/inquiries', [
            'subject' => 'Hi',
            'message' => 'Short',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['subject', 'message']);
    }

    public function test_artwork_inquiry_must_reference_an_approved_work_by_the_same_artist(): void
    {
        [, $profile] = $this->artistWithProfile();
        [, $otherProfile] = $this->artistWithProfile('other@example.com');
        $buyer = $this->makeUser('buyer@example.com', User::ROLE_BUYER);
        $approved = $this->createArtwork($profile, 'approved-artwork');
        $foreign = $this->createArtwork($otherProfile, 'foreign-artwork');
        $pending = $this->createArtwork($profile, 'pending-artwork', Artwork::STATUS_PENDING_REVIEW);

        $this->actingAs($buyer)
            ->postJson('/api/v1/artists/'.$profile->slug.'/inquiries', [
                ...$this->validInquiry(),
                'artwork_id' => $approved->id,
            ])->assertCreated()->assertJsonPath('data.artwork.slug', $approved->slug);

        $this->postJson('/api/v1/artists/'.$profile->slug.'/inquiries', [
            ...$this->validInquiry(),
            'artwork_id' => $foreign->id,
        ])->assertNotFound();

        $this->postJson('/api/v1/artists/'.$profile->slug.'/inquiries', [
            ...$this->validInquiry(),
            'artwork_id' => $pending->id,
        ])->assertNotFound();
    }

    public function test_honeypot_field_is_rejected(): void
    {
        [, $profile] = $this->artistWithProfile();
        $buyer = $this->makeUser('buyer@example.com', User::ROLE_BUYER);

        $this->actingAs($buyer)
            ->postJson('/api/v1/artists/'.$profile->slug.'/inquiries', [
                ...$this->validInquiry(),
                'honeypot' => 'spam.example',
            ])->assertUnprocessable()
            ->assertJsonValidationErrors('honeypot');
    }

    private function artistWithProfile(string $email = 'artist@example.com', bool $isPublic = true): array
    {
        $artist = $this->makeUser($email);
        $profile = $artist->artistProfile()->create([
            'slug' => 'artist-'.str_replace(['@', '.'], '-', $email),
            'display_name' => 'هنرمند آزمایشی',
            'is_public' => $isPublic,
        ]);

        return [$artist, $profile];
    }

    private function createInquiry(ArtistProfile $profile, User $buyer, string $subject = 'پرسش درباره آثار'): ArtistInquiry
    {
        return ArtistInquiry::query()->create([
            'artist_profile_id' => $profile->id,
            'sender_user_id' => $buyer->id,
            'subject' => $subject,
            'message' => 'مایلم درباره جزئیات و شرایط تهیه این اثر بیشتر بدانم.',
            'status' => ArtistInquiry::STATUS_NEW,
        ]);
    }

    private function createArtwork(ArtistProfile $profile, string $slug, string $status = Artwork::STATUS_APPROVED): Artwork
    {
        return $profile->artworks()->create([
            'category_id' => Category::query()->firstOrFail()->id,
            'slug' => $slug,
            'title' => 'اثر آزمایشی',
            'availability' => 'available',
            'status' => $status,
            'image_path' => 'artworks/'.$slug.'.jpg',
        ]);
    }

    private function makeUser(string $email, string $role = User::ROLE_ARTIST): User
    {
        return User::create([
            'name' => 'کاربر آزمایشی',
            'email' => $email,
            'password' => 'strong-password-123',
            'role' => $role,
        ]);
    }

    private function validInquiry(): array
    {
        return [
            'subject' => 'پرسش درباره اثر هنری',
            'message' => 'مایلم درباره جزئیات و شرایط تهیه این اثر بیشتر بدانم.',
        ];
    }
}
