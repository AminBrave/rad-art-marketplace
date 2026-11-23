import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Button, TextareaField, SelectField } from '../components/ui';

function CommentItem({ comment, user, onReply, onDelete, onReport }) {
    const canDelete = user && comment.is_mine && !comment.is_deleted;

    return (
        <article id={'comment-' + comment.id} className="border-b border-border py-4 last:border-b-0">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-sm font-bold">{comment.user?.name || 'کاربر'}</p>
                    <p className="mt-1 text-xs text-muted">{comment.created_at ? new Date(comment.created_at).toLocaleDateString('fa-IR') : ''}</p>
                </div>
                {canDelete && <Button variant="ghost" type="button" onClick={() => onDelete(comment.id)} className="shrink-0 text-xs text-muted underline hover:text-danger">حذف</Button>}
            </div>
            <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-8">{comment.is_deleted ? 'این دیدگاه حذف شده است.' : comment.body}</p>
            {!comment.is_deleted && user && (
                <div className="mt-2 flex flex-wrap gap-4">
                    {comment.parent_id === null && <Button variant="ghost" type="button" onClick={() => onReply(comment)} className="text-xs font-semibold text-terracotta-strong underline">پاسخ</Button>}
                    {!comment.is_mine && <Button variant="ghost" type="button" onClick={() => onReport(comment)} className="text-xs text-muted underline">گزارش دیدگاه</Button>}
                </div>
            )}
            {comment.replies?.length > 0 && (
                <div className="mt-4 border-r-2 border-border pr-4">
                    {comment.replies.map((reply) => (
                        <div id={'comment-' + reply.id} key={reply.id} className="border-b border-border py-3 last:border-b-0">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-xs font-bold">{reply.user?.name || 'کاربر'}</p>
                                    <p className="mt-1 text-[11px] text-muted">{reply.created_at ? new Date(reply.created_at).toLocaleDateString('fa-IR') : ''}</p>
                                </div>
                                {user && reply.is_mine && !reply.is_deleted && <Button variant="ghost" type="button" onClick={() => onDelete(reply.id)} className="text-xs text-muted underline hover:text-danger">حذف</Button>}
                            </div>
                            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7">{reply.is_deleted ? 'این پاسخ حذف شده است.' : reply.body}</p>
                            {!reply.is_deleted && user && !reply.is_mine && <Button variant="ghost" type="button" onClick={() => onReport(reply)} className="mt-2 text-xs text-muted underline">گزارش پاسخ</Button>}
                        </div>
                    ))}
                </div>
            )}
        </article>
    );
}

