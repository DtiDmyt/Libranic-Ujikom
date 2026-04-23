import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import Swal from 'sweetalert2';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { store } from '@/routes/register';
import { cn } from '@/lib/utils';

const selectClasses = cn(
    'flex h-11 w-full appearance-none rounded-md border border-input bg-[#E8E2DB] px-3 py-2 text-sm text-[#1A3263]',
    'shadow-sm transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
    'disabled:cursor-not-allowed disabled:opacity-50',
);

const filledInputClasses = 'bg-[#E8E2DB] focus:bg-[#E8E2DB]';

export default function Register() {
    const [role, setRole] = useState('');
    const isMurid = role === 'murid';

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        phone: '',
        email: '',
        role: '',
        kelas: '',
        identitas: '',
        password: '',
        password_confirmation: '',
        account_role: 'peminjam',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(store.url(), {
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Registrasi Berhasil!',
                    text: 'Akun Anda berhasil dibuat. Silakan masuk.',
                    timer: 2000,
                    showConfirmButton: false,
                }).then(() => {
                    router.visit(login());
                });
            },
            onError: () => {
                Swal.fire({
                    icon: 'error',
                    title: 'Registrasi Gagal!',
                    text: 'Terjadi kesalahan saat mendaftar. Periksa kembali data Anda.',
                    confirmButtonText: 'Coba Lagi',
                    confirmButtonColor: '#1A3263',
                });
                reset('password', 'password_confirmation');
            },
        });
    };

    // Sync role state with form data
    const handleRoleChange = (newRole: string) => {
        setRole(newRole);
        setData('role', newRole);
    };

    return (
        <AuthLayout
            title="Buat Akun Baru"
            description="Masukkan data diri Anda untuk membuat akun Libranic."
        >
            <Head title="Daftar" />
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid gap-5">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nama Lengkap</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            name="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className={filledInputClasses}
                            placeholder="Masukkan nama lengkap"
                        />
                        <InputError message={errors.name} className="mt-1" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="phone">No. Telepon</Label>
                        <Input
                            id="phone"
                            type="tel"
                            required
                            tabIndex={2}
                            autoComplete="tel"
                            name="phone"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            onInvalid={(e) => {
                                const input = e.currentTarget;

                                if (input.validity.valueMissing) {
                                    input.setCustomValidity(
                                        'Nomor telepon wajib diisi.',
                                    );
                                    return;
                                }

                                if (input.validity.patternMismatch) {
                                    input.setCustomValidity(
                                        'Format nomor telepon salah. Nomor harus diawali 08 dan hanya berisi angka.',
                                    );
                                    return;
                                }

                                input.setCustomValidity('');
                            }}
                            onInput={(e) => {
                                e.currentTarget.setCustomValidity('');
                            }}
                            className={filledInputClasses}
                            pattern="^08[0-9]{8,13}$"
                            inputMode="numeric"
                            maxLength={15}
                            placeholder="Contoh: 081234567890"
                        />
                        <InputError message={errors.phone} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={3}
                            autoComplete="email"
                            name="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className={filledInputClasses}
                            placeholder="nama@email.com"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="role">Sebagai</Label>
                        <select
                            id="role"
                            name="role"
                            className={selectClasses}
                            value={role}
                            onChange={(e) => handleRoleChange(e.target.value)}
                            required
                            tabIndex={4}
                        >
                            <option
                                value=""
                                disabled
                                className="bg-[#E8E2DB] text-[#1A3263]"
                            >
                                Pilih peran
                            </option>
                            <option
                                value="murid"
                                className="bg-[#E8E2DB] text-[#1A3263]"
                            >
                                Murid
                            </option>
                            <option
                                value="guru"
                                className="bg-[#E8E2DB] text-[#1A3263]"
                            >
                                Guru
                            </option>
                            <option
                                value="lainnya"
                                className="bg-[#E8E2DB] text-[#1A3263]"
                            >
                                Lainnya
                            </option>
                        </select>
                        <InputError message={errors.role} />
                    </div>

                    {isMurid && (
                        <div className="grid gap-2">
                            <Label htmlFor="kelas">Kelas</Label>
                            <Input
                                id="kelas"
                                type="text"
                                tabIndex={5}
                                name="kelas"
                                value={data.kelas}
                                onChange={(e) =>
                                    setData('kelas', e.target.value)
                                }
                                className={filledInputClasses}
                                placeholder="Contoh: XII PPLG 1"
                            />
                            <InputError message={errors.kelas} />
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="identitas">NISN / NIP</Label>
                        <Input
                            id="identitas"
                            type="text"
                            required
                            tabIndex={isMurid ? 6 : 5}
                            name="identitas"
                            value={data.identitas}
                            onChange={(e) =>
                                setData('identitas', e.target.value)
                            }
                            placeholder="Masukkan NISN atau NIP"
                        />
                        <InputError message={errors.identitas} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <PasswordInput
                            id="password"
                            required
                            tabIndex={isMurid ? 7 : 6}
                            autoComplete="new-password"
                            name="password"
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            placeholder="Masukkan password"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">
                            Konfirmasi Password
                        </Label>
                        <PasswordInput
                            id="password_confirmation"
                            required
                            tabIndex={isMurid ? 8 : 7}
                            autoComplete="new-password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            placeholder="Ulangi password"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <Button
                        type="submit"
                        className="mt-1 w-full"
                        tabIndex={isMurid ? 9 : 8}
                        disabled={processing}
                        data-test="register-user-button"
                    >
                        {processing && <Spinner />}
                        Daftar Sekarang
                    </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                    Sudah punya akun?{' '}
                    <TextLink href={login()} tabIndex={isMurid ? 10 : 9}>
                        Masuk
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
