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

type StatusBuku = 'tersedia' | 'dipinjam' | 'rusak' | 'hilang';

type FormFields = {
    judul_buku: string;
    penulis: string;
    penerbit: string;
    tahun_terbit: string;
    kategori_alat_id: string;
    kode_alat: string;
    stok: string;
    lokasi_rak: string;
    status_buku: StatusBuku;
    denda_keterlambatan: string;
    kondisi_alat: string;
    deskripsi: string;
    gambar: File | null;
};

type PageProps = SharedData & {
    categories: CategoryOption[];
    kodePreviews: Record<string, string>;
};

const statusOptions: { value: StatusBuku; label: string }[] = [
    { value: 'tersedia', label: 'Tersedia' },
    { value: 'dipinjam', label: 'Dipinjam' },
    { value: 'rusak', label: 'Rusak' },
    { value: 'hilang', label: 'Hilang' },
];

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: adminRoutes.dashboard().url },
    { title: 'Manajemen Buku', href: '/admin/buku' },
    { title: 'Daftar Buku', href: '/admin/buku/data' },
    { title: 'Tambah Data', href: '/admin/buku/data/tambah' },
];

export default function AdminTambahDataAlatPage() {
    const { categories, kodePreviews } = usePage<PageProps>().props;
    const hasCategories = categories.length > 0;

    const form = useForm<FormFields>({
        judul_buku: '',
        penulis: '',
        penerbit: '',
        tahun_terbit: '',
        kategori_alat_id: '',
        kode_alat: '',
        stok: '0',
        lokasi_rak: '',
        status_buku: 'tersedia',
        denda_keterlambatan: '0',
        kondisi_alat: '',
        deskripsi: '',
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

    useEffect(() => {
        const kode = kodePreviews[form.data.kategori_alat_id] ?? '';

        if (form.data.kode_alat !== kode) {
            form.setData('kode_alat', kode);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.data.kategori_alat_id, kodePreviews]);

    const handleSubmit = () => {
        alertLoading('Sedang menyimpan data buku...');
        form.post('/admin/buku/data', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setPreviewUrl(null);
                closeAlert();
                alertSuccess('Data buku berhasil ditambahkan.');
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
            <Head title="Tambah Data Buku" />
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
                            Tambah Data Buku
                        </h1>
                        <p className="mt-1 text-sm text-[#547792]">
                            Lengkapi informasi buku agar mudah ditemukan oleh
                            administrator.
                        </p>
                    </div>
                    <Link
                        href="/admin/buku/data"
                        className="inline-flex items-center gap-2 rounded-2xl border border-[#E8E2DB] bg-white px-4 py-2 text-sm font-semibold text-[#1A3263] transition hover:bg-[#F8F6F1]"
                    >
                        <ArrowLeft className="h-4 w-4" /> Kembali
                    </Link>
                </div>

                <div className="grid items-start gap-6 lg:grid-cols-[1.4fr_0.8fr]">
                    <div className="space-y-6 rounded-3xl border border-[#E8E2DB] bg-white p-6 shadow-sm">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="text-sm font-semibold text-[#1A3263]">
                                    Judul Buku *
                                </label>
                                <input
                                    type="text"
                                    value={form.data.judul_buku}
                                    onChange={(event) =>
                                        form.setData(
                                            'judul_buku',
                                            event.target.value,
                                        )
                                    }
                                    className="mt-2 w-full rounded-2xl border border-[#D7DFEE] bg-[#F8FAFC] px-4 py-2 text-sm text-[#1A3263] focus:border-[#1A3263] focus:bg-white focus:outline-none"
                                    placeholder="Contoh: Laskar Pelangi"
                                />
                                {form.errors.judul_buku ? (
                                    <p className="mt-1 text-xs text-red-600">
                                        {form.errors.judul_buku}
                                    </p>
                                ) : null}
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-[#1A3263]">
                                    Penulis *
                                </label>
                                <input
                                    type="text"
                                    value={form.data.penulis}
                                    onChange={(event) =>
                                        form.setData(
                                            'penulis',
                                            event.target.value,
                                        )
                                    }
                                    className="mt-2 w-full rounded-2xl border border-[#D7DFEE] bg-[#F8FAFC] px-4 py-2 text-sm text-[#1A3263] focus:border-[#1A3263] focus:bg-white focus:outline-none"
                                    placeholder="Contoh: Andrea Hirata"
                                />
                                {form.errors.penulis ? (
                                    <p className="mt-1 text-xs text-red-600">
                                        {form.errors.penulis}
                                    </p>
                                ) : null}
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="text-sm font-semibold text-[#1A3263]">
                                    Penerbit *
                                </label>
                                <input
                                    type="text"
                                    value={form.data.penerbit}
                                    onChange={(event) =>
                                        form.setData(
                                            'penerbit',
                                            event.target.value,
                                        )
                                    }
                                    className="mt-2 w-full rounded-2xl border border-[#D7DFEE] bg-[#F8FAFC] px-4 py-2 text-sm text-[#1A3263] focus:border-[#1A3263] focus:bg-white focus:outline-none"
                                    placeholder="Contoh: Bentang Pustaka"
                                />
                                {form.errors.penerbit ? (
                                    <p className="mt-1 text-xs text-red-600">
                                        {form.errors.penerbit}
                                    </p>
                                ) : null}
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-[#1A3263]">
                                    Tahun Terbit *
                                </label>
                                <input
                                    type="number"
                                    min={1900}
                                    max={3000}
                                    value={form.data.tahun_terbit}
                                    onChange={(event) =>
                                        form.setData(
                                            'tahun_terbit',
                                            event.target.value,
                                        )
                                    }
                                    className="mt-2 w-full rounded-2xl border border-[#D7DFEE] bg-[#F8FAFC] px-4 py-2 text-sm text-[#1A3263] focus:border-[#1A3263] focus:bg-white focus:outline-none"
                                    placeholder="Contoh: 2024"
                                />
                                {form.errors.tahun_terbit ? (
                                    <p className="mt-1 text-xs text-red-600">
                                        {form.errors.tahun_terbit}
                                    </p>
                                ) : null}
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="text-sm font-semibold text-[#1A3263]">
                                    Kategori Buku *
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
                                        Tambahkan kategori buku terlebih dahulu
                                        sebelum mengisi form ini.
                                    </p>
                                ) : null}
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-[#1A3263]">
                                    Kode Buku (otomatis)
                                </label>
                                <input
                                    type="text"
                                    value={form.data.kode_alat}
                                    readOnly
                                    className="mt-2 w-full rounded-2xl border border-[#D7DFEE] bg-[#F0F2F8] px-4 py-2 text-sm text-[#1A3263] focus:border-[#1A3263] focus:bg-[#F0F2F8] focus:outline-none"
                                    placeholder="Pilih kategori untuk melihat kode buku"
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="text-sm font-semibold text-[#1A3263]">
                                    Stok *
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    value={form.data.stok}
                                    onChange={(event) =>
                                        form.setData('stok', event.target.value)
                                    }
                                    className="mt-2 w-full rounded-2xl border border-[#D7DFEE] bg-[#F8FAFC] px-4 py-2 text-sm text-[#1A3263] focus:border-[#1A3263] focus:bg-white focus:outline-none"
                                    placeholder="Masukkan jumlah salinan"
                                />
                                {form.errors.stok ? (
                                    <p className="mt-1 text-xs text-red-600">
                                        {form.errors.stok}
                                    </p>
                                ) : null}
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-[#1A3263]">
                                    Lokasi Rak *
                                </label>
                                <input
                                    type="text"
                                    value={form.data.lokasi_rak}
                                    onChange={(event) =>
                                        form.setData(
                                            'lokasi_rak',
                                            event.target.value,
                                        )
                                    }
                                    className="mt-2 w-full rounded-2xl border border-[#D7DFEE] bg-[#F8FAFC] px-4 py-2 text-sm text-[#1A3263] focus:border-[#1A3263] focus:bg-white focus:outline-none"
                                    placeholder="Contoh: Rak B-03"
                                />
                                {form.errors.lokasi_rak ? (
                                    <p className="mt-1 text-xs text-red-600">
                                        {form.errors.lokasi_rak}
                                    </p>
                                ) : null}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-[#1A3263]">
                                Kondisi Buku Sebelum Dipinjam *
                            </label>
                            <textarea
                                value={form.data.kondisi_alat}
                                onChange={(event) =>
                                    form.setData(
                                        'kondisi_alat',
                                        event.target.value,
                                    )
                                }
                                rows={3}
                                placeholder="Jelaskan kondisi buku sebelum dipinjam"
                                className="mt-2 w-full rounded-2xl border border-[#D7DFEE] bg-[#F8FAFC] px-4 py-3 text-sm text-[#1A3263] focus:border-[#1A3263] focus:bg-white focus:outline-none"
                            />
                            {form.errors.kondisi_alat ? (
                                <p className="mt-1 text-xs text-red-600">
                                    {form.errors.kondisi_alat}
                                </p>
                            ) : null}
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-[#1A3263]">
                                Deskripsi Buku / Sinopsis Buku
                            </label>
                            <textarea
                                value={form.data.deskripsi}
                                onChange={(event) =>
                                    form.setData(
                                        'deskripsi',
                                        event.target.value,
                                    )
                                }
                                rows={4}
                                placeholder="Tuliskan ringkasan isi buku"
                                className="mt-2 w-full rounded-2xl border border-[#D7DFEE] bg-[#F8FAFC] px-4 py-3 text-sm text-[#1A3263] focus:border-[#1A3263] focus:bg-white focus:outline-none"
                            />
                            {form.errors.deskripsi ? (
                                <p className="mt-1 text-xs text-red-600">
                                    {form.errors.deskripsi}
                                </p>
                            ) : null}
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
                                Status Buku *
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                {statusOptions.map(({ value, label }) => (
                                    <label
                                        key={value}
                                        className={`inline-flex cursor-pointer items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                                            form.data.status_buku === value
                                                ? 'border-[#1A3263] bg-[#EEF2FF] text-[#1A3263]'
                                                : 'border-[#E8E2DB] text-[#547792]'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="status_buku"
                                            value={value}
                                            checked={
                                                form.data.status_buku === value
                                            }
                                            onChange={() =>
                                                form.setData(
                                                    'status_buku',
                                                    value,
                                                )
                                            }
                                            className="size-4 accent-[#1A3263]"
                                        />
                                        {label}
                                    </label>
                                ))}
                            </div>
                            {form.errors.status_buku ? (
                                <p className="text-xs text-red-600">
                                    {form.errors.status_buku}
                                </p>
                            ) : null}
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-[#1A3263]">
                                Denda Jika Telat (per hari)
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
                            {form.errors.denda_keterlambatan ? (
                                <p className="mt-1 text-xs text-red-600">
                                    {form.errors.denda_keterlambatan}
                                </p>
                            ) : null}
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-[#1A3263]">
                                Upload Cover Buku
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
                                href="/admin/buku/data"
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