export default function ArtworkEngagement({ artwork, slug }) {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [draft, setDraft] = useState('');
    const [replyTo, setReplyTo] = useState(null);
    const [reportTarget, setReportTarget] = useState(null);
    const [reportReason, setReportReason] = useState('spam');
    const [reportMessage, setReportMessage] = useState('');
    const [shareMessage, setShareMessage] = useState('');
    const canInteract = ['buyer', 'artist'].includes(user?.role);
    const { hash, key: locationKey } = useLocation();
    const commentTargetIdFromHash = /^#comment-\d+$/.test(hash) ? hash.slice(9) : '';
    const [commentTargetId, setCommentTargetId] = useState(commentTargetIdFromHash);

    const commentsQuery = useQuery({
        queryKey: ['artwork-comments', slug, page, commentTargetId],
        queryFn: async ({ signal }) => {
            const targetQuery = page === 1 && commentTargetId ? '&comment_id=' + commentTargetId : '';
            const { data } = await axios.get('/api/v1/artworks/' + encodeURIComponent(slug) + '/comments?page=' + page + targetQuery, { signal });
            return data;
        },
        enabled: Boolean(slug),
    });

    useEffect(() => {
        setPage(1);
        setCommentTargetId(commentTargetIdFromHash);
    }, [slug, hash, locationKey, commentTargetIdFromHash]);

    useEffect(() => {
        if (!commentsQuery.isSuccess || !hash.startsWith('#comment-')) return;
        const target = document.getElementById(hash.slice(1));
        target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, [commentsQuery.data, commentsQuery.isSuccess, hash]);

    const refreshArtwork = () => queryClient.invalidateQueries({ queryKey: ['artwork', slug] });
    const refreshComments = () => queryClient.invalidateQueries({ queryKey: ['artwork-comments', slug] });

    const likeMutation = useMutation({
        mutationFn: () => artwork.liked_by_me
            ? axios.delete('/api/v1/artworks/' + encodeURIComponent(slug) + '/likes')
            : axios.post('/api/v1/artworks/' + encodeURIComponent(slug) + '/likes'),
        onSuccess: refreshArtwork,
    });
    const commentMutation = useMutation({
        mutationFn: () => axios.post('/api/v1/artworks/' + encodeURIComponent(slug) + '/comments', {
            body: draft.trim(),
            ...(replyTo ? { parent_id: replyTo.id } : {}),
        }),
        onSuccess: () => {
            setDraft('');
            setReplyTo(null);
            setPage(1);
            refreshComments();
            refreshArtwork();
        },
    });
    const deleteMutation = useMutation({
        mutationFn: (commentId) => axios.delete('/api/v1/artworks/' + encodeURIComponent(slug) + '/comments/' + commentId),
        onSuccess: () => {
            refreshComments();
            refreshArtwork();
        },
    });
    const reportMutation = useMutation({
        mutationFn: () => axios.post('/api/v1/artworks/' + encodeURIComponent(slug) + '/comments/' + reportTarget.id + '/reports', {
            reason: reportReason,
        }),
        onSuccess: () => {
            setReportTarget(null);
            setReportMessage('گزارش شما ثبت شد و برای بررسی ارسال شد.');
        },
    });

    const shareArtwork = async () => {
        const url = window.location.origin + '/artworks/' + encodeURIComponent(slug);
        setShareMessage('');
        try {
            if (typeof window.navigator.share === 'function') {
                await window.navigator.share({ title: artwork.title, url });
                setShareMessage('لینک اثر به اشتراک گذاشته شد.');
                return;
            }
            if (window.navigator.clipboard?.writeText) {
                await window.navigator.clipboard.writeText(url);
                setShareMessage('لینک اثر کپی شد.');
                return;
            }
            setShareMessage('امکان کپی خودکار وجود ندارد. نشانی اثر: ' + url);
        } catch (error) {
            if (error?.name === 'AbortError') return;
            try {
                if (window.navigator.clipboard?.writeText) {
                    await window.navigator.clipboard.writeText(url);
                    setShareMessage('اشتراک‌گذاری مستقیم در دسترس نبود؛ لینک اثر کپی شد.');
                    return;
                }
            } catch {
                // Fall through to the accessible manual-copy message.
            }
            setShareMessage('اشتراک‌گذاری انجام نشد. نشانی اثر: ' + url);
        }
    };

    const comments = commentsQuery.data?.data ?? [];
    const pagination = commentsQuery.data ?? {};
    const currentPage = pagination.current_page ?? page;

    return (
        <section className="mt-12 border-t border-border pt-8" aria-labelledby="artwork-engagement-title">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 id="artwork-engagement-title" className="text-xl font-black">گفت‌وگو درباره اثر</h2>
                    <p className="mt-1 text-xs text-muted">تعامل با اثر هنری و گفت‌وگوی محترمانه با جامعه رادمن</p>
                </div>
                <Button variant="ghost" type="button" onClick={shareArtwork} className="border border-border px-4 py-2 text-sm font-semibold hover:border-terracotta-strong">اشتراک‌گذاری اثر</Button>
            </div>
            {shareMessage && <p role="status" className="mt-3 break-words text-xs text-muted">{shareMessage}</p>}

            <div className="mt-5 flex flex-wrap items-center gap-3">
                {canInteract ? (
                    <Button variant="ghost" type="button" disabled={likeMutation.isPending} onClick={() => likeMutation.mutate()} aria-pressed={Boolean(artwork.liked_by_me)} className="inline-flex items-center gap-2 border border-border px-4 py-2 text-sm font-bold disabled:opacity-60">
                        <span aria-hidden="true">{artwork.liked_by_me ? '♥' : '♡'}</span>
                        {artwork.liked_by_me ? 'پسندیده‌اید' : 'پسندیدن'}
                    </Button>
                ) : (
                    <Link to="/login" state={{ from: { pathname: '/artworks/' + slug } }} className="border border-border px-4 py-2 text-sm font-bold">برای پسندیدن وارد شوید</Link>
                )}
                <span className="text-sm text-muted">{Number(artwork.likes_count || 0).toLocaleString('fa-IR')} پسند</span>
                <span className="text-sm text-muted">{Number(artwork.comments_count || 0).toLocaleString('fa-IR')} دیدگاه</span>
                {likeMutation.isError && <span role="alert" className="text-xs text-danger">ثبت پسند انجام نشد.</span>}
            </div>

            {canInteract ? (
                <form onSubmit={(event) => { event.preventDefault(); if (draft.trim() && !commentMutation.isPending) commentMutation.mutate(); }} className="mt-6">
                    {replyTo && <div className="mb-2 flex items-center justify-between text-xs text-muted"><span>در پاسخ به {replyTo.user?.name || 'کاربر'}</span><Button variant="ghost" type="button" onClick={() => setReplyTo(null)} className="underline">لغو پاسخ</Button></div>}
                    <label htmlFor="artwork-comment-body" className="mb-2 block text-sm font-semibold">{replyTo ? 'پاسخ شما' : 'دیدگاه شما'}</label>
                    <TextareaField id="artwork-comment-body" value={draft} onChange={(event) => setDraft(event.target.value)} rows={3} maxLength={2000} required placeholder="دیدگاه خود را بنویسید..." className="w-full resize-y border border-border bg-surface px-3 py-3 text-sm leading-7 outline-none focus:border-terracotta-strong" />
                    <div className="mt-2 flex items-center justify-between gap-3">
                        <span className="text-xs text-muted">{draft.length.toLocaleString('fa-IR')} / ۲۰۰۰</span>
                        <Button variant="ghost" type="submit" disabled={!draft.trim() || commentMutation.isPending} className="bg-ink px-4 py-2 text-sm font-bold text-inverse disabled:opacity-50">{commentMutation.isPending ? 'در حال ثبت...' : 'ثبت دیدگاه'}</Button>
                    </div>
                    {commentMutation.isError && <p role="alert" className="mt-2 text-xs text-danger">ثبت دیدگاه انجام نشد. متن را بررسی و دوباره تلاش کنید.</p>}
                </form>
            ) : (
                <p className="mt-6 text-sm text-muted"><Link to="/login" state={{ from: { pathname: '/artworks/' + slug } }} className="font-bold text-terracotta-strong underline">وارد شوید</Link> تا دیدگاه بنویسید یا پاسخ دهید.</p>
            )}

            {reportMessage && <p role="status" className="mt-4 text-xs text-muted">{reportMessage}</p>}
            {reportTarget && (
                <form onSubmit={(event) => { event.preventDefault(); setReportMessage(''); reportMutation.mutate(); }} className="mt-4 border border-border p-4">
                    <p className="text-sm font-bold">گزارش دیدگاه</p>
                    <label htmlFor="artwork-report-reason" className="mt-3 block text-xs text-muted">دلیل گزارش</label>
                    <SelectField id="artwork-report-reason" value={reportReason} onChange={(event) => setReportReason(event.target.value)} className="mt-1">
                        <option value="spam">هرزنامه</option>
                        <option value="harassment">آزار یا توهین</option>
                        <option value="copyright">نقض حقوق اثر</option>
                        <option value="other">سایر</option>
                    </SelectField>
                    <div className="mt-3 flex gap-3">
                        <Button variant="ghost" type="submit" disabled={reportMutation.isPending} className="bg-ink px-3 py-2 text-xs font-bold text-inverse">ارسال گزارش</Button>
                        <Button variant="ghost" type="button" onClick={() => setReportTarget(null)} className="px-3 py-2 text-xs underline">انصراف</Button>
                    </div>
                    {reportMutation.isError && <p role="alert" className="mt-2 text-xs text-danger">ارسال گزارش انجام نشد.</p>}
                </form>
            )}

            {deleteMutation.isError && <p role="alert" className="mt-3 text-xs text-danger">حذف دیدگاه انجام نشد. دوباره تلاش کنید.</p>}
            <div className="mt-7">
                {commentsQuery.isPending ? <p className="py-6 text-sm text-muted">در حال دریافت دیدگاه‌ها...</p> : null}
                {commentsQuery.isError ? <div className="py-6 text-sm text-danger" role="alert">دریافت دیدگاه‌ها انجام نشد. <Button variant="ghost" type="button" onClick={() => commentsQuery.refetch()} className="underline">تلاش دوباره</Button></div> : null}
                {!commentsQuery.isPending && !commentsQuery.isError && comments.length === 0 ? <p className="py-6 text-sm text-muted">هنوز دیدگاهی ثبت نشده است.</p> : null}
                {comments.map((comment) => (
                    <CommentItem
                        key={comment.id}
                        comment={comment}
                        user={canInteract ? user : null}
                        onReply={setReplyTo}
                        onDelete={(id) => deleteMutation.mutate(id)}
                        onReport={setReportTarget}
                    />
                ))}
            </div>
            {pagination.last_page > 1 && (
                <nav aria-label="صفحه‌بندی دیدگاه‌ها" className="mt-5 flex items-center justify-between gap-3">
                    <Button variant="ghost" type="button" disabled={currentPage <= 1 || commentsQuery.isFetching} onClick={() => { setCommentTargetId(''); setPage(currentPage - 1); }} className="border border-border px-3 py-2 text-xs disabled:opacity-40">دیدگاه‌های قبلی</Button>
                    <span className="text-xs text-muted">{Number(currentPage).toLocaleString('fa-IR')} از {Number(pagination.last_page).toLocaleString('fa-IR')}</span>
                    <Button variant="ghost" type="button" disabled={currentPage >= pagination.last_page || commentsQuery.isFetching} onClick={() => { setCommentTargetId(''); setPage(currentPage + 1); }} className="border border-border px-3 py-2 text-xs disabled:opacity-40">دیدگاه‌های بعدی</Button>
                </nav>
            )}
        </section>
    );
}
