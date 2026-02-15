import { Pagination } from '@/components/ui/pagination';
import { usePagination } from '@/hooks/use-pagination';
import { Head, Link, usePage } from '@inertiajs/react';
import { Eye, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard Pengguna', href: '/dashboard' },
    { title: 'Peminjaman Saya', href: '/peminjaman' },
    { title: 'Riwayat Peminjaman', href: '/peminjaman/riwayat-peminjaman' },
];

type LoanHistoryRow = {
    id: number;
    nama_alat: string;
    nama_peminjam: string;
    jumlah: number;
    batas_peminjaman?: string | null;
    tanggal_dikembalikan?: string | null;
    return_status: string;
    return_status_label: string;
    detail_url: string;
    late_days?: number;
    penalty?: number;
    pengembalian?: {
        kondisi?: string | null;
        catatan?: string | null;
        catatan_petugas?: string | null;
        lampiran_url?: string | null;
    };
};

type PageProps = SharedData & {
    items: LoanHistoryRow[];
};

const statusDisplayConfig: Record<
    string,
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
    ditolak: {
        label: 'Ditolak',
        palette: 'bg-[#FEE2E2] text-[#991B1B]',
        dot: 'bg-[#DC2626]',
    },
};

const normalizeReturnStatus = (value?: string | null): string => {
    if (!value) {
        return 'menunggu';
    }

    const normalized = value.toLowerCase().trim();
    if (normalized === 'terlambat') {
        return 'telat';
    }

    const knownKeys = Object.keys(statusDisplayConfig);
    if (knownKeys.includes(normalized)) {
        return normalized;
    }

    return 'menunggu';
};

const formatDate = (value?: string | null) =>
    value
        ? new Intl.DateTimeFormat('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
          }).format(new Date(value))
        : '-';

const currencyFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
});

const resolveNote = (item: LoanHistoryRow): string => {
    const status = normalizeReturnStatus(item.return_status);
    const noteFromOfficer = item.pengembalian?.catatan_petugas?.trim();

    if (status === 'tepat waktu') {
        return '-';
    }

    if (status === 'telat') {
        const penalty = item.penalty ?? 0;
        const lateDays = item.late_days ?? 0;
        if (penalty <= 0) {
            return 'Tidak ada denda';
        }

        return `Denda ${currencyFormatter.format(penalty)}${lateDays > 0 ? ` (${lateDays} hari)` : ''}`;
    }

    if (status === 'rusak' || status === 'hilang') {
        return noteFromOfficer || 'Catatan belum diisi';
    }

    if (status === 'ditolak') {
        return item.pengembalian?.catatan?.trim() || 'Peminjaman ditolak';
    }

    return '-';
};

const statusFilterOptions = [
    { value: 'semua', label: 'Semua Status' },
    { value: 'menunggu', label: 'Proses Pengecekan' },
    { value: 'ditolak', label: 'Ditolak' },
    { value: 'tepat waktu', label: 'Tepat Waktu' },
    { value: 'telat', label: 'Telat' },
    { value: 'rusak', label: 'Rusak' },
    { value: 'hilang', label: 'Hilang' },
];

