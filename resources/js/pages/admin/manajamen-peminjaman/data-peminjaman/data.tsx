import PagePlaceholder from '@/components/page-placeholder';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'Manajemen Peminjaman', href: '/admin/peminjaman' },
    { title: 'Data Peminjaman', href: '/admin/peminjaman' },
];

export default function AdminDataPeminjamanPage() {
    return (
        <PagePlaceholder
            title="Data Peminjaman"
            description="Pantau seluruh transaksi peminjaman alat yang sedang berjalan ataupun selesai."
            breadcrumbs={breadcrumbs}
        />
    );
}
