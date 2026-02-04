import { Head } from '@inertiajs/react';
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
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: adminRoutes.dashboard().url,
    },
];

type QuickStat = {
    label: string;
    value: string;
    unit?: string;
    description: string;
    icon: LucideIcon;
    accent: string;
};

type JurusanStat = {
    name: string;
    peminjaman: number;
    terlambat: number;
};

const quickStats: QuickStat[] = [
    {
        label: 'Total Alat',
        value: '540',
        unit: 'unit',
        description: '+12 alat baru bulan ini',
        icon: Layers3,
        accent: 'from-[#1A3263] to-[#233D7A]',
    },
    {
        label: 'Peminjaman Aktif',
        value: '318',
        unit: 'transaksi',
        description: 'Terakhir diperbarui 5 menit lalu',
        icon: ClipboardList,
        accent: 'from-[#496987] to-[#547792]',
    },
    {
        label: 'Alat Rusak / Habis',
        value: '11',
        unit: 'unit',
        description: 'Perlu pengecekan ulang stok',
        icon: TriangleAlert,
        accent: 'from-[#F7B74F] to-[#FAB95B]',
    },
    {
        label: 'Total Denda Bulan Ini',
        value: 'Rp 1.250.000',
        unit: '',
        description: 'Naik 6% dibanding bulan lalu',
        icon: Coins,
        accent: 'from-[#E8E2DB] to-[#F7F0E7] text-[#1A3263]',
    },
];

const jurusanStats: JurusanStat[] = [
    { name: 'PPLG', peminjaman: 142, terlambat: 5 },
    { name: 'ANIM', peminjaman: 118, terlambat: 3 },
    { name: 'BCF', peminjaman: 103, terlambat: 4 },
    { name: 'TO', peminjaman: 95, terlambat: 2 },
    { name: 'TPFL', peminjaman: 82, terlambat: 1 },
    { name: 'UMUM', peminjaman: 76, terlambat: 2 },
];

const peakJurusan = jurusanStats.reduce(
    (prev, curr) => (curr.peminjaman > prev.peminjaman ? curr : prev),
    jurusanStats[0],
);
const highestLate = jurusanStats.reduce(
    (prev, curr) => (curr.terlambat > prev.terlambat ? curr : prev),
    jurusanStats[0],
);

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
                                            {stat.value}
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
                    <div className="rounded-3xl border border-[#1A3263]/10 bg-white p-6 shadow-sm">
                        <p className="text-xs font-semibold tracking-[0.4em] text-[#547792] uppercase">
                            Catatan Singkat
                        </p>
                        <div className="mt-4 grid gap-4 text-sm text-slate-600 md:grid-cols-2">
                            <div className="rounded-2xl bg-[#F9F5EE]/80 p-4">
                                <p className="text-xs font-semibold text-[#1A3263]">
                                    Jurusan paling aktif
                                </p>
                                <p className="text-base font-semibold text-[#1A3263]">
                                    {peakJurusan.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {peakJurusan.peminjaman} peminjaman aktif
                                </p>
                            </div>
                            <div className="rounded-2xl border border-[#FAB95B]/40 p-4">
                                <p className="text-xs font-semibold text-[#B45309]">
                                    Perlu perhatian
                                </p>
                                <p className="text-base font-semibold text-[#1A3263]">
                                    {highestLate.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {highestLate.terlambat} keterlambatan
                                    tercatat
                                </p>
                            </div>
                        </div>
                        <p className="mt-4 text-xs text-slate-500">
                            Rekomendasi: jadwalkan inspeksi alat rusak dan
                            ingatkan jurusan dengan keterlambatan tinggi.
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
