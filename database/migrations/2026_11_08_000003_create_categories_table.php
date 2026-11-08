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
        Schema::create('categories', function (Blueprint $table): void {
            $table->id();
            $table->string('name', 100)->unique();
            $table->string('slug', 120)->unique();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });

        $now = now();
        DB::table('categories')->insert([
            ['name' => 'نقاشی', 'slug' => 'painting', 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'عکاسی', 'slug' => 'photography', 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'مجسمه‌سازی', 'slug' => 'sculpture', 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'هنر دیجیتال', 'slug' => 'digital-art', 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'خوشنویسی', 'slug' => 'calligraphy', 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'سایر', 'slug' => 'other', 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
