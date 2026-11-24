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
