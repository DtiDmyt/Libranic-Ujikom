import PagePlaceholder from '@/components/page-placeholder';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'Manajemen Peminjaman', href: '/admin/pengembalian' },
    { title: 'Data Pengembalian', href: '/admin/pengembalian' },
];

export default function AdminDataPengembalianPage() {
    return (
        <PagePlaceholder
            title="Data Pengembalian"
            description="Lihat status pengembalian alat beserta konfirmasi dari petugas."
            breadcrumbs={breadcrumbs}
        />
    );
}
