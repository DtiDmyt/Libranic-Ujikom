import { Head, Link, useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { ArrowLeft, Shield } from 'lucide-react';
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

type PageProps = SharedData & {
    roles: AccountRoleOption[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'Master Data', href: '/admin/master-data/administrator' },
    { title: 'Administrator', href: '/admin/master-data/administrator' },
    { title: 'Tambah', href: '/admin/master-data/administrator/tambah' },
];

export default function AdminTambahAdministratorPage() {
    const { roles } = usePage<PageProps>().props;
    const form = useForm<AdminCredentialFormFields>({
        name: '',
        email: '',
        password: '',
        account_role: roles[0] ?? 'admin',
        phone: '',
        role: '',
        kelas: '',
        identitas: '',
        password_confirmation: '',
    });

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        alertLoading('Sedang menyimpan akun administrator...');
        form.post('/admin/master-data/administrator', {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                closeAlert();
                alertSuccess('Akun administrator berhasil ditambahkan.');
            },
            onError: () => {
                closeAlert();
                alertError(
                    'Tidak dapat menyimpan akun, periksa kembali formulir.',
                );
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Administrator" />
            <div className="space-y-6 bg-[#F5F1EA] p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold tracking-[0.25em] text-[#547792] uppercase">
                            Master Data
                        </p>
                        <h1 className="mt-2 text-3xl font-bold text-[#1A3263]">
                            Tambah Administrator
                        </h1>
                        <p className="mt-1 text-sm text-[#547792]">
                            Buat akun administrator atau peminjam. Saat memilih
                            role peminjam, form akan berubah mengikuti data
                            pendaftaran pengguna.
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
                            submitLabel="Simpan Akun"
                        />
                    </div>
                    <div className="rounded-3xl border border-[#E8E2DB] bg-white p-6 shadow-sm">
                        <div className="flex items-start gap-3">
                            <div className="rounded-2xl bg-[#1A3263] p-3 text-white">
                                <Shield className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-base font-semibold text-[#1A3263]">
                                    Petunjuk Keamanan
                                </p>
                                <p className="mt-1 text-sm text-[#547792]">
                                    Gunakan password yang kuat dan hanya bagikan
                                    akun kepada pengguna yang tepercaya.
                                </p>
                            </div>
                        </div>
                        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[#547792]">
                            <li>
                                Minimal 8 karakter dengan kombinasi huruf dan
                                angka.
                            </li>
                            <li>
                                Untuk role peminjam, lengkapi data role,
                                identitas, dan kelas jika diperlukan.
                            </li>
                            <li>Role menentukan akses fitur di dashboard.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
