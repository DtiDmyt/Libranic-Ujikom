import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Eye, PencilLine, Plus, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import AppLayout from '@/layouts/app-layout';
import adminRoutes from '@/routes/admin';
import type { BreadcrumbItem, SharedData } from '@/types';
import {
    alertError,
    alertLoading,
    alertSuccess,
    closeAlert,
} from '@/lib/alert';

type LoanCondition = 'baik' | 'rusak' | 'hilang';

type LoanRow = {
    id: number;
    nama_barang: string;
    peminjam: string;
    kelas: string;
    jumlah: number;
    kondisi_barang: LoanCondition;
    tanggal_pinjam: string;
    tanggal_pengembalian: string;
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
        kondisi: LoanCondition | 'semua';
    };
    borrowers: BorrowerOption[];
    flash?: {
        success?: string;
        error?: string;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: adminRoutes.dashboard().url },
    { title: 'Manajemen Peminjaman', href: '/admin/peminjaman' },
    { title: 'Data Peminjaman', href: '/admin/peminjaman' },
];

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
});

const formatDate = (value?: string | null) =>
    value ? dateFormatter.format(new Date(value)) : '-';

export default function AdminDataPeminjamanPage() {
    const { items, filters, borrowers, flash } = usePage<PageProps>().props;

    const [selected, setSelected] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState(filters.search ?? '');

    useEffect(() => {
        setSearchTerm(filters.search ?? '');
        setSelected((prev) =>
            prev.filter((id) => items.some((item) => item.id === id)),
        );
    }, [filters.search, items]);

    useEffect(() => {
        if (flash?.success) {
            alertSuccess(flash.success);
        } else if (flash?.error) {
            alertError(flash.error);
        }
    }, [flash?.success, flash?.error]);

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

    const visitWithFilters = (overrides?: { search?: string }) => {
        const query: Record<string, unknown> = {
            search: overrides?.search ?? searchTerm,
        };

        router.get('/admin/peminjaman/data', query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const toggleSelect = (id: number) => {
        setSelected((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id],
        );
    };

    const toggleSelectAll = () => {
        setSelected((prev) =>
            prev.length === items.length ? [] : items.map((item) => item.id),
        );
    };

    const allSelected = items.length > 0 && selected.length === items.length;
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
            router.delete('/admin/peminjaman/data/bulk-delete', {
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
            '/admin/peminjaman/data/bulk-selesai',
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
            router.delete(`/admin/peminjaman/data/${id}`, {
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

    const handleMarkComplete = (id: number) => {
        alertLoading('Menandai peminjaman selesai...');
        router.patch(
            `/admin/peminjaman/data/${id}/selesai`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    closeAlert();
                    alertSuccess('Peminjaman ditandai selesai.');
                },
                onError: () => {
                    closeAlert();
                    alertError('Tidak dapat menandai selesai.');
                },
            },
        );
    };

    const borrowerMap = useMemo(() => {
        const map = new Map<string, BorrowerOption>();
        borrowers.forEach((borrower) => {
            map.set(borrower.nama, borrower);
        });
        return map;
    }, [borrowers]);

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
                    <div className="space-y-4 border-b border-[#E8E2DB] p-6">
                        <div className="flex flex-wrap items-center gap-3">
                            <Link
                                href="/admin/peminjaman/data/tambah"
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
                                {items.map((item, index) => {
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
                                                {index + 1}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2 text-[#1A3263]">
                                                    <Link
                                                        href={`/admin/peminjaman/data/${item.id}`}
                                                        title="Detail"
                                                        aria-label="Detail"
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E0E7FF] transition hover:bg-[#EEF2FF]"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                    <Link
                                                        href={`/admin/peminjaman/data/${item.id}/edit`}
                                                        title="Edit"
                                                        aria-label="Edit"
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#1A3263] transition hover:bg-[#EEF3FF]"
                                                    >
                                                        <PencilLine className="h-4 w-4" />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleMarkComplete(
                                                                item.id,
                                                            )
                                                        }
                                                        title="Selesai"
                                                        aria-label="Selesai"
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#D1FAE5] text-[#047857] transition hover:bg-[#DCFCE7]"
                                                    >
                                                        <CheckCircle2 className="h-4 w-4" />
                                                    </button>
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
