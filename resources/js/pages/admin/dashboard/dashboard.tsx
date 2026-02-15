import { Head, usePage } from '@inertiajs/react';
import {
    ClipboardList,
    Coins,
    Layers3,
    TriangleAlert,
    type LucideIcon,
} from 'lucide-react';
import {
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    type TooltipProps,
} from 'recharts';
import { Line, LineChart } from 'recharts';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import adminRoutes from '@/routes/admin';
import type { BreadcrumbItem, SharedData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: adminRoutes.dashboard().url,
    },
];

type JurusanStat = {
    name: string;
    peminjaman: number;
    terlambat: number;
};

type QuickStatsPayload = {
    totalAlat: number;
    peminjamanAktif: number;
    problematicItems: number;
    totalDenda: number;
};

type DashboardPageProps = {
    quickStats: QuickStatsPayload;
    jurusanStats: JurusanStat[];
    peakJurusan: JurusanStat;
    highestLate: JurusanStat;
};

type QuickStatConfig = {
    key: keyof QuickStatsPayload;
    label: string;
    unit?: string;
    description: string;
    icon: LucideIcon;
    accent: string;
    format: (value: number) => string;
};

const JurusanTooltip = ({
    active,
    payload,
    label,
}: TooltipProps<number, string>) => {
    if (!active || !payload || payload.length === 0) {
        return null;
    }

    return (
        <div className="rounded-2xl border border-[#1A3263]/10 bg-white/95 px-4 py-3 text-sm shadow-lg">
            <p className="text-[11px] font-semibold tracking-[0.3em] text-[#547792] uppercase">
                {label}
            </p>
            {payload.map((entry) => (
                <p key={entry.dataKey} className="text-xs text-slate-600">
                    {entry.name}: {entry.value}
                </p>
            ))}
        </div>
    );
};

export default function AdminDashboard() {
    const {
        quickStats: quickStatsPayload,
        jurusanStats,
        peakJurusan,
        highestLate,
    } = usePage<SharedData & DashboardPageProps>().props;

    const numberFormatter = new Intl.NumberFormat('id-ID');
    const currencyFormatter = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    });

    const quickStatConfig: QuickStatConfig[] = [
        {
            key: 'totalAlat',
            label: 'Total Alat',
            unit: 'unit',
            description: 'Jumlah alat terkelola sistem',
            icon: Layers3,
            accent: 'from-[#1A3263] to-[#233D7A]',
            format: (value) => numberFormatter.format(value),
        },
        {
            key: 'peminjamanAktif',
            label: 'Peminjaman Aktif',
            unit: 'transaksi',
            description: 'Transaksi sedang berjalan',
            icon: ClipboardList,
            accent: 'from-[#496987] to-[#547792]',
            format: (value) => numberFormatter.format(value),
        },
        {
            key: 'problematicItems',
            label: 'Alat Rusak / Habis',
            unit: 'unit',
            description: 'Memerlukan tindak lanjut',
            icon: TriangleAlert,
            accent: 'from-[#F7B74F] to-[#FAB95B]',
            format: (value) => numberFormatter.format(value),
        },
        {
            key: 'totalDenda',
            label: 'Total Denda Bulan Ini',
            description: 'Akumulasi denda dari keterlambatan',
            icon: Coins,
            accent: 'from-[#E8E2DB] to-[#F7F0E7] text-[#1A3263]',
            format: (value) => currencyFormatter.format(value),
        },
    ];

    const quickStats = quickStatConfig.map((config) => ({
        ...config,
        displayValue: config.format(quickStatsPayload[config.key]),
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-4xl bg-gradient-to-br from-[#FDFCF9] via-[#F5F1EA] to-[#ECE6DC] p-6 shadow-inner">
                <div className="space-y-1">
                    <p className="text-xs font-semibold tracking-[0.4em] text-[#547792] uppercase">
                        Dashboard Administrator
                    </p>
                    <h1 className="text-3xl font-semibold text-[#1A3263]">
                        Selamat Datang Kembali! 👋
                    </h1>
                    <p className="text-sm text-slate-600">
                        Kelola dan monitor seluruh aktivitas peminjaman alat
                        dengan mudah
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    {quickStats.map((stat) => (
                        <div
                            key={stat.label}
                            className="relative rounded-3xl border border-[#1A3263]/10 bg-white/90 p-5 shadow-sm ring-1 ring-transparent transition hover:ring-[#FAB95B]/40"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-[11px] font-semibold tracking-[0.3em] text-[#547792] uppercase">
                                        {stat.label}
                                    </p>
                                    <div className="mt-3 flex items-baseline gap-2">
                                        <p className="text-3xl font-semibold text-[#1A3263]">
                                            {stat.displayValue}
                                        </p>
                                        {stat.unit ? (
                                            <span className="text-sm font-medium text-[#547792]">
                                                {stat.unit}
                                            </span>
                                        ) : null}
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        {stat.description}
                                    </p>
                                </div>
                                <span
                                    className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white ${stat.accent}`}
                                >
                                    <stat.icon className="h-5 w-5" />
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="space-y-6">
                    <div className="relative overflow-hidden rounded-3xl border border-[#1A3263]/10 bg-white p-6 shadow-sm">
                        <p className="text-xs font-semibold tracking-[0.4em] text-[#547792] uppercase">
                            Statistik per Jurusan
                        </p>
                        <h2 className="text-lg font-semibold text-[#1A3263]">
                            Tren peminjaman dan keterlambatan
                        </h2>
                        <PlaceholderPattern className="pointer-events-none absolute inset-0 size-full stroke-[#1A3263]/40 opacity-5" />
                        <div className="relative mt-6 h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={jurusanStats}>
                                    <CartesianGrid
                                        stroke="#E5E7EB"
                                        strokeDasharray="4 4"
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fill: '#475467', fontSize: 12 }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        tick={{ fill: '#94A3B8', fontSize: 12 }}
                                        tickLine={false}
                                        axisLine={false}
                                        width={40}
                                    />
                                    <Tooltip
                                        cursor={{
                                            stroke: '#547792',
                                            strokeWidth: 1,
                                        }}
                                        content={<JurusanTooltip />}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="peminjaman"
                                        name="Peminjaman"
                                        stroke="#1A3263"
                                        strokeWidth={3}
                                        dot={{
                                            stroke: '#1A3263',
                                            fill: 'white',
                                            strokeWidth: 2,
                                            r: 5,
                                        }}
                                        activeDot={{ r: 6, fill: '#1A3263' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
