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
    <div id="app" aria-busy="true">
        <main class="app-boot" aria-label="در حال بارگذاری راد آرت">
            <div class="app-boot__header">
                <span class="app-skeleton app-boot__brand"></span>
                <span class="app-skeleton app-boot__nav"></span>
            </div>
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
                <span class="app-skeleton app-boot__card"></span>
                <span class="app-skeleton app-boot__card"></span>
                <span class="app-skeleton app-boot__card"></span>
            </section>
        </main>
    </div>
</body>
</html>