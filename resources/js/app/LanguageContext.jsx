import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'rademan-locale';
const LOCALES = ['fa', 'en'];

const english = {
    'خانه': 'Home', 'داشبورد': 'Dashboard', 'نمای کلی': 'Overview',
    'گالری': 'Gallery', 'گالری آثار': 'Artwork gallery', 'کشف آثار': 'Explore art',
    'هنرمندان': 'Artists', 'مجموعه‌ها': 'Collections', 'مجموعه‌های منتخب': 'Featured collections',
    'درباره ما': 'About', 'راهنما': 'Help', 'تماس': 'Contact',
    'پیش‌نمایش': 'Preview', 'پیش‌نمایش پروفایل': 'Profile preview', 'پروفایل': 'Profile',
    'حساب من': 'My account', 'حساب کاربری': 'Account', 'مدیریت': 'Admin',
    'ورود': 'Sign in', 'ثبت‌نام': 'Create account', 'عضویت': 'Join',
    'خروج': 'Sign out', 'خروج از حساب': 'Sign out',
    'محتوا': 'Content', 'کتابخانه محتوا': 'Content library', 'آثار': 'Artworks',
    'پیام‌ها': 'Messages', 'تنظیمات': 'Settings', 'کاربران': 'Users',
    'ایمنی': 'Safety', 'دیدگاه‌ها': 'Comments', 'سردبیری': 'Editorial',
    'سردبیری و گزینش': 'Editorial', 'بازبینی آثار': 'Artwork review',
    'تکمیل پروفایل': 'Complete profile', 'تکمیل': 'Complete',
    'ناوبری اصلی': 'Main navigation', 'بخش‌های مختلف راد آرت': 'Explore Rad Art',
    'ناوبری موبایل': 'Mobile navigation', 'ناوبری بخش‌های عمومی': 'Explore',
    'بخش‌های اصلی حساب کاربری': 'Your workspace', 'بخش‌های اصلی فضای کاربری': 'Workspace navigation',
    'پیوندهای تکمیلی سایت': 'More from Rad Art', 'کشف': 'Discover',
    'فضای کاری': 'Workspace', 'فضای کاربری': 'Workspace',
    'مشاهده سایت': 'View website', 'هنر معاصر، از نگاه مستقل': 'Contemporary art, independent perspectives',
    'گالری هنر مستقل معاصر': 'Contemporary independent art gallery',
    'هر اثر،': 'Every artwork,', 'آغاز یک نگاه تازه.': 'the beginning of a new perspective.',
    'ورود به گالری آثار': 'Explore the gallery', 'آشنایی با هنرمندان': 'Meet the artists',
    'نمایش عمومی به آثار تأییدشده و پروفایل‌های عمومی محدود است.': 'Public pages feature approved artworks and public artist profiles.',
    'تازه در گالری': 'New in the gallery', 'هنرمند راد آرت': 'Rad Art artist',
    'مشاهده اثر': 'View artwork', 'در گالری راد آرت': 'Featured on Rad Art',
    'انتخاب زبان': 'Language', 'فارسی': 'فارسی', 'English': 'English',
    'زبان': 'Language', 'تغییر زبان': 'Change language',
    'فضایی برای کشف آثار هنری مستقل، شناخت هنرمندان و ارتباط درباره هنر.': 'A place to discover independent art, meet artists, and connect through art.',
    'برای کشف': 'Discover', 'راد آرت': 'Rad Art',
    'گشت‌وگذار در گالری': 'Explore the gallery', 'همه مجموعه‌ها': 'All collections',
    'خواندن همه': 'Mark all as read', 'اعلان‌ها': 'Notifications',
    'هنوز اعلانی ندارید': 'No notifications yet',
    'فعالیت‌های تازه در این بخش نمایش داده می‌شوند.': 'Recent activity will appear here.',
    'جدیدتر': 'Newer', 'قدیمی‌تر': 'Older', 'جدید': 'New',
    'صفحه‌بندی اعلان‌ها': 'Notification pages',
    'تیره': 'Dark', 'روشن': 'Light', 'هماهنگ با دستگاه': 'System',
    'پوسته:': 'Theme:', 'تغییر پوسته؛ حالت فعلی:': 'Change theme; current mode:',
    'تغییر پوسته': 'Change theme',
    'هنرمند': 'Artist', 'خریدار': 'Buyer', 'مدیر': 'Administrator',
    'رفتن به محتوای اصلی': 'Skip to main content', 'باز کردن منوی اصلی': 'Open main menu',
    'بستن منو': 'Close menu', 'بستن اعلان‌ها': 'Close notifications',
    'خروج انجام نشد. اتصال را بررسی کنید.': 'Sign out failed. Check your connection.',
    'دریافت اعلان‌ها انجام نشد.': 'Could not load notifications.',
    'بازکردن اعلان انجام نشد. دوباره تلاش کنید.': 'Could not open notification. Please try again.',
    'به‌روزرسانی اعلان‌ها انجام نشد.': 'Could not update notifications.',
    'خبرهای تازه درباره پیام‌ها، آثار و هنرمندان': 'Updates about messages, artworks, and artists',
    'جدید': 'New', 'جدیدتر': 'Newer', 'قدیمی‌تر': 'Older',
    'مشاهده سایت': 'View website', 'فضای کاری': 'Workspace',
    'تماس با ما': 'Contact us', 'گالری آثار': 'Artwork gallery',
    'دسته‌بندی فعالی برای نمایش وجود ندارد.': 'No active categories to display.',
    'دریافت محتوای گالری ممکن نشد': 'Could not load gallery content',
    'برای دریافت دوباره تلاش کنید.': 'Please try again.',
    'هنوز اثر دیگری برای نمایش نیست': 'No other artworks to show yet',
    'آثار تازه پس از تأیید در این بخش قرار می‌گیرند.': 'New artworks appear here after approval.',
    'از کجا شروع کنیم؟': 'Where should we start?',
    'دسته‌بندی‌های فعال گالری را مرور کنید و به جهان هر شاخه هنری وارد شوید.': 'Browse active gallery categories and explore each artistic discipline.',
    'دیدن همه آثار': 'View all artworks', 'دیدن همه هنرمندان': 'View all artists',
    'تازه در گالری': 'New in the gallery',
    'آثاری که به‌تازگی برای نمایش عمومی تأیید شده‌اند.': 'Recently approved artworks, now available to explore.',
    'هنرمندان، فراتر از آثار': 'Artists beyond their work',
    'با هنرمندانی آشنا شوید که پروفایل عمومی خود را در راد آرت منتشر کرده‌اند.': 'Meet artists who have published a public profile on Rad Art.',
    'هنرمندان دارای پروفایل عمومی در این بخش معرفی می‌شوند.': 'Artists with public profiles will appear here.',
    'چطور در راد آرت کشف کنیم': 'How to discover on Rad Art',
    'در میان آثار تأییدشده جست‌وجو کنید و مسیرهای تازه‌ای برای دیدن پیدا کنید.': 'Explore approved artworks and discover new perspectives.',
    'با هنرمندان مستقل، نگاه شخصی و جهان تصویری آن‌ها آشنا شوید.': 'Meet independent artists and discover their visual worlds.',
    'برای گفت‌وگو درباره یک اثر یا هنرمند، مسیر ارتباط را آغاز کنید.': 'Start a conversation about an artwork or an artist.',
    'کشف': 'Discover', 'شناخت': 'Meet', 'ارتباط': 'Connect',
    'راد آرت جایی برای مکث، کشف آثار هنری مستقل، شناخت هنرمندان و شکل‌گرفتن گفت‌وگوهایی تازه درباره هنر است.': 'Rad Art is a place to pause, discover independent art, meet artists, and start new conversations about art.',
    'ورود به پورتفولیو': 'View portfolio',
    'پورتفولیوی عمومی این هنرمند را ببینید و با آثار تأییدشده او آشنا شوید.': 'Explore this artist’s public portfolio and approved artworks.',
    'مجموعه‌ها و هنرمندان منتخب': 'Featured collections and artists',
    'روایت‌هایی از نگاه سردبیر': 'Stories selected by the editor',
    'مجموعه‌هایی برای دیدن آثار در کنار یکدیگر و کشف ارتباط‌های تازه.': 'Curated collections that reveal new connections between artworks.',
    'اثر منتخب': 'Selected artwork', 'صداهای منتخب': 'Selected voices',
    'با پورتفولیوی این هنرمند آشنا شوید.': 'Explore this artist’s portfolio.',
    'اثر منتخب': 'Selected artwork', 'شروع به‌عنوان هنرمند': 'Join as an artist',
    'جهان هنری خود را با دیگران به اشتراک بگذارید.': 'Share your artistic world with others.',
    'هنرمندان می‌توانند حساب بسازند، پروفایل خود را تکمیل کنند و آثارشان را برای بررسی ارسال کنند.': 'Artists can create an account, complete their profile, and submit artworks for review.',
    'اثر': 'artwork', 'اثر منتخب': 'selected artworks',
    'باز کردن منوی اصلی': 'Open main menu', 'باز کردن منوی حساب کاربری': 'Open account menu',
    'بستن منو': 'Close menu', 'بستن اعلان‌ها': 'Close notifications',
    'بخش‌های مختلف راد آرت': 'Explore Rad Art', 'ناوبری اصلی': 'Main navigation',
    'رفتن به محتوای اصلی': 'Skip to main content', 'تماس با ما': 'Contact us',
    'ساخت حساب کاربری': 'Create account', 'تماس': 'Contact',
    'گشت‌وگذار در گالری': 'Explore the gallery', 'پاسخ': 'Reply',
    'خروج انجام نشد. اتصال را بررسی کنید.': 'Sign out failed. Check your connection.',
    'دریافت اعلان‌ها انجام نشد.': 'Could not load notifications.',
    'بازکردن اعلان انجام نشد. دوباره تلاش کنید.': 'Could not open notification. Please try again.',
    'به‌روزرسانی اعلان‌ها انجام نشد.': 'Could not update notifications.',
    'خبرهای تازه درباره پیام‌ها، آثار و هنرمندان': 'Updates about messages, artworks, and artists',
    'فضای کاری': 'Workspace', 'RAD ART / WORKSPACE': 'RAD ART / WORKSPACE',
    'صفحه‌بندی اعلان‌ها': 'Notification pages', 'جدید': 'New',
    'اعلان‌ها،': 'Notifications,', 'خوانده‌نشده': 'unread',
    'خواندن همه': 'Mark all as read', 'هنوز اعلانی ندارید': 'No notifications yet',
    'فعالیت‌های تازه در این بخش نمایش داده می‌شوند.': 'Recent activity will appear here.',
    'پروفایل هنرمند': 'Artist profile', 'نمای کلی': 'Overview',
    'بازبینی آثار': 'Artwork review', 'مدیریت کاربران': 'User management',
    'ایمنی پیام‌ها': 'Message safety', 'گزارش دیدگاه‌ها': 'Comment reports',
    'سردبیری و گزینش': 'Editorial curation', 'کتابخانه محتوا': 'Content library',
    'پوسته:': 'Theme:', 'تغییر پوسته': 'Change theme',
    'تیره': 'Dark', 'روشن': 'Light', 'هماهنگ با دستگاه': 'System',
    'گالری هنر مستقل معاصر': 'Contemporary independent art gallery',
    'برای کشف': 'Discover', 'راد آرت': 'Rad Art',
    'راد آرت — گالری هنر مستقل معاصر': 'Rad Art — Contemporary independent art gallery',
    'هنر معاصر، از نگاه مستقل': 'Contemporary art, independent perspectives',
    'هر اثر،': 'Every artwork,', 'آغاز یک نگاه تازه.': 'the beginning of a new perspective.',
    'آثار تأییدشده': 'Approved artworks', 'هنرمندان مستقل': 'Independent artists',
    'درباره راد آرت': 'About Rad Art', 'بخش‌های اصلی فضای کاربری': 'Workspace navigation',
    'ناوبری فضای کاربری': 'Workspace navigation', 'ناوبری موبایل': 'Mobile navigation',
    'پیوندهای تکمیلی سایت': 'More from Rad Art', 'کشف': 'Discover',
    'مشاهده سایت': 'View website', 'خروج از حساب': 'Sign out',
    'خروج': 'Sign out', 'ثبت‌نام': 'Create account', 'ورود': 'Sign in',
    'پیش‌نمایش پروفایل': 'Profile preview', 'پیش‌نمایش': 'Preview',
    'حساب کاربری': 'Account', 'حساب من': 'My account', 'داشبورد': 'Dashboard',
    'تنظیمات': 'Settings', 'پروفایل': 'Profile', 'محتوا': 'Content',
    'پیام‌ها': 'Messages', 'کاربران': 'Users', 'آثار': 'Artworks',
    'دیدگاه‌ها': 'Comments', 'ایمنی': 'Safety', 'سردبیری': 'Editorial',
    'درباره ما': 'About', 'راهنما': 'Help', 'هنرمندان': 'Artists',
    'مجموعه‌ها': 'Collections', 'گالری': 'Gallery', 'خانه': 'Home',
};
const fa = Object.fromEntries(Object.keys(english).map((key) => [key, key]));

function readLocale() {
    if (typeof window === 'undefined') return 'fa';
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        return LOCALES.includes(stored) ? stored : 'fa';
    } catch {
        return 'fa';
    }
}

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
    const [locale, setLocaleState] = useState(readLocale);
    const setLocale = useCallback((nextLocale) => {
        if (LOCALES.includes(nextLocale)) setLocaleState(nextLocale);
    }, []);
    const t = useCallback((value) => locale === 'en' ? (english[value] ?? value) : (fa[value] ?? value), [locale]);

    useEffect(() => {
        const root = document.documentElement;
        root.lang = locale;
        root.dir = locale === 'fa' ? 'rtl' : 'ltr';
        try {
            window.localStorage.setItem(STORAGE_KEY, locale);
        } catch {
            // The selected locale remains active for this session.
        }
    }, [locale]);

    useEffect(() => {
        const syncLocale = (event) => {
            if (event.key === STORAGE_KEY && LOCALES.includes(event.newValue)) setLocaleState(event.newValue);
        };
        window.addEventListener('storage', syncLocale);
        return () => window.removeEventListener('storage', syncLocale);
    }, []);

    const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);
    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage must be used inside LanguageProvider');
    return context;
}
