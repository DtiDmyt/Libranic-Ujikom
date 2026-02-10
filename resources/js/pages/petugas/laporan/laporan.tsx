import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    type TooltipProps,
} from 'recharts';
import AppLayout from '@/layouts/app-layout';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import type { BreadcrumbItem, SharedData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Petugas Dashboard', href: '/petugas/dashboard' },
    { title: 'Laporan', href: '/petugas/laporan' },
];

const numberFormatter = new Intl.NumberFormat('id-ID');
const statusPalette: Record<string, { text: string; badge: string }> = {
    'tepat waktu': {
        text: 'text-[#065F46]',
        badge: 'bg-[#DCFCE7] text-[#065F46] border border-[#BBF7D0]',
    },
    telat: {
        text: 'text-[#B45309]',
        badge: 'bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA]',
    },
    rusak: {
        text: 'text-[#B45309]',
        badge: 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]',
    },
    hilang: {
        text: 'text-[#991B1B]',
        badge: 'bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA]',
    },
    menunggu: {
        text: 'text-[#92400E]',
        badge: 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]',
    },
};

const ChartTooltip = ({
    active,
    payload,
    label,
}: TooltipProps<number, string>) => {
    if (!active || !payload || payload.length === 0) {
        return null;
    }

    return (
        <div className="rounded-2xl border border-[#E0E7EE] bg-white/90 px-4 py-3 text-xs text-[#1A3263] shadow-lg">
            <p className="text-[11px] font-semibold tracking-[0.3em] text-[#547792] uppercase">
                {label}
            </p>
            {payload.map((entry) => (
                <p key={entry.dataKey} className="mt-1">
                    {entry.name}: {entry.value}
                </p>
            ))}
        </div>
    );
};

type HighlightItem = {
    label: string;
    value: string;
    meta?: string | null;
};

type SummaryPayload = {
    total_loans: number;
    total_returns: number;
    on_time: number;
    late: number;
    problematic: number;
};

type ChartPoint = {
    name: string;
    peminjaman: number;
    pengembalian: number;
    telat: number;
};

