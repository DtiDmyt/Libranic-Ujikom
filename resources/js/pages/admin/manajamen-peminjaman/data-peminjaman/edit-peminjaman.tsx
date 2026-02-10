import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
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

type BorrowerOption = {
    id: number;
    nama: string;
    kelas?: string | null;
};

type ToolCategory = {
    id: number;
    nama: string;
};

type ToolOption = {
    id: number;
    nama: string;
    kategori_id: number | null;
    kategori_nama: string;
    kode: string;
    ruangan: string;
    stok?: number;
};

type LoanItem = {
    id: number;
    peminjam_id: number;
    peminjam_nama: string;
    kelas: string;
    alat_id: number;
    alat_nama: string;
    kategori_alat_id: number;
    kategori_alat_nama: string;
    kode_alat: string;
    lokasi_stok: string;
    tanggal_pinjam: string;
    tanggal_pengembalian: string;
    jumlah: number;
    kondisi_pinjam: string;
    keterangan_pinjam: string;
};

type FormFields = {
    peminjam_id: string;
    kelas: string;
    daftarbarang_id: string;
    kategori_alat_id: string;
    tanggal_pinjam: string;
    tanggal_pengembalian: string;
    jumlah: string;
    kondisi_pinjam: string;
    keterangan_pinjam: string;
};

type PageProps = SharedData & {
    borrowers: BorrowerOption[];
    kelasOptions: string[];
    loan: LoanItem;
    tools: ToolOption[];
    toolCategories: ToolCategory[];
};

const breadcrumbs = (id: number): BreadcrumbItem[] => [
    { title: 'Admin Dashboard', href: adminRoutes.dashboard().url },
    { title: 'Manajemen Peminjaman', href: '/admin/data-peminjaman/peminjaman' },
    { title: 'Data Peminjaman', href: '/admin/data-peminjaman/peminjaman' },
    { title: 'Edit Peminjaman', href: `/admin/data-peminjaman/peminjaman/${id}/edit` },
];

