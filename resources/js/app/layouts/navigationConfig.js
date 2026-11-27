import {
    BookOpen, Bookmark, CircleHelp, ClipboardCheck, Compass, Flag, House,
    Images, Info, LogIn, LogOut, MessageCircle, PlusCircle,
    Settings as SettingsIcon, UserPlus, UserRound, Users,
} from 'lucide-react';

export const publicDiscoveryLinks = [
    { to: '/', label: 'خانه', Icon: House, end: true },
    { to: '/artworks', label: 'کشف', Icon: Compass, end: true },
    { to: '/artists', label: 'هنرمندان', Icon: Users, end: true },
    { to: '/collections', label: 'مجموعه‌ها', Icon: Bookmark, end: true },
];

export const publicInfoLinks = [
    { to: '/about', label: 'درباره ما', Icon: Info, end: true },
    { to: '/help', label: 'راهنما', Icon: CircleHelp, end: true },
    { to: '/contact', label: 'تماس', Icon: MessageCircle, end: true },
];

export function getPublicWorkspaceLinks(user, profileHref, t) {
    if (!user) return [
        { to: '/login', label: t('ورود'), Icon: LogIn, end: true },
        { to: '/register', label: t('ساخت حساب کاربری'), Icon: UserPlus, end: true },
    ];

    const roleLinks = user.role === 'artist' ? [
        { to: '/dashboard/artist', label: t('داشبورد'), Icon: House, end: true },
        { to: profileHref, label: t(profileHref.startsWith('/artists/') ? 'پیش‌نمایش پروفایل' : 'تکمیل پروفایل'), Icon: UserRound, end: true },
        { to: '/dashboard/artist/artworks', label: t('محتوا'), Icon: Images, end: true },
        { to: '/dashboard/artist/artworks/new', label: t('ثبت اثر'), Icon: PlusCircle, end: true },
        { to: '/dashboard/artist/messages', label: t('پیام‌ها'), Icon: MessageCircle, end: true },
        { to: '/dashboard/artist/settings', label: t('تنظیمات'), Icon: SettingsIcon, end: true },
    ] : user.role === 'buyer' ? [
        { to: '/dashboard/buyer', label: t('داشبورد'), Icon: House, end: true },
        { to: '/dashboard/buyer/messages', label: t('پیام‌ها'), Icon: MessageCircle, end: true },
        { to: '/dashboard/buyer/settings', label: t('تنظیمات'), Icon: SettingsIcon, end: true },
    ] : user.role === 'admin' ? [
        { to: '/admin', label: t('داشبورد'), Icon: House, end: true },
        { to: '/admin/users', label: t('کاربران'), Icon: Users, end: true },
        { to: '/admin/artworks', label: t('آثار'), Icon: ClipboardCheck, end: true },
        { to: '/admin/message-reports', label: t('ایمنی'), Icon: Flag, end: true },
        { to: '/admin/artwork-comment-reports', label: t('دیدگاه‌ها'), Icon: Flag, end: true },
        { to: '/admin/editorial', label: t('سردبیری'), Icon: BookOpen, end: true },
        { to: '/admin/settings', label: t('تنظیمات'), Icon: SettingsIcon, end: true },
    ] : [];

    return [...roleLinks, { action: 'logout', label: t('خروج از حساب'), Icon: LogOut }];
}

export const workspaceNavigationIcons = {
    '/dashboard/artist': House,
    '/dashboard/artist/profile': UserRound,
    '/dashboard/artist/artworks': Images,
    '/dashboard/artist/artworks/new': PlusCircle,
    '/dashboard/artist/messages': MessageCircle,
    '/dashboard/artist/settings': SettingsIcon,
    '/dashboard/buyer': House,
    '/dashboard/buyer/messages': MessageCircle,
    '/dashboard/buyer/settings': SettingsIcon,
    '/admin': House,
    '/admin/users': Users,
    '/admin/artworks': ClipboardCheck,
    '/admin/message-reports': Flag,
    '/admin/artwork-comment-reports': Flag,
    '/admin/editorial': BookOpen,
    '/admin/settings': SettingsIcon,
};

export const workspaceNavigationLabels = {
    '/dashboard/artist': 'داشبورد',
    '/dashboard/artist/profile': 'پروفایل',
    '/dashboard/artist/artworks': 'محتوا',
    '/dashboard/artist/artworks/new': 'ثبت اثر',
    '/dashboard/artist/messages': 'پیام‌ها',
    '/dashboard/artist/settings': 'تنظیمات',
    '/dashboard/buyer': 'داشبورد',
    '/dashboard/buyer/messages': 'پیام‌ها',
    '/dashboard/buyer/settings': 'تنظیمات',
    '/admin': 'داشبورد',
    '/admin/users': 'کاربران',
    '/admin/artworks': 'آثار',
    '/admin/message-reports': 'ایمنی',
    '/admin/artwork-comment-reports': 'دیدگاه‌ها',
    '/admin/editorial': 'سردبیری',
    '/admin/settings': 'تنظیمات',
};
