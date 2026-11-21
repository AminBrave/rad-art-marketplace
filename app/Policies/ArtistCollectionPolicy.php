<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\ArtistCollection;
use App\Models\User;

class ArtistCollectionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isArtist() && $user->artistProfile()->exists();
    }

    public function create(User $user): bool
    {
        return $this->viewAny($user);
    }

    public function view(User $user, ArtistCollection $collection): bool
    {
        return $user->isArtist()
            && $user->artistProfile()->value('id') === $collection->artist_profile_id;
    }

    public function update(User $user, ArtistCollection $collection): bool
    {
        return $this->view($user, $collection);
    }

    public function delete(User $user, ArtistCollection $collection): bool
    {
        return $this->view($user, $collection);
    }
}
