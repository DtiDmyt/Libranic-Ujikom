import AppLayout from '@/layouts/app-layout';
import AlertPernyataan from '@/pages/pengguna/peminjaman/alert-pernyataan';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import type { FocusEvent, FormEvent, MouseEvent } from 'react';
import { useMemo, useState } from 'react';
import { ArrowLeft, CalendarDays, ClipboardList } from 'lucide-react';
import Swal from 'sweetalert2';

type BorrowerInfo = {
    nama: string;
    nis_nip: string;
    kelas: string;
};

type SelectedItem = {
    id: number;
    nama_alat: string;
    kode_alat: string;
    lokasi: string;
    stok: number;
    denda_keterlambatan: number;
};

type DateDefaults = {
    tanggal_pinjam?: string;
    tanggal_kembali?: string;
};

type LoanFormFields = {
    alat_id: number;
    jumlah_pinjam: string;
    tanggal_pinjam: string;
    tanggal_kembali: string;
    keperluan: string;
};

type PageProps = SharedData & {
    borrower: BorrowerInfo;
    alat: SelectedItem;
    defaultDates?: DateDefaults;
    maxBorrowPerUser?: number;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard Pengguna', href: '/dashboard' },
    { title: 'Peminjaman Saya', href: '/peminjaman' },
    { title: 'Form Peminjaman', href: '/peminjaman/form' },
];

const MAX_LOAN_DAYS = 7;
const WEEKEND_DAYS = new Set([0, 6]);

const currencyFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
});

const formatDateValue = (date: Date): string =>
    date.toISOString().split('T')[0];

