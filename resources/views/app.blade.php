<!doctype html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#F7F5F0">
    <meta name="description" content="راد آرت؛ جایی برای کشف هنر و ارتباط مستقیم با هنرمندان.">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Vazirmatn:wght@400;500;600;700;800&display=optional" rel="stylesheet">
    <title>{{ config('app.name', 'Rad Art Marketplace') }}</title>
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
</head>
<body>
    @php
        $isWorkspace = request()->is('dashboard/*') || request()->is('admin*');
        $isArtworkDetail = request()->is('artworks/*');
        $isArtistProfile = request()->is('artists/*');
        $isForm = request()->is('login', 'register', 'dashboard/artist/profile', 'dashboard/artist/artworks');
        $isInformationPage = request()->is('about', 'help', 'contact');
        $isDirectory = request()->is('artworks', 'artists');
    @endphp
    <div id="app" aria-busy="true">
        <main class="app-boot" aria-label="در حال بارگذاری راد آرت">
            <div class="app-boot__header">
                <span class="app-skeleton app-boot__brand"></span>
                <span class="app-skeleton app-boot__nav"></span>
            </div>

            @if ($isArtworkDetail)
                <section class="grid items-start gap-8 py-10 lg:grid-cols-[1.15fr_.85fr]">
                    <span class="app-skeleton aspect-[4/3] w-full lg:aspect-[4/5]"></span>
                    <div class="grid gap-5 border border-border bg-white p-6 sm:p-9">
                        <span class="app-skeleton h-4 w-24"></span>
                        <span class="app-skeleton h-10 w-4/5"></span>
                        <span class="app-skeleton h-4 w-2/5"></span>
                        <span class="app-skeleton mt-5 h-28 w-full"></span>
                        <span class="app-skeleton mt-3 h-20 w-full"></span>
                    </div>
                </section>
            @elseif ($isArtistProfile)
                <section class="grid gap-4 border border-border bg-white p-7 py-10 sm:p-12">
                    <span class="app-skeleton h-3 w-28"></span>
                    <span class="app-skeleton h-10 w-2/3 max-w-md"></span>
                    <span class="app-skeleton h-4 w-28"></span>
                    <span class="app-skeleton mt-3 h-20 w-full max-w-3xl"></span>
                </section>
                <section class="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    @foreach (range(1, 6) as $item)
                        <div class="border border-border bg-white">
                            <span class="app-skeleton block aspect-[4/3] w-full"></span>
                            <div class="grid gap-3 p-4"><span class="app-skeleton h-4 w-4/5"></span><span class="app-skeleton h-3 w-2/5"></span></div>
                        </div>
                    @endforeach
                </section>
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
                    <span class="app-skeleton app-boot__artwork"></span>
                </section>
                <section class="app-boot__cards" aria-hidden="true">
                    @foreach (range(1, 3) as $item)<span class="app-skeleton app-boot__card"></span>@endforeach
                </section>
            @endif
        </main>
    </div>
</body>
</html>