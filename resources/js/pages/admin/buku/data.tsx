import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { usePagination } from '@/hooks/use-pagination';
import { Pagination } from '@/components/ui/pagination';
import {
    BookOpenText,
    CheckCircle2,
    CalendarDays,
    Eye,
    DollarSign,
    FileText,
    Layers3,
    MapPin,
    PencilLine,
    Plus,
    Tag,
    Trash2,
    X,
} from 'lucide-react';
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

type Status = 'publik' | 'draft';

type ItemRow = {
    id: number;
    nama_alat: string;
    kategori_alat?: string | null;
    ruangan: string;
    status: Status;
    denda_keterlambatan: number;
    gambar_url?: string | null;
    created_at?: string | null;
    kode_alat?: string | null;
    stok?: number | null;
    kondisi_alat?: string | null;
    deskripsi?: string | null;
};

type CategoryOption = {
    id: number;
    nama: string;
};

type PageProps = SharedData & {
    items: ItemRow[];
    filters: {
        search: string;
        status: Status | 'semua';
        kategori: number | null;
    };
    categories: CategoryOption[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: adminRoutes.dashboard().url },
    { title: 'Manajemen Buku', href: '/admin/buku' },
    { title: 'Daftar Buku', href: '/admin/buku/data' },
];

const statusLabels: Record<Status, string> = {
    publik: 'Publik',
    draft: 'Draft',
};

const statusStyles: Record<Status, string> = {
    publik: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    draft: 'bg-amber-100 text-amber-700 border border-amber-200',
};

const rupiahFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
});

const formatCurrency = (value: number) => rupiahFormatter.format(value);

const formatDate = (value?: string | null) =>
    value
        ? new Intl.DateTimeFormat('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
          }).format(new Date(value))
        : '-';

function DetailRow({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof BookOpenText;
    label: string;
    value: string;
}) {
    return (
        <div className="border-b border-[#F0E7DB] pb-3 last:border-b-0 last:pb-0">
            <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] text-[#8E9FC4] uppercase">
                <Icon className="h-4 w-4" />
                {label}
            </div>
            <p className="mt-1 text-sm leading-6 font-semibold text-[#1A3263]">
                {value}
            </p>
        </div>
    );
}

