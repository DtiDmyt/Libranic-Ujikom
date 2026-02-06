import type { FormEvent } from 'react';

export type AccountRoleOption = 'admin' | 'petugas';

export type AdminCredentialFormFields = {
    name: string;
    email: string;
    password: string;
    account_role: AccountRoleOption;
};

type Props<TForm> = {
    form: TForm & {
        data: AdminCredentialFormFields;
        setData: (
            field: keyof AdminCredentialFormFields,
            value: string | AccountRoleOption,
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
    const roleLabels: Record<AccountRoleOption, string> = {
        admin: 'Administrator',
        petugas: 'Petugas',
    };

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

            <div>
                <label className="text-sm font-semibold text-[#1A3263]">
                    Password {isEdit ? '(Opsional)' : '*'}
                </label>
                <input
                    type="password"
                    value={form.data.password}
                    onChange={(event) =>
                        form.setData('password', event.target.value)
                    }
                    placeholder={
                        isEdit
                            ? 'Kosongkan jika tidak diubah'
                            : 'Minimal 8 karakter'
                    }
                    className="mt-2 w-full rounded-2xl border border-[#D7DFEE] bg-[#F8FAFC] px-4 py-2 text-sm text-[#1A3263] focus:border-[#1A3263] focus:bg-white focus:outline-none"
                />
                {form.errors.password ? (
                    <p className="mt-1 text-xs text-red-600">
                        {form.errors.password}
                    </p>
                ) : null}
            </div>

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
