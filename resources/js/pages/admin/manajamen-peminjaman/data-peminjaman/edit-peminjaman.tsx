import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
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

type BorrowerOption = {
    id: number;
    nama: string;
    kelas?: string | null;
};

type LoanItem = {
    id: number;
    peminjam_id: number;
    peminjam_nama: string;
    kelas: string;
    tanggal_pinjam: string;
    tanggal_pengembalian: string;
    jumlah: number;
    kondisi_pinjam: LoanCondition;
    keterangan_pinjam: string;
};

type FormFields = {
    peminjam_id: string;
    kelas: string;
    tanggal_pinjam: string;
    tanggal_pengembalian: string;
    jumlah: string;
    kondisi_pinjam: LoanCondition;
    keterangan_pinjam: string;
};

type PageProps = SharedData & {
    borrowers: BorrowerOption[];
    kelasOptions: string[];
    loan: LoanItem;
};

const conditionOptions: { value: LoanCondition; label: string }[] = [
    { value: 'baik', label: 'Kondisi Baik' },
    { value: 'rusak', label: 'Kondisi Rusak' },
    { value: 'hilang', label: 'Kehilangan' },
];

const breadcrumbs = (id: number): BreadcrumbItem[] => [
    { title: 'Admin Dashboard', href: adminRoutes.dashboard().url },
    { title: 'Manajemen Peminjaman', href: '/admin/peminjaman' },
    { title: 'Data Peminjaman', href: '/admin/peminjaman' },
    { title: 'Edit Peminjaman', href: `/admin/peminjaman/data/${id}/edit` },
];

