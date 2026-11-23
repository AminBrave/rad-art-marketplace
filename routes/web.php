<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\AdminArtworkModerationController;
use App\Http\Controllers\Api\V1\AdminEditorialController;
use App\Http\Controllers\Api\V1\AdminArtworkCommentReportController;
use App\Http\Controllers\Api\V1\AdminMessageReportController;
use App\Http\Controllers\Api\V1\AdminUserController;
use App\Http\Controllers\Api\V1\ArtistArtworkController;
use App\Http\Controllers\Api\V1\ArtistProfileController;
use App\Http\Controllers\Api\V1\ArtistFollowController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ArtworkInteractionController;
use App\Http\Controllers\Api\V1\ConversationController;
use App\Http\Controllers\Api\V1\DirectConversationController;
use App\Http\Controllers\Api\V1\MessageAttachmentController;
use App\Http\Controllers\Api\V1\MessageSafetyController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\PublicArtworkController;
use App\Http\Controllers\Api\V1\PublicEditorialController;
use App\Http\Controllers\PublicPageController;
use App\Http\Middleware\EnsureConversationNotBlocked;
use Illuminate\Support\Facades\Route;

Route::get('/', [PublicPageController::class, 'app'])->name('home');
Route::get('/sitemap.xml', [PublicPageController::class, 'sitemap'])->name('sitemap');
Route::get('/robots.txt', [PublicPageController::class, 'robots'])->name('robots');
Route::get('/artists/{slug}', [PublicPageController::class, 'artist'])->name('artists.page');
Route::get('/artworks/{slug}', [PublicPageController::class, 'artwork'])->name('artworks.page');
Route::get('/collections/{slug}', [PublicPageController::class, 'collection'])->name('collections.page');

