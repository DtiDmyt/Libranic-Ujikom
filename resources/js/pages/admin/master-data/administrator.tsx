import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import {
    Eye,
    PencilLine,
    Plus,
    ShieldCheck,
    ShieldOff,
    Trash2,
    Users,
} from 'lucide-react';
import Swal from 'sweetalert2';
import AppLayout from '@/layouts/app-layout';
import adminRoutes from '@/routes/admin';
import type { BreadcrumbItem, SharedData } from '@/types';
import {
    alertError,
    alertLoading,
    alertSuccess,
    closeAlert,
} from '@/lib/alert';

type AccountRole = 'admin' | 'petugas';
type Status = 'aktif' | 'nonaktif';

type AdminRow = {
    id: number;
    name: string;
    email: string;
    account_role: AccountRole;
    status: Status;
    phone?: string | null;
    kelas?: string | null;
    identitas?: string | null;
    created_at?: string | null;
    can_manage: boolean;
};

type Statistics = {
    total: number;
    aktif: number;
    nonaktif: number;
    admin: number;
    petugas: number;
};

type PageProps = SharedData & {
    items: AdminRow[];
    filters: {
        name: string;
        email: string;
        status: Status | 'semua';
        role: AccountRole | 'semua';
    };
    statistics: Statistics;
    roles: AccountRole[];
    statuses: Status[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: adminRoutes.dashboard().url },
    { title: 'Master Data', href: '/admin/master-data/administrator' },
    { title: 'Administrator', href: '/admin/master-data/administrator' },
];

const roleLabels: Record<AccountRole, string> = {
    admin: 'Administrator',
    petugas: 'Petugas',
};

const statusLabels: Record<Status, string> = {
    aktif: 'Aktif',
    nonaktif: 'Non Aktif',
};

const statusStyles: Record<Status, string> = {
    aktif: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    nonaktif: 'bg-rose-100 text-rose-700 border border-rose-200',
};

const escapeHtml = (input: string) =>
    input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

const formatDateTime = (value?: string | null) => {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'long',
        timeStyle: 'short',
    }).format(new Date(value));
};

