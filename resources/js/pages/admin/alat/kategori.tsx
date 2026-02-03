import PagePlaceholder from '@/components/page-placeholder';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'Manajemen Alat', href: '/admin/alat' },
    { title: 'Kategori Alat', href: '/admin/alat/kategori' },
];

export default function AdminKategoriAlatPage() {
    return (
        <PagePlaceholder
            title="Kategori Alat"
            description="Definisikan kategori alat untuk memudahkan pencarian dan penyusunan inventaris."
            breadcrumbs={breadcrumbs}
        />
    );
}
