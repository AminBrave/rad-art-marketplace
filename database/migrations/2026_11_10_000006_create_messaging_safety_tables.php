<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_blocks', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('blocker_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('blocked_user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['blocker_user_id', 'blocked_user_id']);
            $table->index(['blocked_user_id', 'blocker_user_id']);
        });

        Schema::create('message_reports', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('conversation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('message_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('reporter_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('reason', 32);
            $table->text('details')->nullable();
            $table->string('status', 24)->default('open')->index();
            $table->foreignId('reviewed_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
            $table->index(['conversation_id', 'created_at']);
            $table->unique(['reporter_user_id', 'message_id']);
        });

        Schema::create('message_moderation_audits', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('report_id')->constrained('message_reports')->cascadeOnDelete();
            $table->foreignId('admin_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('action', 32);
            $table->string('note', 1000)->nullable();
            $table->timestamps();
            $table->index(['report_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('message_moderation_audits');
        Schema::dropIfExists('message_reports');
        Schema::dropIfExists('user_blocks');
    }
};
