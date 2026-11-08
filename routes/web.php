<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\AdminUserController;
use App\Http\Controllers\Api\V1\ArtistProfileController;
use App\Http\Controllers\Api\V1\AuthController;
use Illuminate\Support\Facades\Route;

Route::view('/', 'app')->name('home');
Route::view('/artists/{slug}', 'app')->name('artists.page');

Route::prefix('api/v1')->name('api.v1.')->group(function (): void {
    Route::prefix('auth')->name('auth.')->group(function (): void {
        Route::middleware(['guest', 'throttle:5,1'])->group(function (): void {
            Route::post('/register', [AuthController::class, 'register'])->name('register');
            Route::post('/login', [AuthController::class, 'login'])->name('login');
        });

        Route::middleware('auth')->group(function (): void {
            Route::get('/me', [AuthController::class, 'me'])->name('me');
            Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
        });
    });

    Route::get('/artists/{artistProfile:slug}', [ArtistProfileController::class, 'publicShow'])
        ->name('artists.show');

    Route::middleware(['auth', 'role:artist,admin'])->group(function (): void {
        Route::get('/artist-profile/me', [ArtistProfileController::class, 'mine'])
            ->name('artist-profile.me');
        Route::put('/artist-profile/me', [ArtistProfileController::class, 'saveMine'])
            ->name('artist-profile.save');
        Route::get('/artist-profiles/{artistProfile}', [ArtistProfileController::class, 'show'])
            ->name('artist-profiles.show');
        Route::patch('/artist-profiles/{artistProfile}', [ArtistProfileController::class, 'update'])
            ->name('artist-profiles.update');
    });

    Route::prefix('admin')->name('admin.')->middleware(['auth', 'role:admin'])->group(function (): void {
        Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');
        Route::patch('/users/{user}/role', [AdminUserController::class, 'updateRole'])->name('users.role');
    });
});
