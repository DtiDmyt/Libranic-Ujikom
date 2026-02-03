import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem, SharedData } from '@/types';

export default function Dashboard() {
    const { auth } = usePage<SharedData>().props;
    const accountRole = auth.user.account_role ?? 'peminjam';
    const pageTitle =
        accountRole === 'petugas' ? 'Dashboard Petugas' : 'Dashboard';

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: pageTitle,
            href: dashboard().url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={pageTitle} />
            <div className="flex h-full flex-1 flex-col justify-center rounded-3xl border border-[#1A3263]/10 bg-white p-10 text-center shadow-sm">
                <div className="mx-auto max-w-xl space-y-3">
                    <p className="text-xs font-semibold tracking-[0.4em] text-[#547792] uppercase">
                        {accountRole === 'petugas'
                            ? 'Ringkasan Petugas'
                            : 'Ringkasan Peminjam'}
                    </p>
                    <h2 className="text-2xl font-semibold text-[#1A3263]">
                        {pageTitle} sedang disiapkan
                    </h2>
                    <p className="text-sm text-slate-600">
                        Modul analitik untuk peran {accountRole} akan segera
                        tersedia. Sementara itu, silakan gunakan menu di samping
                        untuk melanjutkan aktivitas utama Anda.
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
