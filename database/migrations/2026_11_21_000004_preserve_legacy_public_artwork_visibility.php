<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('artist_contents', function (Blueprint $table): void {
            $table->boolean('legacy_publication')->default(false)->after('publication_status');
        });

        // Existing approved work on public artist profiles was already visible
        // before the content library existed. Grandfather only those records;
        // imported and newly-created content still requires explicit approval.
        DB::table('artist_contents')
            ->join('artworks', 'artworks.artist_content_id', '=', 'artist_contents.id')
            ->join('artist_profiles', 'artist_profiles.id', '=', 'artist_contents.artist_profile_id')
            ->whereColumn('artworks.artist_profile_id', 'artist_contents.artist_profile_id')
            ->where('artist_contents.source', 'native')
            ->where('artist_contents.content_type', 'artwork')
            ->where('artworks.status', 'approved')
            ->where('artist_profiles.is_public', true)
            ->select('artist_contents.id')
            ->orderBy('artist_contents.id')
            ->chunk(500, function ($contents): void {
                DB::table('artist_contents')
                    ->whereIn('id', $contents->pluck('id'))
                    ->update([
                        'legacy_publication' => true,
                        'publication_status' => 'published',
                    ]);
            });
    }

    public function down(): void
    {
        Schema::table('artist_contents', function (Blueprint $table): void {
            $table->dropColumn('legacy_publication');
        });
    }
};
