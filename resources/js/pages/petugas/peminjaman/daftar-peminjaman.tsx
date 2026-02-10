import { Head, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import {
    alertError,
    alertLoading,
    alertSuccess,
    closeAlert,
} from '@/lib/alert';
import FormPenolakan from './form-penolakan';

type BorrowerOption = {
    nama: string;
    kelas?: string | null;
};

type LoanRow = {
    id: number;
    nama_barang: string;
    peminjam: string;
    kelas?: string | null;
    jumlah: number;
    tanggal_pinjam: string;
    tanggal_pengembalian: string;
    status?: string | null;
};

type LoanStatus = 'menunggu' | 'disetujui' | 'ditolak';
type PageProps = SharedData & {
    items: LoanRow[];
    filters: {
        search?: string | null;
        status?: string | null;
    };
    borrowers: BorrowerOption[];
    flash?: {
        success?: string;
        error?: string;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Petugas Dashboard', href: '/petugas/dashboard' },
    { title: 'Data Peminjaman', href: '/petugas/peminjaman' },
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
    ditolak: 'bg-[#FEE2E2] text-[#991B1B]',
    selesai: 'bg-[#DCFCE7] text-[#065F46]',
};

const statusFilters = [
    { value: 'semua', label: 'Semua Status' },
    { value: 'menunggu', label: 'Menunggu Persetujuan' },
    { value: 'disetujui', label: 'Disetujui' },
    { value: 'ditolak', label: 'Ditolak' },
];

const statusOptions: { value: LoanStatus; label: string }[] = [
    { value: 'menunggu', label: statusLabels.menunggu },
    { value: 'disetujui', label: statusLabels.disetujui },
    { value: 'ditolak', label: statusLabels.ditolak },
];

const renderStatusBadge = (status?: string | null) => {
    const normalized = normalizeStatusValue(status);
    const palette = statusStyles[normalized] ?? 'bg-[#E0E7FF] text-[#1E40AF]';

    return (
        <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${palette}`}
        >
            <span
                className={`h-2.5 w-2.5 rounded-full ${
                    normalized === 'disetujui'
                        ? 'bg-[#10B981]'
                        : normalized === 'ditolak'
                          ? 'bg-[#DC2626]'
                          : 'bg-[#F97316]'
                }`}
            />
            {statusLabels[normalized] ?? 'Menunggu Persetujuan'}
        </span>
    );
};

export default function PetugasDataPeminjamanPage() {
    const { items, filters, borrowers, flash } = usePage<PageProps>().props;

    const [localItems, setLocalItems] = useState(items);
    const [searchTerm, setSearchTerm] = useState(filters.search ?? '');
    const [statusFilter, setStatusFilter] = useState(filters.status ?? 'semua');
    const [editingStatusId, setEditingStatusId] = useState<number | null>(null);
    const [pendingStatus, setPendingStatus] = useState<LoanStatus>('menunggu');
    const [statusLoadingId, setStatusLoadingId] = useState<number | null>(null);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [rejectionTarget, setRejectionTarget] = useState<LoanRow | null>(
        null,
    );

    useEffect(() => {
        setLocalItems(items);
        setSearchTerm(filters.search ?? '');
        setStatusFilter(filters.status ?? 'semua');
        setEditingStatusId(null);
        setStatusLoadingId(null);
    }, [items, filters.search, filters.status]);

    useEffect(() => {
        if (flash?.success) {
            alertSuccess(flash.success);
        } else if (flash?.error) {
            alertError(flash.error);
        }
    }, [flash?.success, flash?.error]);

    useEffect(() => {
        const synced =
            searchTerm === (filters.search ?? '') &&
            statusFilter === (filters.status ?? 'semua');

        if (synced) {
            return;
        }

        const timeout = window.setTimeout(() => {
            const query: Record<string, unknown> = {
                search: searchTerm,
                status: statusFilter,
            };

            router.get('/petugas/peminjaman', query, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 400);

        return () => window.clearTimeout(timeout);
    }, [searchTerm, statusFilter, filters.search, filters.status]);

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
            await axios.patch(`/petugas/peminjaman/${id}/status`, payload);
            setLocalItems((prev) =>
                prev.map((item) =>
                    item.id === id
                        ? {
                              ...item,
                              status,
                          }
                        : item,
                ),
            );
            cancelStatusEdit();
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
        setStatusLoadingId(rejectionTarget.id);
        updateLoanStatus(rejectionTarget.id, 'ditolak', { reason });
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
                        Pantau seluruh transaksi peminjaman alat yang sedang
                        berjalan ataupun selesai.
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
                                </tr>
                                <tr className="bg-white text-[11px] font-normal tracking-normal text-[#547792] uppercase">
                                    <th className="px-4 py-3" />
                                    <th className="px-4 py-3">
                                        <select
                                            value={statusFilter}
                                            onChange={(event) =>
                                                setStatusFilter(
                                                    event.target.value,
                                                )
                                            }
                                            className="w-full rounded-2xl border border-[#D7DFEE] bg-white px-3 py-2 text-xs font-semibold text-[#1A3263] focus:border-[#1A3263] focus:outline-none"
                                        >
                                            {statusFilters.map((option) => (
                                                <option
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </option>
                                            ))}
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
                                            className="w-full max-w-md rounded-2xl border border-[#D7DFEE] bg-white px-3 py-2 text-sm text-[#1A3263] placeholder:text-slate-400 focus:border-[#1A3263] focus:outline-none"
                                            placeholder="Cari nama barang / peminjam"
                                        />
                                    </th>
                                    <th className="px-4 py-3" />
                                    <th className="px-4 py-3" />
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F0EBE2] bg-white">
                                {localItems.map((item, index) => (
                                    <tr
                                        key={item.id}
                                        className="text-sm transition hover:bg-[#F8F6F1]"
                                    >
                                        <td className="px-4 py-4 font-semibold text-[#1A3263]">
                                            {index + 1}
                                        </td>
                                        <td className="px-4 py-4 text-[#1A3263]">
                                            {editingStatusId === item.id ? (
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <select
                                                        value={pendingStatus}
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
                                                        beginStatusEdit(item)
                                                    }
                                                    className="text-left"
                                                    title="Ubah status peminjaman"
                                                >
                                                    {renderStatusBadge(
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
                                                {borrowerMap.get(item.peminjam)
                                                    ?.kelas ?? '-'}
                                            </p>
                                        </td>
                                        <td className="px-4 py-4 text-[#1A3263]">
                                            {item.jumlah}
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
                                {localItems.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-6 py-10 text-center text-sm text-[#547792]"
                                        >
                                            Tidak ada data peminjaman.
                                        </td>
                                    </tr>
                                ) : null}
                            </tbody>
                        </table>
                    </div>

                    <div className="border-t border-[#E8E2DB] px-6 py-4 text-sm text-[#547792]">
                        Menampilkan {localItems.length} data
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
        </AppLayout>
    );
}
