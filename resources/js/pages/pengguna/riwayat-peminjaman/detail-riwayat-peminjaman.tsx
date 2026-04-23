import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    BookOpen,
    CalendarDays,
    Clock3,
    FileText,
    User,
} from 'lucide-react';
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
    const {
        loan,
        pengembalian,
        return_status,
        return_status_label,
        late_days,
        penalty,
    } = usePage<PageProps>().props;

    const normalizedStatus = return_status.toLowerCase().trim();
    const statusEntry = statusConfig[normalizedStatus] ?? statusConfig.menunggu;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Riwayat ${loan.nama_alat}`} />

            <div className="space-y-6 bg-[#F5F1EA] p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold tracking-[0.25em] text-[#547792] uppercase">
                            Riwayat Peminjaman
                        </p>
                        <h1 className="mt-2 text-3xl font-bold text-[#1A3263]">
                            Detail Riwayat Peminjaman
                        </h1>
                        <p className="mt-1 text-sm text-[#547792]">
                            Lihat hasil akhir pengembalian buku dan catatan yang
                            sudah diverifikasi.
                        </p>
                    </div>
                    <Link
                        href="/peminjaman/riwayat-peminjaman"
                        className="inline-flex items-center gap-2 rounded-2xl border border-[#E8E2DB] bg-white px-4 py-2 text-sm font-semibold text-[#1A3263] transition hover:bg-[#F8F6F1]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali
                    </Link>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
                    <section className="space-y-6 rounded-3xl border border-[#E8E2DB] bg-white p-6 shadow-sm">
                        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E8E2DB] pb-4">
                            <div>
                                <p className="text-xs font-semibold tracking-[0.25em] text-[#8E7661] uppercase">
                                    Buku
                                </p>
                                <h2 className="mt-2 text-2xl font-bold text-[#1A3263]">
                                    {loan.nama_alat}
                                </h2>
                                <p className="mt-1 text-sm text-[#547792]">
                                    {loan.kode_alat ?? '-'} ·{' '}
                                    {loan.lokasi ?? '-'}
                                </p>
                            </div>
                            <span
                                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusEntry.palette}`}
                            >
                                <span
                                    className={`h-2.5 w-2.5 rounded-full ${statusEntry.dot}`}
                                />
                                {return_status_label}
                            </span>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            <InfoCard
                                label="Nama Peminjam"
                                value={loan.nama_peminjam}
                            />
                            <InfoCard label="Kelas" value={loan.kelas ?? '-'} />
                            <InfoCard
                                label="Jumlah"
                                value={`${loan.jumlah} unit`}
                            />
                            <InfoCard
                                label="Tanggal Pinjam"
                                value={formatDate(loan.tanggal_pinjam)}
                            />
                            <InfoCard
                                label="Tanggal Pengembalian"
                                value={formatDate(
                                    pengembalian.tanggal_pengembalian,
                                )}
                            />
                            <InfoCard
                                label="Denda / Hari"
                                value={`Rp ${new Intl.NumberFormat('id-ID').format(loan.denda_per_hari ?? 0)}`}
                            />
                        </div>

                        <div className="rounded-3xl border border-dashed border-[#D7DFEE] bg-[#F8FAFC] p-5">
                            <p className="text-xs font-semibold tracking-[0.2em] text-[#8E7661] uppercase">
                                Catatan Pengembalian
                            </p>
                            <p className="mt-2 text-sm leading-6 text-[#1A3263]">
                                {pengembalian.catatan_admin?.trim() ||
                                    pengembalian.catatan?.trim() ||
                                    'Tidak ada catatan yang disimpan.'}
                            </p>
                        </div>
                    </section>

                    <aside className="space-y-4">
                        <div className="rounded-3xl border border-[#E8E2DB] bg-white p-6 shadow-sm">
                            <p className="text-xs font-semibold tracking-[0.25em] text-[#8E7661] uppercase">
                                Hasil Akhir
                            </p>
                            <div className="mt-4 space-y-3">
                                <div className="flex items-center gap-3 rounded-2xl bg-[#F8FAFC] p-4 text-sm text-[#1A3263]">
                                    <Clock3 className="h-5 w-5 text-[#547792]" />
                                    <div>
                                        <p className="font-semibold">
                                            Status Akhir
                                        </p>
                                        <p className="text-xs text-[#547792]">
                                            {return_status_label}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 rounded-2xl bg-[#F8FAFC] p-4 text-sm text-[#1A3263]">
                                    <CalendarDays className="h-5 w-5 text-[#547792]" />
                                    <div>
                                        <p className="font-semibold">
                                            Terlambat
                                        </p>
                                        <p className="text-xs text-[#547792]">
                                            {late_days} hari
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 rounded-2xl bg-[#F8FAFC] p-4 text-sm text-[#1A3263]">
                                    <BookOpen className="h-5 w-5 text-[#547792]" />
                                    <div>
                                        <p className="font-semibold">
                                            Total Denda
                                        </p>
                                        <p className="text-xs text-[#547792]">
                                            Rp{' '}
                                            {new Intl.NumberFormat(
                                                'id-ID',
                                            ).format(penalty ?? 0)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-[#E8E2DB] bg-white p-6 shadow-sm">
                            <p className="text-xs font-semibold tracking-[0.25em] text-[#8E7661] uppercase">
                                Lampiran
                            </p>
                            <div className="mt-4 space-y-3 text-sm text-[#1A3263]">
                                {pengembalian.lampiran_url ? (
                                    <a
                                        href={pengembalian.lampiran_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 rounded-2xl border border-[#E0E7FF] px-4 py-3 font-semibold text-[#1A3263] transition hover:bg-[#EEF2FF]"
                                    >
                                        <FileText className="h-4 w-4" />
                                        Lihat lampiran
                                    </a>
                                ) : (
                                    <p className="rounded-2xl bg-[#F8FAFC] p-4 text-[#547792]">
                                        Tidak ada lampiran yang diunggah.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="rounded-3xl border border-[#E8E2DB] bg-white p-6 shadow-sm">
                            <p className="text-xs font-semibold tracking-[0.25em] text-[#8E7661] uppercase">
                                Ringkasan
                            </p>
                            <div className="mt-4 space-y-3 text-sm text-[#1A3263]">
                                <div className="flex items-center gap-3 rounded-2xl bg-[#FBF8F4] p-4">
                                    <User className="h-5 w-5 text-[#547792]" />
                                    <div>
                                        <p className="font-semibold">
                                            {loan.nama_peminjam}
                                        </p>
                                        <p className="text-xs text-[#547792]">
                                            {loan.kelas ?? '-'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 rounded-2xl bg-[#FBF8F4] p-4">
                                    <CalendarDays className="h-5 w-5 text-[#547792]" />
                                    <div>
                                        <p className="font-semibold">
                                            Batas Awal
                                        </p>
                                        <p className="text-xs text-[#547792]">
                                            {formatDate(loan.tanggal_kembali)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 rounded-2xl bg-[#FBF8F4] p-4">
                                    <Clock3 className="h-5 w-5 text-[#547792]" />
                                    <div>
                                        <p className="font-semibold">Status</p>
                                        <p className="text-xs text-[#547792]">
                                            {return_status_label}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </AppLayout>
    );
}
