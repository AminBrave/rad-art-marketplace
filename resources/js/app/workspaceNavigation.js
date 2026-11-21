export function getWorkspacePrimaryLinks(role) {
    const links = {
        artist: [
            { to: '/dashboard/artist', label: 'نمای کلی', end: true },
            { to: '/dashboard/artist/profile', label: 'پروفایل هنرمند' },
            { to: '/dashboard/artist/artworks', label: 'مدیریت آثار' },
            { to: '/dashboard/artist/content', label: 'کتابخانه محتوا' },
            { to: '/dashboard/artist/messages', label: 'پیام‌های مستقیم' },
        ],
        buyer: [
            { to: '/dashboard/buyer', label: 'نمای کلی', end: true },
            { to: '/dashboard/buyer/messages', label: 'پیام‌های مستقیم' },
        ],
        admin: [
            { to: '/admin', label: 'نمای کلی', end: true },
            { to: '/admin/users', label: 'مدیریت کاربران' },
            { to: '/admin/artworks', label: 'بررسی آثار' },
            { to: '/admin/contents', label: 'بررسی کتابخانه محتوا' },
            { to: '/admin/message-reports', label: 'گزارش پیام‌ها' },
            { to: '/admin/editorial', label: 'مجموعه‌ها و سردبیری' },
        ],
    };

    return links[role] ?? [];
}
