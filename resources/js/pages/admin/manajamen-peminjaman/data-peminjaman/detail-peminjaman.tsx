import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, FileText, PencilLine, Printer } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import adminRoutes from '@/routes/admin';
import type { BreadcrumbItem, SharedData } from '@/types';

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
});

const formatDateTime = (value?: string | null) =>
    value ? dateFormatter.format(new Date(value)) : '-';

type LoanCondition = 'baik' | 'rusak' | 'hilang';
type LoanStatus = 'berjalan' | 'selesai' | 'telat';

type ExtensionHistory = {
    tanggal: string;
    catatan: string;
    petugas: string;
};

type LoanDetail = {
    id: number;
    kode_transaksi: string;
    nama_barang: string;
    peminjam: string;
    kelas: string;
    jumlah: number;
    kondisi_pinjam: LoanCondition;
    kondisi_pengembalian?: LoanCondition | null;
    tanggal_pinjam: string;
    tanggal_pengembalian: string;
    keterangan_pinjam: string;
    keterangan_pengembalian?: string | null;
    lampiran_url?: string | null;
    status: LoanStatus;
};

type PageProps = SharedData & {
    loan: LoanDetail;
    history: ExtensionHistory[];
};

const conditionLabels: Record<LoanCondition, string> = {
    baik: 'Baik',
    rusak: 'Rusak',
    hilang: 'Hilang',
};

const statusStyles: Record<LoanStatus, string> = {
    berjalan: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    selesai: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    telat: 'bg-rose-50 text-rose-700 border border-rose-200',
};

const breadcrumbs = (id: number): BreadcrumbItem[] => [
    { title: 'Admin Dashboard', href: adminRoutes.dashboard().url },
    { title: 'Manajemen Peminjaman', href: '/admin/peminjaman' },
    { title: 'Data Peminjaman', href: '/admin/peminjaman' },
    { title: 'Detail Peminjaman', href: `/admin/peminjaman/data/${id}` },
];