const parseDateValue = (value: string): Date | null => {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const isWeekend = (date: Date): boolean => WEEKEND_DAYS.has(date.getDay());

const normalizeStartDate = (value: string, minValue: string): string => {
    const minDate = parseDateValue(minValue)!;
    let date = parseDateValue(value) ?? minDate;
    if (date < minDate) {
        date = new Date(minDate);
    }
    while (isWeekend(date)) {
        date.setDate(date.getDate() + 1);
    }
    return formatDateValue(date);
};

const maxReturnDateFrom = (start: string): string => {
    const baseDate = parseDateValue(start) ?? new Date();
    const date = new Date(baseDate);
    date.setDate(date.getDate() + Math.max(0, MAX_LOAN_DAYS));
    return formatDateValue(date);
};

const normalizeEndDate = (start: string, desired: string): string => {
    const minDate = parseDateValue(start)!;
    let date = parseDateValue(desired) ?? minDate;
    if (date < minDate) {
        date = new Date(minDate);
    }
    while (isWeekend(date)) {
        date.setDate(date.getDate() + 1);
    }
    const maxDate = parseDateValue(maxReturnDateFrom(start))!;
    if (date > maxDate) {
        return formatDateValue(maxDate);
    }
    return formatDateValue(date);
};

const readableDate = (value: string): string =>
    new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(parseDateValue(value) ?? new Date());

type InfoFieldProps = {
    label: string;
    value: string | number;
};

function InfoField({ label, value }: InfoFieldProps) {
    const displayValue =
        value === undefined || value === null || value === '' ? '-' : value;
    return (
        <div>
            <p className="text-xs font-semibold tracking-[0.25em] text-[#8E7661] uppercase">
                {label}
            </p>
            <p className="mt-1 text-base font-semibold text-[#1A3263]">
                {displayValue}
            </p>
        </div>
    );
}

export default function PenggunaFormPeminjamanPage() {
    const {
        borrower,
        alat,
        defaultDates,
        maxBorrowPerUser = 2,
    } = usePage<PageProps>().props;

    const today = useMemo(() => formatDateValue(new Date()), []);
    const initialStart = useMemo(
        () => normalizeStartDate(defaultDates?.tanggal_pinjam ?? today, today),
        [defaultDates, today],
    );
    const initialEnd = useMemo(
        () =>
            normalizeEndDate(
                initialStart,
                defaultDates?.tanggal_kembali ?? initialStart,
            ),
        [defaultDates, initialStart],
    );

    const form = useForm<LoanFormFields>({
        alat_id: alat.id,
        jumlah_pinjam: '1',
        tanggal_pinjam: initialStart,
        tanggal_kembali: initialEnd,
        keperluan: '',
    });

    const maxReturnDate = useMemo(() => {
        if (!form.data.tanggal_pinjam) {
            return today;
        }
        return maxReturnDateFrom(form.data.tanggal_pinjam);
    }, [form.data.tanggal_pinjam, today]);

    const dendaPerHariLabel = currencyFormatter.format(
        alat.denda_keterlambatan ?? 0,
    );

    const [quantityError, setQuantityError] = useState<string | null>(null);
    const [dateError, setDateError] = useState<string | null>(null);
    const [agreementOpen, setAgreementOpen] = useState(false);

    const handleJumlahChange = (value: string) => {
        form.setData('jumlah_pinjam', value);
        if (!value) {
            setQuantityError('Jumlah pinjam wajib diisi.');
            return;
        }
        const numeric = Number(value);
        if (Number.isNaN(numeric) || numeric < 1) {
            setQuantityError('Minimal 1 unit.');
            return;
        }
        if (numeric > maxBorrowPerUser) {
            setQuantityError(`Maksimal ${maxBorrowPerUser} unit per peminjam.`);
            return;
        }
        if (numeric > alat.stok) {
            setQuantityError('Jumlah melebihi stok tersedia.');
            return;
        }
        setQuantityError(null);
    };

    const handleTanggalPinjamChange = (value: string) => {
        const parsed = parseDateValue(value);
        if (!parsed) {
            return;
        }
        const minDate = parseDateValue(today)!;
        if (parsed < minDate) {
            setDateError('Tanggal pinjam tidak boleh sebelum hari ini.');
            return;
        }
        if (isWeekend(parsed)) {
            setDateError('Peminjaman hanya tersedia pada hari Senin - Jumat.');
            return;
        }
        const normalized = formatDateValue(parsed);
        setDateError(null);
        form.setData('tanggal_pinjam', normalized);
        const adjustedEnd = normalizeEndDate(
            normalized,
            form.data.tanggal_kembali,
        );
        form.setData('tanggal_kembali', adjustedEnd);
    };

    const handleTanggalKembaliChange = (value: string) => {
        const parsed = parseDateValue(value);
        if (!parsed) {
            return;
        }
        const minDate = parseDateValue(form.data.tanggal_pinjam)!;
        if (parsed < minDate) {
            setDateError('Tanggal kembali minimal sama dengan tanggal pinjam.');
            return;
        }
        if (isWeekend(parsed)) {
            setDateError('Pengembalian hanya diperbolehkan Senin - Jumat.');
            return;
        }
        const maxDate = parseDateValue(maxReturnDate)!;
        if (parsed > maxDate) {
            setDateError(
                `Maksimal ${MAX_LOAN_DAYS} hari. Pilih tanggal sebelum ${readableDate(maxReturnDate)}.`,
            );
            return;
        }
        setDateError(null);
        form.setData('tanggal_kembali', formatDateValue(parsed));
    };

    const requestShowPicker = (target: HTMLInputElement) => {
        (
            target as HTMLInputElement & { showPicker?: () => void }
        ).showPicker?.();
    };

    const handleDateInputFocus = (event: FocusEvent<HTMLInputElement>) => {
        requestShowPicker(event.currentTarget);
    };

    const handleDateInputClick = (event: MouseEvent<HTMLInputElement>) => {
        requestShowPicker(event.currentTarget);
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (disableSubmit) {
            return;
        }
        setAgreementOpen(true);
    };

    const handleAgreementConfirm = () => {
        setAgreementOpen(false);
        form.post('/peminjaman/form', {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil mengajukan peminjaman',
                    text: 'Permohonanmu sudah dikirim. Pantau statusnya di daftar peminjaman.',
                    timer: 2200,
                    timerProgressBar: true,
                    showConfirmButton: false,
                });
            },
        });
    };

    const disableSubmit =
        form.processing ||
        !form.data.keperluan ||
        !!quantityError ||
        !!dateError;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Form Peminjaman" />
            <form
                onSubmit={handleSubmit}
                className="space-y-6 bg-[#F5F1EA] p-6"
            >
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold tracking-[0.25em] text-[#547792] uppercase">
                            Permohonan Peminjaman
                        </p>
                        <h1 className="mt-2 text-3xl font-bold text-[#1A3263]">
                            Form Peminjaman Alat
                        </h1>
                        <p className="mt-1 text-sm text-[#547792]">
                            Isi detail kebutuhanmu. Semua data identitas sudah
                            otomatis sesuai profil.
                        </p>
                    </div>
                    <Link
                        href="/peminjaman"
                        className="inline-flex items-center gap-2 rounded-2xl border border-[#E8E2DB] bg-white px-4 py-2 text-sm font-semibold text-[#1A3263] transition hover:bg-[#F8F6F1]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali
                    </Link>
                </div>

                <div className="grid items-start gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                    <section className="space-y-6 rounded-3xl border border-[#E8E2DB] bg-white p-6 shadow-sm">
                        <div>
                            <p className="text-base font-semibold text-[#1A3263]">
                                Pengaturan Peminjaman
                            </p>
                            <p className="text-xs text-[#547792]">
                                Atur jumlah, jadwal, dan keperluanmu. Jumlah
                                pinjam juga menjadi referensi jumlah gambar
                                maksimal (2 per orang).
                            </p>
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-[#1A3263]">
                                Jumlah Pinjam
                            </label>
                            <div className="mt-2 flex items-center gap-3 rounded-2xl border border-[#D7DFEE] bg-[#F8FAFC] px-4 py-3">
                                <ClipboardList className="h-5 w-5 text-[#8E9FC4]" />
                                <input
                                    type="number"
                                    min={1}
                                    max={maxBorrowPerUser}
                                    value={form.data.jumlah_pinjam}
                                    onChange={(event) =>
                                        handleJumlahChange(event.target.value)
                                    }
                                    className="w-full bg-transparent text-base font-semibold text-[#1A3263] outline-none"
                                />
                            </div>
                            <p className="mt-1 text-xs text-[#547792]">
                                Maksimal {maxBorrowPerUser} unit per peminjam.
                            </p>
                            {quantityError ? (
                                <p className="mt-1 text-xs text-red-600">
                                    {quantityError}
                                </p>
                            ) : null}
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-[#1A3263]">
                                Rentang Tanggal
                            </label>
                            <div className="mt-2 grid gap-4 md:grid-cols-2">
                                <div className="rounded-2xl border border-[#D7DFEE] bg-[#F8FAFC] px-4 py-3">
                                    <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-[#8E9FC4] uppercase">
                                        <CalendarDays className="h-4 w-4" />
                                        Mulai Pinjam
                                    </div>
                                    <input
                                        type="date"
                                        value={form.data.tanggal_pinjam}
                                        min={today}
                                        onChange={(event) =>
                                            handleTanggalPinjamChange(
                                                event.target.value,
                                            )
                                        }
                                        onFocus={handleDateInputFocus}
                                        onClick={handleDateInputClick}
                                        className="mt-2 w-full bg-transparent text-base font-semibold text-[#1A3263] outline-none"
                                    />
                                </div>
                                <div className="rounded-2xl border border-[#D7DFEE] bg-[#F8FAFC] px-4 py-3">
                                    <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-[#8E9FC4] uppercase">
                                        <CalendarDays className="h-4 w-4" />
                                        Tanggal Kembali
                                    </div>
                                    <input
                                        type="date"
                                        value={form.data.tanggal_kembali}
                                        min={form.data.tanggal_pinjam}
                                        max={maxReturnDate}
                                        onChange={(event) =>
                                            handleTanggalKembaliChange(
                                                event.target.value,
                                            )
                                        }
                                        onFocus={handleDateInputFocus}
                                        onClick={handleDateInputClick}
                                        className="mt-2 w-full bg-transparent text-base font-semibold text-[#1A3263] outline-none"
                                    />
                                </div>
                            </div>
                            <p className="mt-1 text-xs text-[#547792]">
                                Hanya hari kerja (Senin-Jumat) dengan durasi
                                maksimal {MAX_LOAN_DAYS} hari.
                            </p>
                            {dateError ? (
                                <p className="mt-1 text-xs text-red-600">
                                    {dateError}
                                </p>
                            ) : null}
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-[#1A3263]">
                                Keperluan Peminjaman
                            </label>
                            <textarea
                                rows={4}
                                value={form.data.keperluan}
                                onChange={(event) =>
                                    form.setData(
                                        'keperluan',
                                        event.target.value,
                                    )
                                }
                                placeholder="Contoh: Praktik modul Elektronika Industri."
                                className="mt-2 w-full rounded-2xl border border-[#D7DFEE] bg-[#F8FAFC] px-4 py-3 text-sm text-[#1A3263] focus:border-[#1A3263] focus:bg-white focus:outline-none"
                            />
                            <p className="mt-1 text-xs text-[#547792]">
                                Jelaskan tujuan peminjaman secara singkat dan
                                jelas.
                            </p>
                            {form.errors.keperluan ? (
                                <p className="mt-1 text-xs text-red-600">
                                    {form.errors.keperluan}
                                </p>
                            ) : null}
                        </div>
                    </section>

                    <section className="flex flex-col justify-between space-y-6 rounded-3xl border border-[#E8E2DB] bg-white p-6 shadow-sm">
                        <div>
                            <p className="text-base font-semibold text-[#1A3263]">
                                Identitas Peminjam
                            </p>
                            <p className="text-xs text-[#547792]">
                                Data otomatis dari akun Prestito.
                            </p>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <InfoField label="Nama" value={borrower.nama} />
                            <InfoField
                                label="NIS / NIP"
                                value={borrower.nis_nip}
                            />
                            <InfoField label="Kelas" value={borrower.kelas} />
                        </div>

                        <div className="h-px bg-[#F0E7DB]" />

                        <div>
                            <p className="text-base font-semibold text-[#1A3263]">
                                Detail Alat Dipilih
                            </p>
                            <p className="text-xs text-[#547792]">
                                Pastikan informasi alat sesuai sebelum mengirim
                                permohonan.
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <InfoField
                                label="Nama Alat"
                                value={alat.nama_alat}
                            />
                            <InfoField
                                label="Kode Alat"
                                value={alat.kode_alat}
                            />
                            <InfoField label="Lokasi" value={alat.lokasi} />
                            <InfoField
                                label="Stok Tersedia"
                                value={`${alat.stok} unit`}
                            />
                        </div>

                        <button
                            type="button"
                            disabled={disableSubmit}
                            onClick={() => {
                                if (!disableSubmit) {
                                    setAgreementOpen(true);
                                }
                            }}
                            className="mt-4 flex w-full items-center justify-center rounded-2xl bg-[#1A3263] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#1A3263]/20 transition hover:bg-[#172550] disabled:cursor-not-allowed disabled:bg-slate-400"
                        >
                            Ajukan Peminjaman
                        </button>
                    </section>
                </div>
            </form>
            <AlertPernyataan
                open={agreementOpen}
                dendaPerHari={dendaPerHariLabel}
                onClose={() => setAgreementOpen(false)}
                onConfirm={handleAgreementConfirm}
                confirmDisabled={disableSubmit}
            />
        </AppLayout>
    );
}
