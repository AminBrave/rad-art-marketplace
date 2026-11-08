const highlights = [
    { number: '01', title: 'هنر اصیل', description: 'آثار منتخب هنرمندان مستقل را کشف کنید.' },
    { number: '02', title: 'هنرمندان واقعی', description: 'با خالق هر اثر و مسیر هنری او آشنا شوید.' },
    { number: '03', title: 'ارتباط مستقیم', description: 'برای پرسش درباره آثار، مستقیم با هنرمند در تماس باشید.' },
];

export default function App() {
    return (
        <main className="min-h-screen overflow-hidden bg-[#f7f5f0] text-[#20201e]">
            <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
                <a href="/" className="text-2xl font-black tracking-tight" aria-label="راد آرت، صفحه اصلی">
                    راد<span className="text-[#b65c3a]">آرت</span>
                </a>
                <nav aria-label="ناوبری اصلی" className="hidden items-center gap-8 text-sm text-stone-600 md:flex">
                    <a className="transition hover:text-[#b65c3a]" href="#discover">کشف آثار</a>
                    <a className="transition hover:text-[#b65c3a]" href="#artists">هنرمندان</a>
                    <a className="transition hover:text-[#b65c3a]" href="#about">درباره ما</a>
                </nav>
                <a href="#artists" className="rounded-full border border-stone-300 px-5 py-2.5 text-sm font-semibold transition hover:border-[#b65c3a] hover:text-[#b65c3a]">
                    معرفی هنرمند
                </a>
            </header>

            <section className="mx-auto grid max-w-7xl gap-12 px-6 pb-24 pt-12 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-10 lg:pb-32 lg:pt-20">
                <div className="max-w-2xl">
                    <p className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#eae3d8] px-4 py-2 text-xs font-semibold text-[#80513d]">
                        <span className="h-2 w-2 rounded-full bg-[#b65c3a]" />
                        جهان هنر، نزدیک‌تر از همیشه
                    </p>
                    <h1 className="text-5xl font-black leading-[1.35] tracking-tight sm:text-6xl lg:text-7xl">
                        هر اثر، روایت یک <span className="text-[#b65c3a]">جهان</span> است.
                    </h1>
                    <p className="mt-7 max-w-xl text-base leading-9 text-stone-600 sm:text-lg">
                        راد آرت فضایی برای کشف آثار هنری مستقل، شناخت هنرمندان و ارتباط مستقیم با خالقان هر اثر است.
                    </p>
                    <div className="mt-9 flex flex-wrap gap-3">
                        <a href="#discover" className="rounded-full bg-[#20201e] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#b65c3a]">
                            به تماشای آثار
                        </a>
                        <a href="#artists" className="rounded-full border border-stone-300 px-7 py-3.5 text-sm font-bold transition hover:border-[#20201e]">
                            برای هنرمندان
                        </a>
                    </div>
                </div>

                <div className="relative mx-auto w-full max-w-xl" aria-label="ترکیب انتزاعی الهام‌گرفته از هنر معاصر">
                    <div className="absolute -right-5 -top-5 h-32 w-32 rounded-full border border-[#c9a58f]" />
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[48%_48%_12px_12px] bg-[#d9c6b2] p-6 sm:p-10">
                        <div className="absolute inset-6 rounded-[48%_48%_8px_8px] border border-white/50" />
                        <div className="absolute left-[12%] top-[15%] h-[54%] w-[54%] rounded-full bg-[#b65c3a]" />
                        <div className="absolute bottom-[12%] right-[9%] h-[58%] w-[48%] rounded-t-full bg-[#333d35]" />
                        <div className="absolute bottom-[19%] left-[18%] h-[34%] w-[38%] rotate-[-22deg] rounded-[48%_48%_8px_8px] bg-[#e9dfcf]" />
                        <div className="absolute right-[17%] top-[13%] h-20 w-20 rounded-full border-[14px] border-[#f2e8d9]" />
                        <div className="absolute bottom-7 left-8 text-xs font-semibold tracking-[0.3em] text-[#4b4038]">ART / PEOPLE / STORIES</div>
                    </div>
                    <div className="absolute -bottom-5 -left-4 rounded-2xl bg-white px-5 py-4 shadow-xl shadow-stone-900/10">
                        <p className="text-xs text-stone-500">نگاهی تازه به هنر معاصر</p>
                        <p className="mt-1 text-sm font-bold">از نگاه هنرمندان مستقل</p>
                    </div>
                </div>
            </section>

            <section id="discover" className="border-y border-stone-200 bg-white/70">
                <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 md:grid-cols-3 lg:px-10">
                    {highlights.map((item) => (
                        <article key={item.number} className="border-r-2 border-[#d7b5a2] pr-5">
                            <span className="text-xs font-bold tracking-widest text-[#b65c3a]">{item.number}</span>
                            <h2 className="mt-4 text-xl font-extrabold">{item.title}</h2>
                            <p className="mt-3 leading-8 text-stone-600">{item.description}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section id="artists" className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-20 lg:px-10">
                <p className="text-sm font-bold text-[#b65c3a]">برای جامعه هنری</p>
                <h2 className="max-w-2xl text-3xl font-black leading-relaxed sm:text-4xl">هنرمند هستید؟ جای شما در راد آرت خالی است.</h2>
                <p className="max-w-2xl leading-8 text-stone-600">به‌زودی می‌توانید پروفایل هنری خود را بسازید، آثار خود را برای بررسی ارسال کنید و با مخاطبانتان ارتباط بگیرید.</p>
            </section>

            <footer id="about" className="bg-[#20201e] px-6 py-8 text-center text-sm text-stone-300">
                <p>© {new Date().getFullYear()} راد آرت — بستری برای دیدن و دیده‌شدن هنر</p>
            </footer>
        </main>
    );
}
