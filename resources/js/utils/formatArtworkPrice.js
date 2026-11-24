export function formatArtworkPrice(price, locale = 'fa') {
    if (price === null || price === undefined || price === '') {
        return locale === 'en' ? 'Price not provided' : 'قیمت اعلام نشده';
    }

    const formatted = Number(price).toLocaleString(locale === 'en' ? 'en-US' : 'fa-IR');
    return locale === 'en' ? `${formatted} IRR` : `${formatted} ریال`;
}
