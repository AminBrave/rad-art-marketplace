<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Artwork;
use App\Models\User;

class ArtworkPolicy
{
    public function create(User $user): bool
    {
        return $user->isArtist() && $user->artistProfile()->exists();
    }

    public function view(?User $user, Artwork $artwork): bool
    {
        return $artwork->status === Artwork::STATUS_APPROVED
            || ($user !== null && ($user->isAdmin() || $user->artistProfile?->id === $artwork->artist_profile_id));
    }

    public function update(User $user, Artwork $artwork): bool
    {
        return $user->isAdmin() || $user->artistProfile?->id === $artwork->artist_profile_id;
    }

    public function delete(User $user, Artwork $artwork): bool
    {
        return $this->update($user, $artwork);
    }
}
