import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import {
    alertError,
    alertLoading,
    alertSuccess,
    closeAlert,
} from '@/lib/alert';

type LoanRow = {
    id: number;
    nama_barang: string;
    peminjam: string;
    kelas: string;
    jumlah: number;
    tanggal_pinjam: string;
    tanggal_pengembalian: string;
    status: string;
};

type BorrowerOption = {
    id: number;
    nama: string;
    kelas?: string | null;
};

type PageProps = SharedData & {
    items: LoanRow[];
    filters: {
        search: string;
        status: string;
    };
    borrowers: BorrowerOption[];
    flash?: {
        success?: string;
        error?: string;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Petugas Dashboard', href: '/petugas/dashboard' },
    { title: 'Manajemen Peminjaman', href: '/petugas/peminjaman' },
    { title: 'Data Peminjaman', href: '/petugas/peminjaman' },
];

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
});

const formatDate = (value?: string | null) =>
    value ? dateFormatter.format(new Date(value)) : '-';

const statusLabels: Record<string, string> = {
    'menunggu': 'Menunggu Persetujuan',
    'menunggu persetujuan': 'Menunggu Persetujuan',
    pending: 'Menunggu Persetujuan',
    'disetujui': 'Disetujui',
    'ditolak': 'Ditolak',
    selesai: 'Selesai',
};

const statusStyles: Record<string, string> = {
    'menunggu': 'bg-[#FEF3C7] text-[#C2410C]',
    'menunggu persetujuan': 'bg-[#FEF3C7] text-[#C2410C]',
    pending: 'bg-[#FEF3C7] text-[#C2410C]',
    'disetujui': 'bg-[#ECFDF5] text-[#115E59]',
    'ditolak': 'bg-[#FEE2E2] text-[#991B1B]',
    selesai: 'bg-[#E0F2FE] text-[#0F172A]',
};

const formatStatus = (status?: string | null) => {
    if (!status) {
        return 'Menunggu Persetujuan';
    }

    const normalized = status.toLowerCase().trim();
    return statusLabels[normalized] ??
        (status.charAt(0).toUpperCase() + status.slice(1));
};

const statusFilters = [
    { value: 'semua', label: 'Semua Status' },
    { value: 'menunggu persetujuan', label: 'Menuju Persetujuan' },
    { value: 'disetujui', label: 'Disetujui' },
    { value: 'ditolak', label: 'Ditolak' },
];