export default function AdminDetailPeminjamanPage() {
    const { loan, history } = usePage<PageProps>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs(loan.id)}>
            <Head title={`Detail ${loan.nama_barang}`} />
            <div className="space-y-6 bg-[#F5F1EA] p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold tracking-[0.25em] text-[#547792] uppercase">
                            Detail Peminjaman
                        </p>
                        <h1 className="mt-2 text-3xl font-bold text-[#1A3263]">
                            {loan.nama_barang}
                        </h1>
                        <p className="mt-1 text-sm text-[#547792]">
                            {loan.kode_transaksi}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-2 rounded-2xl border border-[#E8E2DB] bg-white px-4 py-2 text-sm font-semibold text-[#1A3263] transition hover:bg-[#F8F6F1]"
                        >
                            <Printer className="h-4 w-4" /> Cetak
                        </button>
                        <Link
                            href={`/admin/peminjaman/data/${loan.id}/edit`}
                            className="inline-flex items-center gap-2 rounded-2xl border border-transparent bg-[#1A3263] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#152750]"
                        >
                            <PencilLine className="h-4 w-4" /> Edit Data
                        </Link>
                        <Link
                            href="/admin/peminjaman"
                            className="inline-flex items-center gap-2 rounded-2xl border border-[#E8E2DB] bg-white px-4 py-2 text-sm font-semibold text-[#1A3263] transition hover:bg-[#F8F6F1]"
                        >
                            <ArrowLeft className="h-4 w-4" /> Kembali
                        </Link>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-3xl border border-[#E8E2DB] bg-white p-4">
                        <p className="text-xs text-[#547792] uppercase">
                            Peminjam
                        </p>
                        <p className="mt-2 text-xl font-semibold text-[#1A3263]">
                            {loan.peminjam}
                        </p>
                        <p className="text-sm text-[#547792]">
                            Kelas {loan.kelas}
                        </p>
                    </div>
                    <div className="rounded-3xl border border-[#E8E2DB] bg-white p-4">
                        <p className="text-xs text-[#547792] uppercase">
                            Jumlah
                        </p>
                        <p className="mt-2 text-xl font-semibold text-[#1A3263]">
                            {loan.jumlah} unit
                        </p>
                        <span
                            className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[loan.status]}`}
                        >
                            {loan.status === 'berjalan'
                                ? 'Sedang dipinjam'
                                : loan.status === 'selesai'
                                  ? 'Selesai'
                                  : 'Terlambat'}
                        </span>
                    </div>
                    <div className="rounded-3xl border border-[#E8E2DB] bg-white p-4">
                        <p className="text-xs text-[#547792] uppercase">
                            Kondisi Saat Dipinjam
                        </p>
                        <p className="mt-2 text-xl font-semibold text-[#1A3263]">
                            {conditionLabels[loan.kondisi_pinjam]}
                        </p>
                        <p className="text-sm text-[#547792]">
                            Kondisi kembali:{' '}
                            {loan.kondisi_pengembalian
                                ? conditionLabels[loan.kondisi_pengembalian]
                                : '-'}
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-3xl border border-[#E8E2DB] bg-white p-6 shadow-sm">
                        <p className="text-base font-semibold text-[#1A3263]">
                            Timeline Peminjaman
                        </p>
                        <div className="mt-4 space-y-4 text-sm text-[#1A3263]">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs text-[#547792] uppercase">
                                        Tanggal Pinjam
                                    </p>
                                    <p className="mt-1 font-semibold">
                                        {formatDateTime(loan.tanggal_pinjam)}
                                    </p>
                                </div>
                                <FileText className="h-10 w-10 text-[#C4A484]" />
                            </div>
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs text-[#547792] uppercase">
                                        Target Pengembalian
                                    </p>
                                    <p className="mt-1 font-semibold">
                                        {formatDateTime(
                                            loan.tanggal_pengembalian,
                                        )}
                                    </p>
                                </div>
                                <FileText className="h-10 w-10 text-[#C4A484]" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-[#E8E2DB] bg-white p-6 shadow-sm">
                        <p className="text-base font-semibold text-[#1A3263]">
                            Catatan Peminjaman
                        </p>
                        <div className="mt-4 space-y-4 text-sm text-[#1A3263]">
                            <div>
                                <p className="text-xs text-[#547792] uppercase">
                                    Keterangan
                                </p>
                                <p className="mt-1 rounded-2xl bg-[#F8FAFC] px-4 py-3 whitespace-pre-line">
                                    {loan.keterangan_pinjam}
                                </p>
                            </div>
                            {loan.keterangan_pengembalian ? (
                                <div>
                                    <p className="text-xs text-[#547792] uppercase">
                                        Catatan Pengembalian
                                    </p>
                                    <p className="mt-1 rounded-2xl bg-[#FDF5F5] px-4 py-3 whitespace-pre-line">
                                        {loan.keterangan_pengembalian}
                                    </p>
                                </div>
                            ) : null}
                            {loan.lampiran_url ? (
                                <a
                                    href={loan.lampiran_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#1A3263]"
                                >
                                    <FileText className="h-4 w-4" /> Lihat
                                    lampiran
                                </a>
                            ) : null}
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl border border-[#E8E2DB] bg-white p-6 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="text-base font-semibold text-[#1A3263]">
                                Riwayat Perpanjangan
                            </p>
                            <p className="text-xs text-[#547792]">
                                Catatan perubahan jadwal pengembalian.
                            </p>
                        </div>
                    </div>
                    <div className="mt-4 overflow-x-auto">
                        <table className="min-w-full divide-y divide-[#E8E2DB] text-sm">
                            <thead className="bg-[#F8F4EE] text-xs text-[#547792] uppercase">
                                <tr>
                                    <th className="px-4 py-3 text-left">
                                        Tanggal
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Petugas
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Catatan
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F1EBE2] text-[#1A3263]">
                                {history.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={3}
                                            className="px-4 py-6 text-center text-sm text-[#547792]"
                                        >
                                            Belum ada riwayat perpanjangan.
                                        </td>
                                    </tr>
                                ) : (
                                    history.map((entry, index) => (
                                        <tr key={`${entry.tanggal}-${index}`}>
                                            <td className="px-4 py-3">
                                                {formatDateTime(entry.tanggal)}
                                            </td>
                                            <td className="px-4 py-3">
                                                {entry.petugas}
                                            </td>
                                            <td className="px-4 py-3">
                                                {entry.catatan}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