export default function AdminEditPeminjamanPage() {
    const { borrowers, kelasOptions, loan } = usePage<PageProps>().props;

    const form = useForm<FormFields>({
        peminjam_id: loan.peminjam_id.toString(),
        kelas: loan.kelas,
        tanggal_pinjam: loan.tanggal_pinjam,
        tanggal_pengembalian: loan.tanggal_pengembalian,
        jumlah: loan.jumlah.toString(),
        kondisi_pinjam: loan.kondisi_pinjam,
        keterangan_pinjam: loan.keterangan_pinjam,
    });

    const [borrowerSearch, setBorrowerSearch] = useState('');

    const filteredBorrowers = useMemo(() => {
        if (!borrowerSearch) return borrowers;
        return borrowers.filter((borrower) =>
            borrower.nama.toLowerCase().includes(borrowerSearch.toLowerCase()),
        );
    }, [borrowerSearch, borrowers]);

    useEffect(() => {
        const selected = borrowers.find(
            (borrower) => borrower.id.toString() === form.data.peminjam_id,
        );
        if (selected?.kelas && form.data.kelas === '') {
            form.setData('kelas', selected.kelas);
        }
    }, [borrowers, form, form.data.kelas, form.data.peminjam_id]);

    const handleSubmit = () => {
        alertLoading('Sedang memperbarui data peminjaman...');
        form.transform((data) => ({ ...data, _method: 'patch' }));
        form.post(`/admin/peminjaman/data/${loan.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                closeAlert();
                alertSuccess('Data peminjaman berhasil diperbarui.');
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

    return (
        <AppLayout breadcrumbs={breadcrumbs(loan.id)}>
            <Head title={`Edit ${loan.peminjam_nama}`} />
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
                            Form Peminjaman
                        </p>
                        <h1 className="mt-2 text-3xl font-bold text-[#1A3263]">
                            Edit Peminjaman
                        </h1>
                        <p className="mt-1 text-sm text-[#547792]">
                            Perbarui detail transaksi agar data tetap akurat.
                        </p>
                    </div>
                    <Link
                        href={`/admin/peminjaman/data/${loan.id}`}
                        className="inline-flex items-center gap-2 rounded-2xl border border-[#E8E2DB] bg-white px-4 py-2 text-sm font-semibold text-[#1A3263] transition hover:bg-[#F8F6F1]"
                    >
                        <ArrowLeft className="h-4 w-4" /> Kembali
                    </Link>
                </div>

                <div className="grid items-start gap-6 lg:grid-cols-[1.4fr_0.8fr]">
                    <div className="space-y-6 rounded-3xl border border-[#E8E2DB] bg-white p-6 shadow-sm">
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
                                placeholder="Cari peminjam..."
                                className="w-full rounded-2xl border border-[#D7DFEE] bg-[#F8FAFC] px-4 py-2 text-sm text-[#1A3263] focus:border-[#1A3263] focus:bg-white focus:outline-none"
                            />
                            <select
                                value={form.data.peminjam_id}
                                onChange={(event) => {
                                    form.setData(
                                        'peminjam_id',
                                        event.target.value,
                                    );
                                    const match = borrowers.find(
                                        (borrower) =>
                                            borrower.id.toString() ===
                                            event.target.value,
                                    );
                                    if (match?.kelas) {
                                        form.setData('kelas', match.kelas);
                                    }
                                }}
                                className="mt-2 w-full rounded-2xl border border-[#D7DFEE] bg-white px-4 py-2 text-sm text-[#1A3263] focus:border-[#1A3263] focus:outline-none"
                            >
                                {filteredBorrowers.length === 0 ? (
                                    <option value="">
                                        Peminjam tidak ditemukan
                                    </option>
                                ) : null}
                                {filteredBorrowers.map((borrower) => (
                                    <option
                                        key={borrower.id}
                                        value={borrower.id}
                                    >
                                        {borrower.nama}
                                    </option>
                                ))}
                            </select>
                            {form.errors.peminjam_id ? (
                                <p className="text-xs text-red-600">
                                    {form.errors.peminjam_id}
                                </p>
                            ) : null}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="text-sm font-semibold text-[#1A3263]">
                                    Kelas *
                                </label>
                                <select
                                    value={form.data.kelas}
                                    onChange={(event) =>
                                        form.setData(
                                            'kelas',
                                            event.target.value,
                                        )
                                    }
                                    className="mt-2 w-full rounded-2xl border border-[#D7DFEE] bg-[#F8FAFC] px-4 py-2 text-sm text-[#1A3263] focus:border-[#1A3263] focus:bg-white focus:outline-none"
                                >
                                    <option value="" disabled>
                                        Pilih kelas
                                    </option>
                                    {kelasOptions.map((kelas) => (
                                        <option key={kelas} value={kelas}>
                                            {kelas}
                                        </option>
                                    ))}
                                </select>
                                {form.errors.kelas ? (
                                    <p className="mt-1 text-xs text-red-600">
                                        {form.errors.kelas}
                                    </p>
                                ) : null}
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-[#1A3263]">
                                    Jumlah *
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    value={form.data.jumlah}
                                    onChange={(event) =>
                                        form.setData(
                                            'jumlah',
                                            event.target.value,
                                        )
                                    }
                                    className="mt-2 w-full rounded-2xl border border-[#D7DFEE] bg-[#F8FAFC] px-4 py-2 text-sm text-[#1A3263] focus:border-[#1A3263] focus:bg-white focus:outline-none"
                                />
                                {form.errors.jumlah ? (
                                    <p className="mt-1 text-xs text-red-600">
                                        {form.errors.jumlah}
                                    </p>
                                ) : null}
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="text-sm font-semibold text-[#1A3263]">
                                    Tanggal Pinjam *
                                </label>
                                <input
                                    type="date"
                                    value={form.data.tanggal_pinjam}
                                    onChange={(event) =>
                                        form.setData(
                                            'tanggal_pinjam',
                                            event.target.value,
                                        )
                                    }
                                    className="mt-2 w-full rounded-2xl border border-[#D7DFEE] bg-[#F8FAFC] px-4 py-2 text-sm text-[#1A3263] focus:border-[#1A3263] focus:bg-white focus:outline-none"
                                />
                                {form.errors.tanggal_pinjam ? (
                                    <p className="mt-1 text-xs text-red-600">
                                        {form.errors.tanggal_pinjam}
                                    </p>
                                ) : null}
                            </div>
                            <div>
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
                                    className="mt-2 w-full rounded-2xl border border-[#D7DFEE] bg-[#F8FAFC] px-4 py-2 text-sm text-[#1A3263] focus:border-[#1A3263] focus:bg-white focus:outline-none"
                                />
                                {form.errors.tanggal_pengembalian ? (
                                    <p className="mt-1 text-xs text-red-600">
                                        {form.errors.tanggal_pengembalian}
                                    </p>
                                ) : null}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[#1A3263]">
                                Keterangan Peminjaman *
                            </label>
                            <textarea
                                rows={5}
                                value={form.data.keterangan_pinjam}
                                onChange={(event) =>
                                    form.setData(
                                        'keterangan_pinjam',
                                        event.target.value,
                                    )
                                }
                                className="w-full rounded-2xl border border-[#D7DFEE] bg-[#F8FAFC] px-4 py-2 text-sm text-[#1A3263] focus:border-[#1A3263] focus:bg-white focus:outline-none"
                                placeholder="Catat informasi penting terkait penggunaan barang"
                            />
                            {form.errors.keterangan_pinjam ? (
                                <p className="text-xs text-red-600">
                                    {form.errors.keterangan_pinjam}
                                </p>
                            ) : null}
                        </div>
                    </div>

                    <div className="space-y-6 rounded-3xl border border-[#E8E2DB] bg-white p-6 shadow-sm">
                        <div>
                            <p className="text-base font-semibold text-[#1A3263]">
                                Kondisi Peminjaman
                            </p>
                            <p className="text-xs text-[#547792]">
                                Pastikan kondisi barang tercatat sebelum keluar
                                dari gudang.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-semibold text-[#1A3263]">
                                Kondisi Barang *
                            </p>
                            <div className="grid gap-3">
                                {conditionOptions.map((option) => (
                                    <label
                                        key={option.value}
                                        className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 ${
                                            form.data.kondisi_pinjam ===
                                            option.value
                                                ? 'border-[#1A3263] bg-[#EEF2FF]'
                                                : 'border-[#E8E2DB] bg-[#FDFBF7]'
                                        }`}
                                    >
                                        <span className="text-sm font-semibold text-[#1A3263]">
                                            {option.label}
                                        </span>
                                        <input
                                            type="radio"
                                            name="kondisi_pinjam"
                                            value={option.value}
                                            checked={
                                                form.data.kondisi_pinjam ===
                                                option.value
                                            }
                                            onChange={(event) =>
                                                form.setData(
                                                    'kondisi_pinjam',
                                                    event.target
                                                        .value as LoanCondition,
                                                )
                                            }
                                            className="sr-only"
                                        />
                                    </label>
                                ))}
                            </div>
                            {form.errors.kondisi_pinjam ? (
                                <p className="text-xs text-red-600">
                                    {form.errors.kondisi_pinjam}
                                </p>
                            ) : null}
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                type="submit"
                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-transparent bg-[#1A3263] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#152750]"
                            >
                                Simpan Perubahan
                            </button>
                            <Link
                                href={`/admin/peminjaman/data/${loan.id}`}
                                className="inline-flex items-center gap-2 rounded-2xl border border-[#E8E2DB] bg-white px-4 py-2 text-sm font-semibold text-[#1A3263] transition hover:bg-[#F8F6F1]"
                            >
                                Batal
                            </Link>
                        </div>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
