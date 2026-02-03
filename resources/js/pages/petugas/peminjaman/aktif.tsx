import PagePlaceholder from '@/components/page-placeholder';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard Petugas', href: '/petugas/dashboard' },
    { title: 'Peminjaman', href: '/petugas/peminjaman/persetujuan' },
    { title: 'Daftar Peminjaman Aktif', href: '/petugas/peminjaman/aktif' },
];

export default function PetugasPeminjamanAktifPage() {
    return (
        <PagePlaceholder
            title="Daftar Peminjaman Aktif"
            description="Pantau peminjaman yang sedang berlangsung untuk memastikan pengembalian tepat waktu."
            breadcrumbs={breadcrumbs}
        />
    );
}
