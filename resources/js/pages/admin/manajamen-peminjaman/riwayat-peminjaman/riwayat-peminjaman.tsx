import { Head, router, usePage } from '@inertiajs/react';
import { Eye } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePagination } from '@/hooks/use-pagination';
import { Pagination } from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';
import adminRoutes from '@/routes/admin';
import type { BreadcrumbItem, SharedData } from '@/types';

type ReturnStatus = 'menunggu' | 'tepat waktu' | 'telat' | 'rusak' | 'hilang';
type ItemCondition = 'baik' | 'rusak' | 'hilang';

type HistoryRow = {
    id: number;
    loan_id?: number | null;
    nama_barang: string;
    peminjam: string;
    kelas?: string | null;
    jumlah: number;
    tanggal_pinjam?: string | null;
    batas_pengembalian?: string | null;
    tanggal_pengembalian?: string | null;
    status: ReturnStatus;
    status_barang: ItemCondition;
    lampiran_url?: string | null;
};

type PageProps = SharedData & {
    items: HistoryRow[];
    filters: {
        search?: string | null;
        status?: ReturnStatus | 'semua';
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: adminRoutes.dashboard().url },
    {
        title: 'Manajemen Peminjaman',
        href: '/admin/data-peminjaman/peminjaman',
    },
    { title: 'Riwayat Peminjaman', href: '/admin/peminjaman/riwayat' },
];

const dateFormatter = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' });

const formatDate = (value?: string | null) =>
    value ? dateFormatter.format(new Date(value)) : '-';

const returnStatusConfig: Record<
    ReturnStatus,
    { label: string; palette: string; dot: string }
> = {
    menunggu: {
        label: 'Proses Pengecekan',
        palette: 'bg-[#FEF3C7] text-[#C2410C]',
        dot: 'bg-[#C2410C]',
    },
    'tepat waktu': {
        label: 'Tepat Waktu',
        palette: 'bg-[#DCFCE7] text-[#065F46]',
        dot: 'bg-[#16A34A]',
    },
    telat: {
        label: 'Telat',
        palette: 'bg-[#FEE2E2] text-[#991B1B]',
        dot: 'bg-[#DC2626]',
    },
    rusak: {
        label: 'Rusak',
        palette: 'bg-[#FEF3C7] text-[#C2410C]',
        dot: 'bg-[#C2410C]',
    },
    hilang: {
        label: 'Hilang',
        palette: 'bg-[#FEE2E2] text-[#991B1B]',
        dot: 'bg-[#DC2626]',
    },
};

const conditionConfig: Record<
    ItemCondition,
    { label: string; palette: string; dot: string }
> = {
    baik: {
        label: 'Baik',
        palette: 'bg-[#E0F2FE] text-[#0369A1]',
        dot: 'bg-[#0284C7]',
    },
    rusak: {
        label: 'Rusak',
        palette: 'bg-[#FEF3C7] text-[#B45309]',
        dot: 'bg-[#D97706]',
    },
    hilang: {
        label: 'Hilang',
        palette: 'bg-[#FEE2E2] text-[#991B1B]',
        dot: 'bg-[#DC2626]',
    },
};

const statusFilterOptions: { value: ReturnStatus | 'semua'; label: string }[] =
    [
        { value: 'semua', label: 'Semua Status' },
        ...(['tepat waktu', 'telat', 'rusak', 'hilang'] as ReturnStatus[]).map(
            (value) => ({ value, label: returnStatusConfig[value].label }),
        ),
    ];

const renderReturnStatusBadge = (status: ReturnStatus) => {
    const config = returnStatusConfig[status] ?? returnStatusConfig.menunggu;
    return (
        <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${config.palette}`}
        >
            <span className={`h-2.5 w-2.5 rounded-full ${config.dot}`} />
            {config.label}
        </span>
    );
};

const renderConditionBadge = (condition: ItemCondition) => {
    const config = conditionConfig[condition] ?? conditionConfig.baik;
    return (
        <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${config.palette}`}
        >
            <span className={`h-2.5 w-2.5 rounded-full ${config.dot}`} />
            {config.label}
        </span>
    );
};

