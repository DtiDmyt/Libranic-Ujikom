import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

type AlertPernyataanProps = {
    open: boolean;
    dendaPerHari: string;
    onClose: () => void;
    onConfirm: () => void;
    confirmDisabled?: boolean;
};

export default function AlertPernyataan({
    open,
    dendaPerHari,
    onClose,
    onConfirm,
    confirmDisabled = false,
}: AlertPernyataanProps) {
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        if (open) {
            setChecked(false);
        }
    }, [open]);

    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-10">
            <div className="w-full max-w-2xl rounded-[32px] bg-white p-6 shadow-[0_30px_60px_rgba(15,23,42,0.25)]">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs font-semibold tracking-[0.3em] text-[#547792] uppercase">
                            Pernyataan Peminjaman
                        </p>
                        <h3 className="mt-2 text-2xl font-semibold text-[#1A3263]">
                            Konfirmasi dan Pernyataan
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full bg-[#F4F1EA] p-2 text-[#1A3263] transition hover:bg-[#E8DED3]"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <p className="mt-4 text-sm text-[#547792]">
                    Dengan mengajukan peminjaman buku ini, saya menyatakan
                    bahwa:
                </p>

                <ul className="mt-4 space-y-3 text-sm text-[#1A3263]">
                    <li className="flex items-start gap-3">
                        <span
                            className="mt-1 h-2 w-2 rounded-full bg-[#1A3263]"
                            aria-hidden="true"
                        />
                        <span>
                            Apabila terlambat mengembalikan, saya bersedia
                            dikenakan denda <strong>{dendaPerHari}</strong> per
                            hari, sesuai ketentuan setiap barang.
                        </span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span
                            className="mt-1 h-2 w-2 rounded-full bg-[#1A3263]"
                            aria-hidden="true"
                        />
                        <span>
                            Apabila buku rusak atau hilang, maka akan dibahas
                            dan ditindaklanjuti bersama administrator sesuai
                            ketentuan sekolah.
                        </span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span
                            className="mt-1 h-2 w-2 rounded-full bg-[#1A3263]"
                            aria-hidden="true"
                        />
                        <span>
                            Saya bertanggung jawab penuh atas buku selama masa
                            peminjaman.
                        </span>
                    </li>
                </ul>

                <label className="mt-6 flex cursor-pointer items-center gap-3 rounded-2xl border border-[#D7DFEE] bg-[#F8FAFC] px-4 py-3 text-sm font-semibold text-[#1A3263]">
                    <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) => setChecked(event.target.checked)}
                        className="h-4 w-4 rounded border-[#D7DFEE] bg-white text-[#1A3263] focus:ring-0"
                    />
                    Saya telah membaca dan menyetujui ketentuan peminjaman di
                    atas.
                </label>

                <div className="mt-6 flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="min-w-[130px] flex-1 rounded-2xl border border-[#D7DFEE] px-4 py-3 text-sm font-semibold text-[#1A3263] transition hover:bg-[#F8F6F1]"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={!checked || confirmDisabled}
                        className="min-w-[190px] flex-1 rounded-2xl bg-[#1A3263] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#172550] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Setuju & Ajukan Peminjaman
                    </button>
                </div>
            </div>
        </div>
    );
}
