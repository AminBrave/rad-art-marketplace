import { Link } from 'react-router-dom';
import { WorkspaceHero, SectionHeader, Surface } from '../components/ui';

export function BuyerDashboardHome() {
    return (
        <section className="space-y-7" dir="rtl">
            <WorkspaceHero
                eyebrow="فضای اختصاصی خریدار"
                title="هنر مورد علاقه‌تان را کشف کنید و گفت‌وگو را ادامه دهید."
                description="از میان آثار و هنرمندان مستقل جست‌وجو کنید و گفت‌وگوهای مستقیم خود را با هنرمندان در یک فضای منظم دنبال کنید."
                actions={<>
                    <Link to="/artworks" style={{ color: "var(--color-ink)" }} className="inline-flex min-h-11 items-center justify-center rounded-md border border-transparent bg-terracotta px-4 py-2 text-sm font-bold text-inverse no-underline transition-colors hover:bg-terracotta-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">کشف آثار هنری</Link>
                    <Link to="/artists" className="inline-flex min-h-11 items-center justify-center rounded-md border border-border-strong bg-paper px-4 py-2 text-sm font-semibold text-ink no-underline transition-colors hover:border-terracotta hover:text-terracotta-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">آشنایی با هنرمندان</Link>
                </>}
            />

            <Surface className="p-5 sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <SectionHeader eyebrow="ارتباط‌های شما" title="پیام‌های مستقیم" description="گفت‌وگوها، پاسخ‌ها و پیوست‌های خود را از یک صندوق پیام پیگیری کنید. برای شروع گفت‌وگو، از صفحه یک اثر یا پروفایل هنرمند اقدام کنید." className="border-0 pb-0" />
                    </div>
                    <span aria-hidden="true" className="grid h-12 w-12 shrink-0 place-items-center bg-surface-muted text-xl text-terracotta-strong">✉</span>
                </div>
                <Link to="/dashboard/buyer/messages" className="mt-6 inline-flex min-h-11 items-center bg-ink px-5 py-3 text-sm font-bold text-inverse transition-colors hover:bg-terracotta">ورود به صندوق پیام <span aria-hidden="true" className="mr-3">←</span></Link>
            </Surface>

            <section className="border-t border-border pt-6">
                <SectionHeader eyebrow="شروع یک تجربه تازه" title="از کجا شروع کنید؟" actions={<Link to="/artworks" className="text-sm font-bold text-terracotta-strong underline underline-offset-4">رفتن به گالری</Link>} />
                <ol className="mt-5 grid gap-4 md:grid-cols-3">
                    <li className="border-r-2 border-sand bg-surface-muted p-4"><span className="text-xs font-bold text-terracotta-strong">۰۱ / کشف</span><h3 className="mt-2 font-bold">آثار و سبک‌ها را ببینید</h3><p className="mt-2 text-sm leading-7 text-muted">در گالری جست‌وجو کنید و جزئیات هر اثر را بخوانید.</p></li>
                    <li className="border-r-2 border-sand bg-surface-muted p-4"><span className="text-xs font-bold text-terracotta-strong">۰۲ / ارتباط</span><h3 className="mt-2 font-bold">به هنرمند پیام بدهید</h3><p className="mt-2 text-sm leading-7 text-muted">از صفحه اثر یا پروفایل عمومی هنرمند، گفت‌وگوی مستقیم را آغاز کنید.</p></li>
                    <li className="border-r-2 border-sand bg-surface-muted p-4"><span className="text-xs font-bold text-terracotta-strong">۰۳ / ادامه</span><h3 className="mt-2 font-bold">گفت‌وگو را پیگیری کنید</h3><p className="mt-2 text-sm leading-7 text-muted">پاسخ‌ها و پیوست‌های جدید را در صندوق پیام‌ها دنبال کنید.</p></li>
                </ol>
            </section>
        </section>
    );
}
