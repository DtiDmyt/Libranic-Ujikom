import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { ChangeEvent, FormEvent, useMemo, useRef, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import adminRoutes from '@/routes/admin';
import type { BreadcrumbItem, SharedData } from '@/types';
import {
    alertError,
    alertLoading,
    alertSuccess,
    closeAlert,
} from '@/lib/alert';

type LoanOption = {
    id: number;
    nama_peminjam: string;
    kelas?: string | null;
    nis_nip?: string | null;
    alat_nama?: string | null;
    kode_alat?: string | null;
    ruangan?: string | null;
    jumlah_pinjam?: number;
    tanggal_pinjam?: string | null;
    tanggal_kembali?: string | null;
};

type ConditionValue = 'baik' | 'rusak' | 'hilang';

type FormFields = {
    peminjaman_id: string;
    tanggal_pengembalian: string;
    kondisi: ConditionValue;
    catatan: string;
    lampiran: File | null;
};

type PageProps = SharedData & {
    loans: LoanOption[];
    defaultDate?: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: adminRoutes.dashboard().url },
    {
        title: 'Manajemen Peminjaman',
        href: '/admin/data-peminjaman/peminjaman',
    },
    {
        title: 'Data Pengembalian',
        href: '/admin/data-pengembalian/pengembalian',
    },
    {
        title: 'Tambah Pengembalian',
        href: '/admin/data-pengembalian/pengembalian/tambah',
    },
];

const conditionOptions: { value: ConditionValue; label: string }[] = [
    { value: 'baik', label: 'Kondisi Baik' },
    { value: 'rusak', label: 'Rusak' },
    { value: 'hilang', label: 'Hilang' },
];

const formatDateLabel = (value?: string | null) =>
    value
        ? new Intl.DateTimeFormat('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
          }).format(new Date(value))
        : '-';

