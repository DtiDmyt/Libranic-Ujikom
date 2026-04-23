import { Head, Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Eye, PencilLine, Plus, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { usePagination } from '@/hooks/use-pagination';
import { Pagination } from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';
import adminRoutes from '@/routes/admin';
import type { BreadcrumbItem, SharedData } from '@/types';
import {
    alertError,
    alertLoading,
    alertSuccess,
    closeAlert,
} from '@/lib/alert';
import FormPenolakan from './form-penolakan';

type LoanCondition = 'baik' | 'rusak' | 'hilang';

type BorrowerOption = {
    nama: string;
    kelas?: string | null;
};

type LoanRow = {
    id: number;
    nama_barang: string;
    peminjam: string;
    kelas: string;
    jumlah: number;
    kondisi_barang: LoanCondition;
    tanggal_pinjam: string;
    tanggal_pengembalian: string;
    status?: string | null;
    return_status?: ReturnStatus | null;
    return_status_label?: string | null;
};

type LoanStatus = 'menunggu' | 'disetujui' | 'ditolak';
type ReturnStatus = 'menunggu' | 'tepat waktu' | 'telat' | 'rusak' | 'hilang';

type PageProps = SharedData & {
    items: LoanRow[];
    filters: {
        search?: string | null;
        status?: LoanStatus | 'semua' | null;
        kondisi: LoanCondition | 'semua';
    };
    borrowers: BorrowerOption[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: adminRoutes.dashboard().url },
    {
        title: 'Manajemen Peminjaman',
        href: '/admin/data-peminjaman/peminjaman',
    },
    { title: 'Data Peminjaman', href: '/admin/data-peminjaman/peminjaman' },
];

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
});

const formatDate = (value?: string | null) =>
    value ? dateFormatter.format(new Date(value)) : '-';

const normalizeStatusValue = (status?: string | null): string => {
    if (!status) {
        return 'menunggu';
    }

    const normalized = status.toLowerCase().trim();
    if (normalized === 'menunggu persetujuan' || normalized === 'pending') {
        return 'menunggu';
    }

    if (normalized === 'selesai') {
        return 'disetujui';
    }

    return normalized;
};

const statusLabels: Record<string, string> = {
    menunggu: 'Menunggu Persetujuan',
    'menunggu persetujuan': 'Menunggu Persetujuan',
    pending: 'Menunggu Persetujuan',
    disetujui: 'Disetujui',
    ditolak: 'Ditolak',
    selesai: 'Selesai',
};

const statusStyles: Record<string, string> = {
    menunggu: 'bg-[#FEF3C7] text-[#C2410C]',
    'menunggu persetujuan': 'bg-[#FEF3C7] text-[#C2410C]',
    pending: 'bg-[#FEF3C7] text-[#C2410C]',
    disetujui: 'bg-[#ECFDF5] text-[#065F46]',
    selesai: 'bg-[#DCFCE7] text-[#065F46]',
    ditolak: 'bg-[#FEE2E2] text-[#991B1B]',
};

const statusOptions: { value: LoanStatus; label: string }[] = [
    { value: 'menunggu', label: statusLabels.menunggu },
    { value: 'disetujui', label: statusLabels.disetujui },
    { value: 'ditolak', label: statusLabels.ditolak },
];

const statusFilterOptions = [
    { value: 'semua', label: 'Semua Status' },
    { value: 'menunggu', label: 'Proses Pengecekan' },
    { value: 'disetujui', label: 'Disetujui' },
    { value: 'ditolak', label: 'Ditolak' },
];

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

const normalizeEditableStatus = (status?: string | null): LoanStatus => {
    const normalized = normalizeStatusValue(status);
    if (normalized === 'disetujui') {
        return 'disetujui';
    }
    if (normalized === 'ditolak') {
        return 'ditolak';
    }
    return 'menunggu';
};

const formatStatusLabel = (status?: string | null): string => {
    const normalized = normalizeStatusValue(status);
    return statusLabels[normalized] ?? 'Menunggu Persetujuan';
};

