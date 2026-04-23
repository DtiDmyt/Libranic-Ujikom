import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';
import Swal from 'sweetalert2';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData } from '@/types';

type Breadcrumb = BreadcrumbItem;

type BorrowerInfo = {
    nama: string;
    nis_nip: string;
    kelas: string;
};

type ToolInfo = {
    nama_alat: string;
    kode_alat: string;
    lokasi: string;
    stok: number;
    denda_keterlambatan: number;
};

type LoanInfo = {
    id: number;
    jumlah: number;
    jumlah_pinjam?: number;
    tanggal_pinjam?: string;
    tanggal_kembali?: string;
    keperluan?: string | null;
    status?: string | null;
};

type ReturnFormFields = {
    kondisi: string;
    catatan: string;
    lampiran: File | null;
    _token: string;
};

type PageProps = SharedData & {
    borrower: BorrowerInfo;
    alat: ToolInfo;
    loan: LoanInfo;
};

const breadcrumbs: Breadcrumb[] = [
    { title: 'Dashboard Pengguna', href: '/dashboard' },
    { title: 'Peminjaman Saya', href: '/peminjaman' },
    { title: 'Form Pengembalian', href: '/peminjaman/pengembalian' },
];

const formatDateLabel = (value?: string) =>
    value
        ? new Intl.DateTimeFormat('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
          }).format(new Date(value))
        : '-';

type InfoFieldProps = {
    label: string;
    value: string | number;
};

function InfoField({ label, value }: InfoFieldProps) {
    const display =
        value === undefined || value === null || value === '' ? '-' : value;
    return (
        <div>
            <p className="text-xs font-semibold tracking-[0.25em] text-[#8E7661] uppercase">
                {label}
            </p>
            <p className="mt-1 text-base font-semibold text-[#1A3263]">
                {display}
            </p>
        </div>
    );
}

const finalStatusConfigs: Record<string, { label: string; className: string }> =
    {
        'tepat waktu': {
            label: 'Tepat Waktu',
            className:
                'border border-emerald-200 bg-emerald-50 text-emerald-700',
        },
        telat: {
            label: 'Telat',
            className: 'border border-rose-200 bg-rose-50 text-rose-700',
        },
        terlambat: {
            label: 'Telat',
            className: 'border border-rose-200 bg-rose-50 text-rose-700',
        },
        rusak: {
            label: 'Rusak',
            className: 'border border-amber-200 bg-amber-50 text-amber-700',
        },
        hilang: {
            label: 'Hilang',
            className: 'border border-slate-300 bg-slate-100 text-slate-700',
        },
    };