type TableRow = {
    id: number;
    nama_barang: string;
    jurusan: string;
    peminjam: string;
    tanggal_pinjam?: string | null;
    tanggal_kembali?: string | null;
    status: string;
    keterangan?: string | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type TablePayload = {
    data: TableRow[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    links: PaginationLink[];
};

type FilterOptions = {
    jurusan: string[];
    status: { value: string; label: string }[];
};

type PageProps = SharedData & {
    summary: SummaryPayload;
    chart: {
        jurusan: ChartPoint[];
    };
    highlights: HighlightItem[];
    table: TablePayload;
    filters: {
        month?: string | null;
        jurusan?: string | null;
        status?: string;
    };
    filterOptions: FilterOptions;
};

export default function PetugasLaporanPage() {
    const { summary, chart, highlights, table, filters, filterOptions } =
        usePage<PageProps>().props;

    const [monthFilter, setMonthFilter] = useState(filters.month ?? '');
    const [jurusanFilter, setJurusanFilter] = useState(filters.jurusan ?? '');
    const [statusFilter, setStatusFilter] = useState(filters.status ?? 'semua');

    useEffect(() => {
        setMonthFilter(filters.month ?? '');
        setJurusanFilter(filters.jurusan ?? '');
        setStatusFilter(filters.status ?? 'semua');
    }, [filters.month, filters.jurusan, filters.status]);

    useEffect(() => {
        const isSynced =
            monthFilter === (filters.month ?? '') &&
            jurusanFilter === (filters.jurusan ?? '') &&
            statusFilter === (filters.status ?? 'semua');

        if (isSynced) {
            return;
        }

        const timeout = window.setTimeout(() => {
            router.get(
                '/petugas/laporan',
                {
                    month: monthFilter || undefined,
                    jurusan: jurusanFilter || undefined,
                    status: statusFilter || undefined,
                },
                {
                    preserveScroll: true,
                    preserveState: true,
                    replace: true,
                },
            );
        }, 350);

        return () => window.clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [monthFilter, jurusanFilter, statusFilter]);

    const handlePrint = () => {
        window.print();
    };

    const handlePagination = (link: PaginationLink) => {
        if (!link.url || link.active) {
            return;
        }

        router.visit(link.url, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const summaryCards = useMemo(
        () => [
            { label: 'Total Peminjaman', value: summary.total_loans },
            { label: 'Total Pengembalian', value: summary.total_returns },
            { label: 'Tepat Waktu', value: summary.on_time },
            { label: 'Terlambat', value: summary.late },
            { label: 'Rusak / Hilang', value: summary.problematic },
        ],
        [summary],
    );

    const chartData = chart.jurusan ?? [];
    const highlightItems = highlights ?? [];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan" />
            <div className="space-y-6 bg-[#F5F1EA] p-6">
                <section className="space-y-3">
                    <p className="text-xs font-semibold tracking-[0.3em] text-[#547792] uppercase">
                        Ringkasan Utama
                    </p>
                    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
                        {summaryCards.map((card) => (
                            <article
                                key={card.label}
                                className="flex flex-col rounded-2xl border border-[#E0E7EE] bg-[#FEFDFC] p-4 shadow-sm"
                            >
                                <span className="text-xs font-semibold text-[#547792] uppercase">
                                    {card.label}
                                </span>
                                <span className="mt-2 text-2xl font-bold text-[#1A3263]">
                                    {numberFormatter.format(card.value)}
                                </span>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                    <article className="relative space-y-4 rounded-3xl bg-white/90 p-6 shadow-sm">
                        <PlaceholderPattern className="pointer-events-none absolute inset-0 stroke-[#1A3263]/20 opacity-5" />
                        <div className="relative space-y-1">
                            <p className="text-xs font-semibold tracking-[0.3em] text-[#547792] uppercase">
                                Grafik Ringkas
                            </p>
                            <p className="text-sm text-[#547792]">
                                Perbandingan peminjaman, pengembalian, dan
                                keterlambatan per jurusan.
                            </p>
                        </div>
                        <div className="relative mt-4 h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={chartData}
                                    margin={{ left: 12, right: 12 }}
                                >
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
                                        interval={0}
                                        tickMargin={10}
                                    />
                                    <YAxis
                                        tick={{ fill: '#94A3B8', fontSize: 12 }}
                                        tickLine={false}
                                        axisLine={false}
                                        width={48}
                                    />
                                    <Tooltip
                                        content={<ChartTooltip />}
                                        cursor={{
                                            stroke: '#94A3B8',
                                            strokeWidth: 1,
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="peminjaman"
                                        name="Peminjaman"
                                        stroke="#1A3263"
                                        strokeWidth={3}
                                        dot={{
                                            stroke: '#1A3263',
                                            strokeWidth: 2,
                                            r: 4,
                                        }}
                                        activeDot={{ r: 6, fill: '#1A3263' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="pengembalian"
                                        name="Pengembalian"
                                        stroke="#4C1D95"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="telat"
                                        name="Terlambat"
                                        stroke="#F97316"
                                        strokeWidth={2}
                                        strokeDasharray="6 3"
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </article>
                    <article className="space-y-4 rounded-3xl bg-white/90 p-6 shadow-sm">
                        <p className="text-xs font-semibold tracking-[0.3em] text-[#547792] uppercase">
                            Top / Highlight
                        </p>
                        <ul className="space-y-3 text-sm text-[#1A3263]">
                            {highlightItems.map((item) => (
                                <li
                                    key={item.label}
                                    className="rounded-2xl border border-[#E0E7EE] bg-[#FAFBFF] px-4 py-3"
                                >
                                    <p className="text-xs text-[#547792]">
                                        {item.label}
                                    </p>
                                    <p className="text-base font-semibold">
                                        {item.value}
                                    </p>
                                    {item.meta ? (
                                        <p className="text-xs text-[#94A3B8]">
                                            {item.meta}
                                        </p>
                                    ) : null}
                                </li>
                            ))}
                        </ul>
                    </article>
                </section>

                <section className="rounded-3xl bg-white/90 p-6 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="inline-flex items-center justify-center rounded-2xl bg-[#1A3263] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#14264c]"
                        >
                            Cetak Laporan
                        </button>
                        <div className="grid flex-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <label className="flex flex-col gap-1 text-sm">
                                <span className="text-[#547792]">Periode</span>
                                <input
                                    type="month"
                                    value={monthFilter}
                                    onChange={(event) =>
                                        setMonthFilter(event.target.value)
                                    }
                                    className="rounded-2xl border border-[#D7DFEE] bg-white px-4 py-2 text-sm text-[#1A3263] focus:border-[#1A3263]"
                                />
                            </label>
                            <label className="flex flex-col gap-1 text-sm">
                                <span className="text-[#547792]">Jurusan</span>
                                <select
                                    value={jurusanFilter}
                                    onChange={(event) =>
                                        setJurusanFilter(event.target.value)
                                    }
                                    className="rounded-2xl border border-[#D7DFEE] bg-white px-4 py-2 text-sm text-[#1A3263] focus:border-[#1A3263]"
                                >
                                    <option value="">Semua Jurusan</option>
                                    {filterOptions.jurusan.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="flex flex-col gap-1 text-sm">
                                <span className="text-[#547792]">
                                    Status Pengembalian
                                </span>
                                <select
                                    value={statusFilter}
                                    onChange={(event) =>
                                        setStatusFilter(event.target.value)
                                    }
                                    className="rounded-2xl border border-[#D7DFEE] bg-white px-4 py-2 text-sm text-[#1A3263] focus:border-[#1A3263]"
                                >
                                    {filterOptions.status.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                    </div>
                </section>

                <section className="rounded-3xl bg-white/90 p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold tracking-[0.3em] text-[#547792] uppercase">
                            Tabel Rekap Inti
                        </p>
                        <p className="text-xs text-[#94A3B8]">
                            Menampilkan {table.from ?? 0} - {table.to ?? 0} dari{' '}
                            {table.total} data
                        </p>
                    </div>
                    <div className="mt-4 overflow-x-auto">
                        <table className="min-w-[900px] divide-y divide-[#E8E2DB] text-sm text-[#1A3263]">
                            <thead className="bg-[#E8E2DB] text-xs tracking-[0.3em] text-[#547792] uppercase">
                                <tr>
                                    <th className="px-4 py-3 text-left">
                                        Nama Barang
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Jurusan
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Peminjam
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Tgl Pinjam
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Tgl Kembali
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Status Pengembalian
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Keterangan
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F0EBE2] bg-white">
                                {table.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-4 py-8 text-center text-sm text-[#94A3B8]"
                                        >
                                            Tidak ada data untuk filter saat
                                            ini.
                                        </td>
                                    </tr>
                                ) : (
                                    table.data.map((row) => {
                                        const normalizedStatus =
                                            row.status?.toLowerCase() ??
                                            'menunggu';
                                        const palette =
                                            statusPalette[normalizedStatus] ??
                                            statusPalette.menunggu;
                                        return (
                                            <tr
                                                key={row.id}
                                                className="text-sm"
                                            >
                                                <td className="px-4 py-3 font-semibold">
                                                    {row.nama_barang}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {row.jurusan}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {row.peminjam}
                                                </td>
                                                <td className="px-4 py-3 text-[#547792]">
                                                    {row.tanggal_pinjam ?? '-'}
                                                </td>
                                                <td className="px-4 py-3 text-[#547792]">
                                                    {row.tanggal_kembali ?? '-'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${palette.badge}`}
                                                    >
                                                        {row.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-[#547792]">
                                                    {row.keterangan ?? '-'}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                    {table.links.length > 1 ? (
                        <nav
                            className="mt-5 flex flex-wrap items-center gap-2 text-sm"
                            aria-label="Pagination"
                        >
                            {table.links.map((link, index) => (
                                <button
                                    key={`${link.label}-${index}`}
                                    type="button"
                                    onClick={() => handlePagination(link)}
                                    className={`rounded-xl border px-3 py-1 ${
                                        link.active
                                            ? 'border-[#1A3263] bg-[#1A3263] text-white'
                                            : link.url
                                              ? 'border-[#E0E7EE] text-[#1A3263] hover:border-[#1A3263]'
                                              : 'cursor-not-allowed border-transparent text-[#CBD5F5]'
                                    }`}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ))}
                        </nav>
                    ) : null}
                </section>
            </div>
        </AppLayout>
    );
}
