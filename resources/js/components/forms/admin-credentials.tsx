import { useState, type FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export type AccountRoleOption = 'admin' | 'peminjam';
export type BorrowerRoleOption = 'murid' | 'guru' | 'lainnya';

export type AdminCredentialFormFields = {
    name: string;
    email: string;
    password: string;
    account_role: AccountRoleOption;
    phone: string;
    role: BorrowerRoleOption | '';
    kelas: string;
    identitas: string;
    password_confirmation: string;
};

type Props<TForm> = {
    form: TForm & {
        data: AdminCredentialFormFields;
        setData: (
            field: keyof AdminCredentialFormFields,
            value: string,
        ) => void;
        reset: () => void;
        processing: boolean;
        errors: Partial<Record<keyof AdminCredentialFormFields, string>>;
    };
    roles: AccountRoleOption[];
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    submitLabel: string;
    isEdit?: boolean;
};

export default function AdminCredentialsForm<TForm>({
    form,
    roles,
    onSubmit,
    submitLabel,
    isEdit = false,
}: Props<TForm>) {
    const [showPassword, setShowPassword] = useState(false);

    const roleLabels: Record<AccountRoleOption, string> = {
        admin: 'Administrator',
        peminjam: 'Peminjam',
    };

    const borrowerRoleOptions: Array<{
        value: BorrowerRoleOption;
        label: string;
    }> = [
        { value: 'murid', label: 'Murid' },
        { value: 'guru', label: 'Guru' },
        { value: 'lainnya', label: 'Lainnya' },
    ];

    const isBorrower = form.data.account_role === 'peminjam';
    const showClassField = isBorrower && form.data.role === 'murid';

    return (
        <form className="space-y-6" onSubmit={onSubmit}>
            <div>
                <label className="text-sm font-semibold text-[#1A3263]">
                    Nama Lengkap *
                </label>
                <input
                    type="text"
                    value={form.data.name}
                    onChange={(event) =>
                        form.setData('name', event.target.value)
                    }
                    className="mt-2 w-full rounded-2xl border border-[#D7DFEE] bg-[#F8FAFC] px-4 py-2 text-sm text-[#1A3263] focus:border-[#1A3263] focus:bg-white focus:outline-none"
                    placeholder="Masukkan nama lengkap"
                />
                {form.errors.name ? (
                    <p className="mt-1 text-xs text-red-600">
                        {form.errors.name}
                    </p>
                ) : null}
            </div>

            <div>
                <label className="text-sm font-semibold text-[#1A3263]">
                    Email *
                </label>
                <input
                    type="email"
                    value={form.data.email}
                    onChange={(event) =>
                        form.setData('email', event.target.value)
                    }
                    className="mt-2 w-full rounded-2xl border border-[#D7DFEE] bg-[#F8FAFC] px-4 py-2 text-sm text-[#1A3263] focus:border-[#1A3263] focus:bg-white focus:outline-none"
                    placeholder="nama@domain.com"
                />
                {form.errors.email ? (
                    <p className="mt-1 text-xs text-red-600">
                        {form.errors.email}
                    </p>
                ) : null}
            </div>

            <div>
                <label className="text-sm font-semibold text-[#1A3263]">
                    Role *
                </label>
                <select
                    value={form.data.account_role}
                    onChange={(event) =>
                        form.setData(
                            'account_role',
                            event.target.value as AccountRoleOption,
                        )
                    }
                    className="mt-2 w-full rounded-2xl border border-[#D7DFEE] bg-[#F8FAFC] px-4 py-2 text-sm text-[#1A3263] focus:border-[#1A3263] focus:bg-white focus:outline-none"
                >
                    {roles.map((role) => (
                        <option key={role} value={role}>
                            {roleLabels[role]}
                        </option>
                    ))}
                </select>
                {form.errors.account_role ? (
                    <p className="mt-1 text-xs text-red-600">
                        {form.errors.account_role}
                    </p>
                ) : null}
            </div>

            {isBorrower ? (
                <div className="space-y-5 rounded-2xl border border-[#E8E2DB] bg-[#F8F6F1] p-5">
                    <div>
                        <label className="text-sm font-semibold text-[#1A3263]">
                            No. Telepon *
                        </label>
                        <input
                            type="tel"
                            value={form.data.phone}
                            onChange={(event) =>
                                form.setData('phone', event.target.value)
                            }
                            className="mt-2 w-full rounded-2xl border border-[#D7DFEE] bg-white px-4 py-2 text-sm text-[#1A3263] focus:border-[#1A3263] focus:bg-white focus:outline-none"
                            placeholder="Contoh: 081234567890"
                            inputMode="numeric"
                            maxLength={15}
                        />
                        {form.errors.phone ? (
                            <p className="mt-1 text-xs text-red-600">
                                {form.errors.phone}
                            </p>
                        ) : null}
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-[#1A3263]">
                            Sebagai *
                        </label>
                        <select
                            value={form.data.role}
                            onChange={(event) =>
                                form.setData('role', event.target.value)
                            }
                            className="mt-2 w-full rounded-2xl border border-[#D7DFEE] bg-white px-4 py-2 text-sm text-[#1A3263] focus:border-[#1A3263] focus:bg-white focus:outline-none"
                        >
                            <option value="">Pilih peran</option>
                            {borrowerRoleOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        {form.errors.role ? (
                            <p className="mt-1 text-xs text-red-600">
                                {form.errors.role}
                            </p>
                        ) : null}
                    </div>

                    {showClassField ? (
                        <div>
                            <label className="text-sm font-semibold text-[#1A3263]">
                                Kelas *
                            </label>
                            <input
                                type="text"
                                value={form.data.kelas}
                                onChange={(event) =>
                                    form.setData('kelas', event.target.value)
                                }
                                className="mt-2 w-full rounded-2xl border border-[#D7DFEE] bg-white px-4 py-2 text-sm text-[#1A3263] focus:border-[#1A3263] focus:bg-white focus:outline-none"
                                placeholder="Contoh: XII PPLG 1"
                            />
                            {form.errors.kelas ? (
                                <p className="mt-1 text-xs text-red-600">
                                    {form.errors.kelas}
                                </p>
                            ) : null}
                        </div>
                    ) : null}

                    <div>
                        <label className="text-sm font-semibold text-[#1A3263]">
                            NISN / NIP *
                        </label>
                        <input
                            type="text"
                            value={form.data.identitas}
                            onChange={(event) =>
                                form.setData('identitas', event.target.value)
                            }
                            className="mt-2 w-full rounded-2xl border border-[#D7DFEE] bg-white px-4 py-2 text-sm text-[#1A3263] focus:border-[#1A3263] focus:bg-white focus:outline-none"
                            placeholder="Masukkan NISN atau NIP"
                        />
                        {form.errors.identitas ? (
                            <p className="mt-1 text-xs text-red-600">
                                {form.errors.identitas}
                            </p>
                        ) : null}
                    </div>
                </div>
            ) : null}

            <div>
                <label className="text-sm font-semibold text-[#1A3263]">
                    Password {isEdit ? '(Opsional)' : '*'}
                </label>
                <div className="relative mt-2">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        value={form.data.password}
                        onChange={(event) =>
                            form.setData('password', event.target.value)
                        }
                        placeholder={
                            isEdit
                                ? 'Kosongkan jika tidak diubah'
                                : 'Minimal 8 karakter'
                        }
                        className="w-full rounded-2xl border border-[#D7DFEE] bg-[#F8FAFC] px-4 py-2 pr-10 text-sm text-[#1A3263] focus:border-[#1A3263] focus:bg-white focus:outline-none"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-[#8B9DC3] hover:text-[#1A3263] focus:outline-none"
                        tabIndex={-1}
                    >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                </div>
                {form.errors.password ? (
                    <p className="mt-1 text-xs text-red-600">
                        {form.errors.password}
                    </p>
                ) : null}
            </div>

            {isBorrower ? (
                <div>
                    <label className="text-sm font-semibold text-[#1A3263]">
                        Konfirmasi Password *
                    </label>
                    <div className="relative mt-2">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={form.data.password_confirmation}
                            onChange={(event) =>
                                form.setData(
                                    'password_confirmation',
                                    event.target.value,
                                )
                            }
                            placeholder="Ulangi password"
                            className="w-full rounded-2xl border border-[#D7DFEE] bg-[#F8FAFC] px-4 py-2 pr-10 text-sm text-[#1A3263] focus:border-[#1A3263] focus:bg-white focus:outline-none"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute top-1/2 right-3 -translate-y-1/2 text-[#8B9DC3] hover:text-[#1A3263] focus:outline-none"
                            tabIndex={-1}
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                    {form.errors.password_confirmation ? (
                        <p className="mt-1 text-xs text-red-600">
                            {form.errors.password_confirmation}
                        </p>
                    ) : null}
                </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
                <button
                    type="submit"
                    disabled={form.processing}
                    className="inline-flex flex-1 items-center justify-center rounded-2xl bg-[#1A3263] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#1A3263]/30 transition hover:bg-[#547792] disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                    {submitLabel}
                </button>
                <button
                    type="button"
                    onClick={() => form.reset()}
                    className="inline-flex flex-1 items-center justify-center rounded-2xl border border-[#E8E2DB] bg-white px-4 py-3 text-sm font-semibold text-[#1A3263] transition hover:bg-[#F8F6F1]"
                >
                    Reset
                </button>
            </div>
        </form>
    );
}
