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
        if (Schema::hasTable('conversation_contexts') && Schema::hasColumn('conversation_contexts', 'inquiry_id')) {
            DB::table('conversation_contexts')->whereNull('artwork_id')->delete();

            $duplicateContexts = DB::table('conversation_contexts')
                ->select('conversation_id', 'artwork_id')
                ->whereNotNull('artwork_id')
                ->groupBy('conversation_id', 'artwork_id')
                ->havingRaw('COUNT(*) > 1')
                ->get();

            foreach ($duplicateContexts as $duplicate) {
                $contextIds = DB::table('conversation_contexts')
                    ->where('conversation_id', $duplicate->conversation_id)
                    ->where('artwork_id', $duplicate->artwork_id)
                    ->orderBy('id')
                    ->pluck('id');

                DB::table('conversation_contexts')->whereIn('id', $contextIds->skip(1))->delete();
            }

            Schema::table('conversation_contexts', function (Blueprint $table): void {
                $table->dropForeign(['inquiry_id']);
                $table->dropUnique('conversation_context_unique');
                $table->dropColumn('inquiry_id');
                $table->unique(['conversation_id', 'artwork_id'], 'conversation_artwork_context_unique');
            });
        }

        if (Schema::hasTable('conversations') && Schema::hasColumn('conversations', 'inquiry_id')) {
            Schema::table('conversations', function (Blueprint $table): void {
                $table->dropForeign(['inquiry_id']);
                $table->dropIndex(['inquiry_id']);
                $table->dropColumn('inquiry_id');
            });
        }

        Schema::dropIfExists('artist_inquiries');
    }

    public function down(): void
    {
        throw new RuntimeException('Legacy artist inquiries were permanently removed; this migration cannot restore deleted inquiry data.');
    }
};
