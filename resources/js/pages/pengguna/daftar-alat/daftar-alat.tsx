import { Pagination } from '@/components/ui/pagination';
import { usePagination } from '@/hooks/use-pagination';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import DetailBukuModal, { type BookDetailItem } from './detail-buku';

type BorrowableItem = {
    id: number;
    judul_buku?: string | null;
    nama_alat: string;
    penulis?: string | null;
    penerbit?: string | null;
    tahun_terbit?: number | null;
    lokasi: string;
    lokasi_rak?: string | null;
    stok?: number | null;
    gambar_url?: string | null;
    status: 'tersedia' | 'habis';
    status_buku?: string | null;
    kategori_buku?: string | null;
    denda_keterlambatan?: number | null;
    kondisi_alat?: string | null;
    deskripsi?: string | null;
};

type PageProps = SharedData & {
    items: BorrowableItem[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard Pengguna', href: '/dashboard' },
    { title: 'Daftar Buku', href: '/daftar-buku' },
];

export default function PenggunaDaftarAlatPage({ items = [] }: PageProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedKategori, setSelectedKategori] = useState<string>('semua');
    const [selectedBook, setSelectedBook] = useState<BookDetailItem | null>(
        null,
    );

    // Dynamically get category options from actual data
    const kategoriOptions = useMemo(() => {
        const unique = new Set(
            items
                .map((item) => item.kategori_buku?.trim())
                .filter((kategori): kategori is string => Boolean(kategori)),
        );
        return Array.from(unique).sort();
    }, [items]);

    const filteredItems = useMemo(() => {
        const normalizedQuery = searchTerm.trim().toLowerCase();

        return items.filter((item) => {
            const matchesQuery = normalizedQuery
                ? [
                      item.nama_alat,
                      item.lokasi_rak ?? item.lokasi,
                      item.kategori_buku,
                  ]
                      .filter((value): value is string => Boolean(value))
                      .some((value) =>
                          value.toLowerCase().includes(normalizedQuery),
                      )
                : true;

            const matchesKategori =
                selectedKategori === 'semua'
                    ? true
                    : item.kategori_buku
                          ?.trim()
                          .toLowerCase()
                          .includes(selectedKategori.toLowerCase());

            return matchesQuery && matchesKategori;
        });
    }, [items, searchTerm, selectedKategori]);

    const {
        paginatedItems,
        currentPage,
        totalPages,
        from,
        to,
        total,
        pageNumbers,
        hasNextPage,
        hasPrevPage,
        goToPage,
        nextPage,
        prevPage,
    } = usePagination(filteredItems, 20);

    const showEmptyState = items.length === 0;
    const showFilteredEmptyState =
        !showEmptyState && filteredItems.length === 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Daftar Buku" />

            <div className="space-y-6 bg-[#E8E2DB] p-6">
                <div>
                    <h1 className="mt-2 text-3xl font-bold text-[#1A3263]">
                        Daftar Buku
                    </h1>

                    {/* Search and Filter */}
                    <div className="mt-6 flex flex-col gap-4 sm:flex-row">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <input
                                type="search"
                                placeholder="Search..."
                                className="w-full rounded-full border-0 bg-white/90 px-6 py-4 pr-12 text-sm font-medium text-[#1A3263] shadow-[0_8px_32px_rgba(26,50,99,0.12)] placeholder:text-[#547792]/60 focus:shadow-[0_12px_40px_rgba(250,185,91,0.15)] focus:ring-2 focus:ring-[#FAB95B]/40 focus:outline-none"
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(event.target.value)
                                }
                            />
                            <div className="absolute top-1/2 right-4 -translate-y-1/2">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    className="h-5 w-5 text-[#547792]/60"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m21 21-4.35-4.35M5 11a6 6 0 1 1 12 0 6 6 0 0 1-12 0"
                                    />
                                </svg>
                            </div>
                        </div>

                        {/* Filter Dropdown */}
                        <div className="relative">
                            <select
                                className="min-w-[180px] cursor-pointer appearance-none rounded-full border-0 bg-white/90 px-6 py-4 pr-10 text-sm font-medium text-[#1A3263] shadow-[0_8px_32px_rgba(26,50,99,0.12)] focus:ring-2 focus:ring-[#FAB95B]/40 focus:outline-none"
                                value={selectedKategori}
                                onChange={(event) =>
                                    setSelectedKategori(event.target.value)
                                }
                            >
                                <option value="semua">Semua Kategori</option>
                                {kategoriOptions.map((kategori) => (
                                    <option key={kategori} value={kategori}>
                                        {kategori}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    className="h-4 w-4 text-[#547792]/60"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <section className="bg-[#E8E2DB] px-6 pb-12">
                {showEmptyState ? (
                    <div className="rounded-3xl border border-dashed border-[#C8BCB0] bg-white/70 p-10 text-center">
                        <p className="text-base font-semibold text-[#1A3263]">
                            Belum ada buku yang tersedia.
                        </p>
                        <p className="mt-2 text-sm text-[#547792]">
                            Hubungi administrator jika membutuhkan bantuan
                            menambahkan data buku.
                        </p>
                    </div>
                ) : showFilteredEmptyState ? (
                    <div className="rounded-3xl border border-dashed border-[#547792]/30 bg-white/70 p-10 text-center">
                        <p className="text-base font-semibold text-[#1A3263]">
                            Tidak ditemukan buku dengan filter tersebut.
                        </p>
                        <p className="mt-2 text-sm text-[#547792]">
                            Coba ubah kata kunci pencarian atau pilih kategori
                            lain.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {paginatedItems.map((item) => (
                            <article
                                key={item.id}
                                role="button"
                                tabIndex={0}
                                aria-label={`Lihat detail buku ${item.nama_alat}`}
                                className="flex h-full cursor-pointer flex-col overflow-hidden rounded-[32px] bg-white shadow-[0_20px_45px_rgba(26,50,99,0.08)] transition hover:-translate-y-1 focus:ring-2 focus:ring-[#FAB95B]/40 focus:outline-none"
                                onClick={() => setSelectedBook(item)}
                                onKeyDown={(event) => {
                                    if (
                                        event.key === 'Enter' ||
                                        event.key === ' '
                                    ) {
                                        event.preventDefault();
                                        setSelectedBook(item);
                                    }
                                }}
                            >
                                {/* Gambar */}
                                <div className="h-48 w-full">
                                    {item.gambar_url ? (
                                        <img
                                            src={item.gambar_url}
                                            alt={item.nama_alat}
                                            className="h-full w-full object-cover"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full flex-col items-center justify-center bg-[#E8DED3] text-[#8E7661]">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                className="h-12 w-12"
                                                aria-hidden="true"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth={1.6}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M9 7.5 10.5 5h3L15 7.5H19a2 2 0 0 1 2 2v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-7A2 2 0 0 1 5 7.5z"
                                                />
                                                <circle cx="12" cy="13" r="3" />
                                            </svg>
                                            <span className="mt-2 text-xs font-semibold tracking-[0.3em] uppercase">
                                                Tidak Ada Gambar
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Konten */}
                                <div className="flex flex-1 flex-col justify-between p-6">
                                    <div className="space-y-2">
                                        {/* Nama Buku */}
                                        <h2 className="truncate text-xl font-semibold text-[#1A3263]">
                                            {item.nama_alat}
                                        </h2>

                                        {/* Lokasi */}
                                        <p className="truncate text-sm text-[#547792]">
                                            Lokasi:{' '}
                                            <span className="font-medium text-[#1A3263]">
                                                {(item.lokasi_rak ??
                                                    item.lokasi) ||
                                                    '-'}
                                            </span>
                                        </p>

                                        {/* Stok (bukan button/card) */}
                                        <p className="text-sm text-[#547792]">
                                            Stok:{' '}
                                            <span className="font-semibold text-[#1A3263]">
                                                {typeof item.stok === 'number'
                                                    ? `${item.stok}`
                                                    : 'Tidak tersedia'}
                                            </span>
                                        </p>
                                    </div>

                                    {/* Button Pinjam (posisi selalu rata bawah) */}
                                    {typeof item.stok === 'number' &&
                                    item.stok <= 0 ? (
                                        <button
                                            type="button"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                            }}
                                            className="mt-6 flex w-full cursor-not-allowed items-center justify-center rounded-2xl bg-[#547792]/40 px-6 py-3 text-sm font-semibold tracking-widest text-[#1A3263]/60 uppercase"
                                            disabled
                                        >
                                            Dipinjam
                                        </button>
                                    ) : (
                                        <Link
                                            href={`/peminjaman/form?alat=${item.id}`}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                            }}
                                            className="mt-6 flex w-full items-center justify-center rounded-2xl bg-[#FAB95B] px-6 py-3 text-sm font-semibold tracking-widest text-[#1A3263] uppercase transition hover:bg-[#f7a63b]"
                                        >
                                            Pinjam
                                        </Link>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                <DetailBukuModal
                    open={selectedBook !== null}
                    item={selectedBook}
                    onClose={() => setSelectedBook(null)}
                />

                {!showEmptyState && !showFilteredEmptyState && (
                    <div className="mt-6">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            from={from}
                            to={to}
                            total={total}
                            pageNumbers={pageNumbers}
                            hasNextPage={hasNextPage}
                            hasPrevPage={hasPrevPage}
                            onPageChange={goToPage}
                            onNext={nextPage}
                            onPrev={prevPage}
                        />
                    </div>
                )}
            </section>
        </AppLayout>
    );
}
