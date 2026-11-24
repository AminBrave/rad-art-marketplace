const workspaceLinks = {
    artist: [
        { to: '/dashboard/artist', label: 'نمای کلی', end: true, shortLabel: 'داشبورد', mobilePrimary: true },
        { to: '/dashboard/artist/artworks', label: 'کتابخانه محتوا', shortLabel: 'محتوا', mobilePrimary: true },
        { to: '/dashboard/artist/messages', label: 'پیام‌ها', shortLabel: 'پیام‌ها', mobilePrimary: true },
        { to: '/dashboard/artist/profile', label: 'پروفایل هنرمند', shortLabel: 'پروفایل', mobilePrimary: true },
        { to: '/dashboard/artist/settings', label: 'تنظیمات', shortLabel: 'تنظیمات', mobilePrimary: true },
    ],
    buyer: [
        { to: '/dashboard/buyer', label: 'نمای کلی', end: true, shortLabel: 'داشبورد', mobilePrimary: true },
        { to: '/dashboard/buyer/messages', label: 'پیام‌ها', shortLabel: 'پیام‌ها', mobilePrimary: true },
        { to: '/dashboard/buyer/settings', label: 'تنظیمات', shortLabel: 'تنظیمات', mobilePrimary: true },
    ],
    admin: [
        { to: '/admin', label: 'نمای کلی', end: true, shortLabel: 'داشبورد', mobilePrimary: true },
        { to: '/admin/artworks', label: 'بازبینی آثار', shortLabel: 'آثار', mobilePrimary: true },
        { to: '/admin/editorial', label: 'سردبیری و گزینش', shortLabel: 'سردبیری', mobilePrimary: true },
        { to: '/admin/users', label: 'مدیریت کاربران', shortLabel: 'کاربران', mobilePrimary: true },
        { to: '/admin/message-reports', label: 'ایمنی پیام‌ها', shortLabel: 'ایمنی', mobilePrimary: false },
        { to: '/admin/artwork-comment-reports', label: 'گزارش دیدگاه‌ها', shortLabel: 'دیدگاه‌ها', mobilePrimary: false },
        { to: '/admin/settings', label: 'تنظیمات', shortLabel: 'تنظیمات', mobilePrimary: true },
    ],
};

export function getWorkspacePrimaryLinks(role) {
    return workspaceLinks[role] ?? [];
}

export function getWorkspaceMobileLinks(role) {
    return getWorkspacePrimaryLinks(role).filter((item) => item.mobilePrimary !== false);
}
