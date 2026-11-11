import ComponentShowcase from './ComponentShowcase';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Separator } from '../components/ui';
import { ThemeToggle } from '../components/theme-toggle';

const swatches = [
    { name: 'Ivory', value: '#F7F5F0', token: 'background' },
    { name: 'Charcoal', value: '#242320', token: 'foreground' },
    { name: 'Terracotta', value: '#B65C3A', token: 'primary' },
    { name: 'Sand', value: '#D8C9B7', token: 'secondary' },
    { name: 'Olive', value: '#536052', token: 'accent' },
    { name: 'White', value: '#FFFFFF', token: 'card' },
];

export default function DesignFoundation() {
    return (
        <main dir="rtl" className="min-h-screen bg-background text-foreground">
            <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
                <header className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <a href="/" className="text-xl font-semibold text-foreground no-underline">راد<span className="text-primary">آرت</span></a>
                        <p className="mt-1 text-sm text-muted-foreground">پایه رابط کاربری shadcn/ui</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge variant="secondary">shadcn/ui + Radix</Badge>
                        <ThemeToggle />
                    </div>
                </header>

                <section className="grid gap-6 border-b border-border pb-10 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
                    <div className="space-y-4">
                        <p className="text-sm font-medium text-primary">سامانه طراحی</p>
                        <h1 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">یک رابط استاندارد؛ با رنگ‌های راد.</h1>
                        <p className="max-w-2xl text-base text-muted-foreground">ساختار، اندازه‌ها، فاصله‌ها، تایپوگرافی، شعاع گوشه‌ها و رفتار اجزا از shadcn/ui پیروی می‌کنند. راد فقط مقادیر رنگی light و dark را به توکن‌های معنایی متصل می‌کند.</p>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>مالکیت بصری</CardTitle>
                            <CardDescription>مرز مسئولیت‌ها در این پروژه</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <p><span className="font-medium">shadcn/ui:</span> کامپوننت‌ها، چیدمان، اندازه، تایپوگرافی و حالت‌ها</p>
                            <p><span className="font-medium">Radix UI:</span> تعامل‌های دسترس‌پذیر و مدیریت فوکوس</p>
                            <p><span className="font-medium">RAD:</span> فقط رنگ‌های معنایی در دو حالت روشن و تیره</p>
                        </CardContent>
                    </Card>
                </section>

                <section aria-labelledby="palette-title" className="space-y-5">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                        <div><p className="text-xs font-medium text-muted-foreground">01 / COLOR TOKENS</p><h2 id="palette-title" className="mt-1 text-2xl font-semibold">پالت معنایی راد</h2></div>
                        <p className="text-sm text-muted-foreground">توکن‌ها در dark mode به مقادیر متناسب تغییر می‌کنند.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                        {swatches.map((color) => (
                            <Card key={color.token} className="overflow-hidden">
                                <div className="h-20 border-b border-border" style={{ backgroundColor: color.value }} />
                                <CardContent className="space-y-1 p-3">
                                    <p className="text-sm font-medium" dir="ltr">{color.name}</p>
                                    <p className="text-xs text-muted-foreground" dir="ltr">{color.value}</p>
                                    <p className="text-xs text-muted-foreground" dir="ltr">--{color.token}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                <Separator />

                <section aria-labelledby="controls-title" className="space-y-5">
                    <div><p className="text-xs font-medium text-muted-foreground">02 / COMPONENTS</p><h2 id="controls-title" className="mt-1 text-2xl font-semibold">اجزای پایه</h2></div>
                    <Card>
                        <CardHeader><CardTitle>کنترل‌های فرم</CardTitle><CardDescription>نمونه‌های استاندارد shadcn با رنگ‌بندی معنایی RAD</CardDescription></CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2"><label htmlFor="foundation-email" className="text-sm font-medium">نشانی ایمیل</label><Input id="foundation-email" type="email" placeholder="name@example.com" dir="ltr" /></div>
                            <div className="flex flex-wrap items-end gap-2"><Button>اقدام اصلی</Button><Button variant="secondary">ثانویه</Button><Button variant="outline">خطی</Button><Button variant="ghost">ساده</Button></div>
                        </CardContent>
                    </Card>
                </section>

                <Separator />
                <ComponentShowcase />
                <footer className="border-t border-border pt-6 text-sm text-muted-foreground">RAD · shadcn/ui foundation</footer>
            </div>
        </main>
    );
}
