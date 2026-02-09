import { useEffect, useState } from 'react';

type FormPenolakanProps = {
    open: boolean;
    loading?: boolean;
    onClose: () => void;
    onSubmit: (reason: string) => void;
    title?: string;
    description?: string;
};

const defaultTitle = 'Tolak Peminjaman';
const defaultDescription =
    'Masukkan alasan penolakan agar peminjam mengetahui detailnya.';

export default function FormPenolakan({
    open,
    loading = false,
    onClose,
    onSubmit,
    title = defaultTitle,
    description = defaultDescription,
}: FormPenolakanProps) {
    const [reason, setReason] = useState('');

    useEffect(() => {
        if (open && !loading) {
            setReason('');
        }
    }, [open, loading]);

    if (!open) {
        return null;
    }

    const disabled = loading || reason.trim().length === 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
            <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold tracking-[0.3em] text-[#A0AEC0] uppercase">
                            Form Penolakan
                        </p>
                        <h2 className="mt-1 text-xl font-semibold text-[#1A3263]">
                            {title}
                        </h2>
                    </div>
                </div>
                <p className="mt-3 text-sm text-[#4B5563]">{description}</p>
                <div className="mt-4">
                    <label
                        htmlFor="reason"
                        className="text-xs font-semibold tracking-[0.2em] text-[#94A3B8] uppercase"
                    >
                        Alasan Penolakan
                    </label>
                    <textarea
                        id="reason"
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        disabled={loading}
                        maxLength={500}
                        className="mt-2 h-32 w-full rounded-2xl border border-[#D7DFEE] px-4 py-3 text-sm text-[#1A3263] placeholder:text-slate-400 focus:border-[#1A3263] focus:outline-none"
                        placeholder="Contoh: Stok alat terbatas atau jadwal praktik tidak tersedia"
                    />
                    <p className="mt-1 text-right text-xs text-[#94A3B8]">
                        {reason.trim().length}/500 karakter
                    </p>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-2xl border border-[#D7DFEE] px-4 py-2 text-sm font-semibold text-[#1A3263] transition hover:bg-[#F5F7FB] disabled:cursor-not-allowed disabled:text-slate-400"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={() => onSubmit(reason.trim())}
                        disabled={disabled}
                        className={`rounded-2xl px-4 py-2 text-sm font-semibold text-white transition ${
                            disabled
                                ? 'cursor-not-allowed bg-slate-300'
                                : 'bg-[#1A3263] hover:bg-[#0F1D3A]'
                        }`}
                    >
                        {loading ? 'Mengirim...' : 'Kirim Alasan'}
                    </button>
                </div>
            </div>
        </div>
    );
}
