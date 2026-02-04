import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { ArrowLeft, CheckCircle2, Layers3, UploadCloud } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import adminRoutes from '@/routes/admin';
import type { BreadcrumbItem, SharedData } from '@/types';
import {
    alertError,
    alertLoading,
    alertSuccess,
    closeAlert,
} from '@/lib/alert';

type CategoryOption = {
    id: number;
    nama: string;
};

type ItemPayload = {
    id: number;
    nama_alat: string;
    deskripsi_alat: string | null;
    kategori_jurusan: string;
    kategori_alat_id: number;
    ruangan: string;
    status: 'publik' | 'draft';
    gambar_url: string | null;
};

type FormFields = {
    nama_alat: string;
    deskripsi_alat: string;
    kategori_jurusan: string;
    kategori_alat_id: string;
    ruangan: string;
    status: 'publik' | 'draft';
    gambar: File | null;
};

type PageProps = SharedData & {
    categories: CategoryOption[];
    item: ItemPayload;
};

const breadcrumbs = (id: number): BreadcrumbItem[] => [
    { title: 'Admin Dashboard', href: adminRoutes.dashboard().url },
    { title: 'Manajemen Alat', href: '/admin/alat' },
    { title: 'Daftar Alat', href: '/admin/alat/data' },
    { title: 'Edit Data', href: `/admin/alat/data/${id}/edit` },
];

