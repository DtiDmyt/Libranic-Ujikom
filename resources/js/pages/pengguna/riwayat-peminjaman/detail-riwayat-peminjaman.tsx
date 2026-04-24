import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData } from '@/types';

type DetailLoan = {
    id: number;
    nama_alat: string;
    nama_peminjam: string;
    jumlah: number;
    kelas?: string | null;
    kode_alat?: string | null;
    lokasi?: string | null;
    tanggal_pinjam?: string | null;
    tanggal_kembali?: string | null;
    denda_per_hari?: number;
};

type DetailReturn = {
    tanggal_pengembalian?: string | null;
    kondisi?: string | null;
    catatan?: string | null;
    catatan_admin?: string | null;
    lampiran_url?: string | null;
};

type PageProps = SharedData & {
    loan: DetailLoan;
    pengembalian: DetailReturn;
    return_status: string;
    return_status_label: string;
    late_days: number;
    penalty: number;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard Pengguna', href: '/dashboard' },
    { title: 'Peminjaman Saya', href: '/peminjaman' },
    { title: 'Riwayat Peminjaman', href: '/peminjaman/riwayat-peminjaman' },
];

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
});

const formatDate = (value?: string | null) =>
    value ? dateFormatter.format(new Date(value)) : '-';

const resolveAdminNote = (status: string, note?: string | null) => {
    const normalizedStatus = status.toLowerCase().trim();

    if (normalizedStatus === 'menunggu' || normalizedStatus === 'tepat waktu') {
        return '-';
    }

    return note?.trim() || '-';
};

const statusConfig: Record<
    string,
    { label: string; palette: string; dot: string }
> = {
    menunggu: {
        label: 'Proses Pengecekan',
        palette: 'bg-[#FEF3C7] text-[#C2410C]',
        dot: 'bg-[#F97316]',
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
    ditolak: {
        label: 'Ditolak',
        palette: 'bg-[#FEE2E2] text-[#991B1B]',
        dot: 'bg-[#DC2626]',
    },
};

type InfoCardProps = {
    label: string;
    value: string | number;
};

function InfoCard({ label, value }: InfoCardProps) {
    return (
        <div className="rounded-2xl border border-[#E8E2DB] bg-[#FBF8F4] p-4">
            <p className="text-xs font-semibold tracking-[0.2em] text-[#8E7661] uppercase">
                {label}
            </p>
            <p className="mt-2 text-sm font-semibold text-[#1A3263]">
                {value || value === 0 ? value : '-'}
            </p>
        </div>
    );
}

export default function PenggunaDetailRiwayatPeminjamanPage() {
    const { loan, pengembalian, return_status, return_status_label } =
        usePage<PageProps>().props;

    const normalizedStatus = return_status.toLowerCase().trim();
    const statusEntry = statusConfig[normalizedStatus] ?? statusConfig.menunggu;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Detail Riwayat Peminjaman" />

            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm">
                <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
                    <div className="flex items-start justify-between gap-4 border-b border-[#E8E2DB] px-6 py-5">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.25em] text-[#8E7661] uppercase">
                                Detail Riwayat
                            </p>
                            <h1 className="mt-2 text-2xl font-bold text-[#1A3263]">
                                {loan.nama_alat}
                            </h1>
                            <p className="mt-1 text-sm text-[#547792]">
                                {loan.nama_peminjam} · {loan.kelas ?? '-'}
                            </p>
                            <p className="mt-1 text-xs text-[#547792]">
                                {loan.kode_alat ?? '-'} · {loan.lokasi ?? '-'}
                            </p>
                        </div>
                        <Link
                            href="/peminjaman/riwayat-peminjaman"
                            className="inline-flex items-center gap-2 rounded-full border border-[#E8E2DB] bg-white px-4 py-2 text-sm font-semibold text-[#1A3263] transition hover:bg-[#F8F6F1]"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Tutup
                        </Link>
                    </div>

                    <div className="space-y-5 p-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold tracking-[0.25em] text-[#8E7661] uppercase">
                                    Status Pengembalian
                                </p>
                                <span
                                    className={`mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusEntry.palette}`}
                                >
                                    <span
                                        className={`h-2.5 w-2.5 rounded-full ${statusEntry.dot}`}
                                    />
                                    {return_status_label}
                                </span>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <InfoCard
                                label="Jumlah"
                                value={`${loan.jumlah} unit`}
                            />
                            <InfoCard
                                label="Tanggal Pinjam"
                                value={formatDate(loan.tanggal_pinjam)}
                            />
                            <InfoCard
                                label="Batas Pengembalian"
                                value={formatDate(loan.tanggal_kembali)}
                            />
                        </div>

                        <div className="rounded-3xl border border-dashed border-[#D7DFEE] bg-[#F8FAFC] p-5">
                            <p className="text-xs font-semibold tracking-[0.2em] text-[#8E7661] uppercase">
                                Catatan Admin
                            </p>
                            <p className="mt-2 text-sm leading-6 text-[#1A3263]">
                                {resolveAdminNote(
                                    normalizedStatus,
                                    pengembalian.catatan_admin,
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
