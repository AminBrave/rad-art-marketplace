export function getWorkspacePrimaryLinks(role) {
    const links = {
        artist: [
            { to: '/dashboard/artist', label: 'نمای کلی', end: true, shortLabel: 'خانه' },
            { to: '/dashboard/artist/artworks', label: 'کتابخانه محتوا', shortLabel: 'محتوا' },
            { to: '/dashboard/artist/profile', label: 'پروفایل هنرمند', shortLabel: 'پروفایل' },
            { to: '/dashboard/artist/messages', label: 'درخواست‌ها', shortLabel: 'درخواست‌ها' },
        ],
        buyer: [
            { to: '/dashboard/buyer', label: 'نمای کلی', end: true, shortLabel: 'خانه' },
            { to: '/dashboard/buyer/messages', label: 'درخواست‌ها', shortLabel: 'درخواست‌ها' },
        ],
        admin: [
            { to: '/admin', label: 'نمای کلی', end: true, shortLabel: 'خانه' },
            { to: '/admin/artworks', label: 'بازبینی آثار', shortLabel: 'آثار' },
            { to: '/admin/artwork-comment-reports', label: 'گزارش دیدگاه‌ها', shortLabel: 'دیدگاه‌ها' },
            { to: '/admin/editorial', label: 'سردبیری و گزینش', shortLabel: 'سردبیری' },
            { to: '/admin/message-reports', label: 'ایمنی پیام‌ها', shortLabel: 'ایمنی' },
            { to: '/admin/users', label: 'مدیریت کاربران', shortLabel: 'کاربران' },
        ],
    };

    return links[role] ?? [];
}
