import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

const roleLabels = { artist: 'هنرمند', buyer: 'خریدار', admin: 'مدیر' };

export function PublicLayout() {
    const { user, logout } = useAuth();
    const [logoutError, setLogoutError] = useState('');
    const handleLogout = async () => {
        setLogoutError('');
        try { await logout(); } catch { setLogoutError('خروج انجام نشد. اتصال را بررسی کنید.'); }
    };

    return <div className="min-h-screen bg-canvas text-ink" dir="rtl">
        <header className="border-b border-border bg-canvas">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-10">
                <Link to="/" className="shrink-0 text-2xl font-black tracking-tight text-ink no-underline" aria-label="راد آرت، صفحه اصلی">راد<span className="text-terracotta-strong">آرت</span></Link>
                <nav aria-label="ناوبری اصلی" className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
                    <NavLink to="/artworks" className={({isActive})=>isActive?'font-bold text-terracotta-strong':'hover:text-terracotta-strong'}>کشف آثار</NavLink>
                    <NavLink to="/artists" className={({isActive})=>isActive?'font-bold text-terracotta-strong':'hover:text-terracotta-strong'}>هنرمندان</NavLink>
                    <NavLink to="/collections" className={({isActive})=>isActive?'font-bold text-terracotta-strong':'hover:text-terracotta-strong'}>مجموعه‌های منتخب</NavLink>
                    <NavLink to="/about" className={({isActive})=>isActive?'font-bold text-terracotta-strong':'hover:text-terracotta-strong'}>درباره ما</NavLink>
                    <NavLink to="/help" className={({isActive})=>isActive?'font-bold text-terracotta-strong':'hover:text-terracotta-strong'}>راهنما</NavLink>
                </nav>
                <div className="flex items-center gap-3 text-sm">
                    {user ? <><span className="hidden font-semibold sm:inline">{user.name}</span><span className="bg-surface-muted px-3 py-2 text-xs font-bold text-terracotta-strong">{roleLabels[user.role] ?? user.role}</span><Link to={user.role==='admin'?'/admin':user.role==='buyer'?'/dashboard/buyer':'/dashboard/artist'} className="font-semibold text-terracotta-strong underline">فضای کاربری</Link><button type="button" onClick={handleLogout} className="border border-border px-4 py-2 font-semibold hover:border-terracotta">خروج</button></> : <><Link to="/login" className="font-semibold hover:text-terracotta-strong">ورود</Link><Link to="/register" className="bg-ink px-4 py-2.5 font-semibold text-white hover:bg-terracotta">ثبت‌نام</Link></>}
                </div>
            </div>
            {logoutError && <p role="alert" className="mx-auto max-w-7xl px-5 pb-3 text-xs text-red-700 sm:px-8">{logoutError}</p>}
        </header>
        <Outlet />
        <footer className="border-t border-border bg-surface-muted">
            <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:grid-cols-2 sm:px-8 lg:grid-cols-[1.3fr_1fr_1fr] lg:px-10">
                <div><Link to="/" className="text-xl font-black text-ink">راد<span className="text-terracotta-strong">آرت</span></Link><p className="mt-3 max-w-sm text-sm leading-7 text-muted">فضایی برای کشف آثار هنری مستقل، شناخت هنرمندان و ارتباط درباره هنر.</p></div>
                <div><h2 className="text-sm font-bold">کشف</h2><div className="mt-3 flex flex-col items-start gap-3 text-sm text-muted"><Link to="/artworks">گالری آثار</Link><Link to="/artists">هنرمندان</Link><Link to="/collections">مجموعه‌های منتخب</Link></div></div>
                <div><h2 className="text-sm font-bold">راد آرت</h2><div className="mt-3 flex flex-col items-start gap-3 text-sm text-muted"><Link to="/about">درباره ما</Link><Link to="/help">راهنما</Link><Link to="/contact">تماس با ما</Link></div></div>
            </div>
            <div className="border-t border-border py-4 text-center text-xs text-muted">راد آرت — گالری هنر مستقل معاصر</div>
        </footer>
    </div>;
}

export function WorkspaceLayout({ title, links, outletContext }) {
    const { user, logout } = useAuth();
    const [logoutError, setLogoutError] = useState('');
    const handleLogout = async () => { setLogoutError(''); try { await logout(); } catch { setLogoutError('خروج انجام نشد. اتصال را بررسی کنید.'); } };
    return <div className="min-h-screen bg-canvas text-ink" dir="rtl">
        <header className="border-b border-border bg-white"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-10"><div><Link to="/" className="text-lg font-black text-ink no-underline">راد<span className="text-terracotta-strong">آرت</span></Link><p className="mt-1 text-xs text-muted">{title}</p></div><div className="flex items-center gap-3 text-sm"><span className="font-semibold">{user?.name}</span><Link to="/" className="border border-border px-4 py-2 font-semibold hover:border-terracotta">مشاهده سایت</Link><button type="button" onClick={handleLogout} className="border border-border px-4 py-2 font-semibold hover:border-terracotta">خروج</button></div></div>{logoutError&&<p role="alert" className="mx-auto max-w-7xl px-5 pb-3 text-xs text-red-700 sm:px-8">{logoutError}</p>}</header>
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-7 sm:px-8 lg:grid-cols-[220px_1fr] lg:px-10"><aside className="h-fit border border-border bg-white p-3"><nav aria-label="ناوبری فضای کاربری" className="flex flex-wrap gap-2 lg:flex-col">{links.map(item=><NavLink key={item.to} to={item.to} end={item.end} className={({isActive})=>isActive?'bg-ink px-4 py-3 text-sm font-bold text-white':'px-4 py-3 text-sm font-semibold text-muted hover:bg-surface-muted hover:text-ink'}>{item.label}</NavLink>)}</nav></aside><main className="min-w-0"><Outlet context={outletContext} /></main></div>
    </div>;
}
