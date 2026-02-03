import PagePlaceholder from '@/components/page-placeholder';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'Manajemen Alat', href: '/admin/alat' },
    { title: 'Kategori Jurusan', href: '/admin/alat/kategori-jurusan' },
];

export default function AdminKategoriJurusanPage() {
    return (
        <PagePlaceholder
            title="Kategori Jurusan"
            description="Atur dan kelola kategori jurusan agar klasifikasi alat lebih terstruktur."
            breadcrumbs={breadcrumbs}
        />
    );
}
