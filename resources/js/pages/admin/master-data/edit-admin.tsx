import { Head, Link, useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { ArrowLeft, RefreshCcw } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import AdminCredentialsForm, {
    type AccountRoleOption,
    type AdminCredentialFormFields,
} from '@/components/forms/admin-credentials';
import {
    alertError,
    alertLoading,
    alertSuccess,
    closeAlert,
} from '@/lib/alert';

type AdminPayload = {
    id: number;
    name: string;
    email: string;
    account_role: AccountRoleOption;
    phone?: string | null;
    role?: string | null;
    kelas?: string | null;
    identitas?: string | null;
    status: 'aktif' | 'nonaktif';
};

type PageProps = SharedData & {
    user: AdminPayload;
    roles: AccountRoleOption[];
};

const breadcrumbs = (id: number): BreadcrumbItem[] => [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'Master Data', href: '/admin/master-data/administrator' },
    { title: 'Administrator', href: '/admin/master-data/administrator' },
    { title: 'Edit', href: `/admin/master-data/administrator/${id}/edit` },
];

export default function AdminEditAdministratorPage() {
    const { user, roles } = usePage<PageProps>().props;

    const form = useForm<
        AdminCredentialFormFields & { status: 'aktif' | 'nonaktif' }
    >({
        name: user.name,
        email: user.email,
        password: '',
        account_role: user.account_role,
        phone: user.phone ?? '',
        role: (user.role as AdminCredentialFormFields['role']) ?? '',
        kelas: user.kelas ?? '',
        identitas: user.identitas ?? '',
        password_confirmation: '',
        status: user.status,
    });

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        alertLoading('Sedang memperbarui akun administrator...');
        form.transform((data) => ({ ...data, _method: 'patch' }));
        form.post(`/admin/master-data/administrator/${user.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                closeAlert();
                alertSuccess('Akun administrator berhasil diperbarui.');
            },
            onError: () => {
                closeAlert();
                alertError(
                    'Tidak dapat memperbarui akun, periksa kembali formulir.',
                );
            },
            onFinish: () => {
                form.transform((data) => data);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs(user.id)}>
            <Head title={`Edit ${user.name}`} />
            <div className="space-y-6 bg-[#F5F1EA] p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold tracking-[0.25em] text-[#547792] uppercase">
                            Master Data
                        </p>
                        <h1 className="mt-2 text-3xl font-bold text-[#1A3263]">
                            Edit Administrator
                        </h1>
                        <p className="mt-1 text-sm text-[#547792]">
                            Perbarui informasi akun administrator atau peminjam.
                        </p>
                    </div>
                    <Link
                        href="/admin/master-data/administrator"
                        className="inline-flex items-center gap-2 rounded-2xl border border-[#E8E2DB] bg-white px-4 py-2 text-sm font-semibold text-[#1A3263] transition hover:bg-[#F8F6F1]"
                    >
                        <ArrowLeft className="h-4 w-4" /> Kembali
                    </Link>
                </div>

                <div className="grid items-start gap-6 lg:grid-cols-[1.3fr_0.7fr]">
                    <div className="rounded-3xl border border-[#E8E2DB] bg-white p-6 shadow-sm">
                        <AdminCredentialsForm
                            form={form}
                            roles={roles}
                            onSubmit={handleSubmit}
                            submitLabel="Simpan Perubahan"
                            isEdit
                        />
                    </div>
                    <div className="space-y-4 rounded-3xl border border-[#E8E2DB] bg-white p-6 shadow-sm">
                        <div className="flex items-start gap-3">
                            <div className="rounded-2xl bg-[#1A3263] p-3 text-white">
                                <RefreshCcw className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-base font-semibold text-[#1A3263]">
                                    Status Akun
                                </p>
                                <p className="mt-1 text-sm text-[#547792]">
                                    Ubah status akun di halaman data
                                    administrator menggunakan aksi cepat.
                                </p>
                            </div>
                        </div>
                        <div className="rounded-2xl bg-[#F8F6F1] p-4 text-sm text-[#547792]">
                            Pastikan untuk menginformasikan pengguna jika
                            password diganti. Akses akan mengikuti role terbaru
                            yang dipilih, termasuk data peminjam jika role
                            berubah.
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