export default function AdminRiwayatPeminjamanPage() {
    const { items, filters } = usePage<PageProps>().props;
    const [searchTerm, setSearchTerm] = useState(filters.search ?? '');
    const [statusFilter, setStatusFilter] = useState<ReturnStatus | 'semua'>(
        filters.status ?? 'semua',
    );
    const [detailRow, setDetailRow] = useState<HistoryRow | null>(null);

    const {
        paginatedItems,
        currentPage,
        totalPages,
        from,
        to,
        total,
        pageNumbers,
        hasNextPage,
        hasPrevPage,
        goToPage,
        nextPage,
        prevPage,
    } = usePagination(items, 10);

    useEffect(() => {
        setSearchTerm(filters.search ?? '');
        setStatusFilter(filters.status ?? 'semua');
    }, [filters.search, filters.status]);

    useEffect(() => {
        if (
            searchTerm === (filters.search ?? '') &&
            statusFilter === (filters.status ?? 'semua')
        ) {
            return;
        }

        const timeout = window.setTimeout(() => {
            visitWithFilters();
        }, 400);

        return () => window.clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, statusFilter]);

    const visitWithFilters = (overrides?: {
        search?: string;
        status?: ReturnStatus | 'semua';
    }) => {
        router.get(
            '/admin/peminjaman/riwayat',
            {
                search: overrides?.search ?? searchTerm,
                status: overrides?.status ?? statusFilter,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const closeDetail = () => setDetailRow(null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Riwayat Peminjaman" />
            <div className="space-y-6 bg-[#F5F1EA] p-6">
                <div>
                    <p className="text-xs font-semibold tracking-[0.25em] text-[#547792] uppercase">
                        Manajemen Peminjaman
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-4">
                        <h1 className="text-3xl font-bold text-[#1A3263]">
                            Riwayat Peminjaman
                        </h1>
                    </div>
                    <p className="mt-1 text-sm text-[#547792]">
                        Catatan seluruh peminjaman yang telah dikembalikan
                        lengkap dengan bukti pengembalian.
                    </p>
                </div>

                <div className="rounded-3xl border border-[#E8E2DB] bg-white shadow-sm">
                    <div className="space-y-4 border-b border-[#E8E2DB] p-6">
                        <div className="flex flex-wrap items-start gap-4">
                            <div className="grid w-full gap-4 md:grid-cols-2 lg:grid-cols-[2fr_1fr]">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(event) =>
                                        setSearchTerm(event.target.value)
                                    }
                                    placeholder="Cari nama barang / peminjam"
                                    className="rounded-2xl border border-[#D7DFEE] bg-white px-4 py-2 text-sm text-[#1A3263] placeholder:text-slate-400 focus:border-[#1A3263] focus:outline-none"
                                />
                                <select
                                    value={statusFilter}
                                    onChange={(event) =>
                                        setStatusFilter(
                                            event.target.value as
                                                | ReturnStatus
                                                | 'semua',
                                        )
                                    }
                                    className="rounded-2xl border border-[#D7DFEE] bg-white px-4 py-2 text-sm font-semibold text-[#1A3263] focus:border-[#1A3263] focus:outline-none"
                                >
                                    {statusFilterOptions.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto [-ms-overflow-style:'none'] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        <table className="min-w-[1100px] divide-y divide-[#E8E2DB]">
                            <thead className="text-left text-xs font-semibold tracking-wide text-[#547792] uppercase">
                                <tr className="bg-[#E8E2DB]">
                                    <th className="px-2 py-4">No</th>
                                    <th className="px-4 py-4">Aksi</th>
                                    <th className="px-4 py-4">Status</th>
                                    <th className="px-4 py-4">Nama Barang</th>
                                    <th className="px-4 py-4">Peminjam</th>
                                    <th className="px-4 py-4">
                                        Tanggal Pinjam
                                    </th>
                                    <th className="px-4 py-4">
                                        Tanggal Pengembalian
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F0EBE2] bg-white">
                                {paginatedItems.map((item, index) => (
                                    <tr
                                        key={item.id}
                                        className="text-sm text-[#1A3263] transition hover:bg-[#F8F6F1]"
                                    >
                                        <td className="px-2 py-4 font-semibold">
                                            {from + index}
                                        </td>
                                        <td className="px-4 py-4">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setDetailRow(item)
                                                }
                                                title="Detail"
                                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E0E7FF] transition hover:bg-[#EEF2FF]"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                        </td>
                                        <td className="px-4 py-4">
                                            {renderReturnStatusBadge(
                                                item.status,
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            <p className="font-semibold">
                                                {item.nama_barang}
                                            </p>
                                        </td>
                                        <td className="px-4 py-4">
                                            <p className="font-medium">
                                                {item.peminjam}
                                            </p>
                                            <p className="text-xs text-[#547792]">
                                                {item.kelas ?? '-'}
                                            </p>
                                        </td>
                                        <td className="px-4 py-4 text-[#547792]">
                                            {formatDate(item.tanggal_pinjam)}
                                        </td>
                                        <td className="px-4 py-4 text-[#547792]">
                                            {formatDate(
                                                item.tanggal_pengembalian,
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {items.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-6 py-10 text-center text-sm text-[#547792]"
                                        >
                                            Belum ada riwayat peminjaman.
                                        </td>
                                    </tr>
                                ) : null}
                            </tbody>
                        </table>
                    </div>

                    <div className="border-t border-[#E8E2DB] px-6 py-4">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            from={from}
                            to={to}
                            total={total}
                            pageNumbers={pageNumbers}
                            hasNextPage={hasNextPage}
                            hasPrevPage={hasPrevPage}
                            onPageChange={goToPage}
                            onNext={nextPage}
                            onPrev={prevPage}
                        />
                    </div>
                </div>
            </div>

            {detailRow ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur"
                        onClick={closeDetail}
                    />
                    <div className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#E8E2DB] px-6 py-4">
                            <div>
                                <p className="text-xs font-semibold tracking-[0.25em] text-[#547792] uppercase">
                                    Detail Riwayat
                                </p>
                                <h2 className="text-xl font-bold text-[#1A3263]">
                                    {detailRow.nama_barang}
                                </h2>
                                <p className="text-xs text-[#547792]">
                                    {detailRow.peminjam} · Kelas{' '}
                                    {detailRow.kelas ?? '-'}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeDetail}
                                className="text-sm font-semibold text-[#1A3263] underline"
                            >
                                Tutup
                            </button>
                        </div>
                        <div className="space-y-5 p-6 text-sm text-[#1A3263]">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <p className="text-xs font-semibold text-[#547792] uppercase">
                                        Status Pengembalian
                                    </p>
                                    <div className="mt-2">
                                        {renderReturnStatusBadge(
                                            detailRow.status,
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-[#547792] uppercase">
                                        Status Barang
                                    </p>
                                    <div className="mt-2">
                                        {renderConditionBadge(
                                            detailRow.status_barang,
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-3">
                                <p>
                                    <span className="font-semibold">
                                        Jumlah:
                                    </span>{' '}
                                    {detailRow.jumlah} unit
                                </p>
                                <p>
                                    <span className="font-semibold">
                                        Tanggal Pinjam:
                                    </span>{' '}
                                    {formatDate(detailRow.tanggal_pinjam)}
                                </p>
                                <p>
                                    <span className="font-semibold">
                                        Batas Pengembalian:
                                    </span>{' '}
                                    {formatDate(detailRow.batas_pengembalian)}
                                </p>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <p>
                                    <span className="font-semibold">
                                        Tanggal Pengembalian:
                                    </span>{' '}
                                    {formatDate(detailRow.tanggal_pengembalian)}
                                </p>
                                <p>
                                    <span className="font-semibold">
                                        ID Peminjaman:
                                    </span>{' '}
                                    {detailRow.loan_id ?? '-'}
                                </p>
                            </div>
                            <div>
                                <p className="font-semibold">
                                    Bukti Pengembalian
                                </p>
                                {detailRow.lampiran_url ? (
                                    <div className="mt-3 overflow-hidden rounded-2xl border border-[#E8E2DB] bg-[#F8FAFC]">
                                        <img
                                            src={detailRow.lampiran_url}
                                            alt="Bukti pengembalian"
                                            className="h-64 w-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <p className="mt-2 text-xs text-[#547792]">
                                        Tidak ada bukti pengembalian yang
                                        diunggah.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </AppLayout>
    );
}
