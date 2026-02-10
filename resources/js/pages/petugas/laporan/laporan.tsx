import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Petugas Dashboard', href: '/petugas/dashboard' },
    { title: 'Laporan', href: '/petugas/laporan' },
];

const summaryCards = [
    { label: 'Total Peminjaman', value: '128' },
    { label: 'Total Pengembalian', value: '112' },
    { label: 'Terlambat', value: '16' },
    { label: 'Tepat Waktu', value: '82' },
    { label: 'Rusak / Hilang', value: '4' },
];

const highlightList = [
    { label: 'Barang paling sering dipinjam', value: 'Laptop Aspirasi A515-45' },
    { label: 'Siswa paling sering telat', value: 'Michelle Emmanuella Mangi (12 PPLG 2)' },
    { label: 'Barang paling sering bermasalah', value: 'Mesin Las Gas (Rusak)' },
];

const statusOptions = ['Tepat Waktu', 'Terlambat', 'Rusak', 'Hilang'];

export default function PetugasLaporanPage() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan" />
            <div className="space-y-6 bg-[#F5F1EA] p-6">
                <section className="space-y-3 rounded-3xl bg-white/90 p-6 shadow-sm">
                    <p className="text-xs font-semibold tracking-[0.3em] text-[#547792] uppercase">
                        Ringkasan Utama
                    </p>
                    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
                        {summaryCards.map((card) => (
                            <article
                                key={card.label}
                                className="flex flex-col rounded-2xl border border-[#E0E7EE] bg-[#FEFDFC] p-4 shadow-sm"
                            >
                                <span className="text-xs font-semibold uppercase text-[#547792]">
                                    {card.label}
                                </span>
                                <span className="mt-2 text-xl font-bold text-[#1A3263]">
                                    {card.value}
                                </span>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="space-y-4 rounded-3xl bg-white/90 p-6 shadow-sm">
                    <p className="text-xs font-semibold tracking-[0.3em] text-[#547792] uppercase">
                        Filter Global
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <label className="flex flex-col gap-1 text-sm">
                            <span className="text-[#547792]">Periode</span>
                            <input
                                type="month"
                                className="rounded-2xl border border-[#D7DFEE] bg-white px-4 py-2 text-sm text-[#1A3263] focus:border-[#1A3263]"
                            />
                        </label>
                        <label className="flex flex-col gap-1 text-sm">
                            <span className="text-[#547792]">Jurusan</span>
                            <select className="rounded-2xl border border-[#D7DFEE] bg-white px-4 py-2 text-sm text-[#1A3263] focus:border-[#1A3263]">
                                <option>Semua Jurusan</option>
                                <option>PPLG</option>
                                <option>ANM</option>
                                <option>BCF</option>
                            </select>
                        </label>
                        <label className="flex flex-col gap-1 text-sm">
                            <span className="text-[#547792]">Status Pengembalian</span>
                            <select className="rounded-2xl border border-[#D7DFEE] bg-white px-4 py-2 text-sm text-[#1A3263] focus:border-[#1A3263]">
                                <option>Semua Status</option>
                                {statusOptions.map((status) => (
                                    <option key={status}>{status}</option>
                                ))}
                            </select>
                        </label>
                        <div className="flex flex-col justify-end text-sm text-[#547792]">
                            <p className="font-semibold text-[#1A3263]">Data bulan Februari 2026 – Jurusan PPLG</p>
                            <p>
                                Filter ini mempengaruhi semua grafik, tabel, dan ringkasan di halaman.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                    <article className="space-y-4 rounded-3xl bg-white/90 p-6 shadow-sm">
                        <p className="text-xs font-semibold tracking-[0.3em] text-[#547792] uppercase">
                            Grafik Ringkas
                        </p>
                        <div className="space-y-3">
                            <div className="rounded-2xl border border-[#E0E7EE] p-4">
                                <p className="text-sm font-semibold text-[#1A3263]">Tepat Waktu vs Terlambat vs Rusak</p>
                                <div className="mt-4 h-40 w-full bg-gradient-to-r from-[#DCFCE7] via-[#FEE2E2] to-[#FEF3C7]" />
                            </div>
                            <div className="rounded-2xl border border-[#E0E7EE] p-4">
                                <p className="text-sm font-semibold text-[#1A3263]">Peminjaman per Jurusan</p>
                                <div className="mt-4 h-40 w-full bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#4C1D95]" />
                            </div>
                        </div>
                    </article>
                    <article className="space-y-4 rounded-3xl bg-white/90 p-6 shadow-sm">
                        <p className="text-xs font-semibold tracking-[0.3em] text-[#547792] uppercase">
                            Top / Highlight
                        </p>
                        <ul className="space-y-3 text-sm text-[#1A3263]">
                            {highlightList.map((highlight) => (
                                <li key={highlight.label} className="rounded-2xl border border-[#E0E7EE] bg-[#FAFBFF] px-4 py-3">
                                    <p className="text-xs text-[#547792]">{highlight.label}</p>
                                    <p className="font-semibold">{highlight.value}</p>
                                </li>
                            ))}
                        </ul>
                    </article>
                </section>

                <section className="rounded-3xl bg-white/90 p-6 shadow-sm">
                    <p className="text-xs font-semibold tracking-[0.3em] text-[#547792] uppercase">
                        Tabel Rekap Inti
                    </p>
                    <div className="mt-4 overflow-x-auto">
                        <table className="min-w-[900px] divide-y divide-[#E8E2DB] text-sm text-[#1A3263]">
                            <thead className="bg-[#E8E2DB] text-xs uppercase tracking-[0.3em] text-[#547792]">
                                <tr>
                                    <th className="px-4 py-3 text-left">Nama Barang</th>
                                    <th className="px-4 py-3 text-left">Jurusan</th>
                                    <th className="px-4 py-3 text-left">Peminjam</th>
                                    <th className="px-4 py-3 text-left">Tgl Pinjam</th>
                                    <th className="px-4 py-3 text-left">Tgl Kembali</th>
                                    <th className="px-4 py-3 text-left">Status Pengembalian</th>
                                    <th className="px-4 py-3 text-left">Keterangan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F0EBE2]">
                                {Array.from({ length: 4 }).map((_, index) => (
                                    <tr key={index} className="bg-white">
                                        <td className="px-4 py-3 font-semibold">{index === 0 ? 'Laptop Aspirasi A515-45' : 'Kompressor'}</td>
                                        <td className="px-4 py-3">PPLG</td>
                                        <td className="px-4 py-3">Alice Joy Gracia</td>
                                        <td className="px-4 py-3">10 Feb 2026</td>
                                        <td className="px-4 py-3">16 Feb 2026</td>
                                        <td className="px-4 py-3 text-[#065F46]">Tepat Waktu</td>
                                        <td className="px-4 py-3 text-[#547792]">Catatan singkat status</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="rounded-3xl bg-white/90 p-6 shadow-sm">
                    <p className="text-xs font-semibold tracking-[0.3em] text-[#547792] uppercase">
                        Catatan Petugas
                    </p>
                    <textarea
                        rows={3}
                        className="mt-3 w-full rounded-2xl border border-[#D7DFEE] bg-[#F8FAFC] px-4 py-3 text-sm text-[#1A3263] focus:border-[#1A3263] focus:outline-none"
                        defaultValue="Selama periode ini terdapat 2 alat rusak dan 1 keterlambatan lebih dari 3 hari."
                    />
                </section>

                <section className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-white/90 p-6 shadow-sm">
                    <p className="text-sm text-[#1A3263]">Aksi Laporan</p>
                    <div className="flex flex-wrap gap-3">
                        <button className="rounded-2xl bg-[#1A3263] px-5 py-2 text-sm font-semibold text-white">
                            Export PDF
                        </button>
                        <button className="rounded-2xl border border-[#E0E7EE] px-5 py-2 text-sm font-semibold text-[#1A3263]">
                            Export Excel
                        </button>
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
