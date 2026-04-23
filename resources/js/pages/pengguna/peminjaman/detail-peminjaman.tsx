import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    BookOpen,
    CalendarDays,
    Clock3,
    PencilLine,
    Send,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { type MouseEvent } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData } from '@/types';

type LoanDetail = {
    id: number;
    nama_alat: string;
    kode_alat: string;
    lokasi: string;
    nama_peminjam: string;
    nis_nip: string;
    kelas: string;
    jumlah: number;
    tanggal_pinjam?: string | null;
    tanggal_kembali?: string | null;
    status: string;
    denda_per_hari: number;
    perpanjangan_count: number;
    max_extensions: number;
    remaining_extensions: number;
    can_extend: boolean;
    can_delete: boolean;
    detail_url: string;
    edit_url: string;
    update_url: string;
    delete_url: string;
    return_url: string;
};

type PageProps = SharedData & {
    loan: LoanDetail;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard Pengguna', href: '/dashboard' },
    { title: 'Peminjaman Saya', href: '/peminjaman' },
    { title: 'Detail Peminjaman', href: '/peminjaman/daftar-peminjaman' },
];

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
});

const formatDate = (value?: string | null) =>
    value ? dateFormatter.format(new Date(value)) : '-';

const normalizeStatus = (status?: string | null) =>
    (status ?? 'menunggu').toLowerCase().trim();

const statusConfig: Record<
    string,
    { label: string; palette: string; dot: string }
> = {
    menunggu: {
        label: 'Menunggu Persetujuan',
        palette: 'bg-[#FEF3C7] text-[#C2410C]',
        dot: 'bg-[#F97316]',
    },
    disetujui: {
        label: 'Disetujui',
        palette: 'bg-[#DCFCE7] text-[#065F46]',
        dot: 'bg-[#16A34A]',
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

export default function PenggunaDetailPeminjamanPage() {
    const { loan } = usePage<PageProps>().props;
    const normalizedStatus = normalizeStatus(loan.status);
    const statusEntry = statusConfig[normalizedStatus] ?? statusConfig.menunggu;
    const canReturn = normalizedStatus === 'disetujui';

    const handleEditClick = (event: MouseEvent<Element>) => {
        if (loan.can_extend) {
            return;
        }

        event.preventDefault();
        Swal.fire({
            icon: 'warning',
            title: 'Perpanjangan belum tersedia',
            text: `Kamu hanya bisa memperpanjang peminjaman yang sudah disetujui maksimal ${loan.max_extensions}x.`,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail ${loan.nama_alat}`} />

            <div className="space-y-6 bg-[#F5F1EA] p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold tracking-[0.25em] text-[#547792] uppercase">
                            Peminjaman Saya
                        </p>
                        <h1 className="mt-2 text-3xl font-bold text-[#1A3263]">
                            Detail Peminjaman
                        </h1>
                        <p className="mt-1 text-sm text-[#547792]">
                            Lihat rincian buku yang sedang kamu pinjam dan
                            perpanjang jika masih tersedia.
                        </p>
                    </div>
                    <Link
                        href="/peminjaman/daftar-peminjaman"
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
                                    Buku Dipinjam
                                </p>
                                <h2 className="mt-2 text-2xl font-bold text-[#1A3263]">
                                    {loan.nama_alat}
                                </h2>
                                <p className="mt-1 text-sm text-[#547792]">
                                    {loan.kode_alat} · {loan.lokasi}
                                </p>
                            </div>
                            <span
                                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusEntry.palette}`}
                            >
                                <span
                                    className={`h-2.5 w-2.5 rounded-full ${statusEntry.dot}`}
                                />
                                {statusEntry.label}
                            </span>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            <InfoCard
                                label="Nama Peminjam"
                                value={loan.nama_peminjam}
                            />
                            <InfoCard label="NIS / NIP" value={loan.nis_nip} />
                            <InfoCard label="Kelas" value={loan.kelas} />
                            <InfoCard
                                label="Jumlah"
                                value={`${loan.jumlah} unit`}
                            />
                            <InfoCard
                                label="Tanggal Pinjam"
                                value={formatDate(loan.tanggal_pinjam)}
                            />
                            <InfoCard
                                label="Tanggal Kembali"
                                value={formatDate(loan.tanggal_kembali)}
                            />
                        </div>
                    </section>

                    <aside className="space-y-4">
                        <div className="rounded-3xl border border-[#E8E2DB] bg-white p-6 shadow-sm">
                            <p className="text-xs font-semibold tracking-[0.25em] text-[#8E7661] uppercase">
                                Aksi Cepat
                            </p>
                            <div className="mt-4 space-y-3">
                                <Link
                                    href={loan.edit_url}
                                    onClick={handleEditClick}
                                    className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                                        loan.can_extend
                                            ? 'bg-[#1A3263] text-white hover:bg-[#152750]'
                                            : 'cursor-not-allowed bg-slate-100 text-slate-400'
                                    }`}
                                >
                                    <PencilLine className="h-4 w-4" />
                                    Edit perpanjangan
                                </Link>
                                {canReturn ? (
                                    <Link
                                        href={loan.return_url}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#1A3263] bg-white px-4 py-3 text-sm font-semibold text-[#1A3263] transition hover:bg-[#EEF3FF]"
                                    >
                                        <Send className="h-4 w-4" />
                                        Ajukan pengembalian
                                    </Link>
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-[#D7DFEE] bg-[#FBF8F4] p-4 text-sm text-[#547792]">
                                        Pengembalian baru bisa diajukan setelah
                                        status disetujui.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="rounded-3xl border border-[#E8E2DB] bg-white p-6 shadow-sm">
                            <p className="text-xs font-semibold tracking-[0.25em] text-[#8E7661] uppercase">
                                Perpanjangan
                            </p>
                            <div className="mt-4 space-y-3 text-sm text-[#1A3263]">
                                <div className="flex items-center gap-3 rounded-2xl bg-[#F8FAFC] p-4">
                                    <Clock3 className="h-5 w-5 text-[#547792]" />
                                    <div>
                                        <p className="font-semibold">
                                            {loan.perpanjangan_count}/
                                            {loan.max_extensions} kali dipakai
                                        </p>
                                        <p className="text-xs text-[#547792]">
                                            Sisa {loan.remaining_extensions}{' '}
                                            kali perpanjangan.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 rounded-2xl bg-[#F8FAFC] p-4">
                                    <CalendarDays className="h-5 w-5 text-[#547792]" />
                                    <div>
                                        <p className="font-semibold">
                                            Batas terakhir
                                        </p>
                                        <p className="text-xs text-[#547792]">
                                            {formatDate(loan.tanggal_kembali)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 rounded-2xl bg-[#F8FAFC] p-4">
                                    <BookOpen className="h-5 w-5 text-[#547792]" />
                                    <div>
                                        <p className="font-semibold">
                                            Denda per hari
                                        </p>
                                        <p className="text-xs text-[#547792]">
                                            Rp{' '}
                                            {new Intl.NumberFormat(
                                                'id-ID',
                                            ).format(loan.denda_per_hari ?? 0)}
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
