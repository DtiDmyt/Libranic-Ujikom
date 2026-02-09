import { Head } from '@inertiajs/react';
import { Eye, Plus, Trash2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'Manajemen Peminjaman', href: '/admin/peminjaman' },
    { title: 'Data Pengembalian', href: '/admin/peminjaman/pengembalian' },
];

type LoanStatus = 'menunggu' | 'disetujui' | 'ditolak';

type LoanRow = {
    id: number;
    nama_barang: string;
    peminjam: string;
    kelas: string;
    jumlah: number;
    tanggal_pinjam: string;
    tanggal_pengembalian: string;
    status: LoanStatus;
};

const staticLoans: LoanRow[] = [
    {
        id: 1,
        nama_barang: 'Bor Listrik Bosch',
        peminjam: 'Aldo Wiranata',
        kelas: 'X PPLG 1',
        jumlah: 2,
        tanggal_pinjam: '2026-02-01',
        tanggal_pengembalian: '2026-02-08',
        status: 'menunggu',
    },
    {
        id: 2,
        nama_barang: 'Mesin Las Panasonic',
        peminjam: 'Naila Ramadhani',
        kelas: 'XI ANM 2',
        jumlah: 1,
        tanggal_pinjam: '2026-02-03',
        tanggal_pengembalian: '2026-02-10',
        status: 'disetujui',
    },
    {
        id: 3,
        nama_barang: 'Senter Industri Dewalt',
        peminjam: 'Rafi Pratama',
        kelas: 'XII BCF 1',
        jumlah: 3,
        tanggal_pinjam: '2026-02-05',
        tanggal_pengembalian: '2026-02-12',
        status: 'ditolak',
    },
];

const statusLabels: Record<LoanStatus, string> = {
    menunggu: 'Menunggu Persetujuan',
    disetujui: 'Disetujui',
    ditolak: 'Ditolak',
};

const statusStyles: Record<LoanStatus, string> = {
    menunggu: 'bg-[#FEF3C7] text-[#C2410C]',
    disetujui: 'bg-[#ECFDF5] text-[#065F46]',
    ditolak: 'bg-[#FEE2E2] text-[#991B1B]',
};

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
});

const formatDate = (value: string) => dateFormatter.format(new Date(value));

const renderStatusBadge = (status: LoanStatus) => (
    <span
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status]}`}
    >
        <span
            className={`h-2.5 w-2.5 rounded-full ${
                status === 'disetujui'
                    ? 'bg-[#059669]'
                    : status === 'ditolak'
                      ? 'bg-[#B91C1C]'
                      : 'bg-[#F97316]'
            }`}
        />
        {statusLabels[status]}
    </span>
);

export default function AdminDataPengembalianPage() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Pengembalian" />
            <div className="space-y-6 bg-[#F5F1EA] p-6">
                <div>
                    <p className="text-xs font-semibold tracking-[0.25em] text-[#547792] uppercase">
                        Manajemen Peminjaman
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-4">
                        <h1 className="text-3xl font-bold text-[#1A3263]">
                            Data Pengembalian
                        </h1>
                    </div>
                    <p className="mt-1 text-sm text-[#547792]">
                        Tampilan ini disamakan dengan daftar peminjaman, masih
                        statis untuk ilustrasi pengembalian.
                    </p>
                </div>

                <div className="rounded-3xl border border-[#E8E2DB] bg-white shadow-sm">
                    <div className="space-y-4 border-b border-[#E8E2DB] p-6">
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                className="inline-flex items-center gap-2 rounded-xl bg-[#1A3263] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#1A3263]/30"
                            >
                                <Plus className="h-4 w-4" /> Tambah data
                            </button>
                            <button
                                type="button"
                                className="inline-flex items-center gap-2 rounded-xl bg-[#F87171] px-4 py-2 text-sm font-semibold text-white"
                            >
                                <Trash2 className="h-4 w-4" /> Hapus
                            </button>
                            <div className="ml-auto text-xs font-semibold tracking-wide text-[#547792] uppercase">
                                Statis • ilustrasi
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto [-ms-overflow-style:'none'] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        <table className="min-w-[1200px] divide-y divide-[#E8E2DB]">
                            <thead className="text-left text-xs font-semibold tracking-wide text-[#547792] uppercase">
                                <tr className="bg-[#E8E2DB]">
                                    <th className="px-6 py-4">No</th>
                                    <th className="px-4 py-4">Aksi</th>
                                    <th className="px-4 py-4">Status</th>
                                    <th className="px-4 py-4">Nama Barang</th>
                                    <th className="px-4 py-4">Peminjam</th>
                                    <th className="px-4 py-4">Jumlah</th>
                                    <th className="px-4 py-4">
                                        Tanggal Pinjam
                                    </th>
                                    <th className="px-4 py-4">
                                        Tanggal Pengembalian
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F0EBE2] bg-white">
                                {staticLoans.map((item, index) => (
                                    <tr
                                        key={item.id}
                                        className="text-sm hover:bg-[#F8F6F1]"
                                    >
                                        <td className="px-6 py-4 font-semibold text-[#1A3263]">
                                            {index + 1}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2 text-[#1A3263]">
                                                <button
                                                    type="button"
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E0E7FF] transition hover:bg-[#EEF2FF]"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-[#1A3263]">
                                            {renderStatusBadge(item.status)}
                                        </td>
                                        <td className="px-4 py-4 text-[#1A3263]">
                                            <p className="font-semibold">
                                                {item.nama_barang}
                                            </p>
                                        </td>
                                        <td className="px-4 py-4 text-[#1A3263]">
                                            <p className="font-medium">
                                                {item.peminjam}
                                            </p>
                                            <p className="text-xs text-[#547792]">
                                                {item.kelas}
                                            </p>
                                        </td>
                                        <td className="px-4 py-4 text-[#1A3263]">
                                            {item.jumlah}
                                        </td>
                                        <td className="px-4 py-4 text-[#547792]">
                                            {formatDate(item.tanggal_pinjam)}
                                        </td>
                                        <td className="px-4 py-4 text-[#547792]">
                                            {formatDate(
                                                item.tanggal_pengembalian,
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="border-t border-[#E8E2DB] px-6 py-4 text-sm text-[#547792]">
                        Menampilkan {staticLoans.length} data statis
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
