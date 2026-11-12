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

            // Install replacement indexes before removing the legacy composite index.
            // MySQL may be using that old index to support the artwork foreign key.
            if (! $this->hasIndex('conversation_contexts', 'conversation_artwork_context_unique')) {
                Schema::table('conversation_contexts', function (Blueprint $table): void {
                    $table->unique(['conversation_id', 'artwork_id'], 'conversation_artwork_context_unique');
                });
            }

            if (! $this->hasIndex('conversation_contexts', 'conversation_context_artwork_id_index')) {
                Schema::table('conversation_contexts', function (Blueprint $table): void {
                    $table->index('artwork_id', 'conversation_context_artwork_id_index');
                });
            }

            if ($this->hasForeignKey('conversation_contexts', 'conversation_contexts_inquiry_id_foreign')) {
                Schema::table('conversation_contexts', function (Blueprint $table): void {
                    $table->dropForeign(
                        DB::connection()->getDriverName() === 'sqlite'
                            ? ['inquiry_id']
                            : 'conversation_contexts_inquiry_id_foreign'
                    );
                });
            }

            if ($this->hasIndex('conversation_contexts', 'conversation_context_unique')) {
                Schema::table('conversation_contexts', function (Blueprint $table): void {
                    $table->dropUnique('conversation_context_unique');
                });
            }

            if (Schema::hasColumn('conversation_contexts', 'inquiry_id')) {
                Schema::table('conversation_contexts', function (Blueprint $table): void {
                    $table->dropColumn('inquiry_id');
                });
            }
        }

        if (Schema::hasTable('conversations') && Schema::hasColumn('conversations', 'inquiry_id')) {
            if ($this->hasForeignKey('conversations', 'conversations_inquiry_id_foreign')) {
                Schema::table('conversations', function (Blueprint $table): void {
                    $table->dropForeign(
                        DB::connection()->getDriverName() === 'sqlite'
                            ? ['inquiry_id']
                            : 'conversations_inquiry_id_foreign'
                    );
                });
            }

            if ($this->hasIndex('conversations', 'conversations_inquiry_id_index')) {
                Schema::table('conversations', function (Blueprint $table): void {
                    $table->dropIndex('conversations_inquiry_id_index');
                });
            }

            if (Schema::hasColumn('conversations', 'inquiry_id')) {
                Schema::table('conversations', function (Blueprint $table): void {
                    $table->dropColumn('inquiry_id');
                });
            }
        }

        Schema::dropIfExists('artist_inquiries');
    }

    private function hasIndex(string $table, string $index): bool
    {
        return collect(Schema::getIndexes($table))
            ->contains(fn (array $definition): bool => ($definition['name'] ?? null) === $index);
    }

    private function hasForeignKey(string $table, string $constraint): bool
    {
        return collect(Schema::getForeignKeys($table))
            ->contains(fn (array $definition): bool => ($definition['name'] ?? null) === $constraint
                || in_array('inquiry_id', $definition['columns'] ?? [], true));
    }

    public function down(): void
    {
        throw new RuntimeException('Legacy artist inquiries were permanently removed; this migration cannot restore deleted inquiry data.');
    }
};
