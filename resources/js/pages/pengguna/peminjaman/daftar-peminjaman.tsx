import { Pagination } from '@/components/ui/pagination';
import { usePagination } from '@/hooks/use-pagination';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';
import { Plus, Eye, Send } from 'lucide-react';

type LoanRow = {
    id: number;
    nama_alat: string;
    kode_alat: string;
    jumlah: number;
    tanggal_pinjam?: string;
    tanggal_kembali?: string;
    status: string;
    keperluan: string;
    denda_per_hari: number;
    alasan_penolakan?: string | null;
};

type StatusOption = {
    value: string;
    label: string;
};

type PageProps = SharedData & {
    items: LoanRow[];
    filters: {
        search?: string;
        status?: string;
    };
    statusOptions: StatusOption[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard Pengguna', href: '/dashboard' },
    { title: 'Peminjaman Saya', href: '/peminjaman' },
];

const currencyFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
});

const formatDateLabel = (value?: string) =>
    value
        ? new Intl.DateTimeFormat('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
          }).format(new Date(value))
        : '-';

const statusStyles: Record<string, string> = {
    menunggu: 'bg-amber-100 text-amber-700 border border-amber-200',
    disetujui: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    dikembalikan: 'bg-sky-100 text-sky-700 border border-sky-200',
    ditolak: 'bg-rose-100 text-rose-700 border border-rose-200',
    default: 'bg-slate-100 text-slate-600 border border-slate-200',
};

