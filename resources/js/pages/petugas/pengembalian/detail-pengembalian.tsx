import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

type ReturnStatus = 'menunggu' | 'tepat waktu' | 'telat' | 'rusak' | 'hilang';

type LoanInfo = {
    id?: number | null;
    nama_alat: string;
    kode_alat: string;
    lokasi: string;
    nama_peminjam: string;
    kelas: string;
    jumlah: number;
    tanggal_pinjam?: string | null;
    tanggal_kembali?: string | null;
};

type ReturnInfo = {
    id: number;
    tanggal_pengembalian?: string | null;
    kondisi?: string | null;
    catatan?: string | null;
    lampiran_url?: string | null;
    status: ReturnStatus;
};

type PageProps = SharedData & {
    loan: LoanInfo | null;
    pengembalian: ReturnInfo;
    status_label: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Petugas Dashboard', href: '/petugas/dashboard' },
    { title: 'Data Pengembalian', href: '/petugas/pengembalian' },
    { title: 'Detail Pengembalian', href: '#' },
];

const statusConfig: Record<
    ReturnStatus,
    { label: string; palette: string; dot: string }
> = {
    menunggu: {
        label: 'Proses Pengecekan',
        palette: 'bg-[#FEF3C7] text-[#C2410C]',
        dot: 'bg-[#C2410C]',
    },
    'tepat waktu': {
        label: 'Tepat Waktu',
        palette: 'bg-[#DCFCE7] text-[#065F46]',
        dot: 'bg-[#16A34A]',
    },
    telat: {
        label: 'Telat',
        palette: 'bg-[#FEE2E2] text-[#991B1B]',
        dot: 'bg-[#DC2626]',
    },
    rusak: {
        label: 'Rusak',
        palette: 'bg-[#FEF3C7] text-[#C2410C]',
        dot: 'bg-[#C2410C]',
    },
    hilang: {
        label: 'Hilang',
        palette: 'bg-[#FEE2E2] text-[#991B1B]',
        dot: 'bg-[#DC2626]',
    },
};

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
});

const formatDate = (value?: string | null) =>
    value ? dateFormatter.format(new Date(value)) : '-';

export default function PetugasDetailPengembalianPage() {
    const { loan, pengembalian } = usePage<PageProps>().props;
    const metadata = statusConfig[pengembalian.status] ?? statusConfig.menunggu;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Detail Pengembalian" />

            <div className="space-y-6 bg-[#F5F1EA] p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-xs font-semibold tracking-[0.25em] text-[#547792] uppercase">
                            Manajemen Peminjaman
                        </p>
                        <h1 className="mt-2 text-3xl font-bold text-[#1A3263]">
                            Detail Pengembalian
                        </h1>
                        <p className="mt-1 text-sm text-[#547792]">
                            Ringkasan alat yang sudah dikembalikan beserta
                            status pemeriksaannya.
                        </p>
                    </div>
                    <Link
                        href="/petugas/pengembalian"
                        className="inline-flex items-center gap-2 rounded-full border border-[#1A3263] px-4 py-2 text-sm font-semibold text-[#1A3263] transition hover:bg-[#1A3263] hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" /> Kembali
                    </Link>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="space-y-4 rounded-3xl border border-[#E8E2DB] bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold tracking-[0.25em] text-[#547792] uppercase">
                                    Informasi Alat
                                </p>
                                <h2 className="mt-1 text-xl font-bold text-[#1A3263]">
                                    {loan?.nama_alat ?? '-'}
                                </h2>
                            </div>
                            <span
                                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${metadata.palette}`}
                            >
                                <span
                                    className={`h-2.5 w-2.5 rounded-full ${metadata.dot}`}
                                />
                                {metadata.label}
                            </span>
                        </div>

                        <dl className="grid gap-3 text-sm text-[#1A3263]">
                            <div className="flex justify-between">
                                <dt className="text-[#547792]">Kode Alat</dt>
                                <dd className="font-semibold">
                                    {loan?.kode_alat ?? '-'}
                                </dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-[#547792]">Lokasi</dt>
                                <dd className="font-semibold">
                                    {loan?.lokasi ?? '-'}
                                </dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-[#547792]">Jumlah</dt>
                                <dd className="font-semibold">
                                    {loan?.jumlah ?? 0}
                                </dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-[#547792]">
                                    Tanggal Pinjam
                                </dt>
                                <dd className="font-semibold">
                                    {formatDate(loan?.tanggal_pinjam)}
                                </dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-[#547792]">
                                    Batas Peminjaman
                                </dt>
                                <dd className="font-semibold">
                                    {formatDate(loan?.tanggal_kembali)}
                                </dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-[#547792]">
                                    Tanggal Dikembalikan
                                </dt>
                                <dd className="font-semibold">
                                    {formatDate(
                                        pengembalian.tanggal_pengembalian,
                                    )}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    <div className="space-y-4 rounded-3xl border border-[#E8E2DB] bg-white p-6 shadow-sm">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.25em] text-[#547792] uppercase">
                                Informasi Peminjam
                            </p>
                            <h2 className="mt-1 text-xl font-bold text-[#1A3263]">
                                {loan?.nama_peminjam ?? '-'}
                            </h2>
                            <p className="text-sm text-[#547792]">
                                {loan?.kelas ?? '-'}
                            </p>
                        </div>

                        <dl className="space-y-3 text-sm text-[#1A3263]">
                            <div>
                                <dt className="text-[#547792]">
                                    Kondisi Saat Dikembalikan
                                </dt>
                                <dd className="font-semibold capitalize">
                                    {pengembalian.kondisi ?? 'Tidak dicatat'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-[#547792]">
                                    Catatan Pemeriksaan
                                </dt>
                                <dd className="font-semibold">
                                    {pengembalian.catatan?.trim() ||
                                        'Tidak ada catatan.'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-[#547792]">
                                    Lampiran Bukti
                                </dt>
                                <dd>
                                    {pengembalian.lampiran_url ? (
                                        <a
                                            href={pengembalian.lampiran_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-sm font-semibold text-[#1A3263] underline hover:text-[#0F1D3A]"
                                        >
                                            Lihat lampiran
                                        </a>
                                    ) : (
                                        <span className="text-sm text-[#94A3B8]">
                                            Tidak ada lampiran.
                                        </span>
                                    )}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
