import { useMemo, useState } from 'react';

export type PaginationResult<T> = {
    currentPage: number;
    totalPages: number;
    paginatedItems: T[];
    from: number;
    to: number;
    total: number;
    goToPage: (page: number) => void;
    nextPage: () => void;
    prevPage: () => void;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    pageNumbers: number[];
};

export function usePagination<T>(
    items: T[],
    itemsPerPage: number,
): PaginationResult<T> {
    const [currentPage, setCurrentPage] = useState(1);

    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));

    const safePage = Math.min(Math.max(1, currentPage), totalPages);

    if (safePage !== currentPage) {
        setCurrentPage(safePage);
    }

    const paginatedItems = useMemo(() => {
        const startIndex = (safePage - 1) * itemsPerPage;
        return items.slice(startIndex, startIndex + itemsPerPage);
    }, [items, safePage, itemsPerPage]);

    const from = total === 0 ? 0 : (safePage - 1) * itemsPerPage + 1;
    const to = Math.min(safePage * itemsPerPage, total);

    const goToPage = (page: number) => {
        const targetPage = Math.min(Math.max(1, page), totalPages);
        setCurrentPage(targetPage);
    };

    const nextPage = () => {
        if (safePage < totalPages) {
            setCurrentPage(safePage + 1);
        }
    };

    const prevPage = () => {
        if (safePage > 1) {
            setCurrentPage(safePage - 1);
        }
    };

    const pageNumbers = useMemo(() => {
        const pages: number[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            const half = Math.floor(maxVisible / 2);
            let start = safePage - half;
            let end = safePage + half;

            if (start < 1) {
                start = 1;
                end = maxVisible;
            }

            if (end > totalPages) {
                end = totalPages;
                start = totalPages - maxVisible + 1;
            }

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
        }

        return pages;
    }, [totalPages, safePage]);

    return {
        currentPage: safePage,
        totalPages,
        paginatedItems,
        from,
        to,
        total,
        goToPage,
        nextPage,
        prevPage,
        hasNextPage: safePage < totalPages,
        hasPrevPage: safePage > 1,
        pageNumbers,
    };
}
