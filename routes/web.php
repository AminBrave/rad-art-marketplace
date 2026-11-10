<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\AdminArtworkModerationController;
use App\Http\Controllers\Api\V1\AdminUserController;
use App\Http\Controllers\Api\V1\ArtistInquiryController;
use App\Http\Controllers\Api\V1\ArtistProfileController;
use App\Http\Controllers\Api\V1\ArtworkController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ConversationController;
use App\Http\Controllers\Api\V1\DirectConversationController;
use App\Http\Controllers\Api\V1\EditorialController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\MessageSafetyController;
use App\Http\Middleware\EnsureConversationNotBlocked;
use App\Http\Controllers\PublicPageController;
use Illuminate\Support\Facades\Route;

Route::view('/', 'app')->name('home');
Route::get('/sitemap.xml', [PublicPageController::class, 'sitemap'])->name('sitemap');
Route::get('/robots.txt', [PublicPageController::class, 'robots'])->name('robots');
Route::get('/artists/{slug}', [PublicPageController::class, 'artist'])->name('artists.page');
Route::get('/artworks/{slug}', [PublicPageController::class, 'artwork'])->name('artworks.page');
Route::get('/collections/{slug}', [PublicPageController::class, 'collection'])->name('collections.page');

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

    Route::middleware('auth')->group(function (): void {
        Route::post('/conversations/direct', [DirectConversationController::class, 'start'])->middleware(['role:buyer', 'throttle:10,1'])->name('conversations.direct');
        Route::post('/inquiries/{inquiry}/conversation', [ConversationController::class, 'startFromInquiry'])->name('conversations.start');
        Route::get('/conversations/{conversation}', [ConversationController::class, 'show'])->name('conversations.show');
        Route::get('/conversations/{conversation}/messages', [ConversationController::class, 'messages'])->name('conversations.messages');
        Route::post('/conversations/{conversation}/messages', [ConversationController::class, 'storeMessage'])->middleware(['throttle:30,1', EnsureConversationNotBlocked::class])->name('conversations.messages.store');
        Route::post('/conversations/{conversation}/report', [MessageSafetyController::class, 'report'])->middleware('throttle:5,1')->name('conversations.report');
        Route::post('/conversations/{conversation}/messages/{message}/report', [MessageSafetyController::class, 'report'])->middleware('throttle:5,1')->name('conversations.messages.report');
        Route::post('/conversations/{conversation}/block', [MessageSafetyController::class, 'block'])->name('conversations.block');
        Route::delete('/conversations/{conversation}/block', [MessageSafetyController::class, 'unblock'])->name('conversations.unblock');
        Route::patch('/conversations/{conversation}/messages/{message}', [ConversationController::class, 'updateMessage'])->middleware('throttle:30,1')->name('conversations.messages.update');
        Route::delete('/conversations/{conversation}/messages/{message}', [ConversationController::class, 'deleteMessage'])->name('conversations.messages.delete');
        Route::post('/conversations/{conversation}/messages/{message}/reactions', [ConversationController::class, 'setReaction'])->middleware('throttle:60,1')->name('conversations.messages.reactions');
        Route::patch('/conversations/{conversation}/read', [ConversationController::class, 'markRead'])->name('conversations.read');
        Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
        Route::patch('/notifications/read-all', [NotificationController::class, 'markAllRead'])->name('notifications.read-all');
        Route::get('/notifications/preferences', [NotificationController::class, 'preferences'])->name('notifications.preferences');
        Route::patch('/notifications/preferences', [NotificationController::class, 'updatePreferences'])->name('notifications.preferences.update');
        Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markRead'])->name('notifications.read');
    });

    Route::get('/artists', [ArtistProfileController::class, 'index'])->name('artists.index');
    Route::get('/artists/{artistProfile:slug}', [ArtistProfileController::class, 'publicShow'])->name('artists.show');
    Route::post('/artists/{artistProfile:slug}/inquiries', [ArtistInquiryController::class, 'store'])->middleware(['auth', 'role:buyer', 'throttle:5,1'])->name('artists.inquiries.store');

    Route::middleware(['auth', 'role:buyer'])->prefix('buyer')->name('buyer.')->group(function (): void {
        Route::get('/inquiries', [ArtistInquiryController::class, 'buyerIndex'])->name('inquiries.index');
        Route::get('/conversations', [ConversationController::class, 'buyerIndex'])->name('conversations.index');
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
                Route::get('/conversations', [ConversationController::class, 'artistIndex'])->name('conversations.index');
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
        Route::get('/message-reports', [MessageSafetyController::class, 'adminIndex'])->name('message-reports.index');
        Route::patch('/message-reports/{report}', [MessageSafetyController::class, 'adminUpdate'])->name('message-reports.update');
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
