import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

type ActiveLoan = {
    id: number;
    nama_barang: string;
    jumlah: number;
    tanggal_pinjam?: string | null;
    tanggal_kembali?: string | null;
    late_penalty_per_day: number;
    late_penalty_total: number;
    due_message: string;
    isLate: boolean;
    keterangan: string;
};

type DashboardPageProps = SharedData & {
    totalBorrows: number;
    maxActiveLoans: number;
    activeLoans: ActiveLoan[];
};

const syaratLines = [
    'Siswa aktif',
    'Maksimal 2 alat dalam satu peminjaman',
    'Wajib mengembalikan tepat waktu',
];

const dendaLines = [
    'Tepat waktu & alat baik → Tidak ada denda',
    'Terlambat → Denda berlaku sesuai ketentuan alat',
    'Alat rusak/hilang → Akan dibahas bersama',
];

export default function PenggunaDashboard() {
    const { totalBorrows, maxActiveLoans, activeLoans } =
        usePage<DashboardPageProps>().props;

    const numberFormatter = new Intl.NumberFormat('id-ID');
    const remainingQuota = Math.max(0, maxActiveLoans - activeLoans.length);

    const statCards = [
        {
            label: 'Total Peminjaman Saya',
            value: totalBorrows,
            description: 'Rekam semua pinjaman yang pernah Anda ajukan.',
        },
        {
            label: 'Peminjaman Aktif',
            value: activeLoans.length,
            description: 'Transaksi yang sedang berjalan.',
        },
        {
            label: 'Kuota Tersisa',
            value: remainingQuota,
            description: `Maksimal peminjaman aktif ${maxActiveLoans} alat.`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-4xl bg-gradient-to-br from-[#FDFCF9] via-[#F5F1EA] to-[#ECE6DC] p-6 shadow-inner">
                <div className="space-y-1">
                    <p className="text-xs font-semibold tracking-[0.4em] text-[#547792] uppercase">
                        Dashboard Peminjam
                    </p>
                    <h1 className="text-3xl font-semibold text-[#1A3263]">
                        Catatan Peminjaman
                    </h1>
                    <p className="text-sm text-slate-600">
                        Ikuti aturan peminjaman dan pantau keterlambatan setiap
                        alat yang sedang Anda pegang.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {statCards.map((card) => (
                        <article
                            key={card.label}
                            className="relative rounded-3xl border border-[#1A3263]/10 bg-white/90 p-5 shadow-sm ring-1 ring-transparent transition hover:ring-[#FAB95B]/40"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-[11px] font-semibold tracking-[0.3em] text-[#547792] uppercase">
                                        {card.label}
                                    </p>
                                    <p className="mt-3 text-3xl font-semibold text-[#1A3263]">
                                        {numberFormatter.format(card.value)}
                                        <span className="text-sm text-[#547792]">
                                            {' '}
                                            {card.badge}
                                        </span>
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {card.description}
                                    </p>
                                </div>
                                <span
                                    className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white ${card.accent}`}
                                >
                                    <span className="text-xs font-semibold uppercase">
                                        {card.badge}
                                    </span>
                                </span>
                            </div>
                        </article>
                    ))}
                </div>

                <div className="space-y-4">
                    <section className="rounded-3xl bg-[#1A3263] px-6 py-5 text-[#E8E2DB] shadow-sm">
                        <p className="text-xs font-semibold tracking-[0.4em] uppercase">
                            Syarat Peminjaman
                        </p>
                        <ul className="mt-4 space-y-3 text-base font-medium">
                            {syaratLines.map((line) => (
                                <li key={line} className="flex gap-3">
                                    <span className="mt-1 h-2 w-2 rounded-full bg-[#FAB95B]" />
                                    <span>{line}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="rounded-3xl bg-[#547792] px-6 py-5 text-[#E8E2DB] shadow-sm">
                        <p className="text-xs font-semibold tracking-[0.4em] uppercase">
                            Informasi Denda
                        </p>
                        <ul className="mt-4 space-y-3 text-base font-medium">
                            {dendaLines.map((line) => (
                                <li key={line} className="flex gap-3">
                                    <span className="mt-1 h-2 w-2 rounded-full bg-[#FAB95B]" />
                                    <span>{line}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>
            </div>
        </AppLayout>
    );
}
