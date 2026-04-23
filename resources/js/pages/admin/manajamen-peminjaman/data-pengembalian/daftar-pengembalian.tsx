import { Head, Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { CheckCircle, Eye, PencilLine, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { usePagination } from '@/hooks/use-pagination';
import { Pagination } from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';
import adminRoutes from '@/routes/admin';
import type { BreadcrumbItem, SharedData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    {
        title: 'Manajemen Peminjaman',
        href: '/admin/data-peminjaman/peminjaman',
    },
    {
        title: 'Data Pengembalian',
        href: '/admin/data-pengembalian/pengembalian',
    },
];

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
});

const formatDate = (value?: string | null) =>
    value ? dateFormatter.format(new Date(value)) : '-';

const currencyFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
});

type ReturnStatus = 'menunggu' | 'tepat waktu' | 'telat' | 'rusak' | 'hilang';

type ReturnRow = {
    pengembalian_id: number;
    loan_id: number | null;
    nama_barang: string;
    peminjam: string;
    kelas: string;
    jumlah: number;
    batas_peminjaman?: string | null;
    tanggal_dikembalikan?: string | null;
    status: ReturnStatus;
    catatan_admin?: string | null;
    lampiran_url?: string | null;
    lampiran_name?: string | null;
    telat_hari?: number | null;
    total_denda?: number | null;
};

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

const statusOptions: { value: ReturnStatus; label: string }[] = (
    Object.keys(statusConfig) as ReturnStatus[]
).map((value) => ({
    value,
    label: statusConfig[value].label,
}));

const statusFilterOptions: { value: ReturnStatus | 'semua'; label: string }[] =
    [{ value: 'semua', label: 'Semua Status' }, ...statusOptions];

type PageProps = SharedData & {
    items: ReturnRow[];
    filters: {
        search?: string | null;
        status?: ReturnStatus | 'semua';
    };
};

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
        return item.catatan_admin?.trim() || 'Catatan belum diisi';
    }

    return '-';
};

