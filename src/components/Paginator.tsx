import React from "react";
import ReactPagination from "react-js-pagination";

interface PaginatorProps {
    currentPage: number; // 0-based
    totalCount: number;
    pageSize?: number;
    onPageChange: (page: number) => void; // 1-based from lib
}

const Paginator: React.FC<PaginatorProps> = ({
    currentPage,
    totalCount,
    pageSize = 10,
    onPageChange,
}) => {
    if (totalCount <= pageSize) return null;

    return (
        <div className="d-flex justify-content-center mt-3">
            <ReactPagination
                activePage={currentPage + 1}
                itemsCountPerPage={pageSize}
                totalItemsCount={totalCount}
                pageRangeDisplayed={5}
                onChange={onPageChange}
                itemClass="page-item"
                linkClass="page-link"
                firstPageText="First"
                lastPageText="Last"
                prevPageText="Prev"
                nextPageText="Next"
            />
        </div>
    );
};

export default Paginator;
