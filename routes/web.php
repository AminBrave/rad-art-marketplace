<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\AdminArtworkModerationController;
use App\Http\Controllers\Api\V1\AdminUserController;
use App\Http\Controllers\Api\V1\ArtistInquiryController;
use App\Http\Controllers\Api\V1\ArtistProfileController;
use App\Http\Controllers\Api\V1\ArtworkController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\EditorialController;
use Illuminate\Support\Facades\Route;

Route::view('/', 'app')->name('home');
Route::view('/artists/{slug}', 'app')->name('artists.page');
Route::view('/artworks/{slug}', 'app')->name('artworks.page');

Route::prefix('api/v1')->name('api.v1.')->group(function (): void {
    Route::prefix('auth')->name('auth.')->group(function (): void {
        Route::get('/me', [AuthController::class, 'me'])->name('me');

        Route::middleware(['guest', 'throttle:5,1'])->group(function (): void {
            Route::post('/register', [AuthController::class, 'register'])->name('register');
            Route::post('/login', [AuthController::class, 'login'])->name('login');
        });
        Route::middleware('auth')->group(function (): void {
            Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
        });
    });

    Route::get('/artists', [ArtistProfileController::class, 'index'])->name('artists.index');
    Route::get('/artists/{artistProfile:slug}', [ArtistProfileController::class, 'publicShow'])->name('artists.show');
    Route::post('/artists/{artistProfile:slug}/inquiries', [ArtistInquiryController::class, 'store'])->middleware(['auth', 'role:buyer', 'throttle:5,1'])->name('artists.inquiries.store');

    Route::middleware(['auth', 'role:buyer'])->prefix('buyer')->name('buyer.')->group(function (): void {
        Route::get('/inquiries', [ArtistInquiryController::class, 'buyerIndex'])->name('inquiries.index');
        Route::get('/inquiries/{inquiry}', [ArtistInquiryController::class, 'buyerShow'])->name('inquiries.show');
    });

    Route::get('/collections', [EditorialController::class, 'collections'])->name('collections.index');
    Route::get('/collections/{collection:slug}', [EditorialController::class, 'collection'])->name('collections.show');
    Route::get('/featured-artists', [EditorialController::class, 'featuredArtists'])->name('featured-artists.index');

    Route::get('/categories', [ArtworkController::class, 'categories'])->name('categories.index');
    Route::get('/artwork-filters', [ArtworkController::class, 'filters'])->name('artworks.filters');
    Route::get('/artworks', [ArtworkController::class, 'index'])->name('artworks.index');
    Route::get('/artworks/{artwork:slug}/image', [ArtworkController::class, 'image'])->name('artworks.image');
    Route::get('/artworks/{artwork:slug}', [ArtworkController::class, 'show'])->name('artworks.show');

    Route::middleware(['auth', 'role:artist,admin'])->group(function (): void {
        Route::get('/artist-profile/me', [ArtistProfileController::class, 'mine'])->name('artist-profile.me');
        Route::put('/artist-profile/me', [ArtistProfileController::class, 'saveMine'])->name('artist-profile.save');
        Route::get('/artist-profiles/{artistProfile}', [ArtistProfileController::class, 'show'])->name('artist-profiles.show');
        Route::patch('/artist-profiles/{artistProfile}', [ArtistProfileController::class, 'update'])->name('artist-profiles.update');
        Route::prefix('artist')->name('artist.')->group(function (): void {
            Route::middleware('role:artist')->group(function (): void {
                Route::get('/inquiries', [ArtistInquiryController::class, 'artistIndex'])->name('inquiries.index');
                Route::get('/inquiries/{inquiry}', [ArtistInquiryController::class, 'artistShow'])->name('inquiries.show');
                Route::patch('/inquiries/{inquiry}', [ArtistInquiryController::class, 'updateForArtist'])->name('inquiries.update');
            });
            Route::get('/artworks', [ArtworkController::class, 'mine'])->name('artworks.index');
            Route::post('/artworks', [ArtworkController::class, 'store'])->middleware('throttle:10,1')->name('artworks.store');
            Route::patch('/artworks/{artwork}', [ArtworkController::class, 'update'])->middleware('throttle:10,1')->name('artworks.update');
        });
    });

    Route::prefix('admin')->name('admin.')->middleware(['auth', 'role:admin'])->group(function (): void {
        Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');
        Route::prefix('editorial')->name('editorial.')->group(function (): void {
            Route::get('/options', [EditorialController::class, 'options'])->name('options');
            Route::get('/featured-artists', [EditorialController::class, 'adminFeaturedArtists'])->name('featured-artists.index');
            Route::get('/collections', [EditorialController::class, 'adminCollections'])->name('collections.index');
            Route::post('/collections', [EditorialController::class, 'storeCollection'])->name('collections.store');
            Route::patch('/collections/{collection}', [EditorialController::class, 'updateCollection'])->name('collections.update');
            Route::patch('/collections/{collection}/publication', [EditorialController::class, 'setCollectionPublication'])->name('collections.publication');
            Route::put('/collections/order', [EditorialController::class, 'reorderCollections'])->name('collections.order');
            Route::put('/featured-artists', [EditorialController::class, 'saveFeaturedArtists'])->name('featured-artists.save');
        });
        Route::get('/artworks', [AdminArtworkModerationController::class, 'index'])->name('artworks.index');
        Route::patch('/artworks/{artwork}/moderation', [AdminArtworkModerationController::class, 'update'])->name('artworks.moderation');
        Route::patch('/users/{user}/role', [AdminUserController::class, 'updateRole'])->name('users.role');
    });
});

Route::view('/{path?}', 'app')->where('path', '^(?!api(?:/|$)|storage(?:/|$)|build(?:/|$)).*')->name('app.spa');
