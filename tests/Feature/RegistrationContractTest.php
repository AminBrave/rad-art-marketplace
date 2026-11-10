<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class RegistrationContractTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_normalizes_email_and_hashes_password(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'name' => 'Buyer Contract',
            'email' => 'BUYER.CONTRACT@EXAMPLE.TEST',
            'password' => 'strong-password-123',
            'password_confirmation' => 'strong-password-123',
            'role' => User::ROLE_BUYER,
        ])->assertCreated()
            ->assertJsonPath('data.email', 'buyer.contract@example.test')
            ->assertJsonPath('data.role', User::ROLE_BUYER);

        $user = User::query()->where('email', 'buyer.contract@example.test')->firstOrFail();
        $this->assertTrue(Hash::check('strong-password-123', $user->password));
        $this->assertNotSame('strong-password-123', $user->password);
    }
}
