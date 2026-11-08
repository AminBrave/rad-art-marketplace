<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\ArtistProfile;
use App\Models\User;

class ArtistProfilePolicy
{
    public function create(User $user): bool
    {
        return $user->isArtist() || $user->isAdmin();
    }

    public function view(?User $user, ArtistProfile $artistProfile): bool
    {
        return $artistProfile->is_public
            || ($user !== null && ($user->isAdmin() || $user->id === $artistProfile->user_id));
    }

    public function update(User $user, ArtistProfile $artistProfile): bool
    {
        return $user->isAdmin() || $user->id === $artistProfile->user_id;
    }
}
