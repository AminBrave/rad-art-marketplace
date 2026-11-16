import { useState } from 'react';
import {
    ArtistCard,
    ArtworkCard,
    Badge,
    Breadcrumbs,
    Button,
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogTrigger,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    EmptyState,
    ErrorState,
    FormField,
    IconButton,
    Pagination,
    SearchField,
    SelectField,
    Skeleton,
    SkeletonLines,
    SuccessState,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    TextInput,
    TextareaField,
    Toast,
    UploadFeedback,
    WorkspaceHero,
    DashboardMetricCard,
} from '../components/ui';

const sampleArtwork = {
    slug: 'sample-work',
    title: 'روایت رنگ و سکوت',
    image_url: '',
    category: { name: 'نقاشی' },
    artist: { display_name: 'هنرمند نمونه' },
    price: null,
};

const sampleArtist = {
    slug: 'sample-artist',
    display_name: 'هنرمند نمونه',
    city: 'تهران',
    bio: 'روایت‌گر تجربه‌های روزمره با زبان رنگ و فرم',
};

export default function ComponentShowcase() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(2);
    const [toastOpen, setToastOpen] = useState(true);

    return (
        <section id="shared-components" aria-labelledby="shared-components-title" className="border-t border-border py-12">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-xs font-bold text-terracotta-strong">05 / COMPONENT LIBRARY</p>
                    <h2 id="shared-components-title" className="mt-2 text-2xl font-bold">کتابخانه اجزای رابط</h2>
                    <p className="mt-2 text-sm leading-7 text-muted">نمونه‌های تعاملی اجزای مشترک؛ همه اجزا با چیدمان راست‌به‌چپ سازگارند.</p>
                </div>
                <Badge variant="success">RTL ready</Badge>
            </div>

            <div className="mb-8 grid gap-5 lg:grid-cols-2">
                <div className="grid content-start gap-3">
                    <h3 className="font-bold">الگوی معرفی فضای کاربری</h3>
                    <WorkspaceHero
                        eyebrow="استودیوی هنرمند"
                        title="همه چیز برای مدیریت حرفه‌ای"
                        description="الگوی مشترک معرفی فضاهای هنرمند، خریدار و مدیر؛ با سلسله‌مراتب و رنگ‌های یکسان."
                        actions={<Button variant="secondary" size="sm">اقدام نمونه</Button>}
                    />
                </div>
                <div className="grid content-start gap-3">
                    <h3 className="font-bold">کارت شاخص عملیاتی</h3>
                    <DashboardMetricCard label="آثار منتشرشده" value="۱۲۴" detail="تعداد آثار تأییدشده و قابل مشاهده در گالری" eyebrow="پورتفولیو" />
                </div>
            </div>

            <div className="grid gap-8">
                <div className="grid gap-5 border-b border-border pb-8 lg:grid-cols-2">
                    <div className="grid content-start gap-4">
                        <h3 className="font-bold">دکمه‌ها و نشان‌ها</h3>
                        <div className="flex flex-wrap items-center gap-2">
                            <Button>اقدام اصلی</Button>
                            <Button variant="secondary">ثانویه</Button>
                            <Button variant="outline">خطی</Button>
                            <Button variant="ghost">ساده</Button>
                            <Button variant="danger">حذف</Button>
                            <Button loading>در حال ذخیره</Button>
                            <Button disabled>غیرفعال</Button>
                            <IconButton label="گزینه‌های بیشتر"><span aria-hidden="true">⋯</span></IconButton>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Badge>پیش‌فرض</Badge>
                            <Badge variant="success">تأییدشده</Badge>
                            <Badge variant="warning">در انتظار</Badge>
                            <Badge variant="danger">ردشده</Badge>
                            <Badge variant="info">اطلاع‌رسانی</Badge>
                            <Badge variant="accent">ویژه</Badge>
                        </div>
                    </div>
                    <div className="grid content-start gap-4">
                        <h3 className="font-bold">فیلدهای فرم</h3>
                        <FormField label="عنوان اثر" hint="عنوانی کوتاه و روشن بنویسید." required>
                            <TextInput placeholder="عنوان اثر هنری" />
                        </FormField>
                        <FormField label="توضیحات" error="این فیلد برای نمونه دارای خطاست.">
                            <TextareaField defaultValue="شرح کوتاه اثر…" />
                        </FormField>
                        <FormField label="دسته‌بندی">
                            <SelectField defaultValue="painting">
                                <option value="painting">نقاشی</option>
                                <option value="photo">عکاسی</option>
                            </SelectField>
                        </FormField>
                        <SearchField
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            onSearch={() => setToastOpen(true)}
                            placeholder="جست‌وجوی نمونه…"
                        />
                    </div>
                </div>

                <div className="grid gap-5 border-b border-border pb-8 lg:grid-cols-2">
                    <div className="grid content-start gap-4">
                        <h3 className="font-bold">منو و پنجره محاوره‌ای</h3>
                        <div className="flex flex-wrap items-center gap-3">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">باز کردن منو</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuLabel>اقدامات نمونه</DropdownMenuLabel>
                                    <DropdownMenuItem onSelect={() => setToastOpen(true)}>نمایش اعلان</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem disabled>گزینه غیرفعال</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                <DialogTrigger asChild><Button>باز کردن دیالوگ</Button></DialogTrigger>
                                <DialogContent>
                                    <DialogTitle>تأیید عملیات</DialogTitle>
                                    <DialogDescription>این یک نمونه دیالوگ با مدیریت فوکوس و بستن با کلید Escape است.</DialogDescription>
                                    <div className="mt-6 flex flex-wrap gap-2">
                                        <DialogClose asChild><Button variant="outline">بستن</Button></DialogClose>
                                        <Button onClick={() => setDialogOpen(false)}>متوجه شدم</Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <h3 className="mt-3 font-bold">مسیر راهبری</h3>
                        <Breadcrumbs items={[{ label: 'خانه', to: '/' }, { label: 'مدیریت آثار', to: '/dashboard/artist/artworks' }, { label: 'ویرایش اثر' }]} />
                    </div>
                    <div className="grid content-start gap-4">
                        <h3 className="font-bold">تب‌ها</h3>
                        <Tabs defaultValue="overview" dir="rtl">
                            <TabsList aria-label="تب‌های نمونه">
                                <TabsTrigger value="overview">نمای کلی</TabsTrigger>
                                <TabsTrigger value="details">جزئیات</TabsTrigger>
                                <TabsTrigger value="history">تاریخچه</TabsTrigger>
                            </TabsList>
                            <TabsContent value="overview"><p className="text-sm leading-7 text-muted">محتوای هر تب با کلیدهای جهت‌دار قابل پیمایش است.</p></TabsContent>
                            <TabsContent value="details"><p className="text-sm leading-7 text-muted">جزئیات نمونه برای بررسی حالت فعال تب.</p></TabsContent>
                            <TabsContent value="history"><p className="text-sm leading-7 text-muted">تاریخچه نمونه.</p></TabsContent>
                        </Tabs>
                        <h3 className="mt-3 font-bold">صفحه‌بندی</h3>
                        <Pagination currentPage={page} lastPage={6} onPageChange={setPage} />
                    </div>
                </div>

                <section aria-labelledby="rad-semantic-catalogue" className="grid min-w-0 gap-5 border-b border-border pb-8">
                    <div>
                        <h3 id="rad-semantic-catalogue" className="font-bold">بنیان‌های ساختاری و معنایی RAD</h3>
                        <p className="mt-1 text-sm leading-7 text-muted">اجزای معنایی و چیدمان، با توکن‌های RAD و بدون بارگذاری پوسته یا سبک پیش‌فرض Radix Themes.</p>
                    </div>
                    <Flex align="center" wrap gap={3} className="min-w-0">
                        <Avatar alt="هنرمند نمونه" fallback="ه" size="lg" />
                        <div className="min-w-0">
                            <Heading as="h4" size="sm">هنرمند نمونه</Heading>
                            <Text size="xs" color="muted">نمایش آواتار و تایپوگرافی</Text>
                        </div>
                        <Kbd>Ctrl</Kbd>
                        <Code>npm install</Code>
                        <VisuallyHidden>متن کمکی برای فناوری‌های کمکی</VisuallyHidden>
                    </Flex>
                    <Container width="full" className="rounded-lg border border-border bg-surface p-4">
                        <Flex align="center" justify="between" wrap gap={2}>
                            <Heading as="h4" size="sm">ساختار داده</Heading>
                            <Text size="xs" color="muted">نمونه ساختار واکنش‌گرا</Text>
                        </Flex>
                        <Separator className="my-3" />
                        <DataList>
                            <DataListItem label="وضعیت" value="منتشرشده" />
                            <DataListItem label="دسته‌بندی" value="نقاشی معاصر" />
                        </DataList>
                    </Container>
                    <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                        <Card>
                            <Inset>
                                <Heading as="h4" size="sm">کارت معنایی</Heading>
                                <Text size="sm" color="muted">سطح و فاصله‌گذاری از توکن‌های طراحی RAD پیروی می‌کنند.</Text>
                            </Inset>
                        </Card>
                        <Callout title="راهنمای دسترس‌پذیری" variant="info">
                            ساختار HTML معنایی در کنار اجزای تعاملی Radix استفاده می‌شود.
                        </Callout>
                    </div>
                    <Blockquote>کمتر تزئین، بیشتر توجه به اثر.</Blockquote>
                    <div className="grid gap-2">
                        <Text size="sm" color="muted">پیشرفت نمونه</Text>
                        <Progress value={68} label="پیشرفت نمونه" />
                        <Flex align="center" gap={2}>
                            <Spinner label="در حال آماده‌سازی نمونه" />
                            <Text size="xs" color="muted">نمونه حالت بارگذاری</Text>
                        </Flex>
                        <AspectRatio ratio={16 / 9} className="rounded-md border border-dashed border-border bg-surface-muted" />
                    </div>
                </section>

                <div className="grid gap-5 border-b border-border pb-8 md:grid-cols-2 lg:grid-cols-3">
                    <div className="grid content-start gap-3">
                        <h3 className="font-bold">کارت اثر</h3>
                        <ArtworkCard artwork={sampleArtwork} />
                    </div>
                    <div className="grid content-start gap-3">
                        <h3 className="font-bold">کارت هنرمند</h3>
                        <ArtistCard artist={sampleArtist} />
                    </div>
                    <div className="grid content-start gap-3">
                        <h3 className="font-bold">حالت‌های بازخورد</h3>
                        <Skeleton height="5rem" />
                        <SkeletonLines lines={2} />
                        <SuccessState title="ذخیره شد" description="تغییرات با موفقیت ثبت شدند." />
                        <ErrorState title="خطا در دریافت اطلاعات" description="برای تلاش مجدد از دکمه استفاده کنید." onRetry={() => setToastOpen(true)} />
                        <EmptyState title="موردی پیدا نشد" description="هنوز محتوایی برای نمایش وجود ندارد." />
                    </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                    <div className="grid content-start gap-3">
                        <h3 className="font-bold">بازخورد بارگذاری فایل</h3>
                        <UploadFeedback fileName="artwork-preview.webp" status="uploading" progress={64} message="لطفاً تا پایان بارگذاری صفحه را نبندید." />
                        <UploadFeedback fileName="artwork-final.webp" status="success" message="فایل آماده ثبت اثر است." />
                    </div>
                    <div className="grid content-start gap-3">
                        <h3 className="font-bold">اعلان کوتاه</h3>
                        <Toast open={toastOpen} title="نمونه اعلان" description="اعلان قابل بستن با ناحیه زنده دسترس‌پذیر." onDismiss={() => setToastOpen(false)} />
                        {!toastOpen && <Button variant="outline" size="sm" onClick={() => setToastOpen(true)}>نمایش دوباره اعلان</Button>}
                    </div>
                </div>
            </div>
        </section>
    );
}
