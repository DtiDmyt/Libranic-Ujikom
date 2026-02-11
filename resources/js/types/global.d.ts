// Global type declarations for Laravel and CSRF token
declare global {
    interface Window {
        Laravel?: {
            csrfToken?: string;
        };
    }
}

export {};