Route::prefix('api/v1')->name('api.v1.')->group(function (): void {
    Route::prefix('auth')->name('auth.')->group(function (): void {
        Route::get('/me', [AuthController::class, 'me'])->name('me');

        Route::middleware(['guest', 'throttle:auth-guest'])->group(function (): void {
            Route::post('/register', [AuthController::class, 'register'])->name('register');
            Route::post('/login', [AuthController::class, 'login'])->name('login');
        });
        Route::middleware('auth')->group(function (): void {
            Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
        });
    });

    Route::middleware('auth')->group(function (): void {
        Route::post('/conversations/direct', [DirectConversationController::class, 'start'])->middleware(['role:buyer', 'throttle:10,1'])->name('conversations.direct');
        Route::get('/conversations/{conversation}', [ConversationController::class, 'show'])->name('conversations.show');
        Route::get('/conversations/{conversation}/messages', [ConversationController::class, 'messages'])->name('conversations.messages');
        Route::post('/conversations/{conversation}/messages', [ConversationController::class, 'storeMessage'])->middleware(['throttle:30,1', EnsureConversationNotBlocked::class])->name('conversations.messages.store');
        Route::get('/conversations/{conversation}/safety', [MessageSafetyController::class, 'status'])->name('conversations.safety');
        Route::post('/conversations/{conversation}/messages/{message}/attachments', [MessageAttachmentController::class, 'store'])->middleware(['throttle:10,1', EnsureConversationNotBlocked::class])->name('conversations.attachments.store');
        Route::get('/conversations/{conversation}/messages/{message}/attachments/{attachment}/preview', [MessageAttachmentController::class, 'preview'])->name('conversations.attachments.preview');
        Route::get('/conversations/{conversation}/messages/{message}/attachments/{attachment}', [MessageAttachmentController::class, 'download'])->name('conversations.attachments.download');
        Route::post('/conversations/{conversation}/report', [MessageSafetyController::class, 'reportConversation'])->middleware('throttle:5,1')->name('conversations.report');
        Route::post('/conversations/{conversation}/messages/{message}/report', [MessageSafetyController::class, 'reportMessage'])->middleware('throttle:5,1')->name('conversations.messages.report');
        Route::post('/conversations/{conversation}/block', [MessageSafetyController::class, 'block'])->middleware('throttle:10,1')->name('conversations.block');
        Route::delete('/conversations/{conversation}/block', [MessageSafetyController::class, 'unblock'])->middleware('throttle:10,1')->name('conversations.unblock');
        Route::patch('/conversations/{conversation}/messages/{message}', [ConversationController::class, 'updateMessage'])->middleware('throttle:30,1')->name('conversations.messages.update');
        Route::delete('/conversations/{conversation}/messages/{message}', [ConversationController::class, 'deleteMessage'])->name('conversations.messages.delete');
        Route::post('/conversations/{conversation}/messages/{message}/reactions', [ConversationController::class, 'setReaction'])->middleware('throttle:60,1')->name('conversations.messages.reactions');
        Route::patch('/conversations/{conversation}/read', [ConversationController::class, 'markRead'])->name('conversations.read');
        Route::patch('/conversations/{conversation}/settings', [ConversationController::class, 'updateSettings'])->middleware('throttle:30,1')->name('conversations.settings');
        Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
        Route::patch('/notifications/read-all', [NotificationController::class, 'markAllRead'])->name('notifications.read-all');
        Route::get('/notifications/preferences', [NotificationController::class, 'preferences'])->name('notifications.preferences');
        Route::patch('/notifications/preferences', [NotificationController::class, 'updatePreferences'])->name('notifications.preferences.update');
        Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markRead'])->name('notifications.read');
    });

    Route::middleware(['auth', 'role:buyer,artist'])->group(function (): void {
        Route::post('/artworks/{artwork:slug}/likes', [ArtworkInteractionController::class, 'like'])->middleware('throttle:60,1')->name('artworks.likes.store');
        Route::delete('/artworks/{artwork:slug}/likes', [ArtworkInteractionController::class, 'unlike'])->middleware('throttle:60,1')->name('artworks.likes.destroy');
        Route::post('/artworks/{artwork:slug}/comments', [ArtworkInteractionController::class, 'storeComment'])->middleware('throttle:20,1')->name('artworks.comments.store');
        Route::delete('/artworks/{artwork:slug}/comments/{comment}', [ArtworkInteractionController::class, 'destroyComment'])->middleware('throttle:30,1')->name('artworks.comments.destroy');
        Route::post('/artworks/{artwork:slug}/comments/{comment}/reports', [ArtworkInteractionController::class, 'reportComment'])->middleware('throttle:5,1')->name('artworks.comments.reports.store');
    });

    Route::get('/artists', [ArtistProfileController::class, 'index'])->name('artists.index');
    Route::get('/artists/{artistProfile:slug}', [ArtistProfileController::class, 'publicShow'])->name('artists.show');

    Route::middleware(['auth', 'role:buyer'])->prefix('buyer')->name('buyer.')->group(function (): void {
        Route::get('/conversations', [ConversationController::class, 'buyerIndex'])->name('conversations.index');
    });

    Route::get('/collections', [PublicEditorialController::class, 'collections'])->name('collections.index');
    Route::get('/collections/{collection:slug}', [PublicEditorialController::class, 'collection'])->name('collections.show');
    Route::get('/featured-artists', [PublicEditorialController::class, 'featuredArtists'])->name('featured-artists.index');

    Route::get('/categories', [PublicArtworkController::class, 'categories'])->name('categories.index');
    Route::get('/artwork-filters', [PublicArtworkController::class, 'filters'])->name('artworks.filters');
    Route::get('/artworks', [PublicArtworkController::class, 'index'])->name('artworks.index');
    Route::get('/artworks/{artwork:slug}/image', [PublicArtworkController::class, 'image'])->name('artworks.image');
    Route::get('/artworks/{artwork:slug}/comments', [ArtworkInteractionController::class, 'comments'])->name('artworks.comments.index');
    Route::get('/artworks/{artwork:slug}', [PublicArtworkController::class, 'show'])->name('artworks.show');

    Route::middleware(['auth', 'role:artist,admin'])->group(function (): void {
        Route::get('/artist-profile/me', [ArtistProfileController::class, 'mine'])->name('artist-profile.me');
        Route::put('/artist-profile/me', [ArtistProfileController::class, 'saveMine'])->name('artist-profile.save');
        Route::get('/artist-profiles/{artistProfile}', [ArtistProfileController::class, 'show'])->name('artist-profiles.show');
        Route::patch('/artist-profiles/{artistProfile}', [ArtistProfileController::class, 'update'])->name('artist-profiles.update');
        Route::prefix('artist')->name('artist.')->group(function (): void {
            Route::middleware('role:artist')->group(function (): void {
                Route::get('/conversations', [ConversationController::class, 'artistIndex'])->name('conversations.index');
            });
            Route::get('/artworks', [ArtistArtworkController::class, 'mine'])->name('artworks.index');
            Route::post('/artworks', [ArtistArtworkController::class, 'store'])->middleware('throttle:10,1')->name('artworks.store');
            Route::patch('/artworks/{artwork}', [ArtistArtworkController::class, 'update'])->middleware('throttle:10,1')->name('artworks.update');
        });
    });

    Route::prefix('admin')->name('admin.')->middleware(['auth', 'role:admin'])->group(function (): void {
        Route::get('/artwork-comment-reports', [AdminArtworkCommentReportController::class, 'index'])->name('artwork-comment-reports.index');
        Route::patch('/artwork-comment-reports/{report}', [AdminArtworkCommentReportController::class, 'update'])->name('artwork-comment-reports.update');
        Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');
        Route::get('/message-reports', [AdminMessageReportController::class, 'adminIndex'])->name('message-reports.index');
        Route::patch('/message-reports/{report}', [AdminMessageReportController::class, 'adminUpdate'])->name('message-reports.update');
        Route::prefix('editorial')->name('editorial.')->group(function (): void {
            Route::get('/options', [AdminEditorialController::class, 'options'])->name('options');
            Route::get('/featured-artists', [AdminEditorialController::class, 'adminFeaturedArtists'])->name('featured-artists.index');
            Route::get('/collections', [AdminEditorialController::class, 'adminCollections'])->name('collections.index');
            Route::post('/collections', [AdminEditorialController::class, 'storeCollection'])->name('collections.store');
            Route::patch('/collections/{collection}', [AdminEditorialController::class, 'updateCollection'])->name('collections.update');
            Route::patch('/collections/{collection}/publication', [AdminEditorialController::class, 'setCollectionPublication'])->name('collections.publication');
            Route::put('/collections/order', [AdminEditorialController::class, 'reorderCollections'])->name('collections.order');
            Route::put('/featured-artists', [AdminEditorialController::class, 'saveFeaturedArtists'])->name('featured-artists.save');
        });
        Route::get('/artworks', [AdminArtworkModerationController::class, 'index'])->name('artworks.index');
        Route::patch('/artworks/{artwork}/moderation', [AdminArtworkModerationController::class, 'update'])->name('artworks.moderation');
        Route::patch('/users/{user}/role', [AdminUserController::class, 'updateRole'])->name('users.role');
    });

    Route::middleware(['auth', 'role:buyer,artist'])->group(function (): void {
        Route::post('/artists/{artistProfile:slug}/follow', [ArtistFollowController::class, 'follow'])->middleware('throttle:30,1')->name('artists.follow');
        Route::delete('/artists/{artistProfile:slug}/follow', [ArtistFollowController::class, 'unfollow'])->middleware('throttle:30,1')->name('artists.unfollow');
    });
});

Route::get('/{path?}', [PublicPageController::class, 'app'])->where('path', '^(?!api(?:/|$)|storage(?:/|$)|build(?:/|$)).*')->name('app.spa');
