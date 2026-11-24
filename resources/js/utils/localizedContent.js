export function localizedValue(record, field, locale = 'fa') {
    if (!record) return '';
    if (locale === 'en') {
        const translated = record[field + '_en'];
        if (typeof translated === 'string' && translated.trim() !== '') return translated;
    }
    return record[field] ?? '';
}

export function formatArtworkPrice(price, locale = 'fa') {
    if (price === null || price === undefined || price === '') {
        return locale === 'en' ? 'Price not provided' : 'قیمت اعلام نشده';
    }

    const formatted = Number(price).toLocaleString(locale === 'en' ? 'en-US' : 'fa-IR');
    return locale === 'en' ? `${formatted} IRR` : `${formatted} ریال`;
}