const renderWorkflowStatusBadge = (status?: string | null) => {
    const normalized = normalizeStatusValue(status);
    const palette = statusStyles[normalized] ?? 'bg-[#FEF3C7] text-[#C2410C]';

    return (
        <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${palette}`}
        >
            <span
                className={`h-2.5 w-2.5 rounded-full ${
                    normalized === 'disetujui'
                        ? 'bg-[#059669]'
                        : normalized === 'ditolak'
                          ? 'bg-[#B91C1C]'
                          : 'bg-[#F97316]'
                }`}
            />
            {formatStatusLabel(status)}
        </span>
    );
};

const renderReturnStatusBadge = (status: ReturnStatus) => {
    const metadata = returnStatusConfig[status] ?? returnStatusConfig.menunggu;
    return (
        <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${metadata.palette}`}
        >
            <span className={`h-2.5 w-2.5 rounded-full ${metadata.dot}`} />
            {metadata.label}
        </span>
    );
};

export default function AdminDataPeminjamanPage() {
    const { items, filters, borrowers } = usePage<PageProps>().props;

    const [localItems, setLocalItems] = useState(items);
    const [selected, setSelected] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState(filters.search ?? '');
    const [editingStatusId, setEditingStatusId] = useState<number | null>(null);
    const [pendingStatus, setPendingStatus] = useState<LoanStatus>('menunggu');
    const [statusLoadingId, setStatusLoadingId] = useState<number | null>(null);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [rejectionTarget, setRejectionTarget] = useState<LoanRow | null>(
        null,
    );
    const [detailLoan, setDetailLoan] = useState<LoanRow | null>(null);
    const [statusFilter, setStatusFilter] = useState<'semua' | LoanStatus>(
        filters.status ?? 'semua',
    );

    useEffect(() => {
        setSearchTerm(filters.search ?? '');
        setSelected((prev) =>
            prev.filter((id) => items.some((item) => item.id === id)),
        );
        setLocalItems(items);
        setEditingStatusId(null);
        setStatusLoadingId(null);
        setStatusFilter(filters.status ?? 'semua');
    }, [items, filters.search, filters.status]);

    useEffect(() => {
        if (searchTerm === (filters.search ?? '')) {
            return;
        }

        const timeout = window.setTimeout(() => {
            visitWithFilters({ search: searchTerm });
        }, 400);

        return () => window.clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm]);

    const hideRejectModal = () => {
        setRejectModalOpen(false);
        setRejectionTarget(null);
    };

    const cancelRejectModal = () => {
        if (rejectionTarget) {
            setPendingStatus(normalizeEditableStatus(rejectionTarget.status));
        }
        hideRejectModal();
    };

    const visitWithFilters = (overrides?: {
        search?: string;
        status?: 'semua' | LoanStatus;
    }) => {
        const query = {
            search: overrides?.search ?? searchTerm,
            status: overrides?.status ?? statusFilter,
        };

        router.get('/admin/data-peminjaman/peminjaman', query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const nextStatus = event.target.value as 'semua' | LoanStatus;
        setStatusFilter(nextStatus);
        visitWithFilters({ status: nextStatus });
    };

    const toggleSelect = (id: number) => {
        setSelected((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id],
        );
    };

    const visibleItems = useMemo(() => {
        if (statusFilter === 'semua') {
            return localItems;
        }

        return localItems.filter(
            (item) => normalizeStatusValue(item.status) === statusFilter,
        );
    }, [localItems, statusFilter]);

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
    } = usePagination(visibleItems, 10);

    const toggleSelectAll = () => {
        if (
            visibleItems.length > 0 &&
            visibleItems.every((item) => selected.includes(item.id))
        ) {
            setSelected((prev) =>
                prev.filter(
                    (id) => !visibleItems.some((item) => item.id === id),
                ),
            );
            return;
        }

        setSelected((prev) => [
            ...new Set([...prev, ...visibleItems.map((item) => item.id)]),
        ]);
    };

    const allSelected =
        visibleItems.length > 0 &&
        visibleItems.every((item) => selected.includes(item.id));
    const hasSelected = selected.length > 0;

    const handleBulkDelete = () => {
        if (!hasSelected) return;

        Swal.fire({
            title: 'Hapus Peminjaman',
            text: 'Hapus semua peminjaman terpilih?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DC2626',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Hapus',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (!result.isConfirmed) return;

            alertLoading('Sedang menghapus data terpilih...');
            router.delete('/admin/data-peminjaman/peminjaman/bulk-delete', {
                data: { ids: selected },
                preserveScroll: true,
                onSuccess: () => {
                    setSelected([]);
                    closeAlert();
                    alertSuccess('Data terpilih berhasil dihapus.');
                },
                onError: () => {
                    closeAlert();
                    alertError('Gagal menghapus data terpilih.');
                },
            });
        });
    };

    const handleBulkReturn = () => {
        if (!hasSelected) return;

        alertLoading('Sedang memperbarui status peminjaman...');
        router.patch(
            '/admin/data-peminjaman/peminjaman/bulk-selesai',
            { ids: selected },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSelected([]);
                    closeAlert();
                    alertSuccess('Status peminjaman diperbarui.');
                },
                onError: () => {
                    closeAlert();
                    alertError('Tidak dapat memperbarui status.');
                },
            },
        );
    };

    const handleSingleDelete = (id: number) => {
        Swal.fire({
            title: 'Hapus Peminjaman',
            text: 'Yakin ingin menghapus data ini?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DC2626',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Hapus',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (!result.isConfirmed) return;

            alertLoading('Sedang menghapus data...');
            router.delete(`/admin/data-peminjaman/peminjaman/${id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelected((prev) => prev.filter((item) => item !== id));
                    closeAlert();
                    alertSuccess('Data peminjaman berhasil dihapus.');
                },
                onError: () => {
                    closeAlert();
                    alertError('Gagal menghapus data.');
                },
            });
        });
    };

    const updateLoanStatus = async (
        id: number,
        status: LoanStatus,
        options?: { reason?: string },
    ) => {
        const payload: Record<string, unknown> = { status };
        if (options?.reason) {
            payload.reason = options.reason;
        }

        const loadingMessage =
            status === 'disetujui'
                ? 'Menyetujui peminjaman...'
                : status === 'ditolak'
                  ? 'Menolak peminjaman...'
                  : 'Mengatur status menunggu...';
        const successMessage =
            status === 'disetujui'
                ? 'Peminjaman disetujui.'
                : status === 'ditolak'
                  ? 'Peminjaman ditolak.'
                  : 'Status dikembalikan ke menunggu.';
        const errorMessage =
            status === 'disetujui'
                ? 'Tidak dapat menandai selesai.'
                : status === 'ditolak'
                  ? 'Tidak dapat menolak peminjaman.'
                  : 'Tidak dapat mengatur status menunggu.';

        setStatusLoadingId(id);
        alertLoading(loadingMessage);
        try {
            await axios.patch(
                `/admin/data-peminjaman/peminjaman/${id}/status`,
                payload,
            );
            cancelStatusEdit();
            router.reload({
                only: ['items', 'filters', 'borrowers'],
            });
            closeAlert();
            alertSuccess(successMessage);
        } catch (error) {
            closeAlert();
            alertError(errorMessage);
        } finally {
            setStatusLoadingId(null);
        }
    };

    const handleRejectSubmit = (reason: string) => {
        if (!rejectionTarget) {
            return;
        }
        updateLoanStatus(rejectionTarget.id, 'ditolak', { reason });
    };

    const borrowerMap = useMemo(() => {
        const map = new Map<string, BorrowerOption>();
        borrowers.forEach((borrower) => {
            map.set(borrower.nama, borrower);
        });
        return map;
    }, [borrowers]);

    const beginStatusEdit = (item: LoanRow) => {
        setEditingStatusId(item.id);
        setPendingStatus(normalizeEditableStatus(item.status));
    };

    const cancelStatusEdit = () => {
        hideRejectModal();
        setEditingStatusId(null);
        setStatusLoadingId(null);
        setPendingStatus('menunggu');
    };

    const submitStatusEdit = (item: LoanRow) => {
        const nextStatus = pendingStatus;
        const currentStatus = normalizeEditableStatus(item.status);

        if (nextStatus === currentStatus) {
            cancelStatusEdit();
            return;
        }

        const proceed = (reason?: string) => {
            setStatusLoadingId(item.id);
            updateLoanStatus(item.id, nextStatus, { reason });
        };

        if (nextStatus === 'ditolak') {
            setRejectionTarget(item);
            setRejectModalOpen(true);
            return;
        }

        proceed();
    };

    const closeDetailLoan = () => setDetailLoan(null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Peminjaman" />
            <div className="space-y-6 bg-[#F5F1EA] p-6">
                <div>
                    <p className="text-xs font-semibold tracking-[0.25em] text-[#547792] uppercase">
                        Manajemen Peminjaman
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-4">
                        <h1 className="text-3xl font-bold text-[#1A3263]">
                            Data Peminjaman
                        </h1>
                    </div>
                    <p className="mt-1 text-sm text-[#547792]">
                        Pantau seluruh transaksi peminjaman buku yang sedang
                        berjalan ataupun selesai.
                    </p>
                </div>

                <div className="rounded-3xl border border-[#E8E2DB] bg-white shadow-sm">
                    <div className="space-y-4 border-b border-[#E8E2DB] p-6">
                        <div className="flex flex-wrap items-center gap-3">
                            <Link
                                href="/admin/data-peminjaman/peminjaman/tambah"
                                className="inline-flex items-center gap-2 rounded-xl bg-[#1A3263] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#1A3263]/30 transition hover:bg-[#547792]"
                            >
                                <Plus className="h-4 w-4" /> Tambah data
                            </Link>
                            <button
                                type="button"
                                disabled={!hasSelected}
                                onClick={handleBulkDelete}
                                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                                    hasSelected
                                        ? 'bg-[#F87171] text-white shadow-sm hover:bg-[#DC2626]'
                                        : 'cursor-not-allowed bg-slate-100 text-slate-400'
                                }`}
                            >
                                <Trash2 className="h-4 w-4" /> Hapus
                            </button>
                            <button
                                type="button"
                                disabled={!hasSelected}
                                onClick={handleBulkReturn}
                                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                                    hasSelected
                                        ? 'bg-[#CDE8D6] text-[#1A3263] hover:bg-[#B5DBBF]'
                                        : 'cursor-not-allowed bg-slate-100 text-slate-400'
                                }`}
                            >
                                <CheckCircle2 className="h-4 w-4" /> Tandai
                                selesai
                            </button>
                            <div className="mt-3 w-full border-t border-dashed border-[#E8E2DB] md:hidden" />
                            <div className="ml-auto text-xs font-semibold tracking-wide text-[#547792] uppercase">
                                {hasSelected
                                    ? `${selected.length} data dipilih`
                                    : 'Pilih data untuk aksi cepat'}
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto [-ms-overflow-style:'none'] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        <table className="min-w-[1200px] divide-y divide-[#E8E2DB]">
                            <thead className="text-left text-xs font-semibold tracking-wide text-[#547792] uppercase">
                                <tr className="bg-[#E8E2DB]">
                                    <th className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            className="size-4 rounded border-[#1A3263] text-[#1A3263] focus:ring-[#1A3263]"
                                            checked={allSelected}
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th className="px-2 py-4">No</th>
                                    <th className="px-4 py-4">Aksi</th>
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
                                </tr>
                                <tr className="bg-white text-[11px] font-normal tracking-normal text-[#547792] uppercase">
                                    <th className="px-6 py-3" />
                                    <th className="px-2 py-3" />
                                    <th className="px-4 py-3" />
                                    <th className="px-4 py-3">
                                        <select
                                            value={statusFilter}
                                            onChange={handleStatusChange}
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
                                            className="w-full rounded-2xl border border-[#D7DFEE] bg-white px-3 py-2 text-sm text-[#1A3263] placeholder:text-slate-400 focus:border-[#1A3263] focus:outline-none"
                                            placeholder="Cari nama barang / peminjam"
                                        />
                                    </th>
                                    <th className="px-4 py-3" />
                                    <th className="px-4 py-3" />
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F0EBE2] bg-white">
                                {paginatedItems.map((item, index) => {
                                    const isSelected = selected.includes(
                                        item.id,
                                    );
                                    return (
                                        <tr
                                            key={item.id}
                                            className={`text-sm transition hover:bg-[#F8F6F1] ${
                                                isSelected ? 'bg-[#FFF5DC]' : ''
                                            }`}
                                        >
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    className="size-4 rounded border-[#1A3263] text-[#1A3263] focus:ring-[#1A3263]"
                                                    checked={isSelected}
                                                    onChange={() =>
                                                        toggleSelect(item.id)
                                                    }
                                                />
                                            </td>
                                            <td className="px-2 py-4 font-semibold text-[#1A3263]">
                                                {from + index}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2 text-[#1A3263]">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setDetailLoan(item)
                                                        }
                                                        title="Detail"
                                                        aria-label="Detail"
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E0E7FF] transition hover:bg-[#EEF2FF]"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    <Link
                                                        href={`/admin/data-peminjaman/peminjaman/${item.id}/edit`}
                                                        title="Edit"
                                                        aria-label="Edit"
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#1A3263] transition hover:bg-[#EEF3FF]"
                                                    >
                                                        <PencilLine className="h-4 w-4" />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleSingleDelete(
                                                                item.id,
                                                            )
                                                        }
                                                        title="Hapus"
                                                        aria-label="Hapus"
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#FEE2E2] text-[#B91C1C] transition hover:bg-[#FEE2E2]"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-[#1A3263]">
                                                {editingStatusId === item.id ? (
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <select
                                                            value={
                                                                pendingStatus
                                                            }
                                                            onChange={(event) =>
                                                                setPendingStatus(
                                                                    event.target
                                                                        .value as LoanStatus,
                                                                )
                                                            }
                                                            className="rounded-2xl border border-[#D7DFEE] px-3 py-2 text-xs font-semibold text-[#1A3263] focus:border-[#1A3263] focus:outline-none"
                                                            disabled={
                                                                statusLoadingId ===
                                                                item.id
                                                            }
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
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                submitStatusEdit(
                                                                    item,
                                                                )
                                                            }
                                                            disabled={
                                                                statusLoadingId ===
                                                                item.id
                                                            }
                                                            className={`rounded-2xl px-3 py-2 text-xs font-semibold text-white transition ${
                                                                statusLoadingId ===
                                                                item.id
                                                                    ? 'bg-slate-300'
                                                                    : 'bg-[#1A3263] hover:bg-[#0F1D3A]'
                                                            }`}
                                                        >
                                                            {statusLoadingId ===
                                                            item.id
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
                                                                item.id
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
                                                            beginStatusEdit(
                                                                item,
                                                            )
                                                        }
                                                        className="text-left"
                                                        title="Ubah status peminjaman"
                                                    >
                                                        {renderWorkflowStatusBadge(
                                                            item.status,
                                                        )}
                                                    </button>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-[#1A3263]">
                                                <p className="font-semibold">
                                                    {item.nama_barang}
                                                </p>
                                            </td>
                                            <td className="px-4 py-4 text-[#1A3263]">
                                                <p className="font-medium">
                                                    {item.peminjam}
                                                </p>
                                                <p className="text-xs text-[#547792]">
                                                    {borrowerMap.get(
                                                        item.peminjam,
                                                    )?.kelas ?? '-'}
                                                </p>
                                            </td>
                                            <td className="px-4 py-4 text-[#1A3263]">
                                                {item.jumlah}
                                            </td>
                                            <td className="px-4 py-4 text-[#547792]">
                                                {formatDate(
                                                    item.tanggal_pinjam,
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-[#547792]">
                                                {formatDate(
                                                    item.tanggal_pengembalian,
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {visibleItems.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={9}
                                            className="px-6 py-10 text-center text-sm text-[#547792]"
                                        >
                                            Tidak ada data peminjaman.
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
            <FormPenolakan
                open={rejectModalOpen}
                loading={Boolean(
                    rejectionTarget && statusLoadingId === rejectionTarget.id,
                )}
                onClose={cancelRejectModal}
                onSubmit={handleRejectSubmit}
            />
            {detailLoan ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur"
                        onClick={closeDetailLoan}
                    />
                    <div className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#E8E2DB] px-6 py-4">
                            <div>
                                <p className="text-xs font-semibold tracking-[0.25em] text-[#547792] uppercase">
                                    Detail Peminjaman
                                </p>
                                <h2 className="text-xl font-bold text-[#1A3263]">
                                    {detailLoan.nama_barang}
                                </h2>
                                <p className="text-xs text-[#547792]">
                                    {detailLoan.peminjam} · Kelas{' '}
                                    {detailLoan.kelas}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeDetailLoan}
                                className="text-sm font-semibold text-[#1A3263] underline"
                            >
                                Tutup
                            </button>
                        </div>
                        <div className="space-y-4 p-6 text-sm text-[#1A3263]">
                            <div className="grid gap-4 md:grid-cols-3">
                                <p>
                                    <span className="font-semibold">
                                        Jumlah:
                                    </span>{' '}
                                    {detailLoan.jumlah} unit
                                </p>
                                <div className="col-span-2">
                                    <span className="font-semibold">
                                        Status:
                                    </span>{' '}
                                    {renderWorkflowStatusBadge(
                                        detailLoan.status,
                                    )}
                                </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-3">
                                <p>
                                    <span className="font-semibold">
                                        Pinjam:
                                    </span>{' '}
                                    {formatDate(detailLoan.tanggal_pinjam)}
                                </p>
                                <p>
                                    <span className="font-semibold">
                                        Kembali:
                                    </span>{' '}
                                    {formatDate(
                                        detailLoan.tanggal_pengembalian,
                                    )}
                                </p>
                                <p>
                                    <span className="font-semibold">
                                        Return:
                                    </span>{' '}
                                    {detailLoan.return_status
                                        ? renderReturnStatusBadge(
                                              detailLoan.return_status,
                                          )
                                        : '-'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </AppLayout>
    );
}
