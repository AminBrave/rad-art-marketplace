export function formatArtworkPrice(price) {
    if (price === null || price === undefined || price === '') {
        return 'قیمت اعلام نشده';
    }

    return `${Number(price).toLocaleString('fa-IR')} ریال`;
}
