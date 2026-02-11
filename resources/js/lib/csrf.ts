/**
 * Utility functions for handling CSRF token in Inertia.js applications
 */

/**
 * Get the current CSRF token from the DOM
 */
export const getCsrfToken = (): string => {
    if (typeof document === 'undefined') return '';
    
    const tokenMeta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null;
    return tokenMeta?.content || '';
};

/**
 * Refresh CSRF token for axios and window.Laravel
 */
export const refreshCsrfToken = (): void => {
    const token = getCsrfToken();
    
    if (token) {
        // Update axios default headers
        import('axios').then(({ default: axios }) => {
            axios.defaults.headers.common['X-CSRF-TOKEN'] = token;
        });
        
        // Update global Laravel object
        if (typeof window !== 'undefined') {
            window.Laravel = window.Laravel || {};
            window.Laravel.csrfToken = token;
        }
    }
};

/**
 * Get CSRF token for manual form submission
 */
export const getTokenForForm = (): Record<string, string> => {
    const token = getCsrfToken();
    return token ? { _token: token } : {};
};