<?php

declare(strict_types=1);

namespace App\Services\Instagram;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class UnifiedLoginClient
{
    public function authorizationUrl(string $state): string
    {
        $this->assertConfigured();

        return 'https://www.facebook.com/'.config('services.instagram.graph_version').'/dialog/oauth?'.http_build_query([
            'client_id' => config('services.instagram.app_id'),
            'redirect_uri' => config('services.instagram.redirect_uri'),
            'config_id' => config('services.instagram.config_id'),
            'response_type' => 'code',
            'state' => $state,
            'override_default_response_type' => 'true',
        ]);
    }

    /**
     * Exchange the one-time authorization code, then verify account and media read access.
     *
     * Media file URLs and captions are deliberately not requested or persisted.
     *
     * @return array{
     *     access_token: string,
     *     meta_user_id: string,
     *     token_expires_at: \Illuminate\Support\Carbon|null,
     *     accounts: array<int, array{id: string, username: string|null}>,
     *     media_snapshot: array<int, array{account_id: string, items: array<int, array<string, mixed>>}>
     * }
     */
    public function exchangeAndProbe(string $code): array
    {
        $this->assertConfigured();

        $tokenResponse = Http::acceptJson()
            ->timeout(15)
            ->get($this->graphUrl('oauth/access_token'), [
                'client_id' => config('services.instagram.app_id'),
                'client_secret' => config('services.instagram.app_secret'),
                'redirect_uri' => config('services.instagram.redirect_uri'),
                'code' => $code,
            ]);

        if (! $tokenResponse->successful()) {
            throw new RuntimeException('Meta authorization code exchange failed.');
        }

        $tokenPayload = $tokenResponse->json();
        $accessToken = is_array($tokenPayload) ? ($tokenPayload['access_token'] ?? null) : null;

        if (! is_string($accessToken) || $accessToken === '') {
            throw new RuntimeException('Meta did not return an access token.');
        }

        $appSecretProof = hash_hmac('sha256', $accessToken, (string) config('services.instagram.app_secret'));
        $metaUser = $this->graphGet('me', ['fields' => 'id'], $accessToken, $appSecretProof);
        $metaUserId = $metaUser['id'] ?? null;

        if (! is_string($metaUserId) || $metaUserId === '') {
            throw new RuntimeException('Meta did not return the connected business user.');
        }

        $accounts = $this->assignedAccounts($accessToken, $appSecretProof);

        if ($accounts === []) {
            throw new RuntimeException('No eligible Instagram professional account was shared with this configuration.');
        }

        $mediaSnapshot = [];

        foreach ($accounts as $account) {
            $media = $this->graphGet($account['id'].'/media', [
                'fields' => 'id,media_type,timestamp,permalink,children{id,media_type,timestamp}',
                'limit' => 5,
            ], $accessToken, $appSecretProof);

            if (! is_array($media['data'] ?? null)) {
                throw new RuntimeException('Meta returned an invalid media listing.');
            }

            $mediaItems = $media['data'];
            $items = array_map(
                fn (array $item): array => $this->mediaMetadata($item),
                array_filter($mediaItems, 'is_array')
            );

            $mediaSnapshot[] = [
                'account_id' => $account['id'],
                'items' => array_values($items),
            ];
        }

        return [
            'access_token' => $accessToken,
            'meta_user_id' => $metaUserId,
            'token_expires_at' => isset($tokenPayload['expires_in']) && is_numeric($tokenPayload['expires_in'])
                ? now()->addSeconds((int) $tokenPayload['expires_in'])
                : null,
            'accounts' => $accounts,
            'media_snapshot' => $mediaSnapshot,
        ];
    }

    private function assignedAccounts(string $accessToken, string $appSecretProof): array
    {
        $accounts = [];
        $after = null;
        $seenCursors = [];

        for ($page = 0; $page < 20; $page++) {
            $parameters = ['fields' => 'id,username', 'limit' => 100];

            if ($after !== null) {
                $parameters['after'] = $after;
            }

            $response = $this->graphGet('me/assigned_instagram_accounts', $parameters, $accessToken, $appSecretProof);

            $accountRows = is_array($response['data'] ?? null) ? $response['data'] : [];

            foreach ($accountRows as $account) {
                if (! is_array($account)
                    || ! isset($account['id'])
                    || ! is_string($account['id'])
                    || ! ctype_digit($account['id'])) {
                    continue;
                }

                $accounts[$account['id']] = [
                    'id' => $account['id'],
                    'username' => isset($account['username']) && is_string($account['username'])
                        ? $account['username']
                        : null,
                ];
            }

            $nextCursor = $response['paging']['cursors']['after'] ?? null;

            if (! is_string($nextCursor) || $nextCursor === '') {
                return array_values($accounts);
            }

            if (isset($seenCursors[$nextCursor])) {
                throw new RuntimeException('Meta returned a repeated Instagram account cursor.');
            }

            $seenCursors[$nextCursor] = true;
            $after = $nextCursor;
        }

        throw new RuntimeException('Instagram account discovery exceeded the safety page limit.');
    }

    private function graphGet(string $path, array $parameters, string $accessToken, string $appSecretProof): array
    {
        $response = Http::acceptJson()
            ->withToken($accessToken)
            ->timeout(15)
            ->get($this->graphUrl($path), [
                ...$parameters,
                'appsecret_proof' => $appSecretProof,
            ]);

        if (! $response->successful()) {
            throw new RuntimeException('Meta Graph API request failed.');
        }

        $payload = $response->json();

        if (! is_array($payload) || isset($payload['error'])) {
            throw new RuntimeException('Meta Graph API returned an invalid response.');
        }

        return $payload;
    }

    private function mediaMetadata(array $item): array
    {
        $metadata = [];

        foreach (['id', 'media_type', 'timestamp', 'permalink'] as $field) {
            if (isset($item[$field]) && is_string($item[$field])) {
                $metadata[$field] = $item[$field];
            }
        }

        if (is_array($item['children']['data'] ?? null)) {
            $metadata['children'] = array_values(array_map(
                fn (array $child): array => $this->mediaMetadata($child),
                array_filter($item['children']['data'], 'is_array')
            ));
        }

        return $metadata;
    }

    private function graphUrl(string $path): string
    {
        return 'https://graph.facebook.com/'.config('services.instagram.graph_version').'/'.$path;
    }

    private function assertConfigured(): void
    {
        foreach (['app_id', 'app_secret', 'config_id', 'redirect_uri', 'graph_version'] as $key) {
            if (! is_string(config('services.instagram.'.$key)) || trim(config('services.instagram.'.$key)) === '') {
                throw new RuntimeException('Instagram Unified Login is not configured.');
            }
        }

        if (! filter_var(config('services.instagram.redirect_uri'), FILTER_VALIDATE_URL)
            || parse_url((string) config('services.instagram.redirect_uri'), PHP_URL_SCHEME) !== 'https'
            || ! preg_match('/^v\d+\.\d+$/', (string) config('services.instagram.graph_version'))) {
            throw new RuntimeException('Instagram Unified Login configuration is invalid.');
        }
    }
}
