import { Head, usePage } from '@inertiajs/react';
import { usePagination } from '@/hooks/use-pagination';
import { Pagination } from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData } from '@/types';

type ActiveUser = {
    id: number;
    name: string;
    role?: string | null;
    role_slug?: string | null;
    is_online: boolean;
    status_badge: string;
    last_activity_at?: string | null;
    last_activity_text?: string | null;
    activity_description?: string | null;
    activity_time_ago?: string | null;
};

type PageProps = SharedData & {
    staffUsers: ActiveUser[];
    borrowerUsers: ActiveUser[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'Log Aktivitas', href: '/admin/log-aktivitas' },
];

const userStatusPalette: Record<'online' | 'offline', string> = {
    online: 'bg-[#1A3263] text-white',
    offline: 'bg-[#E8E2DB] text-[#1A3263]',
};

const getInitials = (name: string) => {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase() ?? '')
        .join('');
};

export default function AdminLogAktivitasPage() {
    const { staffUsers, borrowerUsers } = usePage<PageProps>().props;

    const staffPagination = usePagination(staffUsers, 10);
    const borrowerPagination = usePagination(borrowerUsers, 10);

    const renderUserPanel = (
        title: string,
        description: string,
        users: ActiveUser[],
        pagination: ReturnType<typeof usePagination<ActiveUser>>,
    ) => (
        <section className="rounded-3xl border border-[#E8E2DB] bg-white shadow-lg shadow-[#1A3263]/10">
            <div className="border-b border-[#E8E2DB] px-5 py-4">
                <p className="text-xs font-semibold tracking-[0.25em] text-[#547792] uppercase">
                    {title}
                </p>
                <p className="text-sm text-[#547792]">{description}</p>
            </div>
            <div className="max-h-[420px] overflow-y-auto px-5 py-4">
                {users.length === 0 ? (
                    <p className="text-sm text-[#547792]">
                        Belum ada data aktivitas.
                    </p>
                ) : (
                    <ul className="space-y-4">
                        {pagination.paginatedItems.map((user, index) => (
                            <li
                                key={user.id}
                                className="flex items-start gap-3 border-b border-[#E8E2DB] pb-4 last:border-none last:pb-0"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E8E2DB] text-base font-semibold text-[#1A3263]">
                                    {getInitials(user.name)}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-[#1A3263]">
                                        {user.name}
                                    </p>
                                    {user.role ? (
                                        <p className="text-xs text-[#547792] italic">
                                            {user.role}
                                        </p>
                                    ) : null}
                                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#547792]">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-semibold ${
                                                user.is_online
                                                    ? userStatusPalette.online
                                                    : userStatusPalette.offline
                                            }`}
                                        >
                                            {user.status_badge}
                                        </span>
                                        <span>
                                            —{' '}
                                            {user.last_activity_text ??
                                                'belum pernah aktif'}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-xs text-[#547792]">
                                        Aktivitas —{' '}
                                        {user.activity_description ??
                                            'Belum ada aktivitas terbaru.'}
                                    </p>
                                    {user.activity_time_ago ? (
                                        <p className="text-xs font-semibold text-[#547792]">
                                            — {user.activity_time_ago}
                                        </p>
                                    ) : null}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            {users.length > 0 && (
                <div className="border-t border-[#E8E2DB] px-5 py-3">
                    <Pagination
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        from={pagination.from}
                        to={pagination.to}
                        total={pagination.total}
                        pageNumbers={pagination.pageNumbers}
                        hasNextPage={pagination.hasNextPage}
                        hasPrevPage={pagination.hasPrevPage}
                        onPageChange={pagination.goToPage}
                        onNext={pagination.nextPage}
                        onPrev={pagination.prevPage}
                    />
                </div>
            )}
        </section>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Log Aktivitas" />
            <div className="min-h-[calc(100vh-6rem)] bg-[#F5F1EA] p-6">
                <div className="mx-auto flex justify-end">
                    <div className="w-full max-w-5xl space-y-6">
                        <div className="flex flex-col gap-6 lg:flex-row">
                            <div className="flex-1">
                                <h1 className="px-1 text-2xl font-bold text-[#1A3263]">
                                    Aktivitas Staf
                                </h1>
                                {renderUserPanel(
                                    'Administrator',
                                    'Pantau aktivitas administrator yang sedang bertugas.',
                                    staffUsers,
                                    staffPagination,
                                )}
                            </div>
                            <div className="flex-1">
                                <h1 className="px-1 text-2xl font-bold text-[#1A3263]">
                                    Aktivitas Peminjam
                                </h1>
                                {renderUserPanel(
                                    'Murid & Guru',
                                    'Lihat siapa saja peminjam yang online dan terakhir aktif.',
                                    borrowerUsers,
                                    borrowerPagination,
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
