import PagePlaceholder from '@/components/page-placeholder';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'Master Data', href: '/admin/master-data/administrator' },
    { title: 'Administrator', href: '/admin/master-data/administrator' },
];

export default function AdminAdministratorPage() {
    return (
        <PagePlaceholder
            title="Data Administrator"
            description="Kelola akun administrator dan petugas untuk akses sistem Simanic."
            breadcrumbs={breadcrumbs}
        />
    );
}
