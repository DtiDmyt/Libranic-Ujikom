import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

    return (
        <AuthLayout
            title="Buat Akun Baru"
            description="Masukkan data diri Anda untuk membuat akun Simanic."
        >
            <Head title="Daftar" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => {
                    return (
                        <>
                            <div className="grid gap-5">
                                <input
                                    type="hidden"
                                    name="account_role"
                                    value="peminjam"
                                />
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
                                        className={filledInputClasses}
                                        placeholder="Masukkan nama lengkap"
                                    />
                                    <InputError
                                        message={errors.name}
                                        className="mt-1"
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="phone">
                                        No. Telepon (Opsional)
                                    </Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        tabIndex={2}
                                        autoComplete="tel"
                                        name="phone"
                                        className={filledInputClasses}
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
                                        onChange={(event) =>
                                            setRole(event.target.value)
                                        }
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
                                            className={filledInputClasses}
                                            placeholder="Contoh: XII PPLG 1"
                                        />
                                        <InputError message={errors.kelas} />
                                    </div>
                                )}

                                <div className="grid gap-2">
                                    <Label htmlFor="identitas">
                                        NISN / NIP
                                    </Label>
                                    <Input
                                        id="identitas"
                                        type="text"
                                        required
                                        tabIndex={isMurid ? 6 : 5}
                                        name="identitas"
                                        placeholder="Masukkan NISN atau NIP"
                                    />
                                    <InputError message={errors.identitas} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                        tabIndex={isMurid ? 7 : 6}
                                        autoComplete="new-password"
                                        name="password"
                                        placeholder="Masukkan password"
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation">
                                        Konfirmasi Password
                                    </Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        required
                                        tabIndex={isMurid ? 8 : 7}
                                        autoComplete="new-password"
                                        name="password_confirmation"
                                        placeholder="Ulangi password"
                                    />
                                    <InputError
                                        message={errors.password_confirmation}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="mt-1 w-full"
                                    tabIndex={isMurid ? 9 : 8}
                                    data-test="register-user-button"
                                >
                                    {processing && <Spinner />}
                                    Daftar Sekarang
                                </Button>
                            </div>

                            <div className="text-center text-sm text-muted-foreground">
                                Sudah punya akun?{' '}
                                <TextLink
                                    href={login()}
                                    tabIndex={isMurid ? 10 : 9}
                                >
                                    Masuk
                                </TextLink>
                            </div>
                        </>
                    );
                }}
            </Form>
        </AuthLayout>
    );
}
