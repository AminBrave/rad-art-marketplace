import { useState } from 'react';
import ThemeSwitcher from '../design-system/ThemeSwitcher';
import {
    Alert,
    AlertDescription,
    AlertTitle,
    ArtistCard,
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    Input,
    Separator,
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
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
                <div className="flex items-center gap-3"><ThemeSwitcher /><Badge variant="success">RTL ready</Badge></div>
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
                <div className="grid gap-5 border-b border-border pb-8 lg:grid-cols-2">
                    <div className="grid content-start gap-4">
                        <h3 className="font-semibold">ساختار کارت New York</h3>
                        <Card>
                            <CardHeader>
                                <CardAction><Badge variant="secondary">نمونه</Badge></CardAction>
                                <CardTitle>جزئیات اثر هنری</CardTitle>
                                <CardDescription>کارت ترکیبی با بخش‌های مستقل و قابل جایگزینی.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm leading-7 text-muted-foreground">اجزای کارت از یک API ترکیبی استفاده می‌کنند تا ساختار محتوا، عنوان و اقدامات از هم جدا بمانند.</p>
                            </CardContent>
                            <CardFooter className="justify-between">
                                <span className="text-xs text-muted-foreground">به‌روزرسانی امروز</span>
                                <Button size="sm">مشاهده جزئیات</Button>
                            </CardFooter>
                        </Card>
                        <Alert>
                            <AlertTitle>وضعیت ثبت</AlertTitle>
                            <AlertDescription>این اثر برای بررسی اولیه آماده است.</AlertDescription>
                        </Alert>
                        <Alert variant="destructive">
                            <AlertTitle>نیازمند اصلاح</AlertTitle>
                            <AlertDescription>یک فیلد ضروری هنوز تکمیل نشده است.</AlertDescription>
                        </Alert>
                    </div>
                    <div className="grid content-start gap-4">
                        <h3 className="font-semibold">Field و ورودی‌های New York</h3>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="ny-title">عنوان اثر</FieldLabel>
                                <Input id="ny-title" placeholder="عنوان اثر هنری" />
                                <FieldDescription>عنوانی روشن و قابل جست‌وجو انتخاب کنید.</FieldDescription>
                            </Field>
                            <Field data-invalid="true">
                                <FieldLabel htmlFor="ny-email">ایمیل تماس</FieldLabel>
                                <Input id="ny-email" type="email" aria-invalid="true" placeholder="name@example.com" dir="ltr" />
                                <FieldError>قالب نشانی ایمیل معتبر نیست.</FieldError>
                            </Field>
                        </FieldGroup>
                        <Separator />
                        <p className="text-xs text-muted-foreground">کنترل‌ها از توکن‌های semantic استفاده می‌کنند و وضعیت خطا با aria-invalid قابل تشخیص است.</p>
                    </div>
                </div>

                <div className="grid gap-4 border-b border-border pb-8">
                    <div>
                        <h3 className="font-semibold">جدول داده و واکنش‌گرایی</h3>
                        <p className="mt-1 text-sm text-muted-foreground">جدول پایه برای ترکیب با مرتب‌سازی، فیلتر و صفحه‌بندی متناسب با هر دامنه.</p>
                    </div>
                    <Table>
                        <TableCaption>فهرست نمونه آثار در انتظار بررسی</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>اثر</TableHead>
                                <TableHead>هنرمند</TableHead>
                                <TableHead>وضعیت</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow><TableCell className="font-medium">روایت رنگ و سکوت</TableCell><TableCell>هنرمند نمونه</TableCell><TableCell><Badge variant="warning">در انتظار</Badge></TableCell></TableRow>
                            <TableRow><TableCell className="font-medium">باغ بی‌صدا</TableCell><TableCell>هنرمند دوم</TableCell><TableCell><Badge variant="success">تأییدشده</Badge></TableCell></TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>
        </section>
    );
}
