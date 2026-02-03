import PagePlaceholder from '@/components/page-placeholder';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'Manajemen Alat', href: '/admin/alat' },
    { title: 'Data Alat', href: '/admin/alat' },
];

export default function AdminDataAlatPage() {
    return (
        <PagePlaceholder
            title="Data Alat"
            description="Kelola daftar alat beserta informasi jurusan, kategori, dan stok yang tersedia."
            breadcrumbs={breadcrumbs}
        />
    );
}
