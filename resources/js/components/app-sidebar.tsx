import { Link, usePage } from '@inertiajs/react';
import {
    useEffect,
    useState,
    type ComponentType,
    type CSSProperties,
} from 'react';
import {
    Activity,
    ClipboardList,
    LayoutGrid,
    LibrarySquare,
    Users,
    ChevronDown,
    RefreshCcw,
    FileSpreadsheet,
    Home,
    BookOpen,
    FolderTree,
    RotateCcw,
    Image,
    School,
    Library,
    Code2,
    Monitor,
    Video,
    Clapperboard,
    Car,
    Wrench,
    Flame,
    PackageOpen,
    CheckCircle,
    Clock,
    History,
    ClipboardCheck,
    FileText,
    Calendar,
    SendHorizontal,
    Archive,
} from 'lucide-react';
import { NavFooter } from '@/components/nav-footer';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import type { NavItem, SharedData } from '@/types';

type SubItem = {
    title: string;
    description?: string;
    href: string;
    icon?: ComponentType<{ className?: string }>;
};

type MenuItem = {
    title: string;
    href?: string;
    icon: ComponentType<{ className?: string }>;
    subItems?: SubItem[];
};

type MenuSection = {
    title: string;
    items: MenuItem[];
};

type HeaderAction = {
    title: string;
    href: string;
    icon: ComponentType<{ className?: string }>;
};

type SidebarConfig = {
    dashboardHref: string;
    sections: MenuSection[];
    headerActions?: HeaderAction[];
};

const sidebarConfigs: Record<string, SidebarConfig> = {
    admin: {
        dashboardHref: '/admin/dashboard',
        sections: [
            {
                title: 'Menu Utama',
                items: [
                    {
                        title: 'Dashboard',
                        href: '/admin/dashboard',
                        icon: LayoutGrid,
                    },
                    {
                        title: 'Manajemen Buku',
                        icon: PackageOpen,
                        subItems: [
                            {
                                title: 'Daftar Buku',
                                href: '/admin/alat/data',
                                icon: LibrarySquare,
                            },
                            {
                                title: 'Kategori Buku',
                                href: '/admin/alat/kategori',
                                icon: FolderTree,
                            },
                        ],
                    },
                    {
                        title: 'Manajemen Peminjaman',
                        icon: ClipboardCheck,
                        subItems: [
                            {
                                title: 'Data Peminjaman',
                                href: '/admin/data-peminjaman/peminjaman',
                                icon: ClipboardList,
                            },
                            {
                                title: 'Data Pengembalian',
                                href: '/admin/data-pengembalian/pengembalian',
                                icon: RotateCcw,
                            },
                            {
                                title: 'Riwayat Peminjaman',
                                href: '/admin/peminjaman/riwayat',
                                icon: History,
                            },
                        ],
                    },
                ],
            },
            {
                title: 'Master Data',
                items: [
                    {
                        title: 'Administrator',
                        href: '/admin/master-data/administrator',
                        icon: Users,
                    },
                ],
            },
        ],
        headerActions: [
            {
                title: 'Log Aktivitas',
                href: '/admin/log-aktivitas',
                icon: Activity,
            },
        ],
    },
    peminjam: {
        dashboardHref: '/dashboard',
        sections: [
            {
                title: 'Menu Utama',
                items: [
                    {
                        title: 'Beranda',
                        href: '/dashboard',
                        icon: Home,
                    },
                    {
                        title: 'Daftar Buku',
                        href: '/daftar-alat',
                        icon: LibrarySquare,
                    },
                    {
                        title: 'Peminjaman Saya',
                        icon: ClipboardList,
                        subItems: [
                            {
                                title: 'Daftar Peminjaman',
                                href: '/peminjaman/daftar-peminjaman',
                                icon: SendHorizontal,
                            },
                            {
                                title: 'Riwayat Peminjaman',
                                href: '/peminjaman/riwayat-peminjaman',
                                icon: History,
                            },
                        ],
                    },
                ],
            },
        ],
    },
};

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const { state, setOpen } = useSidebar();
    const [hasInitialized, setHasInitialized] = useState(false);
    const isCollapsed = state === 'collapsed';
    const { auth } = usePage<SharedData>().props;
    const accountRole = auth.user.account_role ?? 'peminjam';
    const config = sidebarConfigs[accountRole] ?? sidebarConfigs.peminjam;
    const dashboardHref = config.dashboardHref;
    const menuSections = config.sections;
    const headerActions = config.headerActions ?? [];

    useEffect(() => {
        if (hasInitialized) {
            return;
        }

        if (state === 'collapsed') {
            setOpen(true);
        }

        setHasInitialized(true);
    }, [state, setOpen, hasInitialized]);

    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
            className="bg-[#1A3263] text-sm text-white"
            style={{ '--sidebar-width': '240px' } as CSSProperties}
        >
            <SidebarHeader
                className={`border-b border-[#547792] bg-[#1A3263] ${
                    isCollapsed ? 'px-0 py-3' : 'px-4 py-4'
                }`}
            >
                <BrandBlock href={dashboardHref} />
                {headerActions.length > 0 && (
                    <div className="mt-3 flex flex-col gap-2">
                        {headerActions.map((action) => (
                            <HeaderAction key={action.href} action={action} />
                        ))}
                    </div>
                )}
            </SidebarHeader>

            <SidebarContent className="bg-[#1A3263]">
                <div
                    className={`space-y-4 py-3 ${
                        isCollapsed ? 'px-1 text-center' : 'px-2'
                    }`}
                >
                    {menuSections.map((section) => (
                        <MenuSectionBlock
                            key={section.title}
                            section={section}
                        />
                    ))}
                </div>
            </SidebarContent>

            <SidebarFooter
                className={`border-t border-[#547792] bg-[#1A3263] ${
                    isCollapsed ? 'items-center px-0 py-3' : 'px-4 py-4'
                }`}
            >
                {footerNavItems.length > 0 && (
                    <NavFooter items={footerNavItems} className="mt-auto" />
                )}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