export default function AdminAdministratorPage() {
    const { items, filters, statistics, roles, statuses } =
        usePage<PageProps>().props;
    const [selected, setSelected] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState(
        filters.name ?? filters.email ?? '',
    );

    const selectableIds = useMemo(
        () => items.filter((item) => item.can_manage).map((item) => item.id),
        [items],
    );

    useEffect(() => {
        setSearchTerm(filters.name ?? filters.email ?? '');
        setSelected((prev) => prev.filter((id) => selectableIds.includes(id)));
    }, [filters.name, filters.email, selectableIds]);

    useEffect(() => {
        const currentName = filters.name ?? '';
        const currentEmail = filters.email ?? '';

        if (searchTerm === currentName && searchTerm === currentEmail) {
            return;
        }

        const timeout = window.setTimeout(() => {
            visitWithFilters({
                name: searchTerm,
                email: searchTerm,
            });
        }, 450);

        return () => window.clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm]);

    const visitWithFilters = (overrides?: {
        name?: string;
        email?: string;
        status?: Status | 'semua';
        role?: AccountRole | 'semua';
    }) => {
        router.get(
            '/admin/master-data/administrator',
            {
                name: overrides?.name ?? searchTerm,
                email: overrides?.email ?? searchTerm,
                status: overrides?.status ?? filters.status,
                role: overrides?.role ?? filters.role,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const toggleSelect = (id: number) => {
        if (!selectableIds.includes(id)) {
            return;
        }

        setSelected((prev) =>
            prev.includes(id)
                ? prev.filter((value) => value !== id)
                : [...prev, id],
        );
    };

    const toggleSelectAll = () => {
        if (selectableIds.length === 0) {
            return;
        }

        setSelected((prev) =>
            prev.length === selectableIds.length ? [] : selectableIds,
        );
    };

    const handleBulkDelete = () => {
        if (selected.length === 0) {
            return;
        }

        Swal.fire({
            title: 'Hapus Akun',
            text: 'Hapus semua akun yang telah dipilih?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#B91C1C',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Ya, hapus',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (!result.isConfirmed) {
                return;
            }

            alertLoading('Sedang menghapus akun terpilih...');
            router.delete('/admin/master-data/administrator/bulk-delete', {
                data: { ids: selected },
                preserveScroll: true,
                onSuccess: () => {
                    setSelected([]);
                    closeAlert();
                    alertSuccess('Akun terpilih berhasil dihapus.');
                },
                onError: () => {
                    closeAlert();
                    alertError('Gagal menghapus akun terpilih.');
                },
            });
        });
    };

    const handleBulkStatusChange = (status: Status) => {
        if (selected.length === 0) {
            return;
        }

        alertLoading('Sedang memperbarui status akun...');
        router.patch(
            '/admin/master-data/administrator/bulk-status',
            {
                ids: selected,
                status,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSelected([]);
                    closeAlert();
                    alertSuccess('Status akun terpilih diperbarui.');
                },
                onError: () => {
                    closeAlert();
                    alertError('Gagal memperbarui status akun.');
                },
            },
        );
    };

    const handleSingleDelete = (id: number) => {
        Swal.fire({
            title: 'Hapus Akun',
            text: 'Yakin ingin menghapus akun ini?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DC2626',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Hapus',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (!result.isConfirmed) {
                return;
            }

            alertLoading('Sedang menghapus akun...');
            router.delete(`/admin/master-data/administrator/${id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelected((prev) => prev.filter((value) => value !== id));
                    closeAlert();
                    alertSuccess('Akun administrator berhasil dihapus.');
                },
                onError: () => {
                    closeAlert();
                    alertError('Gagal menghapus akun administrator.');
                },
            });
        });
    };

    const handleShowDetail = (item: AdminRow) => {
        const detailHtml = `
            <div class="space-y-2 text-left text-sm text-[#1A3263]">
                <p><span class="font-semibold">Email:</span> ${escapeHtml(item.email)}</p>
                <p><span class="font-semibold">Role:</span> ${escapeHtml(roleLabels[item.account_role])}</p>
                <p><span class="font-semibold">Status:</span> ${escapeHtml(statusLabels[item.status])}</p>
                <p><span class="font-semibold">No. Telepon:</span> ${escapeHtml(item.phone ?? '-')}</p>
                <p><span class="font-semibold">Kelas:</span> ${escapeHtml(item.kelas ?? '-')}</p>
                <p><span class="font-semibold">Identitas:</span> ${escapeHtml(item.identitas ?? '-')}</p>
                <p><span class="font-semibold">Terdaftar:</span> ${escapeHtml(formatDateTime(item.created_at))}</p>
            </div>
        `;

        Swal.fire({
            title: escapeHtml(item.name),
            html: detailHtml,
            confirmButtonText: 'Tutup',
            customClass: { popup: 'rounded-2xl text-left' },
        });
    };

    const allSelected =
        selectableIds.length > 0 && selected.length === selectableIds.length;
    const hasSelected = selected.length > 0;

    const statisticCards = [
        {
            label: 'Total Akun',
            value: statistics.total,
            accent: 'bg-[#E8E2DB]',
        },
        {
            label: 'Administrator',
            value: statistics.admin,
            accent: 'bg-[#DDE8FF]',
        },
        { label: 'Petugas', value: statistics.petugas, accent: 'bg-[#E0F2FE]' },
        {
            label: 'Status Non Aktif',
            value: statistics.nonaktif,
            accent: 'bg-[#FFE4E6]',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Administrator" />
            <div className="space-y-6 bg-[#F5F1EA] p-6">
                <div className="flex flex-wrap items-center gap-4">
                    <div>
                        <p className="text-xs font-semibold tracking-[0.25em] text-[#547792] uppercase">
                            Master Data
                        </p>
                        <h1 className="mt-2 text-3xl font-bold text-[#1A3263]">
                            Data Administrator
                        </h1>
                        <p className="mt-1 text-sm text-[#547792]">
                            Kelola akun administrator dan petugas untuk akses
                            sistem Prestito.
                        </p>
                    </div>
                </div>

                <div className="rounded-3xl border border-[#E8E2DB] bg-white shadow-sm">
                    <div className="space-y-4 border-b border-[#E8E2DB] p-6">
                        <div className="flex flex-wrap items-center gap-3">
                            <Link
                                href="/admin/master-data/administrator/tambah"
                                className="inline-flex items-center gap-2 rounded-xl bg-[#1A3263] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#1A3263]/30 transition hover:bg-[#547792]"
                            >
                                <Plus className="h-4 w-4" /> Tambah
                            </Link>
                            <button
                                type="button"
                                disabled={!hasSelected}
                                onClick={handleBulkDelete}
                                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                                    hasSelected
                                        ? 'bg-[#F87171] text-white shadow-sm hover:bg-[#DC2626]'
                                        : 'cursor-not-allowed bg-slate-100 text-slate-400'
                                }`}
                            >
                                <Trash2 className="h-4 w-4" /> Hapus
                            </button>
                            <button
                                type="button"
                                disabled={!hasSelected}
                                onClick={() => handleBulkStatusChange('aktif')}
                                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                                    hasSelected
                                        ? 'bg-[#CDE8D6] text-[#1A3263] hover:bg-[#B5DBBF]'
                                        : 'cursor-not-allowed bg-slate-100 text-slate-400'
                                }`}
                            >
                                <ShieldCheck className="h-4 w-4" /> Aktif
                            </button>
                            <button
                                type="button"
                                disabled={!hasSelected}
                                onClick={() =>
                                    handleBulkStatusChange('nonaktif')
                                }
                                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                                    hasSelected
                                        ? 'bg-[#FFE4E6] text-[#B91C1C] hover:bg-[#FECDD3]'
                                        : 'cursor-not-allowed bg-slate-100 text-slate-400'
                                }`}
                            >
                                <ShieldOff className="h-4 w-4" /> Non Aktif
                            </button>
                            <div className="ml-auto text-xs font-semibold tracking-wide text-[#547792] uppercase">
                                {hasSelected
                                    ? `${selected.length} akun dipilih`
                                    : 'Pilih akun untuk aksi cepat'}
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-[#E8E2DB]">
                            <thead className="text-left text-xs font-semibold tracking-wide text-[#547792] uppercase">
                                <tr className="bg-[#E8E2DB]">
                                    <th className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            className="size-4 rounded border-[#1A3263] text-[#1A3263] focus:ring-[#1A3263]"
                                            checked={
                                                allSelected &&
                                                selectableIds.length > 0
                                            }
                                            onChange={toggleSelectAll}
                                            disabled={
                                                selectableIds.length === 0
                                            }
                                        />
                                    </th>
                                    <th className="px-2 py-4">No</th>
                                    <th className="px-4 py-4">Aksi</th>
                                    <th className="px-4 py-4">Nama</th>
                                    <th className="px-4 py-4">Email</th>
                                    <th className="px-4 py-4">Role</th>
                                    <th className="px-4 py-4">Status</th>
                                </tr>
                                <tr className="bg-white text-[11px] font-normal tracking-normal text-[#547792] uppercase">
                                    <th className="px-6 py-3" />
                                    <th className="px-2 py-3" />
                                    <th className="px-4 py-3" />
                                    <th colSpan={2} className="px-4 py-3">
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(event) =>
                                                setSearchTerm(
                                                    event.target.value,
                                                )
                                            }
                                            className="w-full rounded-2xl border border-[#D7DFEE] bg-white px-4 py-2 text-sm text-[#1A3263] placeholder:text-slate-400 focus:border-[#1A3263] focus:outline-none"
                                            placeholder="Cari nama atau email..."
                                        />
                                    </th>
                                    <th className="px-4 py-3">
                                        <select
                                            value={filters.role ?? 'semua'}
                                            onChange={(event) =>
                                                visitWithFilters({
                                                    role: event.target.value as
                                                        | AccountRole
                                                        | 'semua',
                                                })
                                            }
                                            className="w-full rounded-2xl border border-[#D7DFEE] bg-white px-3 py-2 text-sm text-[#1A3263] focus:border-[#1A3263] focus:outline-none"
                                        >
                                            <option value="semua">Semua</option>
                                            {roles.map((role) => (
                                                <option key={role} value={role}>
                                                    {roleLabels[role]}
                                                </option>
                                            ))}
                                        </select>
                                    </th>
                                    <th className="px-4 py-3">
                                        <select
                                            value={filters.status ?? 'semua'}
                                            onChange={(event) =>
                                                visitWithFilters({
                                                    status: event.target
                                                        .value as
                                                        | Status
                                                        | 'semua',
                                                })
                                            }
                                            className="w-full rounded-2xl border border-[#D7DFEE] bg-white px-3 py-2 text-sm text-[#1A3263] focus:border-[#1A3263] focus:outline-none"
                                        >
                                            <option value="semua">Semua</option>
                                            {statuses.map((status) => (
                                                <option
                                                    key={status}
                                                    value={status}
                                                >
                                                    {statusLabels[status]}
                                                </option>
                                            ))}
                                        </select>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F0EBE2] bg-white">
                                {items.map((item, index) => {
                                    const checked = selected.includes(item.id);
                                    return (
                                        <tr
                                            key={item.id}
                                            className={`text-sm transition hover:bg-[#F8F6F1] ${
                                                checked ? 'bg-[#FFF5DC]' : ''
                                            }`}
                                        >
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    className="size-4 rounded border-[#1A3263] text-[#1A3263] focus:ring-[#1A3263]"
                                                    checked={checked}
                                                    onChange={() =>
                                                        toggleSelect(item.id)
                                                    }
                                                    disabled={!item.can_manage}
                                                />
                                            </td>
                                            <td className="px-2 py-4 font-semibold text-[#1A3263]">
                                                {index + 1}
                                            </td>
                                            <td className="flex flex-wrap items-center gap-2 px-4 py-4 text-[#1A3263]">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleShowDetail(item)
                                                    }
                                                    title="Detail"
                                                    aria-label="Detail"
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E0E7FF] text-[#1A3263] transition hover:bg-[#EEF2FF]"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <Link
                                                    href={`/admin/master-data/administrator/${item.id}/edit`}
                                                    title="Edit"
                                                    aria-label="Edit"
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#1A3263] text-[#1A3263] transition hover:bg-[#EEF3FF]"
                                                >
                                                    <PencilLine className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleSingleDelete(
                                                            item.id,
                                                        )
                                                    }
                                                    title="Hapus"
                                                    aria-label="Hapus"
                                                    disabled={!item.can_manage}
                                                    className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                                                        item.can_manage
                                                            ? 'border-[#FEE2E2] text-[#B91C1C] hover:bg-[#FEE2E2]'
                                                            : 'cursor-not-allowed border-slate-100 text-slate-300'
                                                    }`}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                            <td className="px-4 py-4 text-[#1A3263]">
                                                <p className="font-semibold">
                                                    {item.name}
                                                </p>
                                                <p className="text-xs text-[#547792]">
                                                    Terdaftar{' '}
                                                    {formatDateTime(
                                                        item.created_at,
                                                    )}
                                                </p>
                                            </td>
                                            <td className="px-4 py-4 text-[#1A3263]">
                                                {item.email}
                                            </td>
                                            <td className="px-4 py-4 text-[#1A3263]">
                                                <span className="inline-flex items-center rounded-full bg-[#EEF2FF] px-3 py-1 text-xs font-semibold text-[#1A3263]">
                                                    {
                                                        roleLabels[
                                                            item.account_role
                                                        ]
                                                    }
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span
                                                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[item.status]}`}
                                                >
                                                    <span
                                                        className={`h-2 w-2 rounded-full ${
                                                            item.status ===
                                                            'aktif'
                                                                ? 'bg-emerald-500'
                                                                : 'bg-rose-500'
                                                        }`}
                                                    />
                                                    {statusLabels[item.status]}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {items.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-6 py-10 text-center text-sm text-[#547792]"
                                        >
                                            Belum ada akun administrator.
                                        </td>
                                    </tr>
                                ) : null}
                            </tbody>
                        </table>
                    </div>

                    <div className="border-t border-[#E8E2DB] px-6 py-4 text-sm text-[#547792]">
                        Menampilkan {items.length} data
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