export default function PenggunaFormPengembalianPage() {
    const { borrower, alat, loan } = usePage<PageProps>().props;
    const csrfToken =
        typeof document !== 'undefined'
            ? (document
                  .querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
                  ?.getAttribute('content') ?? '')
            : '';
    const form = useForm<ReturnFormFields>({
        kondisi: 'baik',
        catatan: '',
        lampiran: null,
        _token: csrfToken,
    });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const normalizedLoanStatus = loan.status?.trim().toLowerCase() ?? '';
    const finalStatusEntry = finalStatusConfigs[normalizedLoanStatus];

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        form.setData('lampiran', file ?? null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(file ? URL.createObjectURL(file) : null);
    };

    const removeLampiran = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        form.setData('lampiran', null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post(`/peminjaman/${loan.id}/pengembalian`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Pengembalian dikirim',
                    text: 'Terima kasih, pengembalianmu menunggu verifikasi administrator.',
                    timer: 2200,
                    showConfirmButton: false,
                });
                removeLampiran();
            },
            onError: () => {
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal mengirim pengembalian',
                    text: 'Periksa kembali formulir dan coba lagi.',
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Form Pengembalian" />
            <form
                className="space-y-6 bg-[#F5F1EA] p-6"
                onSubmit={handleSubmit}
            >
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold tracking-[0.25em] text-[#547792] uppercase">
                            Pengembalian Buku
                        </p>
                        <h1 className="mt-2 text-3xl font-bold text-[#1A3263]">
                            Form Pengembalian
                        </h1>
                        <p className="mt-1 text-sm text-[#547792]">
                            Lengkapi status dan kondisi buku sebelum menyerahkan
                            kembali ke administrator.
                        </p>
                    </div>
                    <Link
                        href="/peminjaman"
                        className="inline-flex items-center gap-2 rounded-2xl border border-[#E8E2DB] bg-white px-4 py-2 text-sm font-semibold text-[#1A3263] transition hover:bg-[#F8F6F1]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Daftar
                    </Link>
                </div>

                <div className="grid items-start gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                    <section className="space-y-6 rounded-3xl border border-[#E8E2DB] bg-white p-6 shadow-sm">
                        <div>
                            <p className="text-base font-semibold text-[#1A3263]">
                                Ringkasan Peminjaman
                            </p>
                            <p className="text-xs text-[#547792]">
                                Semua informasi diambil langsung dari histori
                                kamu.
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <InfoField
                                label="Jumlah Dipinjam"
                                value={loan.jumlah ?? loan.jumlah_pinjam ?? 0}
                            />
                            <InfoField
                                label="Tanggal Pinjam"
                                value={formatDateLabel(loan.tanggal_pinjam)}
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <InfoField
                                label="Jadwal Pengembalian"
                                value={formatDateLabel(loan.tanggal_kembali)}
                            />
                            <div>
                                <p className="text-xs font-semibold tracking-[0.25em] text-[#8E7661] uppercase">
                                    Status Peminjaman
                                </p>
                                <div className="mt-1 flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center gap-2 rounded-full border border-[#D1D5DB] px-3 py-1 text-xs font-semibold text-[#1A3263]">
                                        <span className="h-1.5 w-1.5 rounded-full bg-[#FBBF24]" />
                                        Proses pengecekan
                                    </span>
                                    <span className="text-xs font-semibold text-[#C4A484] uppercase">
                                        &gt;
                                    </span>
                                    <span className="inline-flex items-center gap-2 rounded-full border border-[#D1D5DB] px-3 py-1 text-xs font-semibold text-[#1A3263]">
                                        Menunggu admin merubah status
                                    </span>
                                </div>
                                <p className="mt-1 text-xs text-[#547792]">
                                    Admin akan menentukan apakah pengembalian
                                    tepat waktu, telat, rusak, atau hilang
                                    setelah pengecekan selesai.
                                    {finalStatusEntry
                                        ? ` Status terakhir yang tercatat: ${finalStatusEntry.label}.`
                                        : ''}
                                </p>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-[#1A3263]">
                                Kondisi Saat Pengembalian
                            </p>
                            <select
                                value={form.data.kondisi}
                                onChange={(event) =>
                                    form.setData('kondisi', event.target.value)
                                }
                                className="mt-2 w-full rounded-2xl border border-[#D7DFEE] px-4 py-2 text-sm text-[#1A3263] focus:border-[#1A3263] focus:outline-none"
                            >
                                <option value="baik">Baik</option>
                                <option value="rusak">Rusak</option>
                                <option value="hilang">Hilang</option>
                            </select>
                            {form.errors.kondisi ? (
                                <p className="mt-1 text-xs text-red-600">
                                    {form.errors.kondisi}
                                </p>
                            ) : null}
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-[#1A3263]">
                                Catatan atau Kondisi Lainnya
                            </p>
                            <textarea
                                value={form.data.catatan}
                                onChange={(event) =>
                                    form.setData('catatan', event.target.value)
                                }
                                rows={4}
                                className="mt-2 w-full rounded-2xl border border-[#D7DFEE] bg-[#F8FAFC] px-4 py-3 text-sm text-[#1A3263] focus:border-[#1A3263] focus:bg-white focus:outline-none"
                                placeholder="Catat keadaan buku, kelengkapan tambahan, atau permintaan khusus..."
                            />
                            {form.errors.catatan ? (
                                <p className="mt-1 text-xs text-red-600">
                                    {form.errors.catatan}
                                </p>
                            ) : null}
                        </div>

                        <div className="space-y-3">
                            <p className="text-sm font-semibold text-[#1A3263]">
                                Bukti Foto *
                            </p>
                            <p className="text-xs text-[#547792]">
                                Unggah foto kondisi terbaru buku. Format JPG,
                                PNG, atau WEBP maksimal 2MB. Wajib diisi.
                            </p>
                            <div className="space-y-3 rounded-3xl border border-dashed border-[#D7DFEE] bg-[#F8FAFC] p-4">
                                <button
                                    type="button"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#1A3263] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#172550]"
                                >
                                    <ImageIcon className="h-5 w-5" /> Unggah
                                    Foto Bukti
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    required
                                    className="hidden"
                                    onChange={handleFileChange}
                                />

                                {previewUrl ? (
                                    <div className="mt-4 space-y-2 rounded-2xl border border-[#E8E2DB] bg-white p-3">
                                        <div className="flex items-center justify-between text-sm font-semibold text-[#1A3263]">
                                            <span>Pratinjau Lampiran</span>
                                            <button
                                                type="button"
                                                onClick={removeLampiran}
                                                className="text-xs font-semibold text-red-600 hover:underline"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                        <img
                                            src={previewUrl}
                                            alt="Pratinjau lampiran pengembalian"
                                            className="h-48 w-full rounded-2xl object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="mt-4 flex flex-col items-center justify-center gap-2 rounded-2xl bg-white py-6 text-center text-sm text-[#547792]">
                                        <ImageIcon className="h-10 w-10 text-[#C4A484]" />
                                        <p>Belum ada gambar yang dipilih</p>
                                    </div>
                                )}
                            </div>
                            {form.errors.lampiran ? (
                                <p className="text-xs text-red-600">
                                    {form.errors.lampiran}
                                </p>
                            ) : null}
                        </div>
                    </section>

                    <section className="flex flex-col justify-between space-y-6 rounded-3xl border border-[#E8E2DB] bg-white p-6 shadow-sm">
                        <div>
                            <p className="text-base font-semibold text-[#1A3263]">
                                Informasi Peminjam & Buku
                            </p>
                            <p className="text-xs text-[#547792]">
                                Pastikan data valid sebelum menyerahkan buku.
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <InfoField label="Nama" value={borrower.nama} />
                            <InfoField
                                label="NIS / NIP"
                                value={borrower.nis_nip}
                            />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <InfoField label="Kelas" value={borrower.kelas} />
                            <InfoField
                                label="Status"
                                value={loan.status ?? 'Menunggu'}
                            />
                        </div>

                        <div className="h-px bg-[#F0E7DB]" />

                        <div className="grid gap-4 md:grid-cols-2">
                            <InfoField
                                label="Nama Buku"
                                value={alat.nama_alat}
                            />
                            <InfoField
                                label="Kode Buku"
                                value={alat.kode_alat}
                            />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <InfoField label="Lokasi" value={alat.lokasi} />
                            <InfoField
                                label="Stok Tersedia"
                                value={`${alat.stok} unit`}
                            />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <InfoField
                                label="Denda / Hari"
                                value={new Intl.NumberFormat('id-ID', {
                                    style: 'currency',
                                    currency: 'IDR',
                                    maximumFractionDigits: 0,
                                }).format(alat.denda_keterlambatan)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={form.processing}
                            className="mt-6 flex w-full items-center justify-center rounded-2xl bg-[#1A3263] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#1A3263]/20 transition hover:bg-[#172550] disabled:cursor-not-allowed disabled:bg-slate-400"
                        >
                            {form.processing
                                ? 'Mengirim...'
                                : 'Konfirmasi Pengembalian'}
                        </button>
                    </section>
                </div>
            </form>
        </AppLayout>
    );
}