function BrandBlock({ href }: { href: string }) {
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed';

    return (
        <SidebarMenu className={isCollapsed ? 'px-0' : 'px-1'}>
            <SidebarMenuItem>
                <Link
                    href={href}
                    prefetch
                    className={`flex items-center gap-3 text-white transition-none ${
                        isCollapsed
                            ? 'mx-auto h-12 w-12 justify-center rounded-xl bg-transparent'
                            : 'py-1'
                    }`}
                >
                    <div
                        className={`flex items-center justify-center rounded-2xl bg-[#FAB95B] shadow-inner ${
                            isCollapsed ? 'h-10 w-10' : 'h-11 w-11'
                        }`}
                    >
                        <img
                            src="/images/logo.png"
                            alt="Logo"
                            className={`${isCollapsed ? 'h-7 w-7' : 'h-9 w-9'} object-contain`}
                        />
                    </div>
                    {!isCollapsed && (
                        <div className="min-w-0 text-left">
                            <p className="text-sm leading-snug font-semibold">
                                Libranic
                            </p>
                        </div>
                    )}
                </Link>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}

function HeaderAction({
    action,
}: {
    action: {
        title: string;
        href: string;
        icon: ComponentType<{ className?: string }>;
    };
}) {
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed';

    if (isCollapsed) {
        const collapsedButton = (
            <Link
                href={action.href}
                aria-label={action.title}
                prefetch
                className="flex h-10 w-10 items-center justify-center rounded-xl text-[#FAB95B] transition-colors hover:text-white"
            >
                <action.icon className="h-4 w-4" />
            </Link>
        );

        return (
            <Tooltip>
                <TooltipTrigger asChild>{collapsedButton}</TooltipTrigger>
                <TooltipContent
                    side="right"
                    className="border-[#547792] bg-[#1A3263] text-[#E8E2DB]"
                >
                    {action.title}
                </TooltipContent>
            </Tooltip>
        );
    }

    return (
        <Link
            href={action.href}
            prefetch
            className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold"
        >
            <span className="flex items-center gap-2 truncate">
                <action.icon className="h-4 w-4 text-[#FAB95B]" />
                <span className="truncate">{action.title}</span>
            </span>
        </Link>
    );
}

function MenuSectionBlock({ section }: { section: MenuSection }) {
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed';

    return (
        <div className={isCollapsed ? 'space-y-2' : 'space-y-2'}>
            {!isCollapsed && (
                <div className="mb-2 px-3 text-xs font-semibold tracking-wider text-[#FAB95B] uppercase">
                    {section.title}
                </div>
            )}
            <div className="space-y-1">
                {section.items.map((item) => (
                    <CollapsibleMenuItem key={item.title} item={item} />
                ))}
            </div>
        </div>
    );
}

function CollapsibleMenuItem({ item }: { item: MenuItem }) {
    const { url } = usePage();
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed';
    const hasSubItems = Boolean(item.subItems?.length);
    const isActive = item.href ? url.startsWith(item.href) : false;
    const hasActiveSubItem = hasSubItems
        ? item.subItems!.some((sub) => url.startsWith(sub.href))
        : false;
    const [isOpen, setIsOpen] = useState(() => hasActiveSubItem);

    useEffect(() => {
        setIsOpen(hasActiveSubItem);
    }, [hasActiveSubItem]);

    const collapsedBaseClasses =
        'flex items-center justify-center rounded-lg p-2 transition-colors';
    const collapsedActive = 'bg-[#FAB95B] text-[#1A3263]';
    const collapsedInactive =
        'text-white/80 hover:bg-[#547792]/60 hover:text-white';

    if (isCollapsed) {
        if (hasSubItems) {
            return (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            type="button"
                            onClick={() => setIsOpen((prev) => !prev)}
                            className={`${collapsedBaseClasses} ${
                                hasActiveSubItem
                                    ? collapsedActive
                                    : collapsedInactive
                            }`}
                        >
                            <item.icon className="h-5 w-5" />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent
                        side="right"
                        className="border-[#547792] bg-[#1A3263] text-white"
                    >
                        {item.title}
                    </TooltipContent>
                </Tooltip>
            );
        }

        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link
                        href={item.href || '#'}
                        prefetch
                        className={`${collapsedBaseClasses} ${
                            isActive ? collapsedActive : collapsedInactive
                        }`}
                    >
                        <item.icon className="h-5 w-5" />
                    </Link>
                </TooltipTrigger>
                <TooltipContent
                    side="right"
                    className="border-[#547792] bg-[#1A3263] text-white"
                >
                    {item.title}
                </TooltipContent>
            </Tooltip>
        );
    }

    if (hasSubItems) {
        return (
            <div className="space-y-1">
                <button
                    type="button"
                    onClick={() => setIsOpen((prev) => !prev)}
                    className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        hasActiveSubItem || isOpen
                            ? 'bg-[#547792] text-white'
                            : 'text-white/80 hover:bg-[#547792]/60 hover:text-white'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                    </div>
                    <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : ''
                        }`}
                    />
                </button>
                {isOpen && (
                    <div className="mt-1 ml-4 space-y-1 border-l border-[#547792] pl-3">
                        {item.subItems!.map((sub) => {
                            const isSubActive = url.startsWith(sub.href);
                            return (
                                <Link
                                    key={sub.href}
                                    href={sub.href}
                                    prefetch
                                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                        isSubActive
                                            ? 'bg-[#FAB95B] text-[#1A3263]'
                                            : 'text-white/70 hover:bg-[#547792]/60 hover:text-white'
                                    }`}
                                >
                                    {sub.icon && (
                                        <sub.icon className="h-4 w-4" />
                                    )}
                                    <span>{sub.title}</span>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    return (
        <Link
            href={item.href || '#'}
            prefetch
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                    ? 'bg-[#FAB95B] text-[#1A3263]'
                    : 'text-white/80 hover:bg-[#547792]/60 hover:text-white'
            }`}
        >
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
        </Link>
    );
}