export default function PenggunaDaftarPeminjamanPage() {
    const { items, filters, statusOptions } = usePage<PageProps>().props;
    const statusFilter = filters.status ?? 'semua';
    const [searchTerm, setSearchTerm] = useState(filters.search ?? '');

    useEffect(() => {
        setSearchTerm(filters.search ?? '');
    }, [filters.search]);

    const hasRejectedItem = items.some((item) => item.status === 'ditolak');

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

    const visitWithFilters = useCallback(
        (overrides?: Partial<{ search: string; status: string }>) => {
            const requestedStatus = overrides?.status ?? statusFilter;
            const requestedSearch = overrides?.search ?? searchTerm;
            const normalizedSearch = requestedSearch?.trim() ?? '';
            const query: Record<string, string> = {};

            if (requestedStatus && requestedStatus !== 'semua') {
                query.status = requestedStatus;
            }

            if (normalizedSearch) {
                query.search = normalizedSearch;
            }

            router.get('/peminjaman', query, {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            });
        },
        [searchTerm, statusFilter],
    );

    useEffect(() => {
        if (searchTerm === (filters.search ?? '')) return;

        const timeout = window.setTimeout(() => {
            visitWithFilters({ search: searchTerm });
        }, 450);

        return () => window.clearTimeout(timeout);
    }, [searchTerm, filters.search, visitWithFilters]);

    const statusLabelMap = statusOptions.reduce<Record<string, string>>(
        (acc, option) => {
            if (option.value !== 'semua') acc[option.value] = option.label;
            return acc;
        },
        {},
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Peminjaman Saya" />

            <div className="space-y-6 bg-[#F5F1EA] p-6">
                <div>
                    <p className="text-xs font-semibold tracking-[0.25em] text-[#547792] uppercase">
                        Riwayat Peminjaman
                    </p>
                    <h1 className="mt-2 text-3xl font-bold text-[#1A3263]">
                        Daftar Peminjaman
                    </h1>
                    <p className="mt-1 text-sm text-[#547792]">
                        Pantau status peminjaman dan pastikan buku sudah
                        dikembalikan tepat waktu.
                    </p>
                </div>

                <div className="rounded-3xl border border-[#E8E2DB] bg-white shadow-sm">
                    {/* tombol pindah ke kiri */}
                    <div className="border-b border-[#E8E2DB] p-6">
                        <Link
                            href="/daftar-buku"
                            className="inline-flex items-center gap-2 rounded-2xl bg-[#1A3263] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#1A3263]/30 transition hover:bg-[#172550]"
                        >
                            <Plus className="h-4 w-4" />
                            Ajukan Peminjaman
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-[#E8E2DB]">
                            <thead className="text-left text-xs font-semibold tracking-wide text-[#547792] uppercase">
                                <tr className="bg-[#E8E2DB]">
                                    <th className="px-4 py-4">No</th>
                                    <th className="px-4 py-4">Aksi</th>
                                    <th className="px-4 py-4">Nama Buku</th>
                                    <th className="px-4 py-4">Jumlah</th>
                                    <th className="px-4 py-4">Tanggal</th>
                                    <th className="px-4 py-4">Denda / Hari</th>
                                    <th className="px-4 py-4">Status</th>
                                    {hasRejectedItem ? (
                                        <th className="px-4 py-4">
                                            Alasan Penolakan
                                        </th>
                                    ) : null}
                                </tr>

                                <tr className="bg-white text-[11px] font-normal text-[#547792]">
                                    <th />
                                    <th />
                                    <th className="px-4 py-3">
                                        <input
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
                                            placeholder="Cari nama buku..."
                                            className="w-full rounded-2xl border border-[#D7DFEE] bg-[#F8FAFC] px-3 py-2 text-xs"
                                        />
                                    </th>
                                    <th />
                                    <th />
                                    <th />
                                    <th className="px-4 py-3">
                                        <select
                                            value={statusFilter}
                                            onChange={(e) =>
                                                visitWithFilters({
                                                    status: e.target.value,
                                                })
                                            }
                                            className="w-full rounded-2xl border border-[#D7DFEE] px-3 py-2 text-xs"
                                        >
                                            {statusOptions.map((option) => (
                                                <option
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </th>
                                    {hasRejectedItem ? <th /> : null}
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-[#F0EBE2] bg-white">
                                {paginatedItems.map((item, index) => (
                                    <tr
                                        key={item.id}
                                        className="text-sm hover:bg-[#F8F6F1]"
                                    >
                                        <td className="px-4 py-4 font-semibold">
                                            {from + index}
                                        </td>

                                        {/* AKSI */}
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/peminjaman/${item.id}`}
                                                    title="Detail"
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E0E7FF] text-[#1A3263] transition hover:bg-[#EEF2FF]"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                                <Link
                                                    href={`/peminjaman/${item.id}/pengembalian`}
                                                    title="Pengembalian"
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E0E7FF] text-[#1A3263] transition hover:bg-[#EEF2FF]"
                                                >
                                                    <Send className="h-4 w-4" />
                                                </Link>
                                            </div>
                                        </td>

                                        <td className="px-4 py-4">
                                            <p className="font-semibold">
                                                {item.nama_alat}
                                            </p>
                                            <p className="text-xs text-[#547792]">
                                                {item.kode_alat}
                                            </p>
                                        </td>

                                        <td className="px-4 py-4 font-semibold">
                                            {item.jumlah}
                                        </td>

                                        <td className="px-4 py-4">
                                            <p className="font-semibold">
                                                {formatDateLabel(
                                                    item.tanggal_pinjam,
                                                )}
                                            </p>
                                            <p className="text-xs text-[#547792]">
                                                Dipinjam sampai{' '}
                                                {formatDateLabel(
                                                    item.tanggal_kembali,
                                                )}
                                            </p>
                                        </td>

                                        <td className="px-4 py-4">
                                            {currencyFormatter.format(
                                                item.denda_per_hari ?? 0,
                                            )}
                                        </td>

                                        <td className="px-4 py-4">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                    statusStyles[item.status] ??
                                                    statusStyles.default
                                                }`}
                                            >
                                                {statusLabelMap[item.status] ??
                                                    'Menunggu'}
                                            </span>
                                        </td>
                                        {hasRejectedItem ? (
                                            <td className="px-4 py-4 text-sm text-[#1A3263]">
                                                {item.status === 'ditolak' ? (
                                                    <>
                                                        <p className="font-semibold">
                                                            {item.alasan_penolakan?.trim() ||
                                                                'Tidak ada alasan yang dicatat.'}
                                                        </p>
                                                    </>
                                                ) : (
                                                    <span className="text-xs text-[#94A3B8]">
                                                        -
                                                    </span>
                                                )}
                                            </td>
                                        ) : null}
                                    </tr>
                                ))}

                                {items.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="py-10 text-center text-sm"
                                        >
                                            Belum ada peminjaman.
                                        </td>
                                    </tr>
                                )}
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
        </AppLayout>
    );
}
