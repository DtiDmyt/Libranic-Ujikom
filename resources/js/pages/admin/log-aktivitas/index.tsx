import PagePlaceholder from '@/components/page-placeholder';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'Log Aktivitas', href: '/admin/log-aktivitas' },
];

export default function AdminLogAktivitasPage() {
    return (
        <PagePlaceholder
            title="Log Aktivitas"
            description="Pantau aktivitas terakhir dari admin, petugas, maupun peminjam."
            breadcrumbs={breadcrumbs}
        />
    );
}
