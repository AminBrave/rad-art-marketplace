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
        $seoPreloadImage = $seo['preload_image'] ?? null;
        $seoImageAlt = $seo['image_alt'] ?? $seoTitle;
        $seoStructuredData = $seo['structured_data'] ?? null;
        $skeletonClass = 'block bg-[linear-gradient(100deg,var(--color-skeleton-base)_25%,var(--color-skeleton-highlight)_42%,var(--color-skeleton-base)_62%)] [background-size:200%_100%] animate-skeleton-shimmer motion-reduce:animate-none rounded-md';
    @endphp
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#F7F5F0" id="rad-theme-color">
    <script>
        (() => {
            try {
                const locale = ["fa", "en"].includes(localStorage.getItem("rademan-locale")) ? localStorage.getItem("rademan-locale") : "fa";
                document.documentElement.lang = locale;
                document.documentElement.dir = locale === "fa" ? "rtl" : "ltr";
                const stored = localStorage.getItem("rademan-theme");
                const theme = ["system", "light", "dark"].includes(stored) ? stored : "system";
                const dark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
                document.documentElement.dataset.theme = theme;
                document.documentElement.style.colorScheme = dark ? "dark" : "light";
                document.getElementById("rad-theme-color")?.setAttribute("content", dark ? "#171815" : "#F7F5F0");
            } catch {
                document.documentElement.dataset.theme = "system";
            }
        })();
    </script>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
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
        <script type="application/ld+json">@json($seoStructuredData, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_AMP | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)</script>
    @endif
    @if ($seoPreloadImage)
        <link rel="preload" as="image" href="{{ $seoPreloadImage }}" fetchpriority="high">
    @endif
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Vazirmatn:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" media="print" onload="this.media='all'">
    <noscript><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Vazirmatn:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"></noscript>
    <title>{{ $seoTitle }}</title>
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
</head>
<body>
    @php
        $isWorkspace = request()->is('dashboard', 'dashboard/*', 'admin*');
        $isMessagingRoute = request()->is('dashboard/artist/messages', 'dashboard/buyer/messages');
        $workspaceNavigationCount = request()->is('dashboard/buyer*') ? 3 : 5;
        $isArtworkDetail = request()->is('artworks/*');
        $isArtistProfile = request()->is('artists/*');
        $isCollectionDetail = request()->is('collections/*');
        $isCollectionIndex = request()->is('collections');
        $isArtworkStudio = request()->is('dashboard/artist/artworks', 'dashboard/artist/artworks/new');
        $isArtistProfileSettings = request()->is('dashboard/artist/profile');
        $isAuthForm = request()->is('login', 'register');
        $isInformationPage = request()->is('about', 'help', 'contact');
        $isDirectory = request()->is('artworks', 'artists');
    @endphp
    @php
        $authBootstrapUser = request()->user();
        $authBootstrap = $authBootstrapUser ? [
            'id' => $authBootstrapUser->id,
            'name' => $authBootstrapUser->name,
            'email' => $authBootstrapUser->email,
            'role' => $authBootstrapUser->role,
        ] : null;
    @endphp
    <script type="application/json" id="rad-auth-bootstrap">@json($authBootstrap, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_AMP | JSON_HEX_QUOT)</script>
    <div id="app">
        @if ($isWorkspace)
            <div class="{{ $isMessagingRoute ? 'flex h-dvh flex-col overflow-hidden bg-canvas text-ink' : 'min-h-screen bg-canvas text-ink' }}" aria-busy="true">
                <header class="sticky top-0 z-40 shrink-0 border-b border-border bg-paper shadow-soft">
                    <div class="mx-auto flex min-h-[4.5rem] max-w-content items-center justify-between gap-3 px-page-gutter sm:min-h-20 sm:gap-4" aria-hidden="true">
                        <div class="flex min-w-0 items-center gap-2.5 sm:gap-3">
                            <span class="{{ $skeletonClass }} h-10 w-10 shrink-0 sm:h-11 sm:w-11"></span>
                            <span class="{{ $skeletonClass }} h-5 w-24"></span>
                        </div>
                        <span class="{{ $skeletonClass }} h-11 w-11 shrink-0"></span>
                    </div>
                </header>
                <div class="{{ $isMessagingRoute ? 'mx-auto flex h-[calc(100dvh-4.5rem-var(--workspace-bottom-nav-height)-env(safe-area-inset-bottom))] w-full min-h-0 min-w-0 max-w-content flex-none px-page-gutter py-3 sm:h-[calc(100dvh-5rem-var(--workspace-bottom-nav-height)-env(safe-area-inset-bottom))] sm:py-4' : 'mx-auto w-full max-w-content px-page-gutter py-5 pb-[calc(var(--workspace-bottom-nav-height)+env(safe-area-inset-bottom)+1rem)] sm:py-8 sm:pb-[calc(var(--workspace-bottom-nav-height)+env(safe-area-inset-bottom)+1rem)]' }}">
                    <main class="{{ $isMessagingRoute ? 'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden' : 'min-w-0' }}" role="status" aria-busy="true" aria-label="در حال بارگذاری فضای کاربری">
        @else
            <main class="mx-auto min-h-screen w-[min(calc(100%_-_2.5rem),80rem)] pt-6 pb-16" role="status" aria-busy="true" aria-label="در حال بارگذاری راد آرت">
                <div class="flex min-h-14 items-center justify-between gap-8 border-b border-border">
                    <span class="{{ $skeletonClass }} h-7 w-24"></span>
                    <span class="{{ $skeletonClass }} h-4 w-[min(42%,22rem)]"></span>
                </div>
        @endif

            @if ($isArtworkDetail)
                <section class="mx-auto min-h-[65vh] max-w-7xl px-5 py-12 sm:px-8 lg:px-10" aria-hidden="true">
                    <a href="/artworks" tabindex="-1" class="mb-7 block"><span class="{{ $skeletonClass }} h-4 w-28"></span></a>
                    <article class="grid gap-8 lg:grid-cols-[1.15fr_.85fr]">
                        <div class="flex aspect-[3/4] items-center justify-center overflow-hidden bg-paper p-4 sm:p-8 lg:aspect-[3/4]">
                            <span class="{{ $skeletonClass }} h-full w-full"></span>
                        </div>
                        <div class="border border-border bg-paper p-6 sm:p-9">
                            <span class="{{ $skeletonClass }} h-4 w-24"></span>
                            <span class="{{ $skeletonClass }} mt-3 h-10 w-4/5"></span>
                            <span class="{{ $skeletonClass }} mt-3 h-4 w-2/5"></span>
                            <div class="mt-7 grid gap-2">
                                <span class="{{ $skeletonClass }} h-3 w-full"></span>
                                <span class="{{ $skeletonClass }} h-3 w-full"></span>
                                <span class="{{ $skeletonClass }} h-3 w-11/12"></span>
                                <span class="{{ $skeletonClass }} h-3 w-4/5"></span>
                            </div>
                            <dl class="mt-7 grid grid-cols-2 gap-4 border-y border-border py-5">
                                @foreach (range(1, 4) as $item)
                                    <div class="grid gap-2"><span class="{{ $skeletonClass }} h-3 w-2/3"></span><span class="{{ $skeletonClass }} h-4 w-4/5"></span></div>
                                @endforeach
                            </dl>
                            <span class="{{ $skeletonClass }} mt-5 h-4 w-2/3"></span>
                            <span class="{{ $skeletonClass }} mt-7 h-11 w-48"></span>
                        </div>
                    </article>
                </section>
            @elseif ($isCollectionDetail)
                <section class="mx-auto min-h-[65vh] max-w-7xl px-5 py-12 sm:px-8 lg:px-10" aria-hidden="true">
                    <nav aria-hidden="true" class="flex items-center gap-2"><span class="{{ $skeletonClass }} h-3 w-10"></span><span class="{{ $skeletonClass }} h-3 w-2"></span><span class="{{ $skeletonClass }} h-3 w-20"></span></nav>
                    <header class="mt-7 max-w-3xl border-b border-border pb-8"><span class="{{ $skeletonClass }} h-3 w-28"></span><span class="{{ $skeletonClass }} mt-3 h-10 w-2/3"></span><div class="mt-5 grid gap-2"><span class="{{ $skeletonClass }} h-3 w-full"></span><span class="{{ $skeletonClass }} h-3 w-full"></span><span class="{{ $skeletonClass }} h-3 w-4/5"></span></div></header>
                    <section class="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        @foreach (range(1, 6) as $item)
                            <article class="min-w-0"><div class="relative overflow-hidden bg-surface-muted"><span class="{{ $skeletonClass }} block aspect-[3/4] w-full rounded-none"></span></div><div class="grid gap-1.5 px-0.5 pb-2 pt-4"><span class="{{ $skeletonClass }} h-3 w-20"></span><span class="{{ $skeletonClass }} h-5 w-4/5"></span><span class="{{ $skeletonClass }} h-5 w-3/5"></span><span class="{{ $skeletonClass }} h-4 w-2/5"></span><span class="{{ $skeletonClass }} h-4 w-1/3"></span></div></article>
                        @endforeach
                    </section>
                </section>
            @elseif ($isCollectionIndex)
                <section class="mx-auto min-h-[65vh] max-w-7xl px-5 py-12 sm:px-8 lg:px-10" aria-hidden="true">
                    <header class="grid max-w-3xl gap-3"><span class="{{ $skeletonClass }} h-3 w-24"></span><span class="{{ $skeletonClass }} h-10 w-2/3"></span><span class="{{ $skeletonClass }} h-4 w-full"></span></header>
                    <section class="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        @foreach (range(1, 6) as $item)
                            <article class="grid content-start gap-3 border border-border bg-paper p-6"><span class="{{ $skeletonClass }} h-3 w-24"></span><span class="{{ $skeletonClass }} mt-1 h-7 w-4/5"></span><div class="mt-1 grid gap-2"><span class="{{ $skeletonClass }} h-3 w-full"></span><span class="{{ $skeletonClass }} h-3 w-full"></span><span class="{{ $skeletonClass }} h-3 w-11/12"></span><span class="{{ $skeletonClass }} h-3 w-4/5"></span></div><span class="{{ $skeletonClass }} mt-3 h-4 w-28"></span></article>
                        @endforeach
                    </section>
                </section>
            @elseif ($isArtistProfile)
                <section class="mx-auto min-h-[65vh] max-w-7xl px-5 py-12 sm:px-8 lg:px-10" aria-hidden="true">
                    <a href="/artists" tabindex="-1" class="block"><span class="{{ $skeletonClass }} h-4 w-28"></span></a>
                    <section class="mt-7 border border-border bg-paper p-7 sm:p-12">
                        <span class="{{ $skeletonClass }} h-4 w-28"></span>
                        <span class="{{ $skeletonClass }} mt-3 h-10 w-2/3 max-w-md"></span>
                        <span class="{{ $skeletonClass }} mt-3 h-4 w-28"></span>
                        <div class="mt-8 grid max-w-3xl gap-2">
                            <span class="{{ $skeletonClass }} h-3 w-full"></span>
                            <span class="{{ $skeletonClass }} h-3 w-full"></span>
                            <span class="{{ $skeletonClass }} h-3 w-11/12"></span>
                            <span class="{{ $skeletonClass }} h-3 w-4/5"></span>
                        </div>
                        <div class="mt-8 flex gap-4"><span class="{{ $skeletonClass }} h-4 w-20"></span><span class="{{ $skeletonClass }} h-4 w-24"></span></div>
                    </section>
                    <section class="mt-12">
                        <span class="{{ $skeletonClass }} h-3 w-24"></span>
                        <span class="{{ $skeletonClass }} mt-2 h-8 w-56"></span>
                        <div class="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            @foreach (range(1, 6) as $item)
                                <article class="group min-w-0 overflow-hidden border border-border bg-paper">
                                    <a href="#" tabindex="-1" class="block">
                                        <div class="flex aspect-[3/4] items-center justify-center overflow-hidden bg-surface-muted p-3"><span class="{{ $skeletonClass }} h-full w-full"></span></div>
                                        <div class="grid gap-2 p-4"><span class="{{ $skeletonClass }} h-5 w-20"></span><span class="{{ $skeletonClass }} h-6 w-4/5"></span><span class="{{ $skeletonClass }} h-4 w-2/5"></span><span class="{{ $skeletonClass }} h-4 w-1/3"></span></div>
                                    </a>
                                </article>
                            @endforeach
                        </div>
                    </section>
                </section>
            @elseif ($isArtworkStudio)
                <section class="mx-auto mt-10 max-w-7xl">
                    <header class="mb-8 grid gap-3 border-b border-border pb-6">
                        <span class="{{ $skeletonClass }} h-3 w-28"></span>
                        <span class="{{ $skeletonClass }} h-9 w-2/3 max-w-sm"></span>
                        <span class="{{ $skeletonClass }} h-4 w-full max-w-2xl"></span>
                    </header>
                    <section class="border border-border bg-paper p-5 sm:p-7">
                        <div class="mb-6 flex flex-wrap items-start justify-between gap-3 border-b border-border pb-5"><span class="{{ $skeletonClass }} h-6 w-36"></span><span class="{{ $skeletonClass }} h-4 w-64 max-w-full"></span></div>
                        <div class="grid gap-5 sm:grid-cols-2">
                            @foreach (range(1, 7) as $item)
                                <div class="grid gap-2"><span class="{{ $skeletonClass }} h-4 w-28"></span><span class="{{ $skeletonClass }} h-11 w-full"></span></div>
                            @endforeach
                            <div class="grid gap-2 sm:col-span-2"><span class="{{ $skeletonClass }} h-4 w-32"></span><span class="{{ $skeletonClass }} h-28 w-full"></span></div>
                            <div class="grid gap-2 sm:col-span-2"><span class="{{ $skeletonClass }} h-4 w-36"></span><span class="{{ $skeletonClass }} h-11 w-full"></span><span class="{{ $skeletonClass }} h-3 w-2/3 max-w-md"></span><span class="{{ $skeletonClass }} h-3 w-1/2 max-w-sm"></span></div>
                            <span class="{{ $skeletonClass }} h-11 w-40 sm:col-span-2"></span>
                        </div>
                    </section>
                    <section class="mt-7 space-y-4">
                        <div class="flex items-center justify-between gap-3"><span class="{{ $skeletonClass }} h-6 w-40"></span><span class="{{ $skeletonClass }} h-9 w-28"></span></div>
                        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            @foreach (range(1, 3) as $item)
                                <article class="overflow-hidden border border-border bg-paper">
                                    <div class="flex aspect-[3/4] items-center justify-center bg-surface-muted p-3"><span class="{{ $skeletonClass }} h-full w-full"></span></div>
                                    <div class="grid gap-3 p-4"><div class="flex justify-between gap-2"><span class="{{ $skeletonClass }} h-5 w-2/3"></span><span class="{{ $skeletonClass }} h-6 w-20 rounded-full"></span></div><span class="{{ $skeletonClass }} h-3 w-1/3"></span><span class="{{ $skeletonClass }} h-3 w-full"></span><span class="{{ $skeletonClass }} h-3 w-4/5"></span><span class="{{ $skeletonClass }} h-9 w-28"></span></div>
                                </article>
                            @endforeach
                        </div>
                    </section>
                </section>
            @elseif ($isArtistProfileSettings)
                <section class="mx-auto mt-10 max-w-7xl">
                    <header class="mb-8 grid gap-3 border-b border-border pb-6"><span class="{{ $skeletonClass }} h-3 w-28"></span><span class="{{ $skeletonClass }} h-9 w-2/3 max-w-sm"></span><span class="{{ $skeletonClass }} h-4 w-full max-w-xl"></span></header>
                    <section class="grid gap-4 sm:grid-cols-2">
                        <div class="grid gap-2 sm:col-span-2"><span class="{{ $skeletonClass }} h-4 w-28"></span><span class="{{ $skeletonClass }} h-11 w-full"></span></div>
                        <div class="grid gap-2 sm:col-span-2"><span class="{{ $skeletonClass }} h-4 w-32"></span><span class="{{ $skeletonClass }} h-28 w-full"></span></div>
                        @foreach (range(1, 2) as $item)
                            <div class="grid gap-2"><span class="{{ $skeletonClass }} h-4 w-24"></span><span class="{{ $skeletonClass }} h-11 w-full"></span></div>
                        @endforeach
                        <div class="grid gap-2 sm:col-span-2"><span class="{{ $skeletonClass }} h-4 w-24"></span><span class="{{ $skeletonClass }} h-11 w-full"></span></div>
                        <div class="grid gap-4 sm:col-span-2"><span class="{{ $skeletonClass }} h-5 w-48"></span><span class="{{ $skeletonClass }} h-11 w-36"></span></div>
                    </section>
                </section>
            @elseif ($isAuthForm)
                <section class="mx-auto max-w-xl px-5 py-12 sm:px-8" aria-hidden="true">
                    <section class="rounded-3xl border border-border-strong bg-paper p-6 shadow-sm sm:p-9">
                        <span class="{{ $skeletonClass }} h-4 w-32"></span>
                        <span class="{{ $skeletonClass }} mt-5 h-8 w-2/3"></span>
                        <div class="mt-6 flex gap-5 border-b border-border pb-4"><span class="{{ $skeletonClass }} h-4 w-12"></span><span class="{{ $skeletonClass }} h-4 w-16"></span></div>
                        <div class="mt-6 grid gap-4">
                            @if (request()->is('register'))
                                @foreach (range(1, 2) as $item)<span class="{{ $skeletonClass }} h-12 w-full"></span>@endforeach
                            @endif
                            <span class="{{ $skeletonClass }} h-12 w-full"></span>
                            <span class="{{ $skeletonClass }} h-12 w-full"></span>
                            @if (request()->is('register'))<span class="{{ $skeletonClass }} h-12 w-full"></span>@endif
                            <span class="{{ $skeletonClass }} h-12 w-full"></span>
                        </div>
                        <span class="{{ $skeletonClass }} mt-5 h-3 w-4/5"></span>
                    </section>
                </section>
            @elseif ($isInformationPage)
                <section class="mt-10 grid gap-7">
                    @foreach (range(1, 3) as $item)
                        <div class="grid gap-3 border-b border-border pb-7"><span class="{{ $skeletonClass }} h-6 w-48"></span><span class="{{ $skeletonClass }} h-4 w-full"></span><span class="{{ $skeletonClass }} h-4 w-5/6"></span></div>
                    @endforeach
                </section>
            @elseif ($isDirectory)
                @if (request()->is('artworks'))
                    <section class="mx-auto mt-10 max-w-7xl">
                        <header class="grid gap-3 border-b border-border pb-6"><span class="{{ $skeletonClass }} h-3 w-24"></span><span class="{{ $skeletonClass }} h-9 w-2/3 max-w-sm"></span><span class="{{ $skeletonClass }} h-4 w-full max-w-xl"></span></header>
                        <div class="mt-7 grid gap-3 border border-border bg-surface-muted p-4 sm:grid-cols-[minmax(0,1.5fr)_repeat(2,minmax(0,1fr))] sm:p-5">
                            @foreach (range(1, 3) as $item)<span class="{{ $skeletonClass }} h-11 w-full"></span>@endforeach
                        </div>
                        <div class="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            @foreach (range(1, 6) as $item)
                                <article class="min-w-0"><div class="relative overflow-hidden bg-surface-muted"><span class="{{ $skeletonClass }} block aspect-[3/4] w-full rounded-none"></span></div><div class="grid gap-1.5 px-0.5 pb-2 pt-4"><div class="flex min-h-5 items-center justify-between gap-3"><span class="{{ $skeletonClass }} h-3 w-20"></span><span class="{{ $skeletonClass }} h-3 w-3 rounded-full"></span></div><span class="{{ $skeletonClass }} h-5 w-4/5"></span><span class="{{ $skeletonClass }} h-5 w-3/5"></span><span class="{{ $skeletonClass }} h-4 w-2/5"></span><span class="{{ $skeletonClass }} h-4 w-1/3"></span></div></article>
                            @endforeach
                        </div>
                    </section>
                @else
                    <section class="mx-auto mt-10 max-w-7xl">
                        <header class="mb-8 grid gap-4 border-y border-border bg-surface-muted px-6 py-10 sm:px-10"><span class="{{ $skeletonClass }} h-3 w-28"></span><span class="{{ $skeletonClass }} h-10 w-2/3 max-w-lg"></span><span class="{{ $skeletonClass }} h-4 w-full max-w-2xl"></span><span class="{{ $skeletonClass }} h-11 w-full max-w-2xl"></span></header>
                        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            @foreach (range(1, 6) as $item)
                                <article class="grid min-w-0 content-start gap-3 border border-border bg-paper p-5 sm:p-6"><div class="flex items-start justify-between gap-4"><span class="{{ $skeletonClass }} h-14 w-14 shrink-0 rounded-full"></span><span class="{{ $skeletonClass }} mt-1 h-3 w-24"></span></div><div class="mt-2 grid gap-2"><span class="{{ $skeletonClass }} h-7 w-2/3"></span><span class="{{ $skeletonClass }} h-3 w-1/3"></span></div><div class="mt-1 grid gap-2"><span class="{{ $skeletonClass }} h-3 w-full"></span><span class="{{ $skeletonClass }} h-3 w-11/12"></span><span class="{{ $skeletonClass }} h-3 w-3/4"></span></div><div class="mt-3 flex items-center justify-between border-t border-border pt-4"><span class="{{ $skeletonClass }} h-4 w-28"></span><span class="{{ $skeletonClass }} h-3 w-3 rounded-full"></span></div></article>
                            @endforeach
                        </div>
                    </section>
                @endif
            @elseif ($isWorkspace)
                @if (request()->is('admin'))
                    <section class="mx-auto mt-10 grid max-w-7xl gap-8">
                        <header class="grid gap-4 overflow-hidden rounded-2xl bg-ink p-6 sm:p-8"><span class="{{ $skeletonClass }} h-3 w-28"></span><span class="{{ $skeletonClass }} h-9 w-2/3 max-w-xl"></span><div class="grid max-w-3xl gap-2"><span class="{{ $skeletonClass }} h-3 w-full"></span><span class="{{ $skeletonClass }} h-3 w-4/5"></span></div><span class="{{ $skeletonClass }} h-11 w-40"></span></header>
                        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">@foreach (range(1, 3) as $item)<article class="grid min-h-32 content-between gap-4 border border-border bg-paper p-5"><span class="{{ $skeletonClass }} h-4 w-28"></span><span class="{{ $skeletonClass }} h-8 w-2/5"></span><span class="{{ $skeletonClass }} h-3 w-4/5"></span></article>@endforeach</div>
                        <div class="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(18rem,.8fr)]">
                            <section class="border border-border bg-paper p-5 sm:p-7"><div class="grid gap-2 border-b border-border pb-4"><span class="{{ $skeletonClass }} h-3 w-24"></span><span class="{{ $skeletonClass }} h-6 w-40"></span></div><div class="mt-5 grid gap-5 sm:grid-cols-[8rem_minmax(0,1fr)]"><span class="{{ $skeletonClass }} aspect-[3/4] w-full sm:max-w-32"></span><div class="grid content-start gap-3"><span class="{{ $skeletonClass }} h-6 w-24 rounded-full"></span><span class="{{ $skeletonClass }} h-5 w-2/3"></span><span class="{{ $skeletonClass }} h-3 w-1/2"></span><span class="{{ $skeletonClass }} mt-2 h-4 w-36"></span></div></div></section>
                            <aside class="border border-border bg-surface-muted p-5 sm:p-7"><div class="grid gap-2"><span class="{{ $skeletonClass }} h-3 w-24"></span><span class="{{ $skeletonClass }} h-6 w-2/3"></span></div><div class="mt-3 grid gap-2"><span class="{{ $skeletonClass }} h-3 w-full"></span><span class="{{ $skeletonClass }} h-3 w-5/6"></span><span class="{{ $skeletonClass }} h-3 w-4/5"></span></div><span class="{{ $skeletonClass }} mt-5 h-11 w-40"></span></aside>
                        </div>
                        <section><div class="grid gap-2"><span class="{{ $skeletonClass }} h-3 w-24"></span><span class="{{ $skeletonClass }} h-6 w-40"></span></div><div class="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">@foreach (range(1, 4) as $item)<article class="grid min-h-44 content-start gap-4 border border-border bg-paper p-5"><div class="flex items-center justify-between"><span class="{{ $skeletonClass }} h-10 w-10"></span><span class="{{ $skeletonClass }} h-3 w-20"></span></div><span class="{{ $skeletonClass }} h-5 w-2/3"></span><span class="{{ $skeletonClass }} h-3 w-full"></span><span class="{{ $skeletonClass }} h-3 w-4/5"></span><span class="{{ $skeletonClass }} mt-2 h-3 w-24"></span></article>@endforeach</div></section>
                    </section>
                @elseif (request()->is('admin/artworks'))
                    <section class="mx-auto mt-10 max-w-7xl">
                        <header class="mb-8 grid gap-3 border-b border-border pb-6"><span class="{{ $skeletonClass }} h-3 w-24"></span><span class="{{ $skeletonClass }} h-9 w-2/3 max-w-sm"></span><span class="{{ $skeletonClass }} h-4 w-full max-w-2xl"></span></header>
                        <div class="mb-6 flex flex-wrap gap-2">@foreach (range(1, 4) as $item)<span class="{{ $skeletonClass }} h-10 w-28 rounded-full"></span>@endforeach</div>
                        <div class="grid gap-4 xl:grid-cols-2">@foreach (range(1, 4) as $item)<article class="overflow-hidden border border-border bg-paper"><div class="grid sm:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)]"><span class="{{ $skeletonClass }} h-56 w-full sm:h-full sm:min-h-64"></span><div class="grid content-start gap-3 p-5"><div class="flex justify-between gap-3"><span class="{{ $skeletonClass }} h-5 w-2/3"></span><span class="{{ $skeletonClass }} h-6 w-20 rounded-full"></span></div><span class="{{ $skeletonClass }} h-3 w-1/2"></span><div class="grid grid-cols-2 gap-3">@foreach (range(1, 4) as $field)<span class="{{ $skeletonClass }} h-8 w-full"></span>@endforeach</div><span class="{{ $skeletonClass }} h-16 w-full"></span></div></div><div class="grid gap-3 border-t border-border p-5"><span class="{{ $skeletonClass }} h-4 w-36"></span><span class="{{ $skeletonClass }} h-20 w-full"></span><div class="flex gap-2"><span class="{{ $skeletonClass }} h-9 w-24"></span><span class="{{ $skeletonClass }} h-9 w-24"></span><span class="{{ $skeletonClass }} h-9 w-20"></span></div></div></article>@endforeach</div>
                    </section>
                @elseif (request()->is('admin/users'))
                    <section class="mx-auto mt-10 max-w-7xl">
                        <header class="mb-8 grid gap-3 border-b border-border pb-6"><span class="{{ $skeletonClass }} h-3 w-24"></span><span class="{{ $skeletonClass }} h-9 w-2/3 max-w-sm"></span><span class="{{ $skeletonClass }} h-4 w-full max-w-2xl"></span></header>
                        <div class="mb-4 grid gap-3 sm:grid-cols-2">@foreach (range(1, 2) as $item)<div class="border border-border bg-paper p-4"><span class="{{ $skeletonClass }} h-3 w-28"></span><span class="{{ $skeletonClass }} mt-2 h-8 w-16"></span></div>@endforeach</div>
                        <div class="mb-6 grid gap-2 border-s-2 border-sand bg-surface-muted p-4"><span class="{{ $skeletonClass }} h-3 w-full"></span><span class="{{ $skeletonClass }} h-3 w-4/5"></span></div>
                        <div class="grid gap-3 xl:grid-cols-2">@foreach (range(1, 4) as $item)<article class="grid gap-4 border border-border bg-paper p-5"><div class="flex items-start justify-between gap-3"><div class="grid flex-1 gap-2"><span class="{{ $skeletonClass }} h-5 w-2/3"></span><span class="{{ $skeletonClass }} h-3 w-4/5"></span></div><span class="{{ $skeletonClass }} h-6 w-20 rounded-full"></span></div><div class="grid gap-2 border-t border-border pt-4"><span class="{{ $skeletonClass }} h-4 w-28"></span><span class="{{ $skeletonClass }} h-11 w-full"></span><span class="{{ $skeletonClass }} h-3 w-3/4"></span><span class="{{ $skeletonClass }} h-9 w-24"></span></div></article>@endforeach</div>
                    </section>
                @elseif (request()->is('admin/message-reports'))
                    <section class="mx-auto mt-10 max-w-7xl">
                        <header class="mb-8 grid gap-3 border-b border-border pb-6"><span class="{{ $skeletonClass }} h-3 w-24"></span><span class="{{ $skeletonClass }} h-9 w-2/3 max-w-sm"></span><span class="{{ $skeletonClass }} h-4 w-full max-w-2xl"></span></header>
                        <div class="mb-4 grid gap-3 sm:grid-cols-2">@foreach (range(1, 2) as $item)<div class="border border-border bg-paper p-4"><span class="{{ $skeletonClass }} h-3 w-28"></span><span class="{{ $skeletonClass }} mt-2 h-8 w-16"></span></div>@endforeach</div>
                        <div class="grid gap-4">@foreach (range(1, 3) as $item)<article class="overflow-hidden border border-border bg-paper"><div class="flex items-start justify-between gap-3 border-b border-border bg-surface-muted p-4 sm:p-5"><div class="grid flex-1 gap-2"><span class="{{ $skeletonClass }} h-3 w-24"></span><span class="{{ $skeletonClass }} h-5 w-2/3"></span><span class="{{ $skeletonClass }} h-3 w-1/2"></span></div><span class="{{ $skeletonClass }} h-6 w-24 rounded-full"></span></div><div class="grid gap-3 p-5"><span class="{{ $skeletonClass }} h-4 w-28"></span><span class="{{ $skeletonClass }} h-16 w-full"></span><span class="{{ $skeletonClass }} h-4 w-36"></span><span class="{{ $skeletonClass }} h-20 w-full"></span><span class="{{ $skeletonClass }} h-11 w-full"></span><div class="flex gap-2"><span class="{{ $skeletonClass }} h-9 w-24"></span><span class="{{ $skeletonClass }} h-9 w-24"></span></div></div></article>@endforeach</div>
                    </section>
                @elseif (request()->is('admin/editorial'))
                    <section class="mx-auto mt-10 max-w-7xl">
                        <header class="mb-8 grid gap-3 border-b border-border pb-6"><span class="{{ $skeletonClass }} h-3 w-24"></span><span class="{{ $skeletonClass }} h-9 w-2/3 max-w-sm"></span><span class="{{ $skeletonClass }} h-4 w-full max-w-2xl"></span></header>
                        <section class="grid gap-4 border border-border bg-paper p-5 sm:p-7"><span class="{{ $skeletonClass }} h-7 w-44"></span><span class="{{ $skeletonClass }} h-4 w-28"></span><span class="{{ $skeletonClass }} h-11 w-full"></span><span class="{{ $skeletonClass }} h-4 w-32"></span><span class="{{ $skeletonClass }} h-28 w-full"></span><span class="{{ $skeletonClass }} h-4 w-48"></span><div class="grid gap-3 border border-border p-3">@foreach (range(1, 6) as $item)<div class="flex items-center gap-3"><span class="{{ $skeletonClass }} h-4 w-4"></span><div class="grid flex-1 gap-2"><span class="{{ $skeletonClass }} h-4 w-2/3"></span><span class="{{ $skeletonClass }} h-3 w-1/3"></span></div></div>@endforeach</div><div class="flex gap-2"><span class="{{ $skeletonClass }} h-10 w-32"></span><span class="{{ $skeletonClass }} h-10 w-32"></span></div></section>
                        <section class="mt-8 grid gap-4"><div class="flex justify-between"><span class="{{ $skeletonClass }} h-6 w-40"></span><span class="{{ $skeletonClass }} h-9 w-28"></span></div>@foreach (range(1, 3) as $item)<article class="grid gap-4 border border-border bg-paper p-5"><span class="{{ $skeletonClass }} h-5 w-2/3"></span><span class="{{ $skeletonClass }} h-3 w-1/3"></span><div class="flex flex-wrap gap-2 border-t border-border pt-4"><span class="{{ $skeletonClass }} h-9 w-24"></span><span class="{{ $skeletonClass }} h-9 w-24"></span><span class="{{ $skeletonClass }} h-9 w-24"></span></div></article>@endforeach</section>
                        <section class="mt-8 grid gap-4 border border-border bg-paper p-5 sm:p-7"><span class="{{ $skeletonClass }} h-6 w-40"></span><span class="{{ $skeletonClass }} h-4 w-full max-w-xl"></span><div class="grid gap-3 sm:grid-cols-2">@foreach (range(1, 4) as $item)<div class="grid gap-3 border border-border p-3"><span class="{{ $skeletonClass }} h-4 w-2/3"></span><span class="{{ $skeletonClass }} h-10 w-full"></span></div>@endforeach</div><span class="{{ $skeletonClass }} h-10 w-40"></span></section>
                    </section>
                @elseif (request()->is('dashboard/artist'))
                    <section class="mx-auto mt-10 grid max-w-7xl gap-8">
                        <header class="grid gap-4 overflow-hidden rounded-2xl bg-ink p-6 sm:p-8"><span class="{{ $skeletonClass }} h-3 w-36"></span><span class="{{ $skeletonClass }} h-9 w-2/3 max-w-xl"></span><div class="grid max-w-3xl gap-2"><span class="{{ $skeletonClass }} h-3 w-full"></span><span class="{{ $skeletonClass }} h-3 w-4/5"></span></div><span class="{{ $skeletonClass }} h-11 w-40"></span></header>
                        <section class="grid gap-5 border border-border bg-paper p-5 sm:p-7 lg:grid-cols-[1fr_15rem]"><div class="grid gap-3"><div class="flex items-center gap-3"><span class="{{ $skeletonClass }} h-3 w-24"></span><span class="{{ $skeletonClass }} h-6 w-24 rounded-full"></span></div><span class="{{ $skeletonClass }} h-7 w-2/3 max-w-sm"></span><span class="{{ $skeletonClass }} h-4 w-full max-w-2xl"></span><span class="{{ $skeletonClass }} h-4 w-4/5 max-w-xl"></span><div class="mt-2 flex gap-3"><span class="{{ $skeletonClass }} h-10 w-32"></span><span class="{{ $skeletonClass }} h-10 w-28"></span></div></div><div class="grid justify-items-center gap-3 border-t border-border pt-5 lg:border-r lg:border-t-0 lg:pt-0"><span class="{{ $skeletonClass }} h-3 w-20"></span><span class="{{ $skeletonClass }} h-10 w-20"></span><span class="{{ $skeletonClass }} h-2 w-full rounded-full"></span></div></section>
                    </section>
                @elseif (request()->is('dashboard/buyer'))
                    <section class="mx-auto mt-10 grid max-w-7xl gap-7">
                        <header class="grid gap-4 overflow-hidden rounded-2xl bg-ink p-6 sm:p-8"><span class="{{ $skeletonClass }} h-3 w-36"></span><span class="{{ $skeletonClass }} h-9 w-full max-w-2xl"></span><div class="grid max-w-3xl gap-2"><span class="{{ $skeletonClass }} h-3 w-full"></span><span class="{{ $skeletonClass }} h-3 w-4/5"></span></div><div class="flex flex-wrap gap-3"><span class="{{ $skeletonClass }} h-11 w-36"></span><span class="{{ $skeletonClass }} h-11 w-40"></span></div></header>
                        <section class="border border-border bg-paper p-5 sm:p-7"><div class="flex items-start justify-between gap-4"><div class="grid min-w-0 flex-1 gap-2"><span class="{{ $skeletonClass }} h-3 w-28"></span><span class="{{ $skeletonClass }} h-6 w-40"></span><span class="{{ $skeletonClass }} h-3 w-full max-w-2xl"></span><span class="{{ $skeletonClass }} h-3 w-4/5 max-w-xl"></span></div><span class="{{ $skeletonClass }} h-12 w-12 shrink-0"></span></div><span class="{{ $skeletonClass }} mt-6 h-11 w-40"></span></section>
                        <section class="border-t border-border pt-6"><div class="grid gap-2"><span class="{{ $skeletonClass }} h-3 w-36"></span><span class="{{ $skeletonClass }} h-6 w-48"></span><span class="{{ $skeletonClass }} h-3 w-full max-w-2xl"></span></div><div class="mt-5 grid gap-4 md:grid-cols-3">@foreach (range(1, 3) as $item)<article class="grid gap-3 border-r-2 border-sand bg-surface-muted p-4"><span class="{{ $skeletonClass }} h-3 w-24"></span><span class="{{ $skeletonClass }} h-5 w-3/4"></span><span class="{{ $skeletonClass }} h-3 w-full"></span><span class="{{ $skeletonClass }} h-3 w-5/6"></span></article>@endforeach</div></section>
                    </section>
                @elseif (request()->is('dashboard/artist/messages', 'dashboard/buyer/messages'))
                    <section class="flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden font-sans"><div class="grid h-full min-h-0 w-full min-w-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)] overflow-hidden rounded-lg border border-border bg-surface shadow-soft lg:grid-cols-[minmax(17rem,21rem)_minmax(0,1fr)]">
                        <aside class="{{ request()->filled('conversation') ? 'hidden min-h-0 flex-col border-e-0 border-border bg-paper md:border-e lg:flex' : 'flex min-h-0 flex-col border-e-0 border-border bg-paper md:border-e' }}"><div class="border-b border-border p-3"><span class="{{ $skeletonClass }} h-4 w-20"></span><span class="{{ $skeletonClass }} mt-2 h-3 w-40"></span></div><div class="grid gap-2 border-b border-border bg-surface-muted p-3"><span class="{{ $skeletonClass }} h-10 w-full"></span><div class="grid grid-cols-3"><span class="{{ $skeletonClass }} h-10 w-full"></span><span class="{{ $skeletonClass }} h-10 w-full"></span><span class="{{ $skeletonClass }} h-10 w-full"></span></div></div><div class="grid gap-0">@foreach (range(1, 6) as $item)<div class="flex min-h-[4.25rem] items-center gap-2 border-b border-border px-3 py-2"><span class="{{ $skeletonClass }} h-10 w-10 shrink-0 rounded-full"></span><div class="grid flex-1 gap-2"><span class="{{ $skeletonClass }} h-4 w-2/5"></span><span class="{{ $skeletonClass }} h-3 w-4/5"></span><span class="{{ $skeletonClass }} h-2 w-16"></span></div></div>@endforeach</div></aside>
                        <div class="{{ request()->filled('conversation') ? 'flex min-w-0 flex-col bg-canvas' : 'hidden min-w-0 flex-col bg-canvas lg:flex' }}">@if (request()->filled('conversation'))<div class="flex items-center gap-3 border-b border-border p-5"><span class="{{ $skeletonClass }} h-10 w-10 rounded-full"></span><span class="{{ $skeletonClass }} h-4 w-40"></span></div><div class="border-b border-border bg-surface-muted px-5 py-3"><span class="{{ $skeletonClass }} h-3 w-28"></span></div><div class="grid content-end gap-5 p-6">@foreach (range(1, 5) as $item)<div class="flex {{ $item % 2 ? 'justify-end' : 'justify-start' }}"><span class="{{ $skeletonClass }} h-16 w-3/5 rounded-[20px]"></span></div>@endforeach</div><div class="border-t border-border p-5"><span class="{{ $skeletonClass }} h-12 w-full rounded-full"></span></div>@else<div class="m-auto p-8 text-center"><span class="{{ $skeletonClass }} h-4 w-56"></span></div>@endif</div>
                    </div></section>
                @else
                    <section class="mx-auto mt-10 max-w-7xl">
                        <div class="grid gap-3 border-b border-border pb-6"><span class="{{ $skeletonClass }} h-3 w-24"></span><span class="{{ $skeletonClass }} h-9 w-2/3 max-w-sm"></span><span class="{{ $skeletonClass }} h-4 w-full max-w-xl"></span></div>
                        <div class="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">@foreach (range(1, 3) as $item)<span class="{{ $skeletonClass }} h-28 w-full"></span>@endforeach</div>
                        <div class="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">@foreach (range(1, 6) as $item)<div class="overflow-hidden border border-border bg-paper"><span class="{{ $skeletonClass }} block aspect-[3/4] w-full"></span><div class="grid gap-3 p-4"><span class="{{ $skeletonClass }} h-3 w-20"></span><span class="{{ $skeletonClass }} h-5 w-4/5"></span><span class="{{ $skeletonClass }} h-4 w-2/5"></span></div></div>@endforeach</div>
                    </section>
                @endif
            @else
                <section class="grid grid-cols-1 items-center gap-12 py-14 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,.9fr)] lg:gap-20 lg:py-24">
                    <div class="grid gap-4">
                        <span class="{{ $skeletonClass }} mb-3 h-3 w-28"></span>
                        <span class="{{ $skeletonClass }} h-[clamp(2rem,4vw,3.5rem)] w-[92%]"></span>
                        <span class="{{ $skeletonClass }} h-[clamp(2rem,4vw,3.5rem)] w-2/3"></span>
                        <span class="{{ $skeletonClass }} mt-2 h-4 w-[94%]"></span>
                        <span class="{{ $skeletonClass }} h-4 w-[70%]"></span>
                        <span class="{{ $skeletonClass }} mt-5 h-12 w-36"></span>
                    </div>
                    <div class="w-full min-w-0">
                        <span class="{{ $skeletonClass }} aspect-[3/4] w-full"></span>
                        <div class="flex min-h-[4.75rem] items-center justify-between gap-4 px-2 py-4">
                            <div class="grid gap-2"><span class="{{ $skeletonClass }} h-3 w-32"></span><span class="{{ $skeletonClass }} h-4 w-24"></span></div>
                            <span class="{{ $skeletonClass }} h-3 w-20"></span>
                        </div>
                    </div>
                </section>
                <section class="grid grid-cols-1 gap-8 border-y border-border bg-surface-muted py-12 md:grid-cols-3">
                    @foreach (range(1, 3) as $item)
                        <div class="grid content-start gap-1">
                            <span class="{{ $skeletonClass }} h-3 w-20"></span>
                            <span class="{{ $skeletonClass }} mt-3 h-6 w-3/4"></span>
                            <span class="{{ $skeletonClass }} mt-3 h-3 w-full"></span>
                            <span class="{{ $skeletonClass }} mt-2 h-3 w-5/6"></span>
                        </div>
                    @endforeach
                </section>
                <section class="py-16">
                    <div class="mb-8 flex items-end justify-between gap-4"><div class="grid gap-3"><span class="{{ $skeletonClass }} h-3 w-24"></span><span class="{{ $skeletonClass }} h-8 w-40"></span></div><span class="{{ $skeletonClass }} h-4 w-20"></span></div>
                    <div class="grid grid-cols-1 gap-5 md:grid-cols-3" aria-hidden="true">
                        @foreach (range(1, 3) as $item)
                            <article class="min-w-0 border border-border bg-paper"><a href="#" tabindex="-1" class="block"><div class="flex aspect-[3/4] items-center justify-center overflow-hidden bg-surface-muted p-3"><span class="{{ $skeletonClass }} aspect-[3/4] w-full"></span></div><div class="grid gap-2 p-4"><span class="{{ $skeletonClass }} h-5 w-20"></span><span class="{{ $skeletonClass }} h-6 w-4/5"></span><span class="{{ $skeletonClass }} h-4 w-2/5"></span><span class="{{ $skeletonClass }} h-4 w-1/3"></span></div></a></article>
                        @endforeach
                    </div>
                </section>
                <section class="border-y border-border bg-paper py-14">
                    <div class="grid gap-3"><span class="{{ $skeletonClass }} h-3 w-24"></span><span class="{{ $skeletonClass }} h-8 w-48"></span></div>
                    <div class="mt-6 flex min-h-24 flex-wrap content-start gap-3">
                        @foreach (range(1, 6) as $item)<span class="{{ $skeletonClass }} h-11 w-28"></span>@endforeach
                    </div>
                </section>
                <section class="py-16">
                    <div class="mb-8 flex items-end justify-between gap-4"><div class="grid gap-3"><span class="{{ $skeletonClass }} h-3 w-24"></span><span class="{{ $skeletonClass }} h-8 w-44"></span></div><span class="{{ $skeletonClass }} h-4 w-24"></span></div>
                    <div class="grid grid-cols-1 gap-5 md:grid-cols-3">
                        @foreach (range(1, 3) as $item)
                            <article class="grid gap-3 border border-border bg-paper p-5"><div class="flex items-start gap-3"><span class="{{ $skeletonClass }} h-12 w-12 shrink-0 rounded-full"></span><div class="grid flex-1 content-start gap-2 pt-1"><span class="{{ $skeletonClass }} h-5 w-2/3"></span><span class="{{ $skeletonClass }} h-3 w-1/3"></span></div></div><div class="grid gap-2"><span class="{{ $skeletonClass }} h-3 w-full"></span><span class="{{ $skeletonClass }} h-3 w-11/12"></span><span class="{{ $skeletonClass }} h-3 w-3/4"></span></div><a href="#" tabindex="-1" class="mt-1 block"><span class="{{ $skeletonClass }} h-4 w-28"></span></a></article>
                        @endforeach
                    </div>
                </section>
                <section class="flex flex-col items-start justify-between gap-8 bg-ink py-14 text-inverse-text md:flex-row md:items-center">
                    <div class="grid max-w-2xl gap-3"><span class="{{ $skeletonClass }} h-3 w-24"></span><span class="{{ $skeletonClass }} h-8 w-full"></span><span class="{{ $skeletonClass }} h-4 w-5/6"></span></div>
                    <span class="{{ $skeletonClass }} h-12 w-36"></span>
                </section>
            @endif
        @if ($isWorkspace)
                    </main>
                </div>
                <div class="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-paper pb-[env(safe-area-inset-bottom)] shadow-raised lg:inset-x-auto lg:left-1/2 lg:bottom-6 lg:w-[min(54rem,calc(100vw_-_3rem))] lg:-translate-x-1/2 lg:border lg:pb-0" aria-hidden="true">
                    <div class="mx-auto grid h-[var(--workspace-bottom-nav-primary-height)] w-full grid-flow-col auto-cols-fr gap-1 px-2 lg:h-16 lg:px-3">
                        @foreach (range(1, $workspaceNavigationCount) as $item)
                            <div class="flex flex-col items-center justify-center gap-1"><span class="{{ $skeletonClass }} h-[19px] w-[19px]"></span><span class="{{ $skeletonClass }} h-2 w-10"></span></div>
                        @endforeach
                    </div>
                </div>
            </div>
        @else
            </main>
        @endif
    </div>
</body>
</html>