// Components
import { Form, Head, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { logout } from '@/routes';
import { send } from '@/routes/verification';

export default function VerifyEmail({ status }: { status?: string }) {
    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault();

        Swal.fire({
            title: 'Keluar dari akun?',
            text: 'Apakah Anda yakin ingin keluar?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#1A3263',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Keluar',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(
                    logout(),
                    {},
                    {
                        onSuccess: () => {
                            Swal.fire({
                                icon: 'success',
                                title: 'Berhasil Keluar!',
                                text: 'Anda telah keluar dari akun.',
                                timer: 2000,
                                showConfirmButton: false,
                            });
                        },
                    },
                );
            }
        });
    };

    return (
        <AuthLayout
            title="Verifikasi email"
            description="Mohon verifikasi alamat email Anda dengan mengklik tautan yang baru saja kami kirimkan."
        >
            <Head title="Verifikasi email" />

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    Tautan verifikasi baru telah dikirim ke alamat email yang
                    Anda berikan saat mendaftar.
                </div>
            )}

            <Form {...send.form()} className="space-y-6 text-center">
                {({ processing }) => (
                    <>
                        <Button disabled={processing} variant="secondary">
                            {processing && <Spinner />}
                            Kirim ulang email verifikasi
                        </Button>

                        <TextLink
                            href="#"
                            onClick={handleLogout}
                            className="mx-auto block text-sm"
                        >
                            Keluar
                        </TextLink>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
