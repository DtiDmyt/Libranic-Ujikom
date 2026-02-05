import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { ArrowLeft, ImageIcon } from 'lucide-react';
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

type Status = 'publik' | 'draft';

type FormFields = {
    nama_alat: string;
    kategori_jurusan: string;
    kategori_alat_id: string;
    ruangan: string;
    denda_keterlambatan: string;
    status: Status;
    gambar: File | null;
};

type PageProps = SharedData & {
    categories: CategoryOption[];
};

const statusOptions: { value: Status; label: string }[] = [
    { value: 'publik', label: 'Publik' },
    { value: 'draft', label: 'Draft' },
];

const jurusanOptions = ['PPLG', 'ANM', 'BCF', 'TO', 'TPFL'];

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: adminRoutes.dashboard().url },
    { title: 'Manajemen Alat', href: '/admin/alat' },
    { title: 'Daftar Alat', href: '/admin/alat/data' },
    { title: 'Tambah Data', href: '/admin/alat/data/tambah' },
];

export default function AdminTambahDataAlatPage() {
    const { categories } = usePage<PageProps>().props;
    const hasCategories = categories.length > 0;

    const form = useForm<FormFields>({
        nama_alat: '',
        kategori_jurusan: '',
        kategori_alat_id: categories[0]?.id.toString() ?? '',
        ruangan: '',
        denda_keterlambatan: '0',
        status: 'publik',
        gambar: null,
    });

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleSubmit = () => {
        alertLoading('Sedang menyimpan data alat...');
        form.post('/admin/alat/data', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setPreviewUrl(null);
                closeAlert();
                alertSuccess('Data alat berhasil ditambahkan.');
            },
            onError: () => {
                closeAlert();
                alertError(
                    'Tidak dapat menyimpan data, periksa kembali formulir.',
                );
            },
        });
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        form.setData('gambar', file ?? null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(file ? URL.createObjectURL(file) : null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Data Alat" />
            <form
                className="space-y-6 bg-[#F5F1EA] p-6"
                onSubmit={(event) => {
                    event.preventDefault();
                    handleSubmit();
                }}
            >
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="mt-2 text-3xl font-bold text-[#1A3263]">
                            Tambah Data Alat
                        </h1>
                        <p className="mt-1 text-sm text-[#547792]">
                            Lengkapi informasi alat agar mudah ditemukan oleh
                            petugas.
                        </p>
                    </div>
                    <Link
                        href="/admin/alat/data"
                        className="inline-flex items-center gap-2 rounded-2xl border border-[#E8E2DB] bg-white px-4 py-2 text-sm font-semibold text-[#1A3263] transition hover:bg-[#F8F6F1]"
                    >
                        <ArrowLeft className="h-4 w-4" /> Kembali
                    </Link>
                </div>

                <div className="grid items-start gap-6 lg:grid-cols-[1.4fr_0.8fr]">
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
                                placeholder="Contoh: Bor Listrik"
                            />
                            {form.errors.nama_alat ? (
                                <p className="mt-1 text-xs text-red-600">
                                    {form.errors.nama_alat}
                                </p>
                            ) : null}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="text-sm font-semibold text-[#1A3263]">
                                    Kategori Jurusan *
                                </label>
                                <select
                                    value={form.data.kategori_jurusan}
                                    onChange={(event) =>
                                        form.setData(
                                            'kategori_jurusan',
                                            event.target.value,
                                        )
                                    }
                                    className="mt-2 w-full rounded-2xl border border-[#D7DFEE] bg-[#F8FAFC] px-4 py-2 text-sm text-[#1A3263] focus:border-[#1A3263] focus:bg-white focus:outline-none"
                                >
                                    <option value="" disabled>
                                        Pilih jurusan
                                    </option>
                                    {jurusanOptions.map((jurusan) => (
                                        <option key={jurusan} value={jurusan}>
                                            {jurusan}
                                        </option>
                                    ))}
                                </select>
                                {form.errors.kategori_jurusan ? (
                                    <p className="mt-1 text-xs text-red-600">
                                        {form.errors.kategori_jurusan}
                                    </p>
                                ) : null}
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
                                    disabled={!hasCategories}
                                    className="mt-2 w-full rounded-2xl border border-[#D7DFEE] bg-[#F8FAFC] px-4 py-2 text-sm text-[#1A3263] focus:border-[#1A3263] focus:bg-white focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
                                >
                                    {hasCategories ? (
                                        <option value="" disabled>
                                            Pilih kategori
                                        </option>
                                    ) : (
                                        <option value="">
                                            Belum ada kategori
                                        </option>
                                    )}
                                    {hasCategories
                                        ? categories.map((category) => (
                                              <option
                                                  key={category.id}
                                                  value={category.id}
                                              >
                                                  {category.nama}
                                              </option>
                                          ))
                                        : null}
                                </select>
                                {form.errors.kategori_alat_id ? (
                                    <p className="mt-1 text-xs text-red-600">
                                        {form.errors.kategori_alat_id}
                                    </p>
                                ) : !hasCategories ? (
                                    <p className="mt-1 text-xs text-[#B45309]">
                                        Tambahkan kategori alat terlebih dahulu
                                        sebelum mengisi form ini.
                                    </p>
                                ) : null}
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
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
                                    placeholder="Contoh: Lab CNC - A2"
                                />
                                {form.errors.ruangan ? (
                                    <p className="mt-1 text-xs text-red-600">
                                        {form.errors.ruangan}
                                    </p>
                                ) : null}
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-[#1A3263]">
                                    Denda Keterlambatan (per hari)
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    value={form.data.denda_keterlambatan}
                                    onChange={(event) =>
                                        form.setData(
                                            'denda_keterlambatan',
                                            event.target.value,
                                        )
                                    }
                                    className="mt-2 w-full rounded-2xl border border-[#D7DFEE] bg-[#F8FAFC] px-4 py-2 text-sm text-[#1A3263] focus:border-[#1A3263] focus:bg-white focus:outline-none"
                                    placeholder="Masukkan jumlah dalam rupiah"
                                />
                                <p className="mt-1 text-xs text-[#547792]">
                                    Telat satu hari mengikuti tarif ini.
                                    Kerusakan atau kehilangan dibahas bersama
                                    admin.
                                </p>
                                {form.errors.denda_keterlambatan ? (
                                    <p className="mt-1 text-xs text-red-600">
                                        {form.errors.denda_keterlambatan}
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
                                Lengkapi pengaturan tambahan sebelum menyimpan.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-semibold text-[#1A3263]">
                                Status Publikasi *
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                {statusOptions.map(({ value, label }) => (
                                    <label
                                        key={value}
                                        className={`inline-flex cursor-pointer items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                                            form.data.status === value
                                                ? 'border-[#1A3263] bg-[#EEF2FF] text-[#1A3263]'
                                                : 'border-[#E8E2DB] text-[#547792]'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="status"
                                            value={value}
                                            checked={form.data.status === value}
                                            onChange={() =>
                                                form.setData('status', value)
                                            }
                                            className="size-4 accent-[#1A3263]"
                                        />
                                        {label}
                                    </label>
                                ))}
                            </div>
                            {form.errors.status ? (
                                <p className="text-xs text-red-600">
                                    {form.errors.status}
                                </p>
                            ) : null}
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-[#1A3263]">
                                Gambar Pratinjau
                            </p>
                            <p className="text-xs text-[#547792]">
                                Klik tombol di bawah untuk membuka galeri foto.
                            </p>
                            <div className="mt-4">
                                <button
                                    type="button"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#1A3263] px-6 py-4 text-center text-sm font-semibold text-white transition hover:bg-[#172550]"
                                >
                                    <ImageIcon className="h-5 w-5" />
                                    Buka Direktori Gambar
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                {previewUrl ? (
                                    <img
                                        src={previewUrl}
                                        alt="Pratinjau gambar"
                                        className="mt-4 h-40 w-full rounded-2xl object-cover"
                                    />
                                ) : null}
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
                                disabled={form.processing || !hasCategories}
                                className="inline-flex flex-1 items-center justify-center rounded-2xl bg-[#1A3263] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#1A3263]/30 transition hover:bg-[#547792] disabled:cursor-not-allowed disabled:bg-slate-400"
                            >
                                Simpan Data
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
