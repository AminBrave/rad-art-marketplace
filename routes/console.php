<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Support\Facades\Artisan;

Artisan::command('about:marketplace', function (): void {
    $this->comment('Rad Art Marketplace — Persian-first art discovery.');
})->purpose('Display marketplace project information');

Artisan::command('users:make-admin {email}', function (string $email): int {
    $user = User::query()->where('email', mb_strtolower($email))->first();

    if (! $user) {
        $this->error('No user found with that email address.');

        return self::FAILURE;
    }

    $user->forceFill(['role' => User::ROLE_ADMIN])->save();

    $this->info("{$user->email} is now an administrator.");

    return self::SUCCESS;
})->purpose('Promote an existing user to administrator');
