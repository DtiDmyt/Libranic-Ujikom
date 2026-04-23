import { Link } from '@inertiajs/react';
import { useEffect } from 'react';
import {
    CalendarDays,
    BookOpenText,
    DollarSign,
    FileText,
    MapPin,
    Tag,
    UserRound,
    X,
} from 'lucide-react';

export type BookDetailItem = {
    id: number;
    judul_buku?: string | null;
    nama_alat: string;
    penulis?: string | null;
    penerbit?: string | null;
    tahun_terbit?: number | null;
    kategori_buku?: string | null;
    lokasi_rak?: string | null;
    stok?: number | null;
    gambar_url?: string | null;
    status_buku?: string | null;
    denda_keterlambatan?: number | null;
    kondisi_alat?: string | null;
    deskripsi?: string | null;
};

type DetailBukuModalProps = {
    open: boolean;
    item: BookDetailItem | null;
    onClose: () => void;
};

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
}

function DetailRow({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof BookOpenText;
    label: string;
    value: string;
}) {
    return (
        <div className="border-b border-[#F0E7DB] pb-3 last:border-b-0 last:pb-0">
            <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] text-[#8E9FC4] uppercase">
                <Icon className="h-4 w-4" />
                {label}
            </div>
            <p className="mt-1 text-sm leading-6 font-semibold text-[#1A3263]">
                {value}
            </p>
        </div>
    );
}

export default function DetailBukuModal({
    open,
    item,
    onClose,
}: DetailBukuModalProps) {
    useEffect(() => {
        if (!open) {
            return undefined;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [open, onClose]);

    if (!open || !item) {
        return null;
    }

    const title = item.judul_buku ?? item.nama_alat;
    const location = item.lokasi_rak ?? '-';

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A3263]/55 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="w-full max-w-5xl overflow-hidden rounded-[28px] border border-[#E8E2DB] bg-white shadow-[0_30px_80px_rgba(26,50,99,0.24)]"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-4 border-b border-[#F0E7DB] px-5 py-4 sm:px-6">
                    <div>
                        <p className="text-[11px] font-semibold tracking-[0.25em] text-[#547792] uppercase">
                            Detail Buku
                        </p>
                        <h2 className="mt-1 text-xl leading-tight font-bold text-[#1A3263] sm:text-[26px]">
                            {title}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E8E2DB] bg-[#F8FAFC] text-[#1A3263] transition hover:bg-[#E8E2DB]"
                        aria-label="Tutup detail buku"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="grid gap-0 lg:grid-cols-[0.62fr_1.38fr]">
                    <div className="flex items-center bg-[#F5F1EA] p-4 sm:p-5">
                        <div className="w-full overflow-hidden rounded-[24px] border border-[#E8E2DB] bg-white shadow-[0_16px_40px_rgba(26,50,99,0.08)]">
                            {item.gambar_url ? (
                                <img
                                    src={item.gambar_url}
                                    alt={title}
                                    className="h-[230px] w-full object-cover sm:h-[270px] lg:h-[320px]"
                                />
                            ) : (
                                <div className="flex h-[230px] w-full flex-col items-center justify-center bg-[#E8DED3] px-8 text-center text-[#8E7661] sm:h-[270px] lg:h-[320px]">
                                    <BookOpenText className="h-9 w-9" />
                                    <p className="mt-4 text-xs font-semibold tracking-[0.25em] uppercase">
                                        Cover Tidak Tersedia
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex min-h-0 flex-col p-4 sm:p-5">
                        <p className="text-sm text-[#547792]">
                            Klik tombol pinjam jika ingin melanjutkan proses
                            peminjaman.
                        </p>

                        <div className="mt-4 grid min-h-0 gap-x-4 gap-y-3 overflow-hidden sm:grid-cols-3">
                            <DetailRow
                                icon={UserRound}
                                label="Penulis"
                                value={item.penulis || '-'}
                            />
                            <DetailRow
                                icon={BookOpenText}
                                label="Penerbit"
                                value={item.penerbit || '-'}
                            />
                            <DetailRow
                                icon={CalendarDays}
                                label="Tahun Terbit"
                                value={
                                    item.tahun_terbit
                                        ? String(item.tahun_terbit)
                                        : '-'
                                }
                            />
                            <DetailRow
                                icon={Tag}
                                label="Kategori"
                                value={item.kategori_buku || '-'}
                            />
                            <DetailRow
                                icon={MapPin}
                                label="Lokasi Rak"
                                value={location}
                            />
                            <DetailRow
                                icon={DollarSign}
                                label="Denda Jika Telat"
                                value={formatCurrency(
                                    item.denda_keterlambatan ?? 0,
                                )}
                            />
                            <DetailRow
                                icon={BookOpenText}
                                label="Jumlah Salinan / Stok"
                                value={
                                    typeof item.stok === 'number'
                                        ? `${item.stok} unit`
                                        : '-'
                                }
                            />
                            <DetailRow
                                icon={FileText}
                                label="Kondisi Buku"
                                value={item.kondisi_alat || '-'}
                            />
                        </div>

                        <div className="mt-4 rounded-[22px] border border-[#E8E2DB] bg-[#F8FAFC] p-3">
                            <p className="text-[11px] font-semibold tracking-[0.25em] text-[#547792] uppercase">
                                Deskripsi Buku / Sinopsis
                            </p>
                            <p className="mt-2 text-[13px] leading-5 text-[#1A3263]">
                                {item.deskripsi ||
                                    'Belum ada deskripsi untuk buku ini.'}
                            </p>
                        </div>

                        <div className="mt-4 flex shrink-0 flex-col gap-3 sm:flex-row">
                            <Link
                                href={`/peminjaman/form?alat=${item.id}`}
                                className="inline-flex flex-1 items-center justify-center rounded-2xl bg-[#FAB95B] px-6 py-3 text-sm font-semibold text-[#1A3263] shadow-lg shadow-[#FAB95B]/20 transition hover:bg-[#f7a63b]"
                            >
                                Pinjam Buku
                            </Link>
                            <button
                                type="button"
                                onClick={onClose}
                                className="inline-flex flex-1 items-center justify-center rounded-2xl border border-[#E8E2DB] bg-white px-6 py-3 text-sm font-semibold text-[#1A3263] transition hover:bg-[#F8F6F1]"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
