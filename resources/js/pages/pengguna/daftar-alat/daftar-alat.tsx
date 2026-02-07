import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Head } from '@inertiajs/react';

type BorrowableItem = {
    id: number;
    nama_alat: string;
    lokasi: string;
    stok?: number | null;
    status: 'tersedia' | 'habis';
};

type PageProps = SharedData & {
    items: BorrowableItem[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard Pengguna', href: '/dashboard' },
    { title: 'Daftar Alat', href: '/daftar-alat' },
];

export default function PenggunaDaftarAlatPage({ items = [] }: PageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Daftar Alat" />

            <div className="space-y-6 bg-[#F5F1EA] p-6">
                <div>
                    <p className="text-xs font-semibold tracking-[0.25em] text-[#547792] uppercase">
                        Manajemen Alat
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-[#1A3263]">
                        Daftar Alat
                    </h1>

                    <p className="mt-1 text-sm text-[#547792]">
                        Kelola seluruh inventaris alat lengkap dengan kategori
                        dan status publikasi.
                    </p>
                </div>
            </div>

            <section className="bg-[#F5F1EA] px-6 pb-12">
                {items.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-[#C8BCB0] bg-white/70 p-10 text-center">
                        <p className="text-base font-semibold text-[#1A3263]">
                            Belum ada alat yang tersedia.
                        </p>
                        <p className="mt-2 text-sm text-[#547792]">
                            Hubungi administrator jika membutuhkan bantuan
                            menambahkan data alat.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {items.map((item) => (
                            <article
                                key={item.id}
                                className="flex h-full flex-col overflow-hidden rounded-[32px] bg-white shadow-[0_20px_45px_rgba(26,50,99,0.08)] transition hover:-translate-y-1"
                            >
                                {/* Gambar */}
                                <div className="h-48 w-full">
                                    <img
                                        src={`https://picsum.photos/seed/alat-${item.id}/480/320`}
                                        alt={item.nama_alat}
                                        className="h-full w-full object-cover"
                                        loading="lazy"
                                    />
                                </div>

                                {/* Konten */}
                                <div className="flex flex-1 flex-col justify-between p-6">
                                    <div className="space-y-2">
                                        {/* Nama Alat */}
                                        <h2 className="truncate text-xl font-semibold text-[#1A3263]">
                                            {item.nama_alat}
                                        </h2>

                                        {/* Lokasi */}
                                        <p className="truncate text-sm text-[#547792]">
                                            Lokasi:{' '}
                                            <span className="font-medium text-[#1A3263]">
                                                {item.lokasi || '-'}
                                            </span>
                                        </p>

                                        {/* Stok (bukan button/card) */}
                                        <p className="text-sm text-[#547792]">
                                            Stok:{' '}
                                            <span className="font-semibold text-[#1A3263]">
                                                {typeof item.stok === 'number'
                                                    ? `${item.stok} unit`
                                                    : 'Tidak tersedia'}
                                            </span>
                                        </p>
                                    </div>

                                    {/* Button Pinjam (posisi selalu rata bawah) */}
                                    <button
                                        type="button"
                                        className="mt-6 flex w-full items-center justify-center rounded-2xl bg-[#FAB95B] px-6 py-3 text-sm font-semibold tracking-widest text-[#1A3263] uppercase transition hover:bg-[#f7a63b]"
                                    >
                                        Pinjam
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </AppLayout>
    );
}
