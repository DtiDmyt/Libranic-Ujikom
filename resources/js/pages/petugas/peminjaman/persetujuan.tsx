import PagePlaceholder from '@/components/page-placeholder';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard Petugas', href: '/petugas/dashboard' },
    { title: 'Peminjaman', href: '/petugas/peminjaman/persetujuan' },
    {
        title: 'Persetujuan Peminjaman',
        href: '/petugas/peminjaman/persetujuan',
    },
];

export default function PetugasPersetujuanPeminjamanPage() {
    return (
        <PagePlaceholder
            title="Persetujuan Peminjaman"
            description="Tinjau dan setujui permintaan peminjaman yang diajukan peminjam."
            breadcrumbs={breadcrumbs}
        />
    );
}