export default function AdminEditPeminjamanPage() {
    const { borrowers, kelasOptions, loan, tools, toolCategories } =
        usePage<PageProps>().props;

    const form = useForm<FormFields>({
        peminjam_id: loan.peminjam_id.toString(),
        kelas: loan.kelas,
        daftarbarang_id: loan.alat_id?.toString() ?? '',
        kategori_alat_id: loan.kategori_alat_id?.toString() ?? '',
        tanggal_pinjam: loan.tanggal_pinjam,
        tanggal_pengembalian: loan.tanggal_pengembalian,
        jumlah: loan.jumlah.toString(),
        kondisi_pinjam: loan.kondisi_pinjam,
        keterangan_pinjam: loan.keterangan_pinjam,
    });

    const [borrowerSearch, setBorrowerSearch] = useState('');
    const [toolSearch, setToolSearch] = useState('');

    const hasTools = tools.length > 0;
    const hasCategories = toolCategories.length > 0;

    const filteredBorrowers = useMemo(() => {
        if (!borrowerSearch) return borrowers;
        return borrowers.filter((borrower) =>
            borrower.nama.toLowerCase().includes(borrowerSearch.toLowerCase()),
        );
    }, [borrowerSearch, borrowers]);

    const filteredTools = useMemo(() => {
        if (!hasTools) {
            return [] as ToolOption[];
        }

        const keyword = toolSearch.toLowerCase();

        return tools.filter((tool) => {
            const matchesCategory = form.data.kategori_alat_id
                ? tool.kategori_id?.toString() === form.data.kategori_alat_id
                : true;
            const matchesKeyword = keyword
                ? tool.nama.toLowerCase().includes(keyword)
                : true;

            return matchesCategory && matchesKeyword;
        });
    }, [form.data.kategori_alat_id, hasTools, toolSearch, tools]);

    const selectedTool = useMemo(() => {
        if (!form.data.daftarbarang_id) {
            return undefined;
        }

        return tools.find(
            (tool) => tool.id.toString() === form.data.daftarbarang_id,
        );
    }, [form.data.daftarbarang_id, tools]);

    const kodeAlat = selectedTool?.kode ?? loan.kode_alat ?? '';
    const lokasiStok = selectedTool?.ruangan ?? loan.lokasi_stok ?? '';
    const stokTersedia =
        typeof selectedTool?.stok === 'number' ? selectedTool.stok : null;

    const categoryExists = useMemo(() => {
        if (!form.data.kategori_alat_id) {
            return false;
        }

        return toolCategories.some(
            (category) => category.id.toString() === form.data.kategori_alat_id,
        );
    }, [form.data.kategori_alat_id, toolCategories]);

    const toolOptionMissing = Boolean(
        form.data.daftarbarang_id && !selectedTool,
    );

    const handleToolChange = (value: string) => {
        form.setData('daftarbarang_id', value);
        const match = tools.find((tool) => tool.id.toString() === value);
        if (match) {
            form.setData(
                'kategori_alat_id',
                match.kategori_id !== null && match.kategori_id !== undefined
                    ? match.kategori_id.toString()
                    : '',
            );
        }
    };

    const handleCategoryChange = (value: string) => {
        form.setData('kategori_alat_id', value);
        const currentTool = tools.find(
            (tool) => tool.id.toString() === form.data.daftarbarang_id,
        );

        if (!value || !currentTool) {
            return;
        }

        if (currentTool.kategori_id?.toString() !== value) {
            form.setData('daftarbarang_id', '');
        }
    };

    const handleSubmit = () => {
        alertLoading('Sedang memperbarui data peminjaman...');
        form.transform((data) => ({ ...data, _method: 'patch' }));
        form.post(`/admin/data-peminjaman/peminjaman/${loan.id}`, {
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
                        href={`/admin/data-peminjaman/peminjaman/${loan.id}`}
                        className="inline-flex items-center gap-2 rounded-2xl border border-[#E8E2DB] bg-white px-4 py-2 text-sm font-semibold text-[#1A3263] transition hover:bg-[#F8F6F1]"
                    >
                        <ArrowLeft className="h-4 w-4" /> Kembali
                    </Link>
                </div>

                <div className="grid items-start gap-6 lg:grid-cols-[1.4fr_0.8fr]">
                    <div className="space-y-6 rounded-3xl border border-[#E8E2DB] bg-white p-6 shadow-sm">
                        <div>
                            <p className="text-base font-semibold text-[#1A3263]">
                                Informasi Peminjam
                            </p>
                            <p className="text-xs text-[#547792]">
                                Cari nama peminjam, kelas akan mengikuti data
                                master.
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
                                    } else {
                                        form.setData('kelas', '');
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
                                    Kelas
                                </label>
                                <input
                                    type="text"
                                    value={form.data.kelas}
                                    readOnly
                                    placeholder="Pilih nama peminjam terlebih dahulu"
                                    className="mt-2 w-full rounded-2xl border border-[#D7DFEE] bg-[#F0F2F8] px-4 py-2 text-sm text-[#1A3263] focus:border-[#1A3263] focus:bg-[#F0F2F8] focus:outline-none"
                                />
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

                        <div>
                            <p className="text-base font-semibold text-[#1A3263]">
                                Jadwal & Keperluan
                            </p>
                            <p className="text-xs text-[#547792]">
                                Pastikan tanggal sesuai kesepakatan dengan
                                peminjam.
                            </p>
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
                                Deskripsi Keperluan Peminjaman *
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
                                placeholder="Perbarui tujuan penggunaan atau catatan tambahan"
                            />
                            {form.errors.keterangan_pinjam ? (
                                <p className="text-xs text-red-600">
                                    {form.errors.keterangan_pinjam}
                                </p>
                            ) : null}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-4 rounded-3xl border border-[#E8E2DB] bg-white p-6 shadow-sm">
                            <div>
                                <p className="text-base font-semibold text-[#1A3263]">
                                    Detail Alat
                                </p>
                                <p className="text-xs text-[#547792]">
                                    Periksa kembali alat yang dipinjam agar kode
                                    dan lokasi selalu sesuai.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-[#1A3263]">
                                    Kategori Alat
                                </label>
                                <select
                                    value={form.data.kategori_alat_id}
                                    onChange={(event) =>
                                        handleCategoryChange(event.target.value)
                                    }
                                    disabled={!hasCategories || !hasTools}
                                    className="w-full rounded-2xl border border-[#D7DFEE] bg-white px-4 py-2 text-sm text-[#1A3263] focus:border-[#1A3263] focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
                                >
                                    {!hasCategories ? (
                                        <option value="">
                                            Belum ada kategori alat
                                        </option>
                                    ) : (
                                        <>
                                            <option value="">
                                                Semua kategori
                                            </option>
                                            {toolCategories.map((category) => (
                                                <option
                                                    key={category.id}
                                                    value={category.id.toString()}
                                                >
                                                    {category.nama}
                                                </option>
                                            ))}
                                            {!categoryExists &&
                                            form.data.kategori_alat_id ? (
                                                <option
                                                    value={
                                                        form.data
                                                            .kategori_alat_id
                                                    }
                                                >
                                                    {loan.kategori_alat_nama}{' '}
                                                    (tidak tersedia)
                                                </option>
                                            ) : null}
                                        </>
                                    )}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-[#1A3263]">
                                    Nama Alat *
                                </label>
                                <input
                                    type="text"
                                    value={toolSearch}
                                    onChange={(event) =>
                                        setToolSearch(event.target.value)
                                    }
                                    disabled={!hasTools}
                                    placeholder="Cari berdasarkan nama alat"
                                    className="w-full rounded-2xl border border-[#D7DFEE] bg-[#F8FAFC] px-4 py-2 text-sm text-[#1A3263] focus:border-[#1A3263] focus:bg-white focus:outline-none disabled:cursor-not-allowed"
                                />
                                <select
                                    value={form.data.daftarbarang_id}
                                    onChange={(event) =>
                                        handleToolChange(event.target.value)
                                    }
                                    disabled={!hasTools}
                                    className="mt-2 w-full rounded-2xl border border-[#D7DFEE] bg-white px-4 py-2 text-sm text-[#1A3263] focus:border-[#1A3263] focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
                                >
                                    {!hasTools ? (
                                        <option value="">
                                            Belum ada data alat
                                        </option>
                                    ) : filteredTools.length === 0 ? (
                                        <option value="">
                                            Tidak ada alat yang cocok
                                        </option>
                                    ) : (
                                        <>
                                            <option value="" disabled>
                                                Pilih alat yang dipinjam
                                            </option>
                                            {filteredTools.map((tool) => (
                                                <option
                                                    key={tool.id}
                                                    value={tool.id.toString()}
                                                >
                                                    {tool.nama}
                                                </option>
                                            ))}
                                        </>
                                    )}
                                    {toolOptionMissing ? (
                                        <option
                                            value={form.data.daftarbarang_id}
                                        >
                                            {loan.alat_nama} (tidak tersedia)
                                        </option>
                                    ) : null}
                                </select>
                                {form.errors.daftarbarang_id ? (
                                    <p className="text-xs text-red-600">
                                        {form.errors.daftarbarang_id}
                                    </p>
                                ) : null}
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="text-sm font-semibold text-[#1A3263]">
                                        Kode Alat
                                    </label>
                                    <input
                                        type="text"
                                        value={kodeAlat}
                                        readOnly
                                        placeholder="Pilih alat terlebih dahulu"
                                        className="mt-2 w-full rounded-2xl border border-[#D7DFEE] bg-[#F0F2F8] px-4 py-2 text-sm text-[#1A3263] focus:border-[#1A3263] focus:bg-[#F0F2F8] focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-[#1A3263]">
                                        Lokasi Stok
                                    </label>
                                    <input
                                        type="text"
                                        value={lokasiStok}
                                        readOnly
                                        placeholder="Pilih alat terlebih dahulu"
                                        className="mt-2 w-full rounded-2xl border border-[#D7DFEE] bg-[#F0F2F8] px-4 py-2 text-sm text-[#1A3263] focus:border-[#1A3263] focus:bg-[#F0F2F8] focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="rounded-2xl bg-[#F8FAFC] p-4 text-xs text-[#547792]">
                                {selectedTool ? (
                                    <>
                                        <p className="text-sm font-semibold text-[#1A3263]">
                                            Stok tersedia: {stokTersedia ?? '–'}{' '}
                                            unit
                                        </p>
                                        <p className="mt-1">
                                            Catat perubahan stok setelah
                                            peminjaman diperbarui.
                                        </p>
                                    </>
                                ) : (
                                    <p className="text-sm font-semibold text-[#1A3263]">
                                        Alat lama masih tercatat, pilih opsi
                                        baru bila perlu.
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-3 pt-2">
                                <button
                                    type="submit"
                                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-transparent bg-[#1A3263] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#152750]"
                                >
                                    Simpan Perubahan
                                </button>
                                <Link
                                    href={`/admin/data-peminjaman/peminjaman/${loan.id}`}
                                    className="inline-flex items-center gap-2 rounded-2xl border border-[#E8E2DB] bg-white px-4 py-2 text-sm font-semibold text-[#1A3263] transition hover:bg-[#F8F6F1]"
                                >
                                    Batal
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
