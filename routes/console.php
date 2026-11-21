<?php

declare(strict_types=1);

use App\Models\ArtistContent;
use App\Models\Artwork;
use App\Models\User;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

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

Artisan::command('rademan:backfill-artist-content {--chunk=200} {--dry-run}', function (): int {
    $chunkSize = min(max((int) $this->option('chunk'), 1), 1000);
    $pending = Artwork::query()->whereNull('artist_content_id');
    $pendingCount = (clone $pending)->count();

    if ($this->option('dry-run')) {
        $this->info("{$pendingCount} artwork records need a content companion.");

        return self::SUCCESS;
    }

    $processed = 0;

    $pending->orderBy('id')->chunkById($chunkSize, function ($artworks) use (&$processed): void {
        foreach ($artworks as $candidate) {
            DB::transaction(function () use ($candidate, &$processed): void {
                $artwork = Artwork::query()->lockForUpdate()->find($candidate->id);

                if (! $artwork || $artwork->artist_content_id !== null) {
                    return;
                }

                $content = ArtistContent::query()->create([
                    'artist_profile_id' => $artwork->artist_profile_id,
                    'source' => ArtistContent::SOURCE_NATIVE,
                    'content_type' => 'artwork',
                    'title' => $artwork->title,
                    'description' => $artwork->description,
                    'media_path' => $artwork->image_path,
                    'publication_status' => ArtistContent::PUBLICATION_DRAFT,
                ]);

                DB::table('artworks')->where('id', $artwork->id)->update(['artist_content_id' => $content->id]);
                $processed++;
            });
        }
    });

    $this->info("Linked {$processed} legacy artwork records to artist content.");

    return self::SUCCESS;
})->purpose('Create resumable artist-content records for legacy artworks');
