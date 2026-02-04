import Swal from 'sweetalert2';

export type AlertIcon = 'success' | 'error' | 'warning' | 'info' | 'question';

export type AlertOptions = {
    title?: string;
    text?: string;
    icon?: AlertIcon;
    confirmButtonText?: string;
    showConfirmButton?: boolean;
};

export function showAlert(message: string, options: AlertOptions = {}): void {
    Swal.fire({
        title: options.title ?? 'Notifikasi',
        text: options.text ?? message,
        icon: options.icon ?? 'info',
        confirmButtonText: options.confirmButtonText ?? 'OK',
        showConfirmButton: options.showConfirmButton ?? true,
        customClass: {
            popup: 'rounded-2xl',
        },
        timer: options.icon === 'success' ? 1800 : undefined,
    });
}

export function alertSuccess(message: string): void {
    showAlert(message, { title: 'Berhasil', icon: 'success' });
}

export function alertError(message: string): void {
    showAlert(message, { title: 'Terjadi Kesalahan', icon: 'error' });
}

export function alertLoading(message: string): void {
    Swal.fire({
        title: 'Memproses',
        text: message,
        allowOutsideClick: false,
        showConfirmButton: false,
        customClass: {
            popup: 'rounded-2xl',
        },
        didOpen: () => {
            Swal.showLoading();
        },
    });
}

export function closeAlert(): void {
    Swal.close();
}
