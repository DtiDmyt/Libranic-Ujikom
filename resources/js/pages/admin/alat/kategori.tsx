import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Plus, PencilLine, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import AppLayout from '@/layouts/app-layout';
import adminRoutes from '@/routes/admin';
import type { BreadcrumbItem } from '@/types';
import type { SharedData } from '@/types';
import {
    alertError,
    alertLoading,
    alertSuccess,
    closeAlert,
} from '@/lib/alert';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: adminRoutes.dashboard().url },
    { title: 'Manajemen Alat', href: '/admin/alat' },
    { title: 'Kategori Alat', href: '/admin/alat/kategori' },
];

type CategoryRow = {
    id: number;
    nama: string;
};

type PageProps = SharedData & {
    categories: CategoryRow[];
};

export default function AdminKategoriAlatPage() {
    const { categories } = usePage<PageProps>().props;

    const form = useForm({ nama: '' });
    const [editingId, setEditingId] = useState<number | null>(null);
    const [selected, setSelected] = useState<number[]>([]);

    const toggleSelect = (id: number) => {
        setSelected((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id],
        );
    };

    const toggleSelectAll = () => {
        setSelected((prev) =>
            prev.length === categories.length
                ? []
                : categories.map((c) => c.id),
        );
    };

    const allSelected =
        selected.length === categories.length && categories.length > 0;
    const hasSelected = selected.length > 0;

    const totalLabel = useMemo(
        () =>
            `Menampilkan 1 sampai ${categories.length} dari ${categories.length} data`,
        [categories.length],
    );

    const submitForm = () => {
        if (editingId) {
            alertLoading('Sedang memperbarui kategori...');
            form.patch(`/admin/alat/kategori/${editingId}`, {
                preserveScroll: true,
                onSuccess: () => {
                    form.reset();
                    setEditingId(null);
                    closeAlert();
                    alertSuccess('Kategori berhasil diperbarui.');
                },
                onError: () => {
                    closeAlert();
                    alertError(
                        'Tidak dapat memperbarui kategori, periksa kembali data.',
                    );
                },
            });
        } else {
            alertLoading('Sedang menambahkan kategori...');
            form.post('/admin/alat/kategori', {
                preserveScroll: true,
                onSuccess: () => {
                    form.reset();
                    closeAlert();
                    alertSuccess('Kategori berhasil ditambahkan.');
                },
                onError: () => {
                    closeAlert();
                    alertError(
                        'Tidak dapat menyimpan kategori, periksa kembali data.',
                    );
                },
            });
        }
    };

    const handleEdit = (category: CategoryRow) => {
        form.setData('nama', category.nama);
        setEditingId(category.id);
    };

    const handleBulkDelete = () => {
        if (!hasSelected) return;

        Swal.fire({
            title: 'Hapus Kategori',
            text: 'Yakin ingin menghapus kategori terpilih?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DC2626',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Hapus',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (!result.isConfirmed) {
                return;
            }

            alertLoading('Sedang menghapus kategori terpilih...');
            router.delete('/admin/alat/kategori/bulk-delete', {
                data: { ids: selected },
                preserveScroll: true,
                onSuccess: () => {
                    setSelected([]);
                    closeAlert();
                    alertSuccess('Kategori terpilih berhasil dihapus.');
                },
                onError: () => {
                    closeAlert();
                    alertError('Gagal menghapus kategori. Silakan coba lagi.');
                },
            });
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kategori Alat" />
            <div className="bg-[#E8E2DB] p-6">
                <div className="mb-6 space-y-1">
                    <p className="text-xs font-semibold tracking-[0.2em] text-[#547792] uppercase">
                        Manajemen Inventaris
                    </p>
                    <h1 className="text-2xl font-bold text-[#1A3263]">
                        Kategori Alat
                    </h1>
                </div>

                <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
                    {/* Left Side - Form */}
                    <div className="h-fit rounded-3xl border border-[#E8E2DB] bg-white p-6 shadow-sm">
                        <h2 className="mb-1 text-base font-bold text-[#1A3263]">
                            Tambah Kategori
                        </h2>
                        <p className="mb-4 text-xs text-[#547792]">
                            Tambahkan kategori baru
                        </p>

                        <form
                            className="space-y-3"
                            onSubmit={(e) => {
                                e.preventDefault();
                                submitForm();
                            }}
                        >
                            <div>
                                <label className="mb-2 block text-sm font-medium text-[#1A3263]">
                                    Nama Kategori *
                                </label>
                                <input
                                    type="text"
                                    value={form.data.nama}
                                    onChange={(e) =>
                                        form.setData('nama', e.target.value)
                                    }
                                    className="w-full rounded-xl border border-[#D7DFEE] bg-[#F8FAFC] px-4 py-2 text-sm text-[#1A3263] transition placeholder:text-slate-400 focus:border-[#3B68D5] focus:bg-white focus:outline-none"
                                    placeholder="Contoh: Perangkat Pendukung"
                                    disabled={form.processing}
                                />
                                {form.errors.nama ? (
                                    <p className="mt-1 text-xs text-red-600">
                                        {form.errors.nama}
                                    </p>
                                ) : null}
                            </div>

                            <button
                                type="submit"
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1A3263] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#1A3263]/30 transition hover:bg-[#547792]"
                                disabled={form.processing}
                            >
                                <Plus className="h-4 w-4" />
                                {editingId ? 'Perbarui' : 'Simpan'}
                            </button>
                            {editingId ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingId(null);
                                        form.reset();
                                    }}
                                    className="w-full rounded-xl border border-[#E8E2DB] bg-white px-4 py-2 text-sm font-semibold text-[#547792] transition hover:bg-[#F5F7FB]"
                                >
                                    Batalkan edit
                                </button>
                            ) : null}
                        </form>
                    </div>

                    {/* Right Side - Table */}
                    <div className="rounded-3xl border border-[#E8E2DB] bg-white shadow-sm">
                        <div className="border-b border-[#E8E2DB] p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="mb-1 text-lg font-bold text-[#1A3263]">
                                        Daftar Kategori
                                    </h2>
                                    <p className="text-xs text-[#547792]">
                                        Total {categories.length} kategori
                                        terdaftar
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    disabled={!hasSelected}
                                    onClick={handleBulkDelete}
                                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                                        hasSelected
                                            ? 'border border-[#FAB95B] bg-white text-[#1A3263] hover:bg-[#FFF5DC]'
                                            : 'cursor-not-allowed border border-[#E8ECF8] bg-[#F8FAFC] text-[#999]'
                                    }`}
                                >
                                    <Trash2 className="h-4 w-4 text-[#1A3263]" />
                                    Hapus
                                </button>
                            </div>
                        </div>

                        <div className="overflow-hidden">
                            <table className="min-w-full">
                                <thead className="bg-[#E8E2DB]">
                                    <tr>
                                        <th className="px-6 py-4 text-left">
                                            <input
                                                type="checkbox"
                                                className="size-4 rounded border-[#1A3263] text-[#1A3263] focus:ring-2 focus:ring-[#1A3263]"
                                                checked={allSelected}
                                                onChange={toggleSelectAll}
                                            />
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-[#547792] uppercase">
                                            NO
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-[#547792] uppercase">
                                            AKSI
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-[#547792] uppercase">
                                            NAMA KATEGORI
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#EEF1FA] bg-white">
                                    {categories.map((category, index) => {
                                        const isChecked = selected.includes(
                                            category.id,
                                        );
                                        return (
                                            <tr
                                                key={category.id}
                                                className={`transition-colors ${
                                                    isChecked
                                                        ? 'bg-[#FFF5DC]'
                                                        : index % 2 === 0
                                                          ? 'bg-white'
                                                          : 'bg-[#F6F3EF]'
                                                } hover:bg-[#F5F1EA]`}
                                            >
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="checkbox"
                                                        className="size-4 rounded border-[#1A3263] text-[#1A3263] focus:ring-2 focus:ring-[#1A3263]"
                                                        checked={isChecked}
                                                        onChange={() =>
                                                            toggleSelect(
                                                                category.id,
                                                            )
                                                        }
                                                    />
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-[#1A3263]">
                                                    {index + 1}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleEdit(category)
                                                        }
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#1A3263] bg-white px-3 py-1.5 text-xs font-semibold text-[#1A3263] transition hover:bg-[#EEF3FF]"
                                                    >
                                                        <PencilLine className="h-3.5 w-3.5" />
                                                        Edit
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-semibold text-[#1A3263]">
                                                    {category.nama}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="border-t border-[#E8E2DB] px-6 py-3">
                            <p className="text-xs text-[#547792]">
                                Menampilkan 1 sampai {categories.length} dari{' '}
                                {categories.length} data
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
