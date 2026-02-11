import { usePage } from '@inertiajs/react';

/**
 * Hook untuk mendapatkan CSRF token dari props Inertia atau DOM
 */
export const useCsrfToken = (): string => {
    const { props } = usePage();
    
    // Coba ambil dari props yang dikirim oleh transform
    if ('csrf_token' in props && typeof props.csrf_token === 'string') {
        return props.csrf_token;
    }
    
    // Fallback ke meta tag
    if (typeof document !== 'undefined') {
        const tokenMeta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null;
        return tokenMeta?.content || '';
    }
    
    return '';
};