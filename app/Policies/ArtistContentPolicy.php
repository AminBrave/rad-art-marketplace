<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\ArtistContent;
use App\Models\User;

class ArtistContentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isArtist() && $user->artistProfile()->exists();
    }

    public function view(User $user, ArtistContent $content): bool
    {
        return $user->isArtist()
            && $user->artistProfile()->value('id') === $content->artist_profile_id;
    }

    public function update(User $user, ArtistContent $content): bool
    {
        return $this->view($user, $content);
    }

    public function adminViewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function moderate(User $user, ArtistContent $content): bool
    {
        return $user->isAdmin();
    }
}
