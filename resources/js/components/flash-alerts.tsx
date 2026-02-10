import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { alertError, alertSuccess } from '@/lib/alert';

type FlashProps = {
    flash?: {
        success?: string;
        error?: string;
    };
};

export function FlashAlerts() {
    const { flash } = usePage<FlashProps>().props;

    useEffect(() => {
        if (flash?.success) {
            alertSuccess(flash.success);
        } else if (flash?.error) {
            alertError(flash.error);
        }
    }, [flash?.error, flash?.success]);

    return null;
}
