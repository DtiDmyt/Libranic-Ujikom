import { Pagination } from '@/components/ui/pagination';
import { usePagination } from '@/hooks/use-pagination';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

type ReturnStatus = 'menunggu' | 'tepat waktu' | 'telat' | 'rusak' | 'hilang';

type ReturnRow = {
    pengembalian_id: number;
    loan_id: number | null;
    nama_barang: string;
    peminjam: string;
    kelas: string;
    jumlah: number;
    tanggal_pinjam?: string | null;
    batas_peminjaman?: string | null;
    tanggal_dikembalikan?: string | null;
    status: ReturnStatus;
    detail_url: string;
    catatan_petugas?: string | null;
    telat_hari?: number | null;
    total_denda?: number | null;
};

type PageProps = SharedData & {
    items: ReturnRow[];
    filters: {
        search?: string | null;
        status?: ReturnStatus | 'semua';
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Petugas Dashboard', href: '/petugas/dashboard' },
    { title: 'Data Pengembalian', href: '/petugas/pengembalian' },
];

const dateFormatter = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' });

const formatDate = (value?: string | null) =>
    value ? dateFormatter.format(new Date(value)) : '-';

const currencyFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
});

const statusConfig: Record<
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

const statusOptions = (Object.keys(statusConfig) as ReturnStatus[]).map(
    (value) => ({
        value,
        label: statusConfig[value].label,
    }),
);

const statusFilterOptions: { value: ReturnStatus | 'semua'; label: string }[] =
    [{ value: 'semua', label: 'Semua Status' }, ...statusOptions];

