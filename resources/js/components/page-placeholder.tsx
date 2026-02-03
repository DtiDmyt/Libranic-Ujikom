import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Props = {
    title: string;
    description?: string;
    breadcrumbs: BreadcrumbItem[];
};

export default function PagePlaceholder({
    title,
    description,
    breadcrumbs,
}: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <div className="rounded-2xl border border-dashed border-[#5477924d] bg-white/40 p-10 text-center text-sm text-muted-foreground">
                <div className="text-xl font-semibold text-foreground">
                    {title}
                </div>
                {description && (
                    <p className="mx-auto mt-2 max-w-2xl">{description}</p>
                )}
                {!description && (
                    <p className="mx-auto mt-2 max-w-2xl">
                        Konten {title} akan ditambahkan di sini.
                    </p>
                )}
            </div>
        </AppLayout>
    );
}