export default function AdminEditDataAlatPage() {
    const { categories, item } = usePage<PageProps>().props;

    const form = useForm<FormFields>({
        nama_alat: item.nama_alat,
        deskripsi_alat: item.deskripsi_alat ?? '',
        kategori_jurusan: item.kategori_jurusan,
        kategori_alat_id: item.kategori_alat_id.toString(),
        ruangan: item.ruangan,
        status: item.status,
        gambar: null,
    });

    const [previewUrl, setPreviewUrl] = useState<string | null>(
        item.gambar_url,
    );
    const [usingObjectUrl, setUsingObjectUrl] = useState(false);

    useEffect(() => {
        return () => {
            if (usingObjectUrl && previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl, usingObjectUrl]);

    const statusOptions = useMemo(
        () => [
            { value: 'publik', label: 'Publik', icon: CheckCircle2 },
            { value: 'draft', label: 'Draft', icon: Layers3 },
        ],
        [],
    );

    const handleSubmit = () => {
        alertLoading('Sedang memperbarui data alat...');
        form.transform((data) => ({ ...data, _method: 'patch' }));
        form.post(`/admin/alat/data/${item.id}`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                closeAlert();
                alertSuccess('Data alat berhasil diperbarui.');
            },
            onError: () => {
                closeAlert();
                alertError(
                    'Tidak dapat memperbarui data, periksa kembali formulir.',
                );
            },
            onFinish: () => {
                form.transform((data) => data);
            },
        });
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        form.setData('gambar', file ?? null);
        if (usingObjectUrl && previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
            setUsingObjectUrl(true);
        } else {
            setPreviewUrl(item.gambar_url);
            setUsingObjectUrl(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs(item.id)}>
            <Head title={`Edit ${item.nama_alat}`} />
            <form
                className="space-y-6 bg-[#F5F1EA] p-6"
                onSubmit={(event) => {
                    event.preventDefault();
                    handleSubmit();
                }}
            >
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold tracking-[0.25em] text-[#547792] uppercase">
                            Form Daftar Alat
                        </p>
                        <h1 className="mt-2 text-3xl font-bold text-[#1A3263]">
                            Edit Data Alat
                        </h1>
                        <p className="mt-1 text-sm text-[#547792]">
                            Perbarui informasi {item.nama_alat} agar tetap
                            akurat.
                        </p>
                    </div>
                    <Link
                        href="/admin/alat/data"
                        className="inline-flex items-center gap-2 rounded-2xl border border-[#E8E2DB] bg-white px-4 py-2 text-sm font-semibold text-[#1A3263] transition hover:bg-[#F8F6F1]"
                    >
                        <ArrowLeft className="h-4 w-4" /> Kembali
                    </Link>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
                    <div className="space-y-6 rounded-3xl border border-[#E8E2DB] bg-white p-6 shadow-sm">
                        <div>
                            <label className="text-sm font-semibold text-[#1A3263]">
                                Nama Alat *
                            </label>
                            <input
                                type="text"
                                value={form.data.nama_alat}
                                onChange={(event) =>
                                    form.setData(
                                        'nama_alat',
                                        event.target.value,
                                    )
                                }
                                className="mt-2 w-full rounded-2xl border border-[#D7DFEE] bg-[#F8FAFC] px-4 py-2 text-sm text-[#1A3263] focus:border-[#1A3263] focus:bg-white focus:outline-none"
                            />
                            {form.errors.nama_alat ? (
                                <p className="mt-1 text-xs text-red-600">
                                    {form.errors.nama_alat}
                                </p>
                            ) : null}
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-[#1A3263]">
                                Deskripsi Alat
                            </label>
                            <textarea
                                value={form.data.deskripsi_alat}
                                onChange={(event) =>
                                    form.setData(
                                        'deskripsi_alat',
                                        event.target.value,
                                    )
                                }
                                rows={6}
                                className="mt-2 w-full rounded-2xl border border-[#D7DFEE] bg-[#0B1221]/90 px-4 py-3 text-sm text-white focus:border-[#1A3263] focus:bg-[#0B1221] focus:outline-none"
                            />
                            {form.errors.deskripsi_alat ? (
                                <p className="mt-1 text-xs text-red-600">
                                    {form.errors.deskripsi_alat}
                                </p>
                            ) : null}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="text-sm font-semibold text-[#1A3263]">
                                    Kategori Jurusan *
                                </label>
                                <input
                                    type="text"
                                    value={form.data.kategori_jurusan}
                                    onChange={(event) =>
                                        form.setData(
                                            'kategori_jurusan',
                                            event.target.value,
                                        )
                                    }
                                    className="mt-2 w-full rounded-2xl border border-[#D7DFEE] bg-[#F8FAFC] px-4 py-2 text-sm text-[#1A3263] focus:border-[#1A3263] focus:bg-white focus:outline-none"
                                />
                                {form.errors.kategori_jurusan ? (
                                    <p className="mt-1 text-xs text-red-600">
                                        {form.errors.kategori_jurusan}
                                    </p>
                                ) : null}
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-[#1A3263]">
                                    Ruangan *
                                </label>
                                <input
                                    type="text"
                                    value={form.data.ruangan}
                                    onChange={(event) =>
                                        form.setData(
                                            'ruangan',
                                            event.target.value,
                                        )
                                    }
                                    className="mt-2 w-full rounded-2xl border border-[#D7DFEE] bg-[#F8FAFC] px-4 py-2 text-sm text-[#1A3263] focus:border-[#1A3263] focus:bg-white focus:outline-none"
                                />
                                {form.errors.ruangan ? (
                                    <p className="mt-1 text-xs text-red-600">
                                        {form.errors.ruangan}
                                    </p>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 rounded-3xl border border-[#E8E2DB] bg-white p-6 shadow-sm">
                        <div>
                            <p className="text-base font-semibold text-[#1A3263]">
                                Opsi Lain-lain
                            </p>
                            <p className="text-xs text-[#547792]">
                                Sesuaikan pengaturan tambahan sebelum menyimpan.
                            </p>
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-[#1A3263]">
                                Kategori Alat *
                            </label>
                            <select
                                value={form.data.kategori_alat_id}
                                onChange={(event) =>
                                    form.setData(
                                        'kategori_alat_id',
                                        event.target.value,
                                    )
                                }
                                className="mt-2 w-full rounded-2xl border border-[#D7DFEE] bg-[#F8FAFC] px-4 py-2 text-sm text-[#1A3263] focus:border-[#1A3263] focus:bg-white focus:outline-none"
                            >
                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.nama}
                                    </option>
                                ))}
                            </select>
                            {form.errors.kategori_alat_id ? (
                                <p className="mt-1 text-xs text-red-600">
                                    {form.errors.kategori_alat_id}
                                </p>
                            ) : null}
                        </div>

                        <div className="space-y-3">
                            <p className="text-xs font-semibold tracking-wide text-[#547792] uppercase">
                                Status Publikasi
                            </p>
                            <div className="space-y-2">
                                {statusOptions.map(
                                    ({ value, label, icon: Icon }) => (
                                        <label
                                            key={value}
                                            className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                                                form.data.status === value
                                                    ? 'border-[#1A3263] bg-[#EEF2FF] text-[#1A3263]'
                                                    : 'border-[#E8E2DB] text-[#547792]'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="inline-flex size-9 items-center justify-center rounded-full bg-white shadow">
                                                    <Icon className="h-4 w-4" />
                                                </span>
                                                {label}
                                            </div>
                                            <input
                                                type="radio"
                                                name="status"
                                                value={value}
                                                checked={
                                                    form.data.status === value
                                                }
                                                onChange={() =>
                                                    form.setData(
                                                        'status',
                                                        value as
                                                            | 'publik'
                                                            | 'draft',
                                                    )
                                                }
                                                className="size-4 accent-[#1A3263]"
                                            />
                                        </label>
                                    ),
                                )}
                            </div>
                            {form.errors.status ? (
                                <p className="text-xs text-red-600">
                                    {form.errors.status}
                                </p>
                            ) : null}
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-[#1A3263]">
                                Upload Gambar Alat
                            </label>
                            <div className="mt-2 rounded-3xl border-2 border-dashed border-[#C4CEDF] bg-[#F8FAFC] p-6 text-center">
                                <UploadCloud className="mx-auto h-10 w-10 text-[#547792]" />
                                <p className="mt-2 text-sm font-semibold text-[#1A3263]">
                                    Unggah gambar terbaru (opsional)
                                </p>
                                <p className="text-xs text-[#547792]">
                                    Format JPG/PNG, ukuran maks. 2MB
                                </p>
                                <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#1A3263] px-5 py-2 text-sm font-semibold text-white shadow">
                                    Pilih Berkas
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                </label>
                                {previewUrl ? (
                                    <img
                                        src={previewUrl}
                                        alt="Pratinjau gambar"
                                        className="mt-4 h-40 w-full rounded-2xl object-cover"
                                    />
                                ) : (
                                    <p className="mt-4 text-xs text-[#9CA3AF]">
                                        Belum ada gambar tersimpan.
                                    </p>
                                )}
                            </div>
                            {form.errors.gambar ? (
                                <p className="mt-1 text-xs text-red-600">
                                    {form.errors.gambar}
                                </p>
                            ) : null}
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="inline-flex flex-1 items-center justify-center rounded-2xl bg-[#1A3263] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#1A3263]/30 transition hover:bg-[#547792] disabled:cursor-not-allowed disabled:bg-slate-400"
                            >
                                Simpan Perubahan
                            </button>
                            <Link
                                href="/admin/alat/data"
                                className="inline-flex flex-1 items-center justify-center rounded-2xl border border-[#E8E2DB] bg-white px-4 py-3 text-sm font-semibold text-[#1A3263] transition hover:bg-[#F8F6F1]"
                            >
                                Batalkan
                            </Link>
                        </div>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