type InfoFieldProps = {
    label: string;
    value?: string | number | null;
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

export default function AdminTambahPengembalianPage() {
    const { loans, defaultDate } = usePage<PageProps>().props;
    const defaultLoanId = loans[0]?.id.toString() ?? '';

    const form = useForm<FormFields>({
        peminjaman_id: defaultLoanId,
        tanggal_pengembalian: defaultDate ?? '',
        kondisi: 'baik',
        catatan: '',
        lampiran: null,
    });

    const [borrowerSearch, setBorrowerSearch] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const filteredLoans = useMemo(() => {
        if (!borrowerSearch) {
            return loans;
        }

        const keyword = borrowerSearch.toLowerCase();
        return loans.filter((loan) => {
            const borrowerMatch = loan.nama_peminjam
                .toLowerCase()
                .includes(keyword);
            const toolMatch = (loan.alat_nama ?? '')
                .toLowerCase()
                .includes(keyword);
            return borrowerMatch || toolMatch;
        });
    }, [borrowerSearch, loans]);

    const selectedLoan = useMemo(() => {
        if (!form.data.peminjaman_id) {
            return undefined;
        }
        return loans.find(
            (loan) => loan.id.toString() === form.data.peminjaman_id,
        );
    }, [form.data.peminjaman_id, loans]);

    const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
        form.setData('peminjaman_id', event.target.value);
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        form.setData('lampiran', file);
    };

    const removeLampiran = () => {
        form.setData('lampiran', null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        alertLoading('Sedang menyimpan data pengembalian...');
        form.post(adminRoutes.dataPengembalian.pengembalian.store().url, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                closeAlert();
                alertSuccess('Pengembalian berhasil dicatat.');
            },
            onError: () => {
                closeAlert();
                alertError(
                    'Tidak dapat menyimpan data, periksa kembali formulir.',
                );
            },
        });
    };

    const hasLoans = loans.length > 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Pengembalian" />
            <form
                className="space-y-6 bg-[#F5F1EA] p-6"
                onSubmit={handleSubmit}
            >
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold tracking-[0.25em] text-[#547792] uppercase">
                            Form Pengembalian
                        </p>
                        <h1 className="mt-2 text-3xl font-bold text-[#1A3263]">
                            Tambah Pengembalian
                        </h1>
                        <p className="mt-1 text-sm text-[#547792]">
                            Pilih peminjaman yang sudah kembali lalu catat
                            kondisi barang agar data pencatatan tetap rapi.
                        </p>
                    </div>
                    <Link
                        href={
                            adminRoutes.dataPengembalian.pengembalian.index()
                                .url
                        }
                        className="inline-flex items-center gap-2 rounded-2xl border border-[#E8E2DB] bg-white px-4 py-2 text-sm font-semibold text-[#1A3263] transition hover:bg-[#F8F6F1]"
                    >
                        <ArrowLeft className="h-4 w-4" /> Kembali
                    </Link>
                </div>

                <div className="grid items-start gap-6 lg:grid-cols-[1.25fr_0.8fr]">
                    <div className="space-y-6 rounded-3xl border border-[#E8E2DB] bg-white p-6 shadow-sm">
                        <div>
                            <p className="text-base font-semibold text-[#1A3263]">
                                Informasi Peminjam
                            </p>
                            <p className="text-xs text-[#547792]">
                                Cari nama peminjam atau buku, lalu pilih
                                peminjaman yang ingin dikembalikan.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[#1A3263]">
                                Nama Peminjam *
                            </label>
                            <input
                                type="text"
                                value={borrowerSearch}
                                onChange={(event) =>
                                    setBorrowerSearch(event.target.value)
                                }
                                placeholder="Cari peminjam atau buku..."
                                className="w-full rounded-2xl border border-[#D7DFEE] bg-[#F8FAFC] px-4 py-2 text-sm text-[#1A3263] focus:border-[#1A3263] focus:bg-white focus:outline-none"
                                disabled={!hasLoans}
                            />
                            <select
                                value={form.data.peminjaman_id}
                                onChange={handleSelectChange}
                                className="mt-2 w-full rounded-2xl border border-[#D7DFEE] bg-white px-4 py-2 text-sm text-[#1A3263] focus:border-[#1A3263] focus:outline-none"
                            >
                                {hasLoans && filteredLoans.length === 0 ? (
                                    <option value="">
                                        Peminjaman tidak ditemukan
                                    </option>
                                ) : null}
                                {!hasLoans ? (
                                    <option value="">
                                        Tidak ada peminjaman aktif
                                    </option>
                                ) : (
                                    filteredLoans.map((loan) => (
                                        <option key={loan.id} value={loan.id}>
                                            {loan.nama_peminjam} •{' '}
                                            {loan.alat_nama ?? '-'}
                                        </option>
                                    ))
                                )}
                            </select>
                            {form.errors.peminjaman_id ? (
                                <p className="text-xs text-red-600">
                                    {form.errors.peminjaman_id}
                                </p>
                            ) : null}
                            {!hasLoans ? (
                                <p className="mt-2 text-xs text-[#547792]">
                                    Belum ada peminjaman aktif. Tambahkan data
                                    peminjaman terlebih dahulu.
                                </p>
                            ) : null}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="text-sm font-semibold text-[#1A3263]">
                                    Kelas
                                </label>
                                <input
                                    type="text"
                                    value={selectedLoan?.kelas ?? ''}
                                    readOnly
                                    placeholder="Pilih peminjaman..."
                                    className="mt-2 w-full rounded-2xl border border-[#D7DFEE] bg-[#F0F2F8] px-4 py-2 text-sm text-[#1A3263] focus:border-[#1A3263] focus:bg-[#F0F2F8] focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-[#1A3263]">
                                    Jumlah Dipinjam
                                </label>
                                <input
                                    type="text"
                                    value={selectedLoan?.jumlah_pinjam ?? ''}
                                    readOnly
                                    className="mt-2 w-full rounded-2xl border border-[#D7DFEE] bg-[#F0F2F8] px-4 py-2 text-sm text-[#1A3263] focus:border-[#1A3263] focus:bg-[#F0F2F8] focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[#1A3263]">
                                Info Buku
                            </label>
                            <div className="grid gap-4 md:grid-cols-2">
                                <InfoField
                                    label="Nama Buku"
                                    value={selectedLoan?.alat_nama}
                                />
                                <InfoField
                                    label="Kode Buku"
                                    value={selectedLoan?.kode_alat}
                                />
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <InfoField
                                    label="Ruangan"
                                    value={selectedLoan?.ruangan}
                                />
                                <InfoField
                                    label="Jadwal Pengembalian"
                                    value={formatDateLabel(
                                        selectedLoan?.tanggal_kembali,
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 rounded-3xl border border-[#E8E2DB] bg-white p-6 shadow-sm">
                        <div>
                            <p className="text-base font-semibold text-[#1A3263]">
                                Detail Pengembalian
                            </p>
                            <p className="text-xs text-[#547792]">
                                Catat kondisi buku dan unggah lampiran bukti
                                agar evaluasi lebih mudah.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[#1A3263]">
                                Tanggal Pengembalian *
                            </label>
                            <input
                                type="date"
                                value={form.data.tanggal_pengembalian}
                                onChange={(event) =>
                                    form.setData(
                                        'tanggal_pengembalian',
                                        event.target.value,
                                    )
                                }
                                className="w-full rounded-2xl border border-[#D7DFEE] bg-[#F8FAFC] px-4 py-2 text-sm text-[#1A3263] focus:border-[#1A3263] focus:bg-white focus:outline-none"
                            />
                            {form.errors.tanggal_pengembalian ? (
                                <p className="mt-1 text-xs text-red-600">
                                    {form.errors.tanggal_pengembalian}
                                </p>
                            ) : null}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[#1A3263]">
                                Kondisi Saat Dikembalikan *
                            </label>
                            <select
                                value={form.data.kondisi}
                                onChange={(event) =>
                                    form.setData(
                                        'kondisi',
                                        event.target.value as ConditionValue,
                                    )
                                }
                                className="w-full rounded-2xl border border-[#D7DFEE] bg-white px-4 py-2 text-sm text-[#1A3263] focus:border-[#1A3263] focus:outline-none"
                            >
                                {conditionOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {form.errors.kondisi ? (
                                <p className="mt-1 text-xs text-red-600">
                                    {form.errors.kondisi}
                                </p>
                            ) : null}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[#1A3263]">
                                Catatan
                            </label>
                            <textarea
                                rows={4}
                                value={form.data.catatan}
                                onChange={(event) =>
                                    form.setData('catatan', event.target.value)
                                }
                                className="w-full rounded-2xl border border-[#D7DFEE] bg-[#F8FAFC] px-4 py-2 text-sm text-[#1A3263] focus:border-[#1A3263] focus:bg-white focus:outline-none"
                                placeholder="Contoh: Terdapat goresan halus di bodi"
                            />
                            {form.errors.catatan ? (
                                <p className="text-xs text-red-600">
                                    {form.errors.catatan}
                                </p>
                            ) : null}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[#1A3263]">
                                Lampiran Bukti *
                            </label>
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/*"
                                required
                                onChange={handleFileChange}
                                className="text-xs text-[#1A3263]"
                            />
                            {form.data.lampiran ? (
                                <div className="flex items-center justify-between text-xs text-[#1A3263]">
                                    <span>{form.data.lampiran.name}</span>
                                    <button
                                        type="button"
                                        onClick={removeLampiran}
                                        className="text-[#1A3263] underline"
                                    >
                                        Hapus
                                    </button>
                                </div>
                            ) : null}
                            {form.errors.lampiran ? (
                                <p className="text-xs text-red-600">
                                    {form.errors.lampiran}
                                </p>
                            ) : null}
                        </div>

                        <button
                            type="submit"
                            disabled={
                                !form.data.peminjaman_id || form.processing
                            }
                            className="w-full rounded-2xl bg-[#1A3263] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2c4e7b] disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                            Simpan Pengembalian
                        </button>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
