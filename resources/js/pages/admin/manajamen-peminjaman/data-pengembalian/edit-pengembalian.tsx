import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { ChangeEvent, FormEvent, useRef } from 'react';
import AppLayout from '@/layouts/app-layout';
import adminRoutes from '@/routes/admin';
import type { BreadcrumbItem, SharedData } from '@/types';
import {
    alertError,
    alertLoading,
    alertSuccess,
    closeAlert,
} from '@/lib/alert';

type ConditionValue = 'baik' | 'rusak' | 'hilang';

type LoanInfo = {
    id?: number | null;
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

type ReturnInfo = {
    id: number;
    tanggal_pengembalian?: string | null;
    kondisi: ConditionValue;
    catatan?: string | null;
    status?: string | null;
    lampiran_url?: string | null;
    lampiran_name?: string | null;
};

type FormFields = {
    tanggal_pengembalian: string;
    kondisi: ConditionValue;
    catatan: string;
    lampiran: File | null;
};

type PageProps = SharedData & {
    loan: LoanInfo;
    pengembalian: ReturnInfo;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: adminRoutes.dashboard().url },
    {
        title: 'Manajemen Peminjaman',
        href: '/admin/data-peminjaman/peminjaman',
    },
    {
        title: 'Data Pengembalian',
        href: adminRoutes.dataPengembalian.pengembalian.index().url,
    },
    {
        title: 'Edit Pengembalian',
        href: '/admin/data-pengembalian/pengembalian',
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

export default function AdminEditPengembalianPage() {
    const { loan, pengembalian } = usePage<PageProps>().props;

    const form = useForm<FormFields>({
        tanggal_pengembalian: pengembalian.tanggal_pengembalian ?? '',
        kondisi: pengembalian.kondisi,
        catatan: pengembalian.catatan ?? '',
        lampiran: null,
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

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
        alertLoading('Menyimpan perubahan pengembalian...');
        form.patch(
            adminRoutes.dataPengembalian.pengembalian.update({
                pengembalian: pengembalian.id,
            }).url,
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    closeAlert();
                    alertSuccess('Data pengembalian berhasil diperbarui.');
                },
                onError: () => {
                    closeAlert();
                    alertError(
                        'Tidak dapat menyimpan perubahan, periksa formulir.',
                    );
                },
            },
        );
    };

    const renderStatusBadge = (status?: string) => {
        const normalized = status?.toLowerCase().trim() ?? 'menunggu';
        const palettes: Record<string, string> = {
            menunggu: 'bg-[#FEF3C7] text-[#C2410C]',
            'tepat waktu': 'bg-[#DCFCE7] text-[#065F46]',
            telat: 'bg-[#FEE2E2] text-[#991B1B]',
            rusak: 'bg-[#FEF3C7] text-[#C2410C]',
            hilang: 'bg-[#FEE2E2] text-[#991B1B]',
        };
        const labelMap: Record<string, string> = {
            menunggu: 'Menunggu Pengecekan',
            'tepat waktu': 'Tepat Waktu',
            telat: 'Telat',
            rusak: 'Rusak',
            hilang: 'Hilang',
        };

        const palette = palettes[normalized] ?? palettes.menunggu;

        return (
            <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${palette}`}
            >
                <span className="h-2.5 w-2.5 rounded-full bg-[#C2410C]" />
                {labelMap[normalized] ?? labelMap.menunggu}
            </span>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Pengembalian" />
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
                            Edit Pengembalian
                        </h1>
                        <p className="mt-1 text-sm text-[#547792]">
                            Sesuaikan tanggal dan kondisi alat agar catatan
                            tetap akurat.
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

                <div className="grid items-start gap-6 lg:grid-cols-[1.4fr_0.8fr]">
                    <div className="space-y-6 rounded-3xl border border-[#E8E2DB] bg-white p-6 shadow-sm">
                        <div>
                            <p className="text-base font-semibold text-[#1A3263]">
                                Detail Pengembalian
                            </p>
                            <p className="text-xs text-[#547792]">
                                Perbarui tanggal, kondisi, atau catatan agar
                                pengembalian sesuai kenyataan.
                            </p>
                            <div className="mt-2">
                                {renderStatusBadge(pengembalian.status)}
                            </div>
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
                                placeholder="Catat temuan seperti goresan, kerusakan, atau kelengkapan"
                            />
                            {form.errors.catatan ? (
                                <p className="text-xs text-red-600">
                                    {form.errors.catatan}
                                </p>
                            ) : null}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[#1A3263]">
                                Lampiran (opsional)
                            </label>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
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
                                        Batalkan lampiran
                                    </button>
                                </div>
                            ) : null}
                            {pengembalian.lampiran_url ? (
                                <div className="text-xs text-[#1A3263]">
                                    <a
                                        href={pengembalian.lampiran_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="font-semibold underline"
                                    >
                                        Lihat lampiran saat ini
                                        {pengembalian.lampiran_name
                                            ? ` (${pengembalian.lampiran_name})`
                                            : ''}
                                    </a>
                                </div>
                            ) : null}
                            {form.errors.lampiran ? (
                                <p className="text-xs text-red-600">
                                    {form.errors.lampiran}
                                </p>
                            ) : null}
                        </div>
                    </div>

                    <div className="space-y-6 rounded-3xl border border-[#E8E2DB] bg-white p-6 shadow-sm">
                        <div>
                            <p className="text-base font-semibold text-[#1A3263]">
                                Ringkasan Peminjaman
                            </p>
                            <p className="text-xs text-[#547792]">
                                Informasi peminjaman ikut ditampilkan supaya
                                admin bisa mengecek kembali sebelum menyimpan.
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <InfoField
                                label="Nama Peminjam"
                                value={loan.nama_peminjam}
                            />
                            <InfoField label="Kelas" value={loan.kelas} />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <InfoField
                                label="Jumlah Dipinjam"
                                value={loan.jumlah_pinjam}
                            />
                            <InfoField
                                label="Kode Alat"
                                value={loan.kode_alat}
                            />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <InfoField
                                label="Nama Alat"
                                value={loan.alat_nama}
                            />
                            <InfoField label="Ruangan" value={loan.ruangan} />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <InfoField
                                label="Tanggal Pinjam"
                                value={formatDateLabel(loan.tanggal_pinjam)}
                            />
                            <InfoField
                                label="Jadwal Kembali"
                                value={formatDateLabel(loan.tanggal_kembali)}
                            />
                        </div>

                        <div className="flex flex-wrap gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-transparent bg-[#1A3263] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#152750] disabled:cursor-not-allowed disabled:bg-slate-300"
                            >
                                Simpan Perubahan
                            </button>
                            <Link
                                href={
                                    adminRoutes.dataPengembalian.pengembalian.index()
                                        .url
                                }
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
