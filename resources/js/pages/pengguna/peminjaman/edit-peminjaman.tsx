import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, Clock3, PencilLine } from 'lucide-react';
import Swal from 'sweetalert2';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData } from '@/types';

type LoanEdit = {
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
    keperluan?: string | null;
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
    next_return_date: string | null;
    extension_step_days: number;
};

type PageProps = SharedData & {
    loan: LoanEdit;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard Pengguna', href: '/dashboard' },
    { title: 'Peminjaman Saya', href: '/peminjaman' },
    { title: 'Edit Peminjaman', href: '/peminjaman/daftar-peminjaman' },
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
    dikembalikan: {
        label: 'Dikembalikan',
        palette: 'bg-[#DBEAFE] text-[#1D4ED8]',
        dot: 'bg-[#2563EB]',
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

export default function PenggunaEditPeminjamanPage() {
    const { loan } = usePage<PageProps>().props;
    const normalizedStatus = normalizeStatus(loan.status);
    const statusEntry = statusConfig[normalizedStatus] ?? statusConfig.menunggu;
    const [submitting, setSubmitting] = useState(false);
    const nextReturnDate = loan.next_return_date;

    const handleSubmit = () => {
        if (submitting || !loan.can_extend) {
            return;
        }

        setSubmitting(true);
        router.patch(
            loan.update_url,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    Swal.fire({
                        icon: 'success',
                        title: 'Perpanjangan tersimpan',
                        text: `Tanggal pengembalian berhasil diperpanjang ${loan.extension_step_days} hari.`,
                        timer: 2200,
                        timerProgressBar: true,
                        showConfirmButton: false,
                    });
                },
                onError: () => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Gagal memperpanjang',
                        text: 'Tidak dapat memperpanjang peminjaman saat ini.',
                    });
                },
                onFinish: () => {
                    setSubmitting(false);
                },
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${loan.nama_alat}`} />

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
                            Peminjaman Saya
                        </p>
                        <h1 className="mt-2 text-3xl font-bold text-[#1A3263]">
                            Edit Perpanjangan
                        </h1>
                        <p className="mt-1 text-sm text-[#547792]">
                            Perpanjangan sekarang otomatis menambah 7 hari dari
                            tanggal pengembalian saat ini.
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

                <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                    <section className="space-y-6 rounded-3xl border border-[#E8E2DB] bg-white p-6 shadow-sm">
                        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E8E2DB] pb-4">
                            <div>
                                <p className="text-xs font-semibold tracking-[0.25em] text-[#8E7661] uppercase">
                                    Detail Pinjaman
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
                            <InfoCard label="Kelas" value={loan.kelas} />
                            <InfoCard label="Jumlah" value={`${loan.jumlah}`} />
                            <InfoCard
                                label="Tanggal Pinjam"
                                value={formatDate(loan.tanggal_pinjam)}
                            />
                            <InfoCard
                                label="Tanggal Kembali Saat Ini"
                                value={formatDate(loan.tanggal_kembali)}
                            />
                            <InfoCard
                                label="Sisa Perpanjangan"
                                value={`${loan.remaining_extensions} kali`}
                            />
                        </div>
                    </section>

                    <aside className="space-y-4">
                        <div className="rounded-3xl border border-[#E8E2DB] bg-white p-6 shadow-sm">
                            <p className="text-xs font-semibold tracking-[0.25em] text-[#8E7661] uppercase">
                                Tanggal Baru
                            </p>
                            <div className="mt-4 space-y-4">
                                <div className="rounded-2xl bg-[#F8FAFC] p-4 text-sm text-[#1A3263]">
                                    <div className="flex items-center gap-3">
                                        <Clock3 className="h-5 w-5 text-[#547792]" />
                                        <div>
                                            <p className="font-semibold">
                                                Perpanjangan{' '}
                                                {loan.perpanjangan_count}/
                                                {loan.max_extensions}
                                            </p>
                                            <p className="text-xs text-[#547792]">
                                                Sisa {loan.remaining_extensions}{' '}
                                                kali perpanjangan.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 rounded-2xl border border-dashed border-[#D7DFEE] bg-[#FBF8F4] p-4">
                                    <div className="flex items-center gap-3 text-sm text-[#1A3263]">
                                        <CalendarDays className="h-5 w-5 text-[#547792]" />
                                        <div>
                                            <p className="font-semibold">
                                                Tanggal Kembali Saat Ini
                                            </p>
                                            <p className="text-xs text-[#547792]">
                                                {formatDate(
                                                    loan.tanggal_kembali,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-[#1A3263]">
                                        <CalendarDays className="h-5 w-5 text-[#547792]" />
                                        <div>
                                            <p className="font-semibold">
                                                Tanggal Kembali Baru (+
                                                {loan.extension_step_days} hari)
                                            </p>
                                            <p className="text-xs text-[#547792]">
                                                {formatDate(nextReturnDate)}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-xs leading-5 text-[#547792]">
                                        Setiap perpanjangan menambah{' '}
                                        {loan.extension_step_days} hari dari
                                        tanggal jatuh tempo saat ini.
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={
                                        submitting ||
                                        loan.remaining_extensions === 0
                                    }
                                    className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white transition ${
                                        submitting ||
                                        loan.remaining_extensions === 0
                                            ? 'cursor-not-allowed bg-slate-300'
                                            : 'bg-[#1A3263] hover:bg-[#152750]'
                                    }`}
                                >
                                    <PencilLine className="h-4 w-4" />
                                    Perpanjang 7 Hari
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>
            </form>
        </AppLayout>
    );
}
