export const api = '/api/v1/admin';
export const statuses = [
    { value: 'pending_review', label: 'در انتظار بررسی' },
    { value: 'approved', label: 'تأییدشده' },
    { value: 'changes_requested', label: 'نیازمند اصلاح' },
    { value: 'rejected', label: 'ردشده' },
];
export const statusLabels = Object.fromEntries(statuses.map((item) => [item.value, item.label]));
export const roleLabels = { buyer: 'خریدار', artist: 'هنرمند', admin: 'مدیر' };
export const dateLabel = (value, locale = 'fa') => {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString(locale === 'fa' ? 'fa-IR' : 'en-US', { dateStyle: 'medium' });
};