export default function PenggunaRiwayatPeminjamanPage() {
    const { items } = usePage<PageProps>().props;
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('semua');

    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            const normalizedStatus = normalizeReturnStatus(item.return_status);
            const matchesStatus =
                statusFilter === 'semua' || normalizedStatus === statusFilter;
            const matchesSearch = item.nama_alat
                .toLowerCase()
                .includes(searchTerm.toLowerCase().trim());
            return matchesStatus && matchesSearch;
        });
    }, [items, searchTerm, statusFilter]);

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
    } = usePagination(filteredItems, 10);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Riwayat Peminjaman" />

            <div className="space-y-6 bg-[#F5F1EA] p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold tracking-[0.25em] text-[#547792] uppercase">
                            Riwayat Peminjaman
                        </p>
                        <h1 className="mt-2 text-3xl font-bold text-[#1A3263]">
                            Riwayat Peminjaman
                        </h1>
                        <p className="mt-1 text-sm text-[#547792]">
                            Rekam kembali pengembalian alat yang sudah selesai
                            untuk memantau status akhir.
                        </p>
                    </div>
                </div>

                <div className="rounded-3xl border border-[#E8E2DB] bg-white shadow-sm">
                    <div className="border-b border-[#E8E2DB] px-6 py-5">
                        <Link
                            href="/daftar-alat"
                            className="inline-flex items-center gap-2 rounded-full bg-[#1A3263] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#1A3263]/30 transition hover:bg-[#0F1D3A]"
                        >
                            <Plus className="h-4 w-4" /> Ajukan Peminjaman
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-[#E8E2DB] text-sm">
                            <thead className="text-left text-xs font-semibold tracking-wide text-[#547792] uppercase">
                                <tr className="bg-[#E8E2DB]">
                                    <th className="px-4 py-4">No</th>
                                    <th className="px-4 py-4">Aksi</th>
                                    <th className="px-4 py-4">Status</th>
                                    <th className="px-4 py-4">Nama Barang</th>
                                    <th className="px-4 py-4">Nama Peminjam</th>
                                    <th className="px-4 py-4">Jumlah</th>
                                    <th className="px-4 py-4">
                                        Batas Peminjaman
                                    </th>
                                    <th className="px-4 py-4">
                                        Tanggal Dikembalikan
                                    </th>
                                    <th className="px-4 py-4">Catatan</th>
                                </tr>
                                <tr className="bg-white text-[11px] font-normal text-[#547792]">
                                    <th />
                                    <th />
                                    <th className="px-4 py-3">
                                        <label className="sr-only">
                                            Filter status
                                        </label>
                                        <select
                                            value={statusFilter}
                                            onChange={(event) =>
                                                setStatusFilter(
                                                    event.target.value,
                                                )
                                            }
                                            className="w-full rounded-2xl border border-[#D7DFEE] px-3 py-2 text-xs font-semibold text-[#1A3263] focus:border-[#1A3263] focus:outline-none"
                                        >
                                            {statusFilterOptions.map(
                                                (option) => (
                                                    <option
                                                        key={option.value}
                                                        value={option.value}
                                                    >
                                                        {option.label}
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                    </th>
                                    <th className="px-4 py-3">
                                        <label className="sr-only">
                                            Cari nama barang
                                        </label>
                                        <input
                                            value={searchTerm}
                                            onChange={(event) =>
                                                setSearchTerm(
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Cari nama barang"
                                            className="w-full rounded-2xl border border-[#D7DFEE] bg-[#F8FAFC] px-3 py-2 text-xs text-[#1A3263] placeholder:text-[#94A3B8] focus:border-[#1A3263] focus:outline-none"
                                        />
                                    </th>
                                    <th />
                                    <th />
                                    <th />
                                    <th />
                                    <th />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F0EBE2] bg-white">
                                {paginatedItems.map((item, index) => {
                                    const normalizedStatus =
                                        normalizeReturnStatus(
                                            item.return_status,
                                        );
                                    const metadata =
                                        statusDisplayConfig[normalizedStatus] ??
                                        statusDisplayConfig.menunggu;
                                    return (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-[#F8F6F1]"
                                        >
                                            <td className="px-4 py-4 font-semibold">
                                                {from + index}
                                            </td>
                                            <td className="px-4 py-4">
                                                <Link
                                                    href={item.detail_url}
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E0E7FF] text-[#1A3263] transition hover:bg-[#EEF2FF]"
                                                    title="Detail"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span
                                                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold ${metadata.palette}`}
                                                >
                                                    <span
                                                        className={`h-2.5 w-2.5 rounded-full ${metadata.dot}`}
                                                    />
                                                    {metadata.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 font-semibold text-[#1A3263]">
                                                {item.nama_alat}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-[#547792]">
                                                {item.nama_peminjam}
                                            </td>
                                            <td className="px-4 py-4 font-semibold">
                                                {item.jumlah}
                                            </td>
                                            <td className="px-4 py-4">
                                                {formatDate(
                                                    item.batas_peminjaman,
                                                )}
                                            </td>
                                            <td className="px-4 py-4">
                                                {formatDate(
                                                    item.tanggal_dikembalikan,
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-[#1A3263]">
                                                {resolveNote(item)}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredItems.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={9}
                                            className="py-10 text-center text-sm text-[#547792]"
                                        >
                                            Belum ada riwayat pengembalian untuk
                                            saat ini.
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
