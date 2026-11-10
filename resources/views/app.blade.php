<!doctype html>
<html lang="fa" dir="rtl">
<head>
    @php
        $seo = $seo ?? [];
        $seoTitle = $seo['title'] ?? 'راد آرت | کشف آثار هنری و ارتباط با هنرمندان';
        $seoDescription = $seo['description'] ?? 'راد آرت؛ جایی برای کشف آثار هنری تأییدشده، آشنایی با هنرمندان و ارتباط مستقیم با آن‌ها.';
        $seoPath = request()->getPathInfo();
        $indexableStaticPaths = ['/', '/artworks', '/artists', '/collections', '/about', '/help', '/contact'];
        $seoRobots = $seo['robots'] ?? (in_array($seoPath, $indexableStaticPaths, true) ? 'index,follow' : 'noindex,nofollow');
        $seoCanonical = $seo['canonical'] ?? (in_array($seoPath, $indexableStaticPaths, true)
            ? rtrim((string) config('app.url'), '/').($seoPath === '/' ? '/' : $seoPath)
            : null);
        $seoImage = $seo['image'] ?? null;
        $seoImageAlt = $seo['image_alt'] ?? $seoTitle;
        $seoStructuredData = $seo['structured_data'] ?? null;
    @endphp
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#F7F5F0">
    <meta name="description" content="{{ $seoDescription }}">
    <meta name="robots" content="{{ $seoRobots }}">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    @if ($seoCanonical)
        <link rel="canonical" href="{{ $seoCanonical }}">
    @endif
    <meta property="og:site_name" content="راد آرت">
    <meta property="og:locale" content="fa_IR">
    <meta property="og:type" content="{{ $seo['og_type'] ?? 'website' }}">
    <meta property="og:title" content="{{ $seoTitle }}">
    <meta property="og:description" content="{{ $seoDescription }}">
    @if ($seoCanonical)
        <meta property="og:url" content="{{ $seoCanonical }}">
    @endif
    @if ($seoImage)
        <meta property="og:image" content="{{ $seoImage }}">
        <meta property="og:image:alt" content="{{ $seoImageAlt }}">
    @endif
    <meta name="twitter:card" content="{{ $seoImage ? 'summary_large_image' : 'summary' }}">
    <meta name="twitter:title" content="{{ $seoTitle }}">
    <meta name="twitter:description" content="{{ $seoDescription }}">
    @if ($seoImage)
        <meta name="twitter:image" content="{{ $seoImage }}">
        <meta name="twitter:image:alt" content="{{ $seoImageAlt }}">
    @endif
    @if (is_array($seoStructuredData))
        <script type="application/ld+json">@json($seoStructuredData, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)</script>
    @endif
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Vazirmatn:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <title>{{ $seoTitle }}</title>
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
</head>
<body>
    @php
        $isWorkspace = request()->is('dashboard', 'dashboard/*', 'admin*');
        $isArtworkDetail = request()->is('artworks/*');
        $isArtistProfile = request()->is('artists/*');
        $isForm = request()->is('login', 'register', 'dashboard/artist/profile', 'dashboard/artist/artworks');
        $isInformationPage = request()->is('about', 'help', 'contact');
        $isDirectory = request()->is('artworks', 'artists');
    @endphp
    <div id="app">
        <main class="app-boot" role="status" aria-busy="true" aria-label="در حال بارگذاری راد آرت">
            <div class="app-boot__header">
                <span class="app-skeleton app-boot__brand"></span>
                <span class="app-skeleton app-boot__nav"></span>
            </div>

            @if ($isArtworkDetail)
                <main class="mx-auto min-h-[65vh] max-w-7xl px-5 py-12 sm:px-8 lg:px-10" dir="rtl" role="status" aria-busy="true" aria-label="در حال دریافت اثر هنری">
                    <a href="/artworks" tabindex="-1" class="mb-7 block"><span class="app-skeleton h-4 w-28"></span></a>
                    <article class="grid gap-8 lg:grid-cols-[1.15fr_.85fr]">
                        <div class="flex aspect-[4/3] items-center justify-center overflow-hidden bg-white p-4 sm:p-8 lg:aspect-[4/5]">
                            <span class="app-skeleton h-full w-full"></span>
                        </div>
                        <div class="border border-border bg-white p-6 sm:p-9">
                            <span class="app-skeleton h-4 w-24"></span>
                            <span class="app-skeleton mt-3 h-10 w-4/5"></span>
                            <span class="app-skeleton mt-3 h-4 w-2/5"></span>
                            <div class="mt-7 grid gap-2">
                                <span class="app-skeleton h-3 w-full"></span>
                                <span class="app-skeleton h-3 w-full"></span>
                                <span class="app-skeleton h-3 w-11/12"></span>
                                <span class="app-skeleton h-3 w-4/5"></span>
                            </div>
                            <dl class="mt-7 grid grid-cols-2 gap-4 border-y border-border py-5">
                                @foreach (range(1, 4) as $item)
                                    <div class="grid gap-2"><span class="app-skeleton h-3 w-2/3"></span><span class="app-skeleton h-4 w-4/5"></span></div>
                                @endforeach
                            </dl>
                            <span class="app-skeleton mt-5 h-4 w-2/3"></span>
                            <span class="app-skeleton mt-7 h-11 w-48"></span>
                        </div>
                    </article>
                </main>
            @elseif ($isArtistProfile)
                <main class="mx-auto min-h-[65vh] max-w-7xl px-5 py-12 sm:px-8 lg:px-10" dir="rtl" role="status" aria-busy="true" aria-label="در حال دریافت پروفایل هنرمند">
                    <a href="/artists" tabindex="-1" class="block"><span class="app-skeleton h-4 w-28"></span></a>
                    <section class="mt-7 border border-border bg-white p-7 sm:p-12">
                        <span class="app-skeleton h-4 w-28"></span>
                        <span class="app-skeleton mt-3 h-10 w-2/3 max-w-md"></span>
                        <span class="app-skeleton mt-3 h-4 w-28"></span>
                        <div class="mt-8 grid max-w-3xl gap-2">
                            <span class="app-skeleton h-3 w-full"></span>
                            <span class="app-skeleton h-3 w-full"></span>
                            <span class="app-skeleton h-3 w-11/12"></span>
                            <span class="app-skeleton h-3 w-4/5"></span>
                        </div>
                        <div class="mt-8 flex gap-4"><span class="app-skeleton h-4 w-20"></span><span class="app-skeleton h-4 w-24"></span></div>
                    </section>
                    <section class="mt-12">
                        <span class="app-skeleton h-3 w-24"></span>
                        <span class="app-skeleton mt-2 h-8 w-56"></span>
                        <div class="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            @foreach (range(1, 6) as $item)
                                <article class="group min-w-0 overflow-hidden border border-border bg-white">
                                    <a href="#" tabindex="-1" class="block">
                                        <div class="flex aspect-[4/3] items-center justify-center overflow-hidden bg-surface-muted p-3"><span class="app-skeleton h-full w-full"></span></div>
                                        <div class="grid gap-2 p-4"><span class="app-skeleton h-5 w-20"></span><span class="app-skeleton h-6 w-4/5"></span><span class="app-skeleton h-4 w-2/5"></span><span class="app-skeleton h-4 w-1/3"></span></div>
                                    </a>
                                </article>
                            @endforeach
                        </div>
                    </section>
                </main>
            @elseif ($isForm)
                <section class="mx-auto mt-10 grid max-w-3xl gap-5 border border-border bg-white p-6 sm:p-8">
                    <span class="app-skeleton h-6 w-40"></span>
                    @foreach (range(1, 4) as $item)
                        <span class="app-skeleton h-12 w-full"></span>
                    @endforeach
                    <span class="app-skeleton h-28 w-full"></span>
                    <span class="app-skeleton h-12 w-36"></span>
                </section>
                @if ($isWorkspace && request()->is('dashboard/artist/artworks'))
                    <section class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        @foreach (range(1, 3) as $item)
                            <div class="border border-border bg-white"><span class="app-skeleton block aspect-[4/3] w-full"></span><div class="grid gap-3 p-4"><span class="app-skeleton h-4 w-4/5"></span><span class="app-skeleton h-3 w-2/5"></span></div></div>
                        @endforeach
                    </section>
                @endif
            @elseif ($isInformationPage)
                <section class="mt-10 grid gap-7">
                    @foreach (range(1, 3) as $item)
                        <div class="grid gap-3 border-b border-border pb-7"><span class="app-skeleton h-6 w-48"></span><span class="app-skeleton h-4 w-full"></span><span class="app-skeleton h-4 w-5/6"></span></div>
                    @endforeach
                </section>
            @elseif ($isWorkspace || $isDirectory)
                <section class="mt-10">
                    <div class="grid gap-3 border-b border-border pb-6"><span class="app-skeleton h-3 w-24"></span><span class="app-skeleton h-9 w-2/3 max-w-sm"></span><span class="app-skeleton h-4 w-full max-w-xl"></span></div>
                    @if ($isWorkspace)
                        <div class="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            @foreach (range(1, 3) as $item)<span class="app-skeleton h-28 w-full"></span>@endforeach
                        </div>
                    @endif
                    <div class="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        @foreach (range(1, 6) as $item)
                            <div class="overflow-hidden border border-border bg-white"><span class="app-skeleton block aspect-[4/3] w-full"></span><div class="grid gap-3 p-4"><span class="app-skeleton h-3 w-20"></span><span class="app-skeleton h-5 w-4/5"></span><span class="app-skeleton h-4 w-2/5"></span></div></div>
                        @endforeach
                    </div>
                </section>
            @else
                <section class="app-boot__hero">
                    <div class="app-boot__copy">
                        <span class="app-skeleton app-boot__eyebrow"></span>
                        <span class="app-skeleton app-boot__heading"></span>
                        <span class="app-skeleton app-boot__heading app-boot__heading--short"></span>
                        <span class="app-skeleton app-boot__paragraph"></span>
                        <span class="app-skeleton app-boot__paragraph app-boot__paragraph--short"></span>
                        <span class="app-skeleton app-boot__button"></span>
                    </div>
                    <div class="app-boot__hero-media">
                        <span class="app-skeleton app-boot__artwork"></span>
                        <div class="app-boot__hero-caption">
                            <div class="app-boot__caption-lines"><span class="app-skeleton app-boot__caption-label"></span><span class="app-skeleton app-boot__caption-title"></span></div>
                            <span class="app-skeleton app-boot__caption-action"></span>
                        </div>
                    </div>
                </section>
                <section class="app-boot__features">
                    @foreach (range(1, 3) as $item)
                        <div class="app-boot__feature">
                            <span class="app-skeleton h-3 w-20"></span>
                            <span class="app-skeleton mt-3 h-6 w-3/4"></span>
                            <span class="app-skeleton mt-3 h-3 w-full"></span>
                            <span class="app-skeleton mt-2 h-3 w-5/6"></span>
                        </div>
                    @endforeach
                </section>
                <section class="app-boot__gallery">
                    <div class="app-boot__section-heading"><div class="grid gap-3"><span class="app-skeleton h-3 w-24"></span><span class="app-skeleton h-8 w-40"></span></div><span class="app-skeleton h-4 w-20"></span></div>
                    <div class="app-boot__cards" aria-hidden="true">
                        @foreach (range(1, 3) as $item)
                            <article class="app-boot__gallery-card"><a href="#" tabindex="-1" class="block"><div class="flex aspect-[4/3] items-center justify-center overflow-hidden bg-surface-muted p-3"><span class="app-skeleton app-boot__card"></span></div><div class="grid gap-2 p-4"><span class="app-skeleton h-5 w-20"></span><span class="app-skeleton h-6 w-4/5"></span><span class="app-skeleton h-4 w-2/5"></span><span class="app-skeleton h-4 w-1/3"></span></div></a></article>
                        @endforeach
                    </div>
                </section>
                <section class="app-boot__categories">
                    <div class="grid gap-3"><span class="app-skeleton h-3 w-24"></span><span class="app-skeleton h-8 w-48"></span></div>
                    <div class="app-boot__category-pills">
                        @foreach (range(1, 6) as $item)<span class="app-skeleton h-11 w-28"></span>@endforeach
                    </div>
                </section>
                <section class="app-boot__artists">
                    <div class="app-boot__section-heading"><div class="grid gap-3"><span class="app-skeleton h-3 w-24"></span><span class="app-skeleton h-8 w-44"></span></div><span class="app-skeleton h-4 w-24"></span></div>
                    <div class="app-boot__artist-cards">
                        @foreach (range(1, 3) as $item)
                            <article class="grid gap-3 border border-border bg-white p-5"><div class="flex items-start gap-3"><span class="app-skeleton h-12 w-12 shrink-0 rounded-full"></span><div class="grid flex-1 content-start gap-2 pt-1"><span class="app-skeleton h-5 w-2/3"></span><span class="app-skeleton h-3 w-1/3"></span></div></div><div class="grid gap-2"><span class="app-skeleton h-3 w-full"></span><span class="app-skeleton h-3 w-11/12"></span><span class="app-skeleton h-3 w-3/4"></span></div><a href="#" tabindex="-1" class="mt-1 block"><span class="app-skeleton h-4 w-28"></span></a></article>
                        @endforeach
                    </div>
                </section>
                <section class="app-boot__cta">
                    <div class="grid max-w-2xl gap-3"><span class="app-skeleton h-3 w-24"></span><span class="app-skeleton h-8 w-full"></span><span class="app-skeleton h-4 w-5/6"></span></div>
                    <span class="app-skeleton h-12 w-36"></span>
                </section>
            @endif
        </main>
    </div>
</body>
</html>