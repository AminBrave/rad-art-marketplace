import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

const roleLabels = { artist: 'هنرمند', buyer: 'خریدار', admin: 'مدیر' };

export function PublicLayout() {
    const { user, logout } = useAuth();
    const [logoutError, setLogoutError] = useState('');

    const handleLogout = async () => {
        setLogoutError('');
        try {
            await logout();
        } catch {
            setLogoutError('خروج انجام نشد. اتصال را بررسی کنید.');
        }
    };

    return (
        <div className="min-h-screen bg-[#f7f5f0] text-[#20201e]" dir="rtl">
            <header className="border-b border-stone-200 bg-[#f7f5f0]">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-10">
                    <Link to="/" className="shrink-0 text-2xl font-black tracking-tight text-[#20201e] no-underline" aria-label="راد آرت، صفحه اصلی">
                        راد<span className="text-[#b65c3a]">آرت</span>
                    </Link>
                    <nav aria-label="ناوبری اصلی" className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-stone-600">
                        <NavLink to="/artworks" className={({ isActive }) => isActive ? 'font-bold text-[#9a452b]' : 'hover:text-[#9a452b]'}>کشف آثار</NavLink>
                        <NavLink to="/artists" className={({ isActive }) => isActive ? 'font-bold text-[#9a452b]' : 'hover:text-[#9a452b]'}>هنرمندان</NavLink>
                        <NavLink to="/about" className={({ isActive }) => isActive ? 'font-bold text-[#9a452b]' : 'hover:text-[#9a452b]'}>درباره ما</NavLink>
                    </nav>
                    <div className="flex items-center gap-3 text-sm">
                        {user ? (
                            <>
                                <span className="hidden font-semibold sm:inline">{user.name}</span>
                                <span className="rounded-full bg-[#eae3d8] px-3 py-2 text-xs font-bold text-[#80513d]">{roleLabels[user.role] ?? user.role}</span>
                                <Link to={user.role === 'admin' ? '/admin' : user.role === 'buyer' ? '/dashboard/buyer' : '/dashboard/artist'} className="font-semibold text-[#9a452b] underline">فضای کاربری</Link>
                                <button type="button" onClick={handleLogout} className="rounded-full border border-stone-300 px-4 py-2 font-semibold hover:border-[#b65c3a]">خروج</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="font-semibold hover:text-[#9a452b]">ورود</Link>
                                <Link to="/register" className="rounded-full bg-[#20201e] px-4 py-2.5 font-semibold text-white hover:bg-[#b65c3a]">ثبت‌نام</Link>
                            </>
                        )}
                    </div>
                </div>
                {logoutError && <p role="alert" className="mx-auto max-w-7xl px-5 pb-3 text-xs text-red-700 sm:px-8">{logoutError}</p>}
            </header>
            <Outlet />
        </div>
    );
}

export function WorkspaceLayout({ title, links, outletContext }) {
    const { user, logout } = useAuth();
    const [logoutError, setLogoutError] = useState('');

    const handleLogout = async () => {
        setLogoutError('');
        try {
            await logout();
        } catch {
            setLogoutError('خروج انجام نشد. اتصال را بررسی کنید.');
        }
    };

    return (
        <div className="min-h-screen bg-[#f7f5f0] text-[#20201e]" dir="rtl">
            <header className="border-b border-stone-200 bg-white">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-10">
                    <div>
                        <Link to="/" className="text-lg font-black text-[#20201e] no-underline">راد<span className="text-[#b65c3a]">آرت</span></Link>
                        <p className="mt-1 text-xs text-stone-500">{title}</p>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <span className="font-semibold">{user?.name}</span>
                        <Link to="/" className="rounded-full border border-stone-300 px-4 py-2 font-semibold hover:border-[#b65c3a]">مشاهده سایت</Link>
                        <button type="button" onClick={handleLogout} className="rounded-full border border-stone-300 px-4 py-2 font-semibold hover:border-[#b65c3a]">خروج</button>
                    </div>
                </div>
                {logoutError && <p role="alert" className="mx-auto max-w-7xl px-5 pb-3 text-xs text-red-700 sm:px-8">{logoutError}</p>}
            </header>
            <div className="mx-auto grid max-w-7xl gap-6 px-5 py-7 sm:px-8 lg:grid-cols-[220px_1fr] lg:px-10">
                <aside className="h-fit rounded-2xl border border-stone-200 bg-white p-3">
                    <nav aria-label="ناوبری فضای کاربری" className="flex flex-wrap gap-2 lg:flex-col">
                        {links.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.end}
                                className={({ isActive }) => isActive
                                    ? 'rounded-xl bg-[#20201e] px-4 py-3 text-sm font-bold text-white'
                                    : 'rounded-xl px-4 py-3 text-sm font-semibold text-stone-600 hover:bg-[#f0ede6] hover:text-[#20201e]'}
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                </aside>
                <main className="min-w-0">
                    <Outlet context={outletContext} />
                </main>
            </div>
        </div>
    );
}
