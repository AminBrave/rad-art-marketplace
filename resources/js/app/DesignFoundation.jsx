import ComponentShowcase from './ComponentShowcase';

const swatches = [
    { name: 'Ivory', value: '#F7F5F0', token: 'canvas' },
    { name: 'Charcoal', value: '#242320', token: 'ink' },
    { name: 'Terracotta', value: '#A64F31', token: 'terracotta' },
    { name: 'Sand', value: '#D8C9B7', token: 'sand' },
    { name: 'Olive', value: '#536052', token: 'olive' },
    { name: 'White', value: '#FFFFFF', token: 'paper' },
];

export default function DesignFoundation() {
    return (
        <main dir="rtl" className="min-h-screen bg-canvas px-5 py-12 text-ink sm:px-8 lg:px-12">
            <div className="mx-auto max-w-content">
                <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
                    <a href="/" className="text-xl font-extrabold text-ink no-underline">راد<span className="text-terracotta">آرت</span></a>
                    <span className="text-xs font-semibold tracking-[0.16em] text-muted" dir="ltr">DESIGN SYSTEM / 01</span>
                </header>
                <section className="grid gap-10 py-16 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
                    <div>
                        <p className="mb-4 text-sm font-bold text-terracotta-strong">بنیان‌های بصری راد آرت</p>
                        <h1 className="max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">هنر، با فضای کافی برای دیده‌شدن.</h1>
                        <p className="mt-6 max-w-2xl text-lg leading-loose text-muted">زبان بصری معاصر و تحریریه‌ای؛ آرام، دقیق و متکی بر آثار هنری. این صفحه نمونه‌ای از رنگ، تایپوگرافی، فرم‌ها و سطوح پایه است.</p>
                    </div>
                    <div className="border-s-2 border-sand ps-6">
                        <p className="text-xs font-semibold uppercase tracking-widest text-muted" dir="ltr">EDITORIAL PRINCIPLE</p>
                        <p className="mt-3 text-xl font-semibold leading-relaxed">کمتر تزئین، بیشتر توجه به اثر.</p>
                    </div>
                </section>
                <section aria-labelledby="palette-title" className="border-t border-border py-10">
                    <div className="mb-6 flex items-end justify-between gap-4">
                        <div><p className="text-xs font-bold text-terracotta-strong">01 / COLOR</p><h2 id="palette-title" className="mt-2 text-2xl font-bold">پالت رنگ</h2></div>
                        <p className="text-xs text-muted" dir="ltr">CORE PALETTE</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                        {swatches.map((color) => (
                            <article key={color.token} className="overflow-hidden rounded-card border border-border bg-paper">
                                <div className="h-20 border-b border-border" style={{ backgroundColor: color.value }} />
                                <div className="p-3"><p className="text-sm font-bold" dir="ltr">{color.name}</p><p className="mt-1 text-xs text-muted" dir="ltr">{color.value}</p><p className="mt-1 text-[11px] text-subtle" dir="ltr">--{color.token}</p></div>
                            </article>
                        ))}
                    </div>
                </section>
                <section aria-labelledby="type-title" className="grid gap-8 border-t border-border py-10 lg:grid-cols-2">
                    <div>
                        <p className="text-xs font-bold text-terracotta-strong">02 / TYPOGRAPHY</p><h2 id="type-title" className="mt-2 text-2xl font-bold">تایپوگرافی فارسی</h2>
                        <p className="mt-6 text-4xl font-extrabold leading-tight">روایت هر اثر، یگانه است.</p>
                        <p className="mt-4 max-w-xl leading-loose text-muted">وزیرمتن برای خوانایی فارسی و رابط راست‌به‌چپ؛ وزن‌های متنوع برای ساخت سلسله‌مراتب روشن، بدون شلوغی بصری.</p>
                    </div>
                    <div dir="ltr" className="border-s border-border ps-6">
                        <h3 className="font-latin text-2xl font-bold">Inter — Editorial type</h3>
                        <p className="mt-4 font-latin text-sm leading-7 text-muted">A considered typographic system for Latin names, metadata, numbers, and mixed-language content.</p>
                        <p className="mt-5 font-latin text-xs tracking-widest text-subtle">ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789</p>
                    </div>
                </section>
                <section aria-labelledby="controls-title" className="border-t border-border py-10">
                    <p className="text-xs font-bold text-terracotta-strong">03 / INTERACTION</p><h2 id="controls-title" className="mt-2 text-2xl font-bold">کنترل‌ها و سطوح</h2>
                    <div className="mt-6 grid gap-8 lg:grid-cols-2">
                        <div className="flex flex-wrap items-center gap-3">
                            <button type="button" className="rounded-md bg-terracotta px-5 py-3 text-sm font-bold text-white transition hover:bg-terracotta-strong">دکمه اصلی</button>
                            <button type="button" className="rounded-md border border-border-strong bg-paper px-5 py-3 text-sm font-bold text-ink transition hover:border-terracotta">دکمه ثانویه</button>
                            <a href="#palette-title" className="text-sm font-bold text-terracotta-strong underline">پیوند متنی</a>
                        </div>
                        <form className="rounded-lg border border-border bg-paper p-5 shadow-soft" onSubmit={(event) => event.preventDefault()}>
                            <label htmlFor="foundation-email" className="block text-sm font-semibold">نشانی ایمیل</label>
                            <input id="foundation-email" type="email" placeholder="name@example.com" dir="ltr" className="mt-2 w-full rounded-md border border-border-strong bg-canvas px-4 py-3 text-left text-sm outline-none transition placeholder:text-subtle focus:border-terracotta" />
                            <p className="mt-2 text-xs text-muted">نمونه فیلد ورودی با حالت تمرکز قابل مشاهده.</p>
                        </form>
                    </div>
                </section>
                <section aria-labelledby="surface-title" className="border-t border-border py-10">
                    <p className="text-xs font-bold text-terracotta-strong">04 / SURFACES</p><h2 id="surface-title" className="mt-2 text-2xl font-bold">مرزها و سطوح</h2>
                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                        <div className="border border-border bg-paper p-5"><p className="font-bold">سطح اصلی</p><p className="mt-2 text-sm text-muted">سفید روی زمینه عاجی</p></div>
                        <div className="border border-sand bg-surface-muted p-5"><p className="font-bold">سطح خنثی</p><p className="mt-2 text-sm text-muted">برای گروه‌بندی آرام محتوا</p></div>
                        <div className="border-s border-2 border-olive bg-paper p-5"><p className="font-bold">نشانگر معنایی</p><p className="mt-2 text-sm text-muted">استفاده محدود از زیتونی</p></div>
                    </div>
                </section>
                <ComponentShowcase />
                <footer className="border-t border-border pt-6 text-xs text-muted">Rad Art · Contemporary Art Editorial · MVP 2</footer>
            </div>
        </main>
    );
}
