import PagePlaceholder from '@/components/page-placeholder';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'Manajemen Peminjaman', href: '/admin/peminjaman' },
    { title: 'Riwayat Peminjaman', href: '/admin/peminjaman/riwayat' },
];

export default function AdminRiwayatPeminjamanPage() {
    return (
        <PagePlaceholder
            title="Riwayat Peminjaman"
            description="Rekap seluruh riwayat peminjaman sebagai bahan evaluasi dan pelaporan."
            breadcrumbs={breadcrumbs}
        />
    );
}