export default function AdminDataPengembalianPage() {
    const { items, filters } = usePage<PageProps>().props;
    const [searchTerm, setSearchTerm] = useState(filters.search ?? '');
    const [statusFilter, setStatusFilter] = useState<ReturnStatus | 'semua'>(
        filters.status ?? 'semua',
    );
    const [selected, setSelected] = useState<number[]>([]);
    const [editingStatusId, setEditingStatusId] = useState<number | null>(null);
    const [pendingStatus, setPendingStatus] =
        useState<ReturnStatus>('menunggu');
    const [pendingNote, setPendingNote] = useState('');
    const [statusLoadingId, setStatusLoadingId] = useState<number | null>(null);
    const [bulkLoading, setBulkLoading] = useState(false);
    const [detailReturn, setDetailReturn] = useState<ReturnRow | null>(null);

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

    const visitWithFilters = (overrides?: {
        search?: string;
        status?: ReturnStatus | 'semua';
    }) => {
        router.get(
            '/admin/data-pengembalian/pengembalian',
            {
                search: overrides?.search ?? searchTerm,
                status: overrides?.status ?? statusFilter,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

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
    }, [searchTerm, statusFilter, filters.search, filters.status]);

    useEffect(() => {
        setSelected((prev) =>
            prev.filter((id) =>
                items.some((item) => item.pengembalian_id === id),
            ),
        );
    }, [items]);

    const allDisplayedSelected =
        items.length > 0 &&
        items.every((item) => selected.includes(item.pengembalian_id));
    const hasSelected = selected.length > 0;

    const toggleSelect = (id: number) => {
        setSelected((prev) =>
            prev.includes(id)
                ? prev.filter((value) => value !== id)
                : [...prev, id],
        );
    };

    const toggleSelectAll = () => {
        if (allDisplayedSelected) {
            setSelected((prev) =>
                prev.filter(
                    (value) =>
                        !items.some((item) => item.pengembalian_id === value),
                ),
            );
            return;
        }
        setSelected((prev) => [
            ...new Set([...prev, ...items.map((item) => item.pengembalian_id)]),
        ]);
    };

    const beginStatusEdit = (item: ReturnRow) => {
        setEditingStatusId(item.pengembalian_id);
        setPendingStatus(item.status);
        setPendingNote(item.catatan_admin ?? '');
    };

    const cancelStatusEdit = () => {
        setEditingStatusId(null);
        setPendingNote('');
    };

    const submitStatusEdit = async (item: ReturnRow) => {
        const requiresNote =
            pendingStatus === 'rusak' || pendingStatus === 'hilang';
        const trimmedNote = pendingNote.trim();

        if (requiresNote && trimmedNote === '') {
            Swal.fire(
                'Catatan wajib',
                'Mohon isi catatan untuk status rusak atau hilang.',
                'warning',
            );
            return;
        }

        setStatusLoadingId(item.pengembalian_id);
        try {
            await axios.patch(
                `/admin/data-pengembalian/pengembalian/${item.pengembalian_id}/status`,
                {
                    status: pendingStatus,
                    catatan_admin: requiresNote ? trimmedNote : null,
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

    const handleDelete = (id: number) => {
        Swal.fire({
            title: 'Hapus Pengembalian',
            text: 'Yakin ingin menghapus catatan pengembalian ini?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DC2626',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Hapus',
        }).then((result) => {
            if (!result.isConfirmed) {
                return;
            }
            router.delete(`/admin/data-pengembalian/pengembalian/${id}`, {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    Swal.fire(
                        'Terhapus',
                        'Data pengembalian dihapus.',
                        'success',
                    );
                },
                onError: () => {
                    Swal.fire('Gagal', 'Tidak dapat menghapus data.', 'error');
                },
            });
        });
    };

    const handleBulkDelete = () => {
        if (!hasSelected) {
            return;
        }
        Swal.fire({
            title: 'Hapus data terpilih',
            text: 'Hapus semua catatan pengembalian yang dipilih?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DC2626',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Hapus',
        }).then((result) => {
            if (!result.isConfirmed) {
                return;
            }
            router.delete('/admin/data-pengembalian/pengembalian/bulk-delete', {
                data: { ids: selected },
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setSelected([]);
                    Swal.fire('Terhapus', 'Data terpilih dihapus.', 'success');
                },
                onError: () => {
                    Swal.fire('Gagal', 'Tidak dapat menghapus data.', 'error');
                },
            });
        });
    };

    const handleBulkConfirm = async () => {
        if (!hasSelected) {
            return;
        }
        setBulkLoading(true);
        try {
            await axios.patch(
                '/admin/data-pengembalian/pengembalian/bulk-status',
                {
                    ids: selected,
                    status: 'tepat waktu',
                },
            );
            setSelected([]);
            Swal.fire('Berhasil', 'Status pengembalian diperbarui.', 'success');
            router.reload({ only: ['items'] });
        } catch (error) {
            Swal.fire('Gagal', 'Tidak dapat memperbarui status.', 'error');
        } finally {
            setBulkLoading(false);
        }
    };

    const closeDetailReturn = () => setDetailReturn(null);

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
                        Pantau pengembalian dengan status pemeriksaan serta
                        catat tanggal ketika pengguna menyerahkan buku.
                    </p>
                </div>

                <div className="rounded-3xl border border-[#E8E2DB] bg-white shadow-sm">
                    <div className="space-y-4 border-b border-[#E8E2DB] p-6">
                        <div className="flex flex-wrap items-center gap-3">
                            <Link
                                href={
                                    adminRoutes.dataPengembalian.pengembalian.tambah()
                                        .url
                                }
                                className="inline-flex items-center gap-2 rounded-xl bg-[#1A3263] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#1A3263]/30 transition hover:bg-[#547792]"
                            >
                                <Plus className="h-4 w-4" /> Tambah Pengembalian
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
                                disabled={!hasSelected || bulkLoading}
                                onClick={handleBulkConfirm}
                                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                                    hasSelected && !bulkLoading
                                        ? 'bg-[#CDE8D6] text-[#1A3263] hover:bg-[#B5DBBF]'
                                        : 'cursor-not-allowed bg-slate-100 text-slate-400'
                                }`}
                            >
                                <CheckCircle className="h-4 w-4" /> Tandai Tepat
                                Waktu
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
                        <table className="min-w-[1100px] divide-y divide-[#E8E2DB]">
                            <thead className="text-left text-xs font-semibold tracking-wide text-[#547792] uppercase">
                                <tr className="bg-[#E8E2DB]">
                                    <th className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            className="size-4 rounded border-[#1A3263] text-[#1A3263] focus:ring-[#1A3263]"
                                            checked={allDisplayedSelected}
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th className="px-2 py-4">No</th>
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
                                <tr className="bg-white text-[11px] font-normal tracking-normal text-[#547792] uppercase">
                                    <th className="px-6 py-3" />
                                    <th className="px-2 py-3" />
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
                                            className="w-full rounded-2xl border border-[#D7DFEE] text-xs font-semibold text-[#1A3263] focus:border-[#1A3263] focus:outline-none"
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
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F0EBE2] bg-white">
                                {paginatedItems.map((item, index) => {
                                    const isSelected = selected.includes(
                                        item.pengembalian_id,
                                    );
                                    return (
                                        <tr
                                            key={item.pengembalian_id}
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
                                                        toggleSelect(
                                                            item.pengembalian_id,
                                                        )
                                                    }
                                                />
                                            </td>
                                            <td className="px-2 py-4 font-semibold text-[#1A3263]">
                                                {from + index}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2 text-[#1A3263]">
                                                    {item.loan_id && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setDetailReturn(
                                                                    item,
                                                                )
                                                            }
                                                            title="Detail"
                                                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E0E7FF] transition hover:bg-[#EEF2FF]"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                    {item.pengembalian_id && (
                                                        <Link
                                                            href={
                                                                adminRoutes.dataPengembalian.pengembalian.edit(
                                                                    {
                                                                        pengembalian:
                                                                            item.pengembalian_id,
                                                                    },
                                                                ).url
                                                            }
                                                            title="Edit"
                                                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#1A3263] transition hover:bg-[#EEF3FF]"
                                                        >
                                                            <PencilLine className="h-4 w-4" />
                                                        </Link>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDelete(
                                                                item.pengembalian_id,
                                                            )
                                                        }
                                                        title="Hapus"
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#FEE2E2] text-[#B91C1C] transition hover:bg-[#FEE2E2]"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-[#1A3263]">
                                                {editingStatusId ===
                                                item.pengembalian_id ? (
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <select
                                                            value={
                                                                pendingStatus
                                                            }
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
                                                                value={
                                                                    pendingNote
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    setPendingNote(
                                                                        event
                                                                            .target
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
                                                            beginStatusEdit(
                                                                item,
                                                            )
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
                                                <p className="font-semibold">
                                                    {item.nama_barang}
                                                </p>
                                            </td>
                                            <td className="px-4 py-4 text-[#1A3263]">
                                                <p className="font-medium">
                                                    {item.peminjam}
                                                </p>
                                                <p className="text-xs text-[#547792]">
                                                    {item.kelas}
                                                </p>
                                            </td>
                                            <td className="px-4 py-4 text-[#1A3263]">
                                                {item.jumlah}
                                            </td>
                                            <td className="px-4 py-4 text-[#547792]">
                                                {formatDate(
                                                    item.batas_peminjaman,
                                                )}
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
                                    );
                                })}
                                {items.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={10}
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
            {detailReturn ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur"
                        onClick={closeDetailReturn}
                    />
                    <div className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#E8E2DB] px-6 py-4">
                            <div>
                                <p className="text-xs font-semibold tracking-[0.25em] text-[#547792] uppercase">
                                    Detail Pengembalian
                                </p>
                                <h2 className="text-xl font-bold text-[#1A3263]">
                                    {detailReturn.nama_barang}
                                </h2>
                                <p className="text-xs text-[#547792]">
                                    {detailReturn.peminjam} · Kelas{' '}
                                    {detailReturn.kelas}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeDetailReturn}
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
                                    {detailReturn.jumlah} unit
                                </p>
                                <p>
                                    <span className="font-semibold">
                                        Batas Pinjam:
                                    </span>{' '}
                                    {formatDate(detailReturn.batas_peminjaman)}
                                </p>
                                <p>
                                    <span className="font-semibold">
                                        Dikembalikan:
                                    </span>{' '}
                                    {formatDate(
                                        detailReturn.tanggal_dikembalikan,
                                    )}
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="font-semibold">Status:</span>
                                {renderStatusBadge(detailReturn.status)}
                            </div>
                            <div>
                                <p className="text-xs font-semibold tracking-[0.25em] text-[#547792] uppercase">
                                    Bukti Foto
                                </p>
                                {detailReturn.lampiran_url ? (
                                    <a
                                        href={detailReturn.lampiran_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-2 block overflow-hidden rounded-2xl border border-[#E8E2DB] bg-[#F8FAFC]"
                                    >
                                        <img
                                            src={detailReturn.lampiran_url}
                                            alt={
                                                detailReturn.lampiran_name
                                                    ? `Bukti pengembalian ${detailReturn.lampiran_name}`
                                                    : 'Bukti pengembalian'
                                            }
                                            className="h-64 w-full object-cover"
                                        />
                                        <div className="px-4 py-3 text-xs text-[#547792]">
                                            {detailReturn.lampiran_name ??
                                                'Lihat file bukti pengembalian'}
                                        </div>
                                    </a>
                                ) : (
                                    <p className="mt-1 text-sm text-[#547792]">
                                        Bukti foto belum tersedia.
                                    </p>
                                )}
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-[#547792] uppercase">
                                    Catatan
                                </p>
                                <p className="mt-1 text-sm text-[#1A3263]">
                                    {renderNote(detailReturn)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </AppLayout>
    );
}
