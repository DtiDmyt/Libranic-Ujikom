import { ChevronLeft, ChevronRight } from 'lucide-react';

type PaginationProps = {
    currentPage: number;
    totalPages: number;
    from: number;
    to: number;
    total: number;
    pageNumbers: number[];
    hasNextPage: boolean;
    hasPrevPage: boolean;
    onPageChange: (page: number) => void;
    onNext: () => void;
    onPrev: () => void;
};

export function Pagination({
    currentPage,
    totalPages,
    from,
    to,
    total,
    pageNumbers,
    hasNextPage,
    hasPrevPage,
    onPageChange,
    onNext,
    onPrev,
}: PaginationProps) {
    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-xs text-[#94A3B8]">
                Menampilkan {from} - {to} dari {total} data
            </p>
            <nav
                className="flex flex-wrap items-center gap-1.5"
                aria-label="Pagination"
            >
                <button
                    type="button"
                    onClick={onPrev}
                    disabled={!hasPrevPage}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${
                        hasPrevPage
                            ? 'border-[#E0E7EE] text-[#1A3263] hover:border-[#1A3263] hover:bg-[#F5F1EA]'
                            : 'cursor-not-allowed border-transparent text-[#CBD5E1]'
                    }`}
                    aria-label="Halaman sebelumnya"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>

                {pageNumbers[0] > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={() => onPageChange(1)}
                            className="flex h-8 min-w-8 items-center justify-center rounded-lg border border-[#E0E7EE] px-2 text-sm text-[#1A3263] transition hover:border-[#1A3263] hover:bg-[#F5F1EA]"
                        >
                            1
                        </button>
                        {pageNumbers[0] > 2 && (
                            <span className="px-1 text-[#94A3B8]">...</span>
                        )}
                    </>
                )}

                {pageNumbers.map((page) => (
                    <button
                        key={page}
                        type="button"
                        onClick={() => onPageChange(page)}
                        className={`flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-sm transition ${
                            page === currentPage
                                ? 'border-[#1A3263] bg-[#1A3263] text-white'
                                : 'border-[#E0E7EE] text-[#1A3263] hover:border-[#1A3263] hover:bg-[#F5F1EA]'
                        }`}
                    >
                        {page}
                    </button>
                ))}

                {pageNumbers[pageNumbers.length - 1] < totalPages && (
                    <>
                        {pageNumbers[pageNumbers.length - 1] <
                            totalPages - 1 && (
                            <span className="px-1 text-[#94A3B8]">...</span>
                        )}
                        <button
                            type="button"
                            onClick={() => onPageChange(totalPages)}
                            className="flex h-8 min-w-8 items-center justify-center rounded-lg border border-[#E0E7EE] px-2 text-sm text-[#1A3263] transition hover:border-[#1A3263] hover:bg-[#F5F1EA]"
                        >
                            {totalPages}
                        </button>
                    </>
                )}

                <button
                    type="button"
                    onClick={onNext}
                    disabled={!hasNextPage}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${
                        hasNextPage
                            ? 'border-[#E0E7EE] text-[#1A3263] hover:border-[#1A3263] hover:bg-[#F5F1EA]'
                            : 'cursor-not-allowed border-transparent text-[#CBD5E1]'
                    }`}
                    aria-label="Halaman berikutnya"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </nav>
        </div>
    );
}
