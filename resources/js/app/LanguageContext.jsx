import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'rademan-locale';
const LOCALES = ['fa', 'en'];

const english = {
    "خانه": "Home",
    "داشبورد": "Dashboard",
    "نمای کلی": "Overview",
    "گالری": "Gallery",
    "گالری آثار": "Artwork gallery",
    "کشف آثار": "Explore art",
    "هنرمندان": "Artists",
    "مجموعه‌ها": "Collections",
    "مجموعه‌های منتخب": "Featured collections",
    "درباره ما": "About",
    "راهنما": "Help",
    "تماس": "Contact",
    "پیش‌نمایش": "Preview",
    "پیش‌نمایش پروفایل": "Profile preview",
    "پروفایل": "Profile",
    "حساب من": "My account",
    "حساب کاربری": "Account",
    "مدیریت": "Admin",
    "ورود": "Sign in",
    "ثبت‌نام": "Create account",
    "عضویت": "Join",
    "خروج": "Sign out",
    "خروج از حساب": "Sign out",
    "محتوا": "Content",
    "کتابخانه محتوا": "Content library",
    "آثار": "Artworks",
    "پیام‌ها": "Messages",
    "تنظیمات": "Settings",
    "کاربران": "Users",
    "ایمنی": "Safety",
    "دیدگاه‌ها": "Comments",
    "سردبیری": "Editorial",
    "سردبیری و گزینش": "Editorial curation",
    "بازبینی آثار": "Artwork review",
    "تکمیل پروفایل": "Complete profile",
    "تکمیل": "Complete",
    "ناوبری اصلی": "Main navigation",
    "بخش‌های مختلف راد آرت": "Explore Rad Art",
    "ناوبری موبایل": "Mobile navigation",
    "ناوبری بخش‌های عمومی": "Explore",
    "بخش‌های اصلی حساب کاربری": "Your workspace",
    "بخش‌های اصلی فضای کاربری": "Workspace navigation",
    "پیوندهای تکمیلی سایت": "More from Rad Art",
    "کشف": "Discover",
    "فضای کاری": "Workspace",
    "فضای کاربری": "Workspace",
    "مشاهده سایت": "View website",
    "هنر معاصر، از نگاه مستقل": "Contemporary art, independent perspectives",
    "گالری هنر مستقل معاصر": "Contemporary independent art gallery",
    "هر اثر،": "Every artwork,",
    "آغاز یک نگاه تازه.": "the beginning of a new perspective.",
    "ورود به گالری آثار": "Explore the gallery",
    "آشنایی با هنرمندان": "Meet the artists",
    "نمایش عمومی به آثار تأییدشده و پروفایل‌های عمومی محدود است.": "Public pages feature approved artworks and public artist profiles.",
    "تازه در گالری": "New in the gallery",
    "هنرمند راد آرت": "Rad Art artist",
    "مشاهده اثر": "View artwork",
    "در گالری راد آرت": "Featured on Rad Art",
    "انتخاب زبان": "Language",
    "فارسی": "فارسی",
    "English": "English",
    "زبان": "Language",
    "تغییر زبان": "Change language",
    "فضایی برای کشف آثار هنری مستقل، شناخت هنرمندان و ارتباط درباره هنر.": "A place to discover independent art, meet artists, and connect through art.",
    "برای کشف": "Discover",
    "راد آرت": "Rad Art",
    "گشت‌وگذار در گالری": "Explore the gallery",
    "همه مجموعه‌ها": "All collections",
    "خواندن همه": "Mark all as read",
    "اعلان‌ها": "Notifications",
    "هنوز اعلانی ندارید": "No notifications yet",
    "فعالیت‌های تازه در این بخش نمایش داده می‌شوند.": "Recent activity will appear here.",
    "جدیدتر": "Newer",
    "قدیمی‌تر": "Older",
    "جدید": "New",
    "صفحه‌بندی اعلان‌ها": "Notification pages",
    "تیره": "Dark",
    "روشن": "Light",
    "هماهنگ با دستگاه": "System",
    "پوسته:": "Theme:",
    "تغییر پوسته؛ حالت فعلی:": "Change theme; current mode:",
    "تغییر پوسته": "Change theme",
    "هنرمند": "Artist",
    "هنرمند منتخب": "Featured artist",
    "خریدار": "Buyer",
    "مدیر": "Administrator",
    "رفتن به محتوای اصلی": "Skip to main content",
    "باز کردن منوی اصلی": "Open main menu",
    "بستن منو": "Close menu",
    "بستن اعلان‌ها": "Close notifications",
    "خروج انجام نشد. اتصال را بررسی کنید.": "Sign out failed. Check your connection.",
    "دریافت اعلان‌ها انجام نشد.": "Could not load notifications.",
    "بازکردن اعلان انجام نشد. دوباره تلاش کنید.": "Could not open notification. Please try again.",
    "به‌روزرسانی اعلان‌ها انجام نشد.": "Could not update notifications.",
    "خبرهای تازه درباره پیام‌ها، آثار و هنرمندان": "Updates about messages, artworks, and artists",
    "تماس با ما": "Contact us",
    "دسته‌بندی فعالی برای نمایش وجود ندارد.": "No active categories to display.",
    "دریافت محتوای گالری ممکن نشد": "Could not load gallery content",
    "برای دریافت دوباره تلاش کنید.": "Please try again.",
    "هنوز اثر دیگری برای نمایش نیست": "No other artworks to show yet",
    "آثار تازه پس از تأیید در این بخش قرار می‌گیرند.": "New artworks appear here after approval.",
    "از کجا شروع کنیم؟": "Where should we start?",
    "دسته‌بندی‌های فعال گالری را مرور کنید و به جهان هر شاخه هنری وارد شوید.": "Browse active gallery categories and explore each artistic discipline.",
    "دیدن همه آثار": "View all artworks",
    "دیدن همه هنرمندان": "View all artists",
    "آثاری که به‌تازگی برای نمایش عمومی تأیید شده‌اند.": "Recently approved artworks, now available to explore.",
    "هنرمندان، فراتر از آثار": "Artists beyond their work",
    "با هنرمندانی آشنا شوید که پروفایل عمومی خود را در راد آرت منتشر کرده‌اند.": "Meet artists who have published a public profile on Rad Art.",
    "هنرمندان دارای پروفایل عمومی در این بخش معرفی می‌شوند.": "Artists with public profiles will appear here.",
    "چطور در راد آرت کشف کنیم": "How to discover on Rad Art",
    "در میان آثار تأییدشده جست‌وجو کنید و مسیرهای تازه‌ای برای دیدن پیدا کنید.": "Explore approved artworks and discover new perspectives.",
    "با هنرمندان مستقل، نگاه شخصی و جهان تصویری آن‌ها آشنا شوید.": "Meet independent artists and discover their visual worlds.",
    "برای گفت‌وگو درباره یک اثر یا هنرمند، مسیر ارتباط را آغاز کنید.": "Start a conversation about an artwork or an artist.",
    "شناخت": "Meet",
    "ارتباط": "Connect",
    "راد آرت جایی برای مکث، کشف آثار هنری مستقل، شناخت هنرمندان و شکل‌گرفتن گفت‌وگوهایی تازه درباره هنر است.": "Rad Art is a place to pause, discover independent art, meet artists, and start new conversations about art.",
    "ورود به پورتفولیو": "View portfolio",
    "پورتفولیوی عمومی این هنرمند را ببینید و با آثار تأییدشده او آشنا شوید.": "Explore this artist’s public portfolio and approved artworks.",
    "مجموعه‌ها و هنرمندان منتخب": "Featured collections and artists",
    "روایت‌هایی از نگاه سردبیر": "Stories selected by the editor",
    "مجموعه‌هایی برای دیدن آثار در کنار یکدیگر و کشف ارتباط‌های تازه.": "Curated collections that reveal new connections between artworks.",
    "اثر منتخب": "selected artworks",
    "صداهای منتخب": "Selected voices",
    "با پورتفولیوی این هنرمند آشنا شوید.": "Explore this artist’s portfolio.",
    "شروع به‌عنوان هنرمند": "Join as an artist",
    "جهان هنری خود را با دیگران به اشتراک بگذارید.": "Share your artistic world with others.",
    "هنرمندان می‌توانند حساب بسازند، پروفایل خود را تکمیل کنند و آثارشان را برای بررسی ارسال کنند.": "Artists can create an account, complete their profile, and submit artworks for review.",
    "اثر": "artwork",
    "باز کردن منوی حساب کاربری": "Open account menu",
    "ساخت حساب کاربری": "Create an account",
    "پاسخ": "Reply",
    "RAD ART / WORKSPACE": "RAD ART / WORKSPACE",
    "اعلان‌ها،": "Notifications,",
    "خوانده‌نشده": "unread",
    "پروفایل هنرمند": "Artist profile",
    "مدیریت کاربران": "User management",
    "ایمنی پیام‌ها": "Message safety",
    "گزارش دیدگاه‌ها": "Comment reports",
    "راد آرت — گالری هنر مستقل معاصر": "Rad Art — Contemporary independent art gallery",
    "آثار تأییدشده": "Approved artworks",
    "هنرمندان مستقل": "Independent artists",
    "درباره راد آرت": "About Rad Art",
    "ناوبری فضای کاربری": "Workspace navigation",
    "در حال بررسی حساب کاربری…": "Checking your account…",
    "وضعیت حساب دریافت نشد. صفحه را دوباره بارگذاری کنید.": "Could not retrieve account status. Reload the page.",
    "بازگشت به راد آرت": "Back to Rad Art",
    "ورود به حساب": "Sign in to your account",
    "نوع حساب": "Account type",
    "نام و نام خانوادگی": "Full name",
    "ایمیل": "Email",
    "گذرواژه": "Password",
    "تکرار گذرواژه": "Confirm password",
    "لطفاً صبر کنید…": "Please wait…",
    "ایجاد حساب": "Create account",
    "ثبت‌نام عمومی فقط برای خریدار و هنرمند فعال است. حساب مدیر باید از سمت سرور ایجاد شود.": "Public registration is available for buyers and artists only. Administrator accounts must be created by the server.",
    "لطفاً اطلاعات ورود را بررسی کنید.": "Please check your sign-in details.",
    "تعداد تلاش‌ها زیاد است. کمی بعد دوباره امتحان کنید.": "Too many attempts. Please try again later.",
    "ورود یا ثبت‌نام انجام نشد. اتصال را بررسی و دوباره تلاش کنید.": "Sign-in or registration failed. Check your connection and try again.",
    "مسیر صفحه": "Breadcrumb",
    "جامعه خلاق راد آرت": "The Rad Art creative community",
    "هنرمند را کشف کنید.": "Discover an artist.",
    "با هنرمندان مستقل آشنا شوید؛ از نگاه و مسیر هنری آن‌ها بخوانید و مجموعه آثار تأییدشده‌شان را ببینید.": "Meet independent artists, explore their perspectives and creative journeys, and view their approved portfolios.",
    "جست‌وجوی هنرمند": "Search artists",
    "نام هنرمند یا شهر…": "Artist name or city…",
    "جامعه هنرمندان": "Artist community",
    "نتایج جست‌وجو": "Search results",
    "چهره‌های خلاق": "Creative voices",
    "در حال دریافت هنرمندان…": "Loading artists…",
    "به‌روزرسانی…": "Updating…",
    "دریافت فهرست هنرمندان ممکن نشد": "Could not load artists",
    "لطفاً دوباره تلاش کنید.": "Please try again.",
    "هنرمندی پیدا نشد": "No artists found",
    "نام یا شهر دیگری را جست‌وجو کنید.": "Try another name or city.",
    "صفحه‌بندی هنرمندان": "Artist pagination",
    "قبلی": "Previous",
    "بعدی": "Next",
    "صفحه": "Page",
    "آرشیو عمومی راد آرت": "Rad Art public archive",
    "در میان آثار تأییدشده هنرمندان جست‌وجو کنید؛ بر اساس دسته، تکنیک و وضعیت اثر مسیر کشف خود را دقیق‌تر کنید.": "Explore approved artworks and refine your search by category, medium, and availability.",
    "فیلتر و مرتب‌سازی آثار": "Filter and sort artworks",
    "جست‌وجوی هدفمند": "Focused search",
    "آثاری را پیدا کنید که با نگاه شما هم‌مسیرند": "Find artworks that match your perspective",
    "معیار انتخاب‌شده": "selected criteria",
    "همه آثار عمومی": "All public artworks",
    "جست‌وجو در آثار و هنرمندان": "Search artworks and artists",
    "عنوان، توضیحات، تکنیک یا نام هنرمند…": "Title, description, medium, or artist…",
    "فیلتر دسته‌بندی": "Filter by category",
    "همه دسته‌ها": "All categories",
    "فیلتر تکنیک و مواد": "Filter by medium",
    "همه تکنیک‌ها": "All media",
    "فیلتر وضعیت اثر": "Filter by availability",
    "همه وضعیت‌ها": "All statuses",
    "مرتب‌سازی آثار": "Sort artworks",
    "جدیدترین": "Newest",
    "فیلتر فعال": "active filters",
    "بدون فیلتر": "No filters",
    "پاک‌کردن فیلترها": "Clear filters",
    "برخی گزینه‌های فیلتر بارگذاری نشدند؛ می‌توانید با جست‌وجو و دسته‌بندی ادامه دهید.": "Some filter options could not be loaded. You can still search and browse by category.",
    "در حال آماده‌سازی گزینه‌های فیلتر…": "Preparing filter options…",
    "معیارهای فعال": "Active filters",
    "انتخاب شما:": "Your selection:",
    "آرشیو آثار": "Artwork archive",
    "در حال دریافت آثار…": "Loading artworks…",
    "نمایش آثار عمومی و تأییدشده": "Showing public and approved artworks",
    "دریافت گالری با خطا روبه‌رو شد": "Could not load the gallery",
    "اتصال را بررسی کنید و دوباره تلاش کنید.": "Check your connection and try again.",
    "اثری با این مشخصات پیدا نشد": "No artworks match these filters",
    "عبارت جست‌وجو یا گزینه‌های فیلتر را تغییر دهید.": "Change your search or filter options.",
    "دریافت آثار بیشتر انجام نشد.": "Could not load more artworks.",
    "بارگذاری آثار بیشتر": "Load more artworks",
    "همه آثار نمایش داده شدند.": "All artworks are displayed."
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
