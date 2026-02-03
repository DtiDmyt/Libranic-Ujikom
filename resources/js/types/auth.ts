export type User = {
    id: number;
    name: string;
    email: string;
    account_role: 'admin' | 'petugas' | 'peminjam';
    role?: 'murid' | 'guru' | 'lainnya' | null;
    kelas?: string | null;
    phone?: string | null;
    identitas?: string | null;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