export default function PetugasDataPeminjamanPage() {
    const { items, filters, borrowers, flash } = usePage<PageProps>().props;

    const [searchTerm, setSearchTerm] = useState(filters.search ?? '');
    const [statusFilter, setStatusFilter] =
        useState(filters.status ?? 'semua');

    useEffect(() => {
        setSearchTerm(filters.search ?? '');
    }, [filters.search]);

    useEffect(() => {
        setStatusFilter(filters.status ?? 'semua');
    }, [filters.status]);

    useEffect(() => {
        if (flash?.success) {
            alertSuccess(flash.success);
        } else if (flash?.error) {
            alertError(flash.error);
        }
    }, [flash?.success, flash?.error]);

    useEffect(() => {
        const isSynced =
            searchTerm === (filters.search ?? '') &&
            statusFilter === (filters.status ?? 'semua');

        if (isSynced) {
            return;
        }

        const timeout = window.setTimeout(() => {
            visitWithFilters();
        }, 400);

        return () => window.clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, statusFilter, filters.search, filters.status]);

    const visitWithFilters = () => {
        const query: Record<string, unknown> = {
            search: searchTerm,
            status: statusFilter,
        };

        router.get('/petugas/peminjaman', query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const updateLoanStatus = (
        id: number,
        status: 'disetujui' | 'ditolak',
        options?: { reason?: string },
    ) => {
        const payload: Record<string, unknown> = { status };

        if (options?.reason) {
            payload.reason = options.reason;
        }

        const loadingMessage =
            status === 'disetujui'
                ? 'Menandai peminjaman selesai...'
                : 'Menolak peminjaman...';
        const successMessage =
            status === 'disetujui'
                ? 'Peminjaman disetujui.'
                : 'Peminjaman ditolak.';

        alertLoading(loadingMessage);
        router.patch(`/petugas/peminjaman/${id}/status`, payload, {
            preserveScroll: true,
            onSuccess: () => {
                closeAlert();
                alertSuccess(successMessage);
            },
            onError: () => {
                closeAlert();
                alertError(
                    status === 'disetujui'
                        ? 'Tidak dapat menandai selesai.'
                        : 'Tidak dapat menolak peminjaman.',
                );
            },
        });
    };

    const handleMarkComplete = (id: number) => {
        updateLoanStatus(id, 'disetujui');
    };

    const handleCancel = (id: number) => {
        Swal.fire({
            title: 'Tolak Peminjaman',
            text: 'Masukkan alasan penolakan.',
            input: 'textarea',
            inputPlaceholder: 'Jelaskan mengapa peminjaman ditolak...',
            showCancelButton: true,
            confirmButtonText: 'Kirim',
            cancelButtonText: 'Batal',
            inputValidator: (value) =>
                value?.trim() ? null : 'Alasan penolakan wajib diisi.',
        }).then((result) => {
            if (!result.isConfirmed) return;

            updateLoanStatus(id, 'ditolak', {
                reason: result.value?.trim() ?? '',
            });
        });
    };

    const borrowerMap = useMemo(() => {
        const map = new Map<string, BorrowerOption>();
        borrowers.forEach((borrower) => {
            map.set(borrower.nama, borrower);
        });
        return map;
    }, [borrowers]);

    const renderStatusBadge = (status: string) => {
        const normalized = status.toLowerCase().trim() || 'menunggu persetujuan';
        const palette = statusStyles[normalized] ?? 'bg-[#E0E7FF] text-[#1E40AF]';
        return (
            <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${palette}`}
            >
                    <span
                        className={`h-2.5 w-2.5 rounded-full ${
                            normalized === 'disetujui'
                                ? 'bg-[#059669]'
                                : normalized === 'ditolak'
                                    ? 'bg-[#991B1B]'
                                    : normalized === 'selesai'
                                        ? 'bg-[#0C4A6E]'
                                        : 'bg-[#F97316]'
                        }`}
                    />
                {formatStatus(status)}
            </span>
        );
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
                        Pantau seluruh transaksi peminjaman alat yang sedang berjalan ataupun selesai.
                    </p>
                </div>

                <div className="rounded-3xl border border-[#E8E2DB] bg-white shadow-sm">
                    <div className="overflow-x-auto [-ms-overflow-style:'none'] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        <table className="min-w-[1200px] divide-y divide-[#E8E2DB]">
                            <thead className="text-left text-xs font-semibold tracking-wide text-[#547792] uppercase">
                                <tr className="bg-[#E8E2DB]">
                                    <th className="px-4 py-4">No</th>
                                    <th className="px-4 py-4">Aksi</th>
                                    <th className="px-4 py-4">Nama Barang</th>
                                    <th className="px-4 py-4">Peminjam</th>
                                    <th className="px-4 py-4">Jumlah</th>
                                    <th className="px-4 py-4">Tanggal Pinjam</th>
                                    <th className="px-4 py-4">Tanggal Pengembalian</th>
                                    <th className="px-4 py-4">Status</th>
                                </tr>
                                <tr className="bg-white text-[11px] font-normal tracking-normal text-[#547792] uppercase">
                                    <th className="px-4 py-3" />
                                    <th className="px-4 py-3" />
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
                                    <th className="px-4 py-3">
                                        <select
                                            value={statusFilter}
                                            onChange={(event) =>
                                                setStatusFilter(event.target.value)
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
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F0EBE2] bg-white">
                                {items.map((item, index) => (
                                    <tr
                                        key={item.id}
                                        className="text-sm transition hover:bg-[#F8F6F1]"
                                    >
                                        <td className="px-4 py-4 font-semibold text-[#1A3263]">
                                            {index + 1}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2 text-[#1A3263]">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleMarkComplete(
                                                            item.id,
                                                        )
                                                    }
                                                    title="Setujui"
                                                    aria-label="Setujui"
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#D1FAE5] text-[#047857] transition hover:bg-[#DCFCE7]"
                                                >
                                                    <CheckCircle2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleCancel(item.id)
                                                    }
                                                    title="Batalkan"
                                                    aria-label="Batalkan"
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#FDE2E2] text-[#B91C1C] transition hover:bg-[#FEE2E2]"
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                </button>
                                            </div>
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
                                                {borrowerMap.get(item.peminjam)?.kelas ??
                                                    '-'}
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
                                        <td className="px-4 py-4 text-[#1A3263]">
                                            {renderStatusBadge(item.status)}
                                        </td>
                                    </tr>
                                ))}
                                {items.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={8}
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
                        Menampilkan {items.length} data
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