const renderStatusBadge = (status: ReturnStatus) => {
    const metadata = statusConfig[status] ?? statusConfig.menunggu;
    return (
        <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${metadata.palette}`}
        >
            <span className={`h-2.5 w-2.5 rounded-full ${metadata.dot}`} />
            {metadata.label}
        </span>
    );
};

const renderNote = (item: ReturnRow) => {
    if (item.status === 'telat') {
        const totalFine = item.total_denda ?? 0;
        if (totalFine > 0) {
            const suffix = item.telat_hari ? ` (${item.telat_hari} hari)` : '';
            return `Denda ${currencyFormatter.format(totalFine)}${suffix}`;
        }
        return 'Tidak ada denda';
    }

    if (item.status === 'rusak' || item.status === 'hilang') {
        return item.catatan_petugas?.trim() || 'Catatan belum diisi';
    }

    return '-';
};

export default function PetugasDataPengembalianPage() {
    const { items, filters } = usePage<PageProps>().props;
    const [searchTerm, setSearchTerm] = useState(filters.search ?? '');
    const [statusFilter, setStatusFilter] = useState<ReturnStatus | 'semua'>(
        filters.status ?? 'semua',
    );
    const [editingStatusId, setEditingStatusId] = useState<number | null>(null);
    const [pendingStatus, setPendingStatus] =
        useState<ReturnStatus>('menunggu');
    const [pendingNote, setPendingNote] = useState<string>('');
    const [statusLoadingId, setStatusLoadingId] = useState<number | null>(null);

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
        setEditingStatusId(null);
        setStatusLoadingId(null);
    }, [filters.search, filters.status]);

    useEffect(() => {
        if (
            searchTerm === (filters.search ?? '') &&
            statusFilter === (filters.status ?? 'semua')
        ) {
            return;
        }

        const timeout = window.setTimeout(() => {
            router.get(
                '/petugas/pengembalian',
                {
                    search: searchTerm,
                    status: statusFilter,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }, 400);

        return () => window.clearTimeout(timeout);
    }, [searchTerm, statusFilter, filters.search, filters.status]);

    const beginStatusEdit = (item: ReturnRow) => {
        setEditingStatusId(item.pengembalian_id);
        setPendingStatus(item.status);
        setPendingNote(item.catatan_petugas ?? '');
    };

    const cancelStatusEdit = () => {
        setEditingStatusId(null);
        setStatusLoadingId(null);
        setPendingNote('');
    };

    const submitStatusEdit = async (item: ReturnRow) => {
        const requiresNote =
            pendingStatus === 'rusak' || pendingStatus === 'hilang';
        const trimmedNote = pendingNote.trim();

        if (requiresNote && trimmedNote === '') {
            Swal.fire(
                'Catatan wajib',
                'Mohon isi catatan ketika status rusak atau hilang.',
                'warning',
            );
            return;
        }

        setStatusLoadingId(item.pengembalian_id);
        try {
            await axios.patch(
                `/petugas/pengembalian/${item.pengembalian_id}/status`,
                {
                    status: pendingStatus,
                    catatan_petugas: requiresNote ? trimmedNote : null,
                },
            );
            Swal.fire('Berhasil', 'Status pengembalian diperbarui.', 'success');
            setEditingStatusId(null);
            router.reload({ only: ['items'] });
        } catch (error) {
            Swal.fire('Gagal', 'Tidak dapat memperbarui status.', 'error');
        } finally {
            setStatusLoadingId(null);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Pengembalian" />
            <div className="space-y-6 bg-[#F5F1EA] p-6">
                <div>
                    <p className="text-xs font-semibold tracking-[0.25em] text-[#547792] uppercase">
                        Manajemen Peminjaman
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-4">
                        <h1 className="text-3xl font-bold text-[#1A3263]">
                            Data Pengembalian
                        </h1>
                    </div>
                    <p className="mt-1 text-sm text-[#547792]">
                        Pantau status akhir pengembalian dan ubah status
                        pemeriksaan bila diperlukan.
                    </p>
                </div>

                <div className="rounded-3xl border border-[#E8E2DB] bg-white shadow-sm">
                    <div className="overflow-x-auto [-ms-overflow-style:'none'] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        <table className="min-w-[1100px] divide-y divide-[#E8E2DB]">
                            <thead className="text-left text-xs font-semibold tracking-wide text-[#547792] uppercase">
                                <tr className="bg-[#E8E2DB]">
                                    <th className="px-4 py-4">No</th>
                                    <th className="px-4 py-4">Status</th>
                                    <th className="px-4 py-4">Nama Barang</th>
                                    <th className="px-4 py-4">Peminjam</th>
                                    <th className="px-4 py-4">Jumlah</th>
                                    <th className="px-4 py-4">
                                        Tanggal Pinjam
                                    </th>
                                    <th className="px-4 py-4">
                                        Tanggal Pengembalian
                                    </th>
                                    <th className="px-4 py-4">Catatan</th>
                                </tr>
                                <tr className="bg-white text-[11px] font-normal tracking-normal text-[#547792] uppercase">
                                    <th className="px-4 py-3" />
                                    <th className="px-4 py-3">
                                        <select
                                            value={statusFilter}
                                            onChange={(event) =>
                                                setStatusFilter(
                                                    event.target.value as
                                                        | ReturnStatus
                                                        | 'semua',
                                                )
                                            }
                                            className="w-full rounded-2xl border border-[#D7DFEE] bg-white px-3 py-2 text-xs font-semibold text-[#1A3263] focus:border-[#1A3263] focus:outline-none"
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
                                    <th className="px-4 py-3" colSpan={2}>
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(event) =>
                                                setSearchTerm(
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Cari nama barang / peminjam"
                                            className="w-full max-w-md rounded-2xl border border-[#D7DFEE] bg-white px-3 py-2 text-sm text-[#1A3263] placeholder:text-slate-400 focus:border-[#1A3263] focus:outline-none"
                                        />
                                    </th>
                                    <th className="px-4 py-3" />
                                    <th className="px-4 py-3" />
                                    <th className="px-4 py-3" />
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F0EBE2] bg-white">
                                {paginatedItems.map((item, index) => (
                                    <tr
                                        key={item.pengembalian_id}
                                        className="text-sm transition hover:bg-[#F8F6F1]"
                                    >
                                        <td className="px-4 py-4 font-semibold text-[#1A3263]">
                                            {from + index}
                                        </td>
                                        <td className="px-4 py-4 text-[#1A3263]">
                                            {editingStatusId ===
                                            item.pengembalian_id ? (
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <select
                                                        value={pendingStatus}
                                                        onChange={(event) =>
                                                            setPendingStatus(
                                                                event.target
                                                                    .value as ReturnStatus,
                                                            )
                                                        }
                                                        className="rounded-2xl border border-[#D7DFEE] px-3 py-2 text-xs font-semibold text-[#1A3263] focus:border-[#1A3263] focus:outline-none"
                                                        autoFocus
                                                    >
                                                        {statusOptions.map(
                                                            (option) => (
                                                                <option
                                                                    key={
                                                                        option.value
                                                                    }
                                                                    value={
                                                                        option.value
                                                                    }
                                                                >
                                                                    {
                                                                        option.label
                                                                    }
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                    {(pendingStatus ===
                                                        'rusak' ||
                                                        pendingStatus ===
                                                            'hilang') && (
                                                        <textarea
                                                            value={pendingNote}
                                                            onChange={(event) =>
                                                                setPendingNote(
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="Catatan kerusakan / kehilangan"
                                                            className="mt-2 w-full rounded-2xl border border-[#D7DFEE] px-3 py-2 text-xs text-[#1A3263] placeholder:text-slate-400 focus:border-[#1A3263] focus:outline-none"
                                                            rows={2}
                                                        />
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            submitStatusEdit(
                                                                item,
                                                            )
                                                        }
                                                        disabled={
                                                            statusLoadingId ===
                                                            item.pengembalian_id
                                                        }
                                                        className={`rounded-2xl px-3 py-2 text-xs font-semibold text-white ${
                                                            statusLoadingId ===
                                                            item.pengembalian_id
                                                                ? 'bg-slate-300'
                                                                : 'bg-[#1A3263] hover:bg-[#0F1D3A]'
                                                        }`}
                                                    >
                                                        {statusLoadingId ===
                                                        item.pengembalian_id
                                                            ? 'Menyimpan...'
                                                            : 'Simpan'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={
                                                            cancelStatusEdit
                                                        }
                                                        disabled={
                                                            statusLoadingId ===
                                                            item.pengembalian_id
                                                        }
                                                        className="rounded-2xl border border-[#D7DFEE] px-3 py-2 text-xs font-semibold text-[#1A3263] transition hover:bg-[#F5F7FB]"
                                                    >
                                                        Batal
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        beginStatusEdit(item)
                                                    }
                                                    className="text-left"
                                                    title="Ubah status pengembalian"
                                                >
                                                    {renderStatusBadge(
                                                        item.status,
                                                    )}
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-[#1A3263]">
                                            <Link
                                                href={item.detail_url}
                                                className="font-semibold text-[#1A3263] underline decoration-transparent transition hover:decoration-[#1A3263]"
                                            >
                                                {item.nama_barang}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-4 text-[#1A3263]">
                                            <p className="font-medium">
                                                {item.peminjam}
                                            </p>
                                            <p className="text-xs text-[#547792]">
                                                {item.kelas}
                                            </p>
                                        </td>
                                        <td className="px-4 py-4 font-semibold text-[#1A3263]">
                                            {item.jumlah}
                                        </td>
                                        <td className="px-4 py-4 text-[#547792]">
                                            {formatDate(item.tanggal_pinjam)}
                                        </td>
                                        <td className="px-4 py-4 text-[#547792]">
                                            {formatDate(
                                                item.tanggal_dikembalikan,
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-[#1A3263]">
                                            {renderNote(item)}
                                        </td>
                                    </tr>
                                ))}
                                {items.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="px-6 py-10 text-center text-sm text-[#547792]"
                                        >
                                            Belum ada pengembalian untuk
                                            ditampilkan.
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
