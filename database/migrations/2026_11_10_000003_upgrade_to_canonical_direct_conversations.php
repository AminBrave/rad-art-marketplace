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
        // Consolidate legacy inquiry threads so each buyer/artist pair has one canonical thread.
        $pairs = DB::table('conversations')
            ->select('buyer_user_id', 'artist_user_id')
            ->groupBy('buyer_user_id', 'artist_user_id')
            ->havingRaw('COUNT(*) > 1')
            ->get();

        foreach ($pairs as $pair) {
            $threads = DB::table('conversations')
                ->where('buyer_user_id', $pair->buyer_user_id)
                ->where('artist_user_id', $pair->artist_user_id)
                ->orderBy('id')
                ->get();
            $canonicalId = $threads->first()->id;
            foreach ($threads->skip(1) as $duplicate) {
                DB::table('messages')->where('conversation_id', $duplicate->id)
                    ->update(['conversation_id' => $canonicalId]);
                DB::table('conversations')->where('id', $canonicalId)->update([
                    'last_message_at' => DB::raw('COALESCE((SELECT MAX(created_at) FROM messages WHERE conversation_id = '.$canonicalId.'), last_message_at)'),
                ]);
                DB::table('conversations')->where('id', $duplicate->id)->delete();
            }
        }

        Schema::table('conversations', function (Blueprint $table): void {
            $table->dropUnique(['inquiry_id']);
            $table->unsignedBigInteger('inquiry_id')->nullable()->change();
            $table->string('pair_key', 64)->nullable()->unique();
        });

        DB::table('conversations')->orderBy('id')->each(function ($conversation): void {
            DB::table('conversations')->where('id', $conversation->id)->update([
                'pair_key' => $conversation->buyer_user_id.':'.$conversation->artist_user_id,
            ]);
        });

        Schema::create('conversation_contexts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('conversation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('artwork_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('inquiry_id')->nullable()->constrained('artist_inquiries')->nullOnDelete();
            $table->foreignId('added_by_user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['conversation_id', 'artwork_id', 'inquiry_id'], 'conversation_context_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('conversation_contexts');
        Schema::table('conversations', function (Blueprint $table): void {
            $table->dropUnique(['pair_key']);
            $table->dropColumn('pair_key');
            $table->unsignedBigInteger('inquiry_id')->nullable(false)->change();
            $table->unique('inquiry_id');
        });
    }
};
