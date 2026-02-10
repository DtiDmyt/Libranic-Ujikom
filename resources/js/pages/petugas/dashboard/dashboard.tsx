import { Head, usePage } from '@inertiajs/react';
import {
    CalendarDays,
    ClipboardList,
    Coins,
    type LucideIcon,
    Repeat,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Petugas Dashboard',
        href: '/petugas/dashboard',
    },
];

type QuickStatsPayload = {
    pendingLoans: number;
    todayLoans: number;
    todayReturns: number;
    todayFine: number;
};

type DashboardPageProps = {
    quickStats: QuickStatsPayload;
} & SharedData;

type QuickStatConfig = {
    key: keyof QuickStatsPayload;
    label: string;
    description: string;
    icon: LucideIcon;
    accent: string;
    format: (value: number) => string;
};

export default function PetugasDashboard() {
    const { quickStats: payload } = usePage<DashboardPageProps>().props;

    const numberFormatter = new Intl.NumberFormat('id-ID');
    const currencyFormatter = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    });

    const quickStatConfig: QuickStatConfig[] = [
        {
            key: 'pendingLoans',
            label: 'Peminjaman Menunggu Persetujuan',
            description: 'Permintaan yang belum dikonfirmasi oleh admin.',
            icon: ClipboardList,
            accent: 'from-[#1A3263] to-[#233D7A]',
            format: (value) => numberFormatter.format(value),
        },
        {
            key: 'todayLoans',
            label: 'Peminjaman Hari Ini',
            description: 'Tanggal peminjaman sesuai hari ini.',
            icon: CalendarDays,
            accent: 'from-[#496987] to-[#547792]',
            format: (value) => numberFormatter.format(value),
        },
        {
            key: 'todayReturns',
            label: 'Pengembalian Hari Ini',
            description: 'Jumlah pengembalian yang tercatat hari ini.',
            icon: Repeat,
            accent: 'from-[#F7B74F] to-[#FAB95B]',
            format: (value) => numberFormatter.format(value),
        },
        {
            key: 'todayFine',
            label: 'Total Denda Hari Ini',
            description: 'Denda yang terakumulasi pada periode ini.',
            icon: Coins,
            accent: 'from-[#E8E2DB] to-[#F7F0E7] text-[#1A3263]',
            format: (value) => currencyFormatter.format(value),
        },
    ];

    const cards = quickStatConfig.map((config) => ({
        ...config,
        displayValue: config.format(payload[config.key]),
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Petugas Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-4xl bg-gradient-to-br from-[#FDFCF9] via-[#F5F1EA] to-[#ECE6DC] p-6 shadow-inner">
                <div className="space-y-1">
                    <p className="text-xs font-semibold tracking-[0.4em] text-[#547792] uppercase">
                        Dashboard Petugas
                    </p>
                    <h1 className="text-3xl font-semibold text-[#1A3263]">
                        Ringkasan Harian
                    </h1>
                    <p className="text-sm text-slate-600">
                        Pantau peminjaman dan pengembalian yang sedang
                        berlangsung.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    {cards.map((card) => (
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
                                        {card.displayValue}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {card.description}
                                    </p>
                                </div>
                                <span
                                    className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white ${card.accent}`}
                                >
                                    <card.icon className="h-5 w-5" />
                                </span>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