export default function AdminDataAlatPage() {
    const { items, filters, categories } = usePage<PageProps>().props;
    const { status: statusFilter, kategori: kategoriFilter } = filters;

    const [selected, setSelected] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState(filters.search ?? '');
    const [detailItem, setDetailItem] = useState<ItemRow | null>(null);

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
        setSelected((prev) =>
            prev.filter((id) => items.some((item) => item.id === id)),
        );
    }, [filters.search, items]);

    useEffect(() => {
        if (searchTerm === (filters.search ?? '')) {
            return;
        }

        const timeout = window.setTimeout(() => {
            visitWithFilters({ search: searchTerm });
        }, 450);

        return () => window.clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm]);

    const visitWithFilters = (overrides?: {
        search?: string;
        status?: Status | 'semua';
        kategori?: number | null;
    }) => {
        const query: Record<string, string | number> = {
            search: overrides?.search ?? searchTerm,
            status: overrides?.status ?? statusFilter,
        };

        const kategoriValue =
            overrides && 'kategori' in overrides
                ? overrides.kategori
                : kategoriFilter;

        if (kategoriValue) {
            query.kategori = kategoriValue;
        }

        router.get('/admin/buku/data', query, {
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
            title: 'Hapus Data',
            text: 'Hapus semua data yang dipilih?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#1A3263',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Ya, hapus',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (!result.isConfirmed) return;

            alertLoading('Sedang menghapus data terpilih...');
            router.delete('/admin/buku/data/bulk-delete', {
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

    const handleBulkStatusChange = (status: Status) => {
        if (!hasSelected) return;

        alertLoading('Sedang memperbarui status data terpilih...');
        router.patch(
            '/admin/buku/data/bulk-status',
            {
                ids: selected,
                status,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSelected([]);
                    closeAlert();
                    alertSuccess('Status data terpilih berhasil diperbarui.');
                },
                onError: () => {
                    closeAlert();
                    alertError('Gagal memperbarui status data terpilih.');
                },
            },
        );
    };

    const handleSingleDelete = (id: number) => {
        Swal.fire({
            title: 'Hapus Data',
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
            router.delete(`/admin/buku/data/${id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelected((prev) => prev.filter((item) => item !== id));
                    closeAlert();
                    alertSuccess('Data buku berhasil dihapus.');
                },
                onError: () => {
                    closeAlert();
                    alertError('Gagal menghapus data buku.');
                },
            });
        });
    };

    const handleShowDetail = (item: ItemRow) => {
        setDetailItem(item);
    };

    const closeDetailModal = () => setDetailItem(null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Daftar Buku" />
            <div className="space-y-6 bg-[#F5F1EA] p-6">
                <div>
                    <p className="text-xs font-semibold tracking-[0.25em] text-[#547792] uppercase">
                        Manajemen Buku
                    </p>
                    <h1 className="mt-2 text-3xl font-bold text-[#1A3263]">
                        Daftar Buku
                    </h1>
                    <p className="mt-1 text-sm text-[#547792]">
                        Kelola seluruh inventaris buku lengkap dengan kategori
                        dan status publikasi.
                    </p>
                </div>

                <div className="rounded-3xl border border-[#E8E2DB] bg-white shadow-sm">
                    <div className="space-y-4 border-b border-[#E8E2DB] p-6">
                        <div className="flex flex-wrap items-center gap-3">
                            <Link
                                href="/admin/buku/data/tambah"
                                className="inline-flex items-center gap-2 rounded-xl bg-[#1A3263] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#1A3263]/30 transition hover:bg-[#547792]"
                            >
                                <Plus className="h-4 w-4" /> Tambah
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
                                onClick={() => handleBulkStatusChange('publik')}
                                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                                    hasSelected
                                        ? 'bg-[#CDE8D6] text-[#1A3263] hover:bg-[#B5DBBF]'
                                        : 'cursor-not-allowed bg-slate-100 text-slate-400'
                                }`}
                            >
                                <CheckCircle2 className="h-4 w-4" /> Publik
                            </button>
                            <button
                                type="button"
                                disabled={!hasSelected}
                                onClick={() => handleBulkStatusChange('draft')}
                                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                                    hasSelected
                                        ? 'bg-[#FFF5DC] text-[#B45309] hover:bg-[#FFE8AD]'
                                        : 'cursor-not-allowed bg-slate-100 text-slate-400'
                                }`}
                            >
                                <Layers3 className="h-4 w-4" /> Draft
                            </button>
                            <div className="mt-3 w-full border-t border-dashed border-[#E8E2DB] md:hidden" />
                            <div className="ml-auto text-xs font-semibold tracking-wide text-[#547792] uppercase">
                                {hasSelected
                                    ? `${selected.length} data dipilih`
                                    : 'Pilih data untuk aksi cepat'}
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-[#E8E2DB]">
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
                                    <th className="px-4 py-4">Nama Buku</th>
                                    <th className="px-4 py-4">Kategori Buku</th>
                                    <th className="px-4 py-4">Stok</th>
                                    <th className="px-4 py-4">Kode Buku</th>
                                    <th className="px-4 py-4">Status</th>
                                </tr>
                                <tr className="bg-white text-[11px] font-normal tracking-normal text-[#547792] uppercase">
                                    <th className="px-6 py-3" />
                                    <th className="px-2 py-3" />
                                    <th className="px-4 py-3" />
                                    <th className="px-4 py-3">
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(event) =>
                                                setSearchTerm(
                                                    event.target.value,
                                                )
                                            }
                                            className="w-full rounded-2xl border border-[#D7DFEE] bg-white px-4 py-2 text-sm text-[#1A3263] placeholder:text-slate-400 focus:border-[#1A3263] focus:outline-none"
                                            placeholder="Cari nama buku..."
                                        />
                                    </th>
                                    <th className="px-4 py-3">
                                        <select
                                            value={kategoriFilter ?? ''}
                                            onChange={(event) =>
                                                visitWithFilters({
                                                    kategori: event.target.value
                                                        ? Number(
                                                              event.target
                                                                  .value,
                                                          )
                                                        : null,
                                                })
                                            }
                                            className="w-full rounded-2xl border border-[#D7DFEE] bg-white px-3 py-2 text-sm text-[#1A3263] focus:border-[#1A3263] focus:outline-none"
                                        >
                                            <option value="">Semua</option>
                                            {categories.map((category) => (
                                                <option
                                                    key={category.id}
                                                    value={category.id}
                                                >
                                                    {category.nama}
                                                </option>
                                            ))}
                                        </select>
                                    </th>
                                    <th className="px-4 py-3" />
                                    <th className="px-4 py-3" />
                                    <th className="px-4 py-3">
                                        <select
                                            value={statusFilter}
                                            onChange={(event) =>
                                                visitWithFilters({
                                                    status: event.target
                                                        .value as
                                                        | Status
                                                        | 'semua',
                                                })
                                            }
                                            className="w-full rounded-2xl border border-[#D7DFEE] bg-white px-3 py-2 text-sm text-[#1A3263] focus:border-[#1A3263] focus:outline-none"
                                        >
                                            <option value="semua">Semua</option>
                                            <option value="publik">
                                                Publik
                                            </option>
                                            <option value="draft">Draft</option>
                                        </select>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F0EBE2] bg-white">
                                {paginatedItems.map((item, index) => {
                                    const checked = selected.includes(item.id);
                                    return (
                                        <tr
                                            key={item.id}
                                            className={`text-sm transition hover:bg-[#F8F6F1] ${
                                                checked ? 'bg-[#FFF5DC]' : ''
                                            }`}
                                        >
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    className="size-4 rounded border-[#1A3263] text-[#1A3263] focus:ring-[#1A3263]"
                                                    checked={checked}
                                                    onChange={() =>
                                                        toggleSelect(item.id)
                                                    }
                                                />
                                            </td>
                                            <td className="px-2 py-4 font-semibold text-[#1A3263]">
                                                {from + index}
                                            </td>
                                            <td className="flex items-center gap-2 px-4 py-4 text-[#1A3263]">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleShowDetail(item)
                                                    }
                                                    title="Detail"
                                                    aria-label="Detail"
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E0E7FF] text-[#1A3263] transition hover:bg-[#EEF2FF]"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <Link
                                                    href={`/admin/buku/data/${item.id}/edit`}
                                                    title="Edit"
                                                    aria-label="Edit"
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#1A3263] text-[#1A3263] transition hover:bg-[#EEF3FF]"
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
                                            </td>
                                            <td className="px-4 py-4 text-[#1A3263]">
                                                <p className="font-semibold">
                                                    {item.nama_alat}
                                                </p>
                                                <p className="text-xs text-[#547792]">
                                                    {item.ruangan}
                                                </p>
                                            </td>
                                            <td className="px-4 py-4 text-[#1A3263]">
                                                {item.kategori_alat ?? '-'}
                                            </td>
                                            <td className="px-4 py-4 text-[#1A3263]">
                                                {item.stok}
                                            </td>
                                            <td className="px-4 py-4 font-mono text-sm text-[#1A3263]">
                                                {item.kode_alat ?? '-'}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span
                                                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[item.status]}`}
                                                >
                                                    <span
                                                        className={`h-2 w-2 rounded-full ${item.status === 'publik' ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                                    />
                                                    {statusLabels[item.status]}
                                                </span>
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
                                            Tidak ada data buku.
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
            {detailItem ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A3263]/55 p-4 backdrop-blur-sm">
                    <div
                        className="absolute inset-0"
                        onClick={closeDetailModal}
                    />
                    <div
                        className="relative w-full max-w-5xl overflow-hidden rounded-[28px] border border-[#E8E2DB] bg-white shadow-[0_30px_80px_rgba(26,50,99,0.24)]"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-4 border-b border-[#F0E7DB] px-5 py-4 sm:px-6">
                            <div>
                                <p className="text-[11px] font-semibold tracking-[0.25em] text-[#547792] uppercase">
                                    Detail Buku
                                </p>
                                <h2 className="mt-1 text-xl leading-tight font-bold text-[#1A3263] sm:text-[26px]">
                                    {detailItem.nama_alat}
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={closeDetailModal}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E8E2DB] bg-[#F8FAFC] text-[#1A3263] transition hover:bg-[#E8E2DB]"
                                aria-label="Tutup detail buku"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="grid gap-0 lg:grid-cols-[0.62fr_1.38fr]">
                            <div className="flex items-center bg-[#F5F1EA] p-4 sm:p-5">
                                <div className="w-full overflow-hidden rounded-[24px] border border-[#E8E2DB] bg-white shadow-[0_16px_40px_rgba(26,50,99,0.08)]">
                                    {detailItem.gambar_url ? (
                                        <img
                                            src={detailItem.gambar_url}
                                            alt={detailItem.nama_alat}
                                            className="h-[230px] w-full object-cover sm:h-[270px] lg:h-[320px]"
                                        />
                                    ) : (
                                        <div className="flex h-[230px] w-full flex-col items-center justify-center bg-[#E8DED3] px-8 text-center text-[#8E7661] sm:h-[270px] lg:h-[320px]">
                                            <BookOpenText className="h-9 w-9" />
                                            <p className="mt-4 text-xs font-semibold tracking-[0.25em] uppercase">
                                                Cover Tidak Tersedia
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex min-h-0 flex-col p-4 sm:p-5">
                                <div className="grid min-h-0 gap-x-4 gap-y-3 overflow-hidden sm:grid-cols-3">
                                    <DetailRow
                                        icon={BookOpenText}
                                        label="Kode Buku"
                                        value={detailItem.kode_alat ?? '-'}
                                    />
                                    <DetailRow
                                        icon={BookOpenText}
                                        label="Stok"
                                        value={`${detailItem.stok ?? 0} unit`}
                                    />
                                    <DetailRow
                                        icon={Tag}
                                        label="Kategori Buku"
                                        value={detailItem.kategori_alat ?? '-'}
                                    />
                                    <DetailRow
                                        icon={MapPin}
                                        label="Ruangan"
                                        value={detailItem.ruangan}
                                    />
                                    <DetailRow
                                        icon={Layers3}
                                        label="Status"
                                        value={statusLabels[detailItem.status]}
                                    />
                                    <DetailRow
                                        icon={DollarSign}
                                        label="Denda / Hari"
                                        value={formatCurrency(
                                            detailItem.denda_keterlambatan,
                                        )}
                                    />
                                    <DetailRow
                                        icon={FileText}
                                        label="Kondisi Buku"
                                        value={detailItem.kondisi_alat ?? '-'}
                                    />
                                    <DetailRow
                                        icon={CalendarDays}
                                        label="Ditambahkan Pada"
                                        value={
                                            detailItem.created_at
                                                ? formatDate(
                                                      detailItem.created_at,
                                                  )
                                                : '-'
                                        }
                                    />
                                </div>

                                <div className="mt-4 rounded-[22px] border border-[#E8E2DB] bg-[#F8FAFC] p-3">
                                    <p className="text-[11px] font-semibold tracking-[0.25em] text-[#547792] uppercase">
                                        Deskripsi Buku
                                    </p>
                                    <p className="mt-2 text-[13px] leading-5 text-[#1A3263]">
                                        {detailItem.deskripsi ??
                                            'Tidak ada deskripsi.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </AppLayout>
    );
}
