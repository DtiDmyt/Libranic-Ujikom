import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import axios from 'axios';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../css/app.css';
import { initializeTheme } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Setup CSRF token for both Axios and Inertia
if (typeof document !== 'undefined') {
    const tokenMeta = document.head.querySelector('meta[name="csrf-token"]');
    const csrfToken = tokenMeta?.getAttribute('content');

    // Setup for Axios
    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    axios.defaults.headers.common['Accept'] = 'application/json';
    if (csrfToken) {
        axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;
    }

    // Setup for Inertia - ensure all requests include CSRF token
    if (csrfToken) {
        // Set global CSRF token for Inertia requests
        window.Laravel = window.Laravel || {};
        window.Laravel.csrfToken = csrfToken;
    }
}

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <StrictMode>
                <App {...props} />
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
    },
    transform: (props) => ({
        ...props,
        csrf_token:
            window.Laravel?.csrfToken ||
            document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content'),
    }),
});

// This will set light / dark mode on load...
initializeTheme();
