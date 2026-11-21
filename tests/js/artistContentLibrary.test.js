import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const page = read('../../resources/js/app/ArtistContentLibrary.jsx');
const router = read('../../resources/js/app/AppRouter.jsx');
const navigation = read('../../resources/js/app/workspaceNavigation.js');
const collectionController = read('../../app/Http/Controllers/Api/V1/ArtistCollectionController.php');
const collectionResource = read('../../app/Http/Resources/ArtistCollectionResource.php');

test('artist content library is registered inside the artist-only workspace route', () => {
    const artistRoute = router.slice(
        router.indexOf('path="/dashboard/artist"'),
        router.indexOf('path="/dashboard/buyer"'),
    );

    assert.match(artistRoute, /RequireRole roles=\{\['artist'\]\}/);
    assert.match(artistRoute, /path="content" element=\{withRouteFallback\(<ArtistContentLibrary \/>\)\}/);
    assert.match(navigation, /to: '\/dashboard\/artist\/content', label: 'کتابخانه محتوا'/);
});

test('artist library uses the owner-scoped API for content review and publication', () => {
    assert.match(page, /axios\.get\('\/api\/v1\/artist\/content'/);
    assert.match(page, /action: 'approve'/);
    assert.match(page, /action: 'publish'/);
    assert.match(page, /action: 'unpublish'/);
    assert.match(page, /contentQuery\.isError/);
    assert.match(page, /contents\.length === 0/);
});

test('artist library manages private collections, ordered membership and collection publication', () => {
    assert.match(page, /axios\.post\('\/api\/v1\/artist\/collections'/);
    assert.match(page, /\/items/);
    assert.match(page, /\/api\/v1\/artist\/collections\/order/);
    assert.match(page, /action: 'delete'/);
    assert.match(page, /action: 'publish'/);
    assert.match(page, /action: 'unpublish'/);
});

test('collection list returns ordered membership summaries with bounded pagination', () => {
    assert.match(collectionController, /with\(\['contents' => fn \(\$query\) => \$query->orderByPivot\('position'\)\]\)/);
    assert.match(collectionController, /'per_page' => \['sometimes', 'integer', 'min:1', 'max:100'\]/);
    assert.match(collectionResource, /'items' => \$this->whenLoaded\('contents'/);
    assert.match(collectionResource, /'id' => \$content->id/);
});
