import { Link } from 'react-router-dom';

export function BuyerDashboardHome() {
    return (
        <section className="space-y-7" dir="rtl">
            <header className="relative overflow-hidden bg-ink px-6 py-8 text-white sm:px-9 sm:py-10">
                <div aria-hidden="true" className="pointer-events-none absolute -left-12 -top-20 h-64 w-64 rounded-full border border-white/10" />
                <div aria-hidden="true" className="pointer-events-none absolute -left-2 -top-10 h-44 w-44 rounded-full border border-white/10" />
                <div className="relative max-w-2xl">
                    <p className="text-xs font-bold tracking-wide text-sand">فضای اختصاصی خریدار</p>
                    <h1 className="mt-3 text-2xl font-black leading-relaxed sm:text-3xl">هنر مورد علاقه‌تان را کشف کنید و گفت‌وگو را ادامه دهید.</h1>
                    <p className="mt-3 max-w-xl text-sm leading-8 text-white/70">از میان آثار و هنرمندان مستقل جست‌وجو کنید و گفت‌وگوهای مستقیم خود را با هنرمندان در یک فضای منظم دنبال کنید.</p>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <Link to="/artworks" className="inline-flex min-h-11 items-center bg-white px-5 py-3 text-sm font-bold text-ink transition-colors hover:bg-sand">کشف آثار هنری <span aria-hidden="true" className="mr-3">←</span></Link>
                        <Link to="/artists" className="inline-flex min-h-11 items-center border border-white/30 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10">آشنایی با هنرمندان</Link>
                    </div>
                </div>
            </header>

            <section className="border border-border bg-paper p-5 sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-bold text-terracotta-strong">ارتباط‌های شما</p>
                        <h2 className="mt-2 text-xl font-black">پیام‌های مستقیم</h2>
                        <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">گفت‌وگوها، پاسخ‌ها و پیوست‌های خود را از یک صندوق پیام پیگیری کنید. برای شروع گفت‌وگو، از صفحه یک اثر یا پروفایل هنرمند اقدام کنید.</p>
                    </div>
                    <span aria-hidden="true" className="grid h-12 w-12 shrink-0 place-items-center bg-surface-muted text-xl text-terracotta-strong">✉</span>
                </div>
                <Link to="/dashboard/buyer/messages" className="mt-6 inline-flex min-h-11 items-center bg-ink px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-terracotta">ورود به صندوق پیام <span aria-hidden="true" className="mr-3">←</span></Link>
            </section>

            <section className="border-t border-border pt-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div><p className="text-xs font-bold text-terracotta-strong">شروع یک تجربه تازه</p><h2 className="mt-2 text-xl font-black">از کجا شروع کنید؟</h2></div>
                    <Link to="/artworks" className="text-sm font-bold text-terracotta-strong underline underline-offset-4">رفتن به گالری</Link>
                </div>
                <ol className="mt-5 grid gap-4 md:grid-cols-3">
                    <li className="border-r-2 border-sand bg-surface-muted p-4"><span className="text-xs font-bold text-terracotta-strong">۰۱ / کشف</span><h3 className="mt-2 font-bold">آثار و سبک‌ها را ببینید</h3><p className="mt-2 text-sm leading-7 text-muted">در گالری جست‌وجو کنید و جزئیات هر اثر را بخوانید.</p></li>
                    <li className="border-r-2 border-sand bg-surface-muted p-4"><span className="text-xs font-bold text-terracotta-strong">۰۲ / ارتباط</span><h3 className="mt-2 font-bold">به هنرمند پیام بدهید</h3><p className="mt-2 text-sm leading-7 text-muted">از صفحه اثر یا پروفایل عمومی هنرمند، گفت‌وگوی مستقیم را آغاز کنید.</p></li>
                    <li className="border-r-2 border-sand bg-surface-muted p-4"><span className="text-xs font-bold text-terracotta-strong">۰۳ / ادامه</span><h3 className="mt-2 font-bold">گفت‌وگو را پیگیری کنید</h3><p className="mt-2 text-sm leading-7 text-muted">پاسخ‌ها و پیوست‌های جدید را در صندوق پیام‌ها دنبال کنید.</p></li>
                </ol>
            </section>
        </section>
    );
}
