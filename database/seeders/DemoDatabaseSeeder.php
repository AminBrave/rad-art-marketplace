<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\ArtistInquiry;
use App\Models\ArtistProfile;
use App\Models\Artwork;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class DemoDatabaseSeeder extends Seeder
{
    private const PASSWORD = 'Demo@12345';

    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            $this->command?->warn('Demo data is restricted to local/testing environments. No records were changed.');
            return;
        }

        $admin = User::query()->updateOrCreate(['email' => 'admin@rademan.test'], [
            'name' => 'مدیر رادمان', 'password' => Hash::make(self::PASSWORD),
            'role' => User::ROLE_ADMIN, 'email_verified_at' => now(),
        ]);

        $categories = [];
        foreach ([
            'painting' => 'نقاشی', 'photography' => 'عکاسی', 'sculpture' => 'مجسمه‌سازی',
            'digital-art' => 'هنر دیجیتال', 'calligraphy' => 'خوشنویسی', 'other' => 'سایر',
        ] as $slug => $name) {
            $categories[$slug] = Category::query()->updateOrCreate(['slug' => $slug], ['name' => $name, 'is_active' => true]);
        }
        Category::query()->updateOrCreate(['slug' => 'demo-inactive'], ['name' => 'دسته آزمایشی غیرفعال', 'is_active' => false]);

        $artistData = [
            ['artist', 'آرمان رضایی', 'تهران', 'نقاشی معاصر'],
            ['artist-02', 'سارا نیک‌پی', 'اصفهان', 'عکاسی مستند'],
            ['artist-03', 'نیما فرهمند', 'شیراز', 'مجسمه‌سازی'],
            ['artist-04', 'رها کریمی', 'تبریز', 'هنر دیجیتال'],
            ['artist-05', 'مانی پارسا', 'رشت', 'خوشنویسی'],
            ['artist-06', 'یلدا احمدی', 'تهران', 'نقاشی انتزاعی'],
            ['artist-07', 'کیان موسوی', 'مشهد', 'عکاسی طبیعت'],
            ['artist-08', 'ترانه صادقی', 'کرج', 'حجم و چیدمان'],
            ['artist-09', 'پارسا شریفی', 'یزد', 'تصویرسازی دیجیتال'],
            ['artist-10', 'مهتاب حیدری', 'قزوین', 'نقاشی آبرنگ'],
            ['artist-11', 'سامان رفیعی', 'اهواز', 'عکاسی معماری'],
            ['artist-12', 'هستی محمدی', 'کاشان', 'خوشنویسی و تذهیب'],
            ['artist-13', 'آوا مرادی', 'سنندج', 'هنرهای ترکیبی'],
            ['artist-14', 'بردیا زمانی', 'بندرعباس', 'هنر بازیافتی'],
        ];

        $artists = [];
        foreach ($artistData as $i => [$key, $name, $city, $specialty]) {
            $email = ($key === 'artist' ? 'artist' : $key).'@rademan.test';
            $user = User::query()->updateOrCreate(['email' => $email], [
                'name' => $name, 'password' => Hash::make(self::PASSWORD),
                'role' => User::ROLE_ARTIST, 'email_verified_at' => now(),
            ]);
            $artists[] = $user->artistProfile()->updateOrCreate([], [
                'slug' => $key === 'artist' ? 'arman-rezaei' : $key,
                'display_name' => $name,
                'bio' => $name.' هنرمندی فعال در حوزه '.$specialty.' است. این پروفایل برای آزمایش امکانات بازار هنر رادمان ساخته شده است.',
                'city' => $city,
                'website_url' => $i % 3 === 0 ? 'https://example.com/'.$key : null,
                'instagram_handle' => $i % 4 === 0 ? null : 'demo.'.$key,
                'is_public' => $i !== 13,
            ]);
        }

        $buyers = [];
        foreach ([['buyer', 'مینا خریدار'], ['buyer-02', 'علی خریدار'], ['buyer-03', 'نگار مجموعه‌دار'], ['buyer-04', 'رضا علاقه‌مند به هنر']] as [$key, $name]) {
            $buyers[] = User::query()->updateOrCreate(['email' => $key.'@rademan.test'], [
                'name' => $name, 'password' => Hash::make(self::PASSWORD),
                'role' => User::ROLE_BUYER, 'email_verified_at' => now(),
            ]);
        }

        $categorySlugs = array_keys($categories);
        $availabilityValues = ['available', 'sold', 'not_for_sale'];
        $artworks = [];
        $n = 0;
        foreach ($artists as $artistIndex => $profile) {
            for ($item = 1; $item <= ($artistIndex === 0 ? 18 : 4); $item++) {
                $n++;
                $slug = sprintf('demo-%02d-%02d', $artistIndex + 1, $item);
                $status = ($artistIndex === 0 && $item <= 15) ? Artwork::STATUS_APPROVED : match ($n % 4) {
                    0 => Artwork::STATUS_PENDING_REVIEW,
                    1 => Artwork::STATUS_REJECTED,
                    2 => Artwork::STATUS_CHANGES_REQUESTED,
                    default => Artwork::STATUS_APPROVED,
                };
                $category = $categorySlugs[($n - 1) % count($categorySlugs)];
                $title = $this->title($category, $n);
                $path = 'artworks/demo/'.$slug.'.svg';
                $reviewed = $status !== Artwork::STATUS_PENDING_REVIEW;

                $artwork = $profile->artworks()->updateOrCreate(['slug' => $slug], [
                    'category_id' => $categories[$category]->id,
                    'title' => $title,
                    'description' => $n % 7 === 0 ? null : 'اثر نمایشی شماره '.$n.' برای آزمایش جست‌وجو، فیلتر و جزئیات کاتالوگ.',
                    'medium' => $n % 6 === 0 ? null : $this->medium($category),
                    'dimensions' => $n % 5 === 0 ? null : ($n % 2 === 0 ? '۵۰ × ۷۰ سانتی‌متر' : '۳۰ × ۴۰ × ۲۰ سانتی‌متر'),
                    'year' => $n % 8 === 0 ? null : 2018 + ($n % 9),
                    'price' => match ($n % 5) { 0 => null, 1 => 0, default => 1500000 + ($n * 275000) },
                    'availability' => $availabilityValues[($n - 1) % 3],
                    'status' => $status,
                    'rejection_note' => match ($status) {
                        Artwork::STATUS_REJECTED => 'لطفاً کیفیت تصویر و اطلاعات اثر را بازبینی کنید.',
                        Artwork::STATUS_CHANGES_REQUESTED => 'لطفاً توضیحات و مشخصات اثر را تکمیل کنید.',
                        default => null,
                    },
                    'reviewed_by' => $reviewed ? $admin->id : null,
                    'reviewed_at' => $reviewed ? now()->subDays($n % 25) : null,
                    'image_path' => $path,
                ]);
                Storage::disk('local')->put($path, $this->svg($title, $n));
                $artworks[] = $artwork;
            }
        }

        $publicArtists = array_values(array_filter($artists, fn (ArtistProfile $p): bool => $p->is_public));
        $approved = array_values(array_filter($artworks, fn (Artwork $a): bool => $a->status === Artwork::STATUS_APPROVED));
        for ($i = 1; $i <= 48; $i++) {
            $profile = $publicArtists[($i - 1) % count($publicArtists)];
            $buyer = $buyers[($i - 1) % count($buyers)];
            $status = match ($i % 3) {
                0 => ArtistInquiry::STATUS_ARCHIVED,
                1 => ArtistInquiry::STATUS_NEW,
                default => ArtistInquiry::STATUS_READ,
            };
            $relatedArtwork = null;
            if ($i % 4 !== 0) {
                foreach ($approved as $candidate) {
                    if ($candidate->artist_profile_id === $profile->id) {
                        $relatedArtwork = $candidate;
                        break;
                    }
                }
            }
            ArtistInquiry::query()->updateOrCreate([
                'artist_profile_id' => $profile->id,
                'sender_user_id' => $buyer->id,
                'subject' => 'پرسش نمایشی شماره '.$i,
            ], [
                'artwork_id' => $relatedArtwork?->id,
                'message' => 'سلام، مایلم درباره جزئیات اثر، شیوه نگهداری و شرایط تهیه آن اطلاعات بیشتری دریافت کنم. سپاسگزارم.',
                'status' => $status,
                'read_at' => $status === ArtistInquiry::STATUS_NEW ? null : now()->subDays($i % 12),
            ]);
        }

        $this->command?->info('Rademan demo dataset is ready.');
        $this->command?->line('Admin: admin@rademan.test | Artist: artist@rademan.test | Buyer: buyer@rademan.test');
        $this->command?->line('Password for all demo accounts: '.self::PASSWORD);
    }

    private function title(string $category, int $n): string
    {
        $prefix = [
            'painting' => 'روایت رنگ‌ها', 'photography' => 'لحظه ماندگار',
            'sculpture' => 'فرم و فضا', 'digital-art' => 'جهان دیجیتال',
            'calligraphy' => 'نقش واژه', 'other' => 'تجربه هنری',
        ];
        return ($prefix[$category] ?? 'اثر هنری').' '.$n;
    }

    private function medium(string $category): string
    {
        return [
            'painting' => 'رنگ روغن روی بوم', 'photography' => 'چاپ فاین‌آرت',
            'sculpture' => 'چوب و فلز', 'digital-art' => 'چاپ دیجیتال',
            'calligraphy' => 'مرکب روی کاغذ', 'other' => 'مواد ترکیبی',
        ][$category] ?? 'مواد ترکیبی';
    }

    private function svg(string $title, int $seed): string
    {
        $palette = [
            ['#243447', '#d9a441', '#f2e8d5'], ['#344e41', '#a3b18a', '#dad7cd'],
            ['#5f0f40', '#fb8b24', '#e9d8a6'], ['#264653', '#2a9d8f', '#e9c46a'],
            ['#3d405b', '#81b29a', '#f4f1de'],
        ];
        [$dark, $accent, $light] = $palette[$seed % count($palette)];
        $label = htmlspecialchars($title, ENT_QUOTES | ENT_XML1, 'UTF-8');
        return <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900" role="img" aria-label="{$label}">
<rect width="1200" height="900" fill="{$light}"/>
<path d="M0 650 C220 500 360 820 610 610 S980 430 1200 590 V900 H0Z" fill="{$dark}" opacity=".92"/>
<circle cx="830" cy="330" r="205" fill="{$accent}" opacity=".88"/>
<path d="M180 170 L500 90 L640 430 L310 560Z" fill="{$dark}" opacity=".82"/>
<path d="M690 650 L1030 480 L1120 760 L780 820Z" fill="{$accent}" opacity=".8"/>
<text x="600" y="850" text-anchor="middle" font-family="sans-serif" font-size="34" fill="{$light}">RADEMAN DEMO ARTWORK</text>
</svg>
SVG;
    }
}
