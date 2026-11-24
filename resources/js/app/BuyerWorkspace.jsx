import { Link } from 'react-router-dom';
import { WorkspaceHero, SectionHeader, Container } from '../components/ui';

export function BuyerDashboardHome() {
    return (
        <Container as="section" width="wide" className="space-y-7" dir="rtl">
            <WorkspaceHero
                eyebrow="فضای اختصاصی خریدار"
                title="هنر مورد علاقه‌تان را کشف کنید و گفت‌وگو را ادامه دهید."
                description="از میان آثار و هنرمندان مستقل جست‌وجو کنید و گفت‌وگوهای مستقیم خود را با هنرمندان در یک فضای منظم دنبال کنید."
                actions={<>
                    <Link to="/artworks" className="inline-flex min-h-11 items-center justify-center rounded-md border border-transparent bg-terracotta px-4 py-2 text-sm font-bold text-inverse no-underline transition-colors hover:bg-terracotta-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">کشف آثار هنری</Link>
                    <Link to="/artists" className="inline-flex min-h-11 items-center justify-center rounded-md border border-border-strong bg-paper px-4 py-2 text-sm font-semibold text-ink no-underline transition-colors hover:border-terracotta hover:text-terracotta-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">آشنایی با هنرمندان</Link>
                </>}
            />

            <section aria-labelledby="buyer-messages-heading" className="grid gap-5 border-y border-border py-6 sm:py-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <div className="min-w-0">
                    <p className="text-[11px] font-extrabold tracking-[.14em] text-terracotta-strong">ارتباط‌های شما</p>
                    <h2 id="buyer-messages-heading" className="mt-2 text-xl font-black text-ink">پیام‌های مستقیم</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">گفت‌وگوها، پاسخ‌ها و پیوست‌های خود را از یک صندوق پیام پیگیری کنید. برای شروع گفت‌وگو، از صفحه یک اثر یا پروفایل هنرمند اقدام کنید.</p>
                </div>
                <Link to="/dashboard/buyer/messages" className="inline-flex min-h-12 items-center justify-center gap-3 bg-ink px-5 py-3 text-sm font-bold text-inverse no-underline transition-colors hover:bg-terracotta focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">ورود به صندوق پیام <span aria-hidden="true">←</span></Link>
            </section>

            <section className="border-t border-border pt-6">
                <SectionHeader eyebrow="شروع یک تجربه تازه" title="از کجا شروع کنید؟" actions={<Link to="/artworks" className="text-sm font-bold text-terracotta-strong underline underline-offset-4">رفتن به گالری</Link>} />
                <ol className="mt-6 grid gap-6 md:grid-cols-3 md:gap-7">
                    <li className="border-t-2 border-ink pt-4"><span className="text-xs font-extrabold tracking-[.12em] text-terracotta-strong">۰۱ / کشف</span><h3 className="mt-3 font-bold">آثار و سبک‌ها را ببینید</h3><p className="mt-2 text-sm leading-7 text-muted">در گالری جست‌وجو کنید و جزئیات هر اثر را بخوانید.</p></li>
                    <li className="border-t-2 border-ink pt-4"><span className="text-xs font-extrabold tracking-[.12em] text-terracotta-strong">۰۲ / ارتباط</span><h3 className="mt-3 font-bold">به هنرمند پیام بدهید</h3><p className="mt-2 text-sm leading-7 text-muted">از صفحه اثر یا پروفایل عمومی هنرمند، گفت‌وگوی مستقیم را آغاز کنید.</p></li>
                    <li className="border-t-2 border-ink pt-4"><span className="text-xs font-extrabold tracking-[.12em] text-terracotta-strong">۰۳ / ادامه</span><h3 className="mt-3 font-bold">گفت‌وگو را پیگیری کنید</h3><p className="mt-2 text-sm leading-7 text-muted">پاسخ‌ها و پیوست‌های جدید را در صندوق پیام‌ها دنبال کنید.</p></li>
                </ol>
            </section>
        </Container>
    );
}
