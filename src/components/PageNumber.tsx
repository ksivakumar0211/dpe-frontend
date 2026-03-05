import { faCaretLeft, faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalCount?: number;
    handlePageChange: (page: number) => void;
    handleFilter: (page: number) => void;
}

const PageNumber: React.FC<PaginationProps> = ({ currentPage, totalPages, handlePageChange, handleFilter, totalCount = 0 }) => {
    const maxPagesToShow = 5;

    const getPageNumbers = () => {
        let pages = [];
        if (totalPages <= maxPagesToShow) {
            pages = Array.from({ length: totalPages }, (_, i) => i + 1);
        } else {
            if (currentPage < maxPagesToShow - 1) {
                pages = [1, 2, 3, 4, 5, "...", totalPages];
            } else if (currentPage > totalPages - maxPagesToShow) {
                pages = [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
            } else {
                pages = [1, "...", currentPage, currentPage + 1, currentPage + 2, "...", totalPages];
            }
        }
        return pages;
    };

    const handlePageClick = (page: number) => {
        handlePageChange(page);
        handleFilter(page);
    };

    return (
        <div className="pagination d-flex align-items-center gap-2">
            <button
                className={`btn btn-sm ${currentPage === 1 ? "disabled" : "btn-outline-primary"}`}
                onClick={() => handlePageClick(currentPage - 1)}
                disabled={currentPage === 1}
            >
                <FontAwesomeIcon icon={faCaretLeft} />
            </button>

            {getPageNumbers().map((page, index) => (
                <button
                    key={index}
                    className={`btn btn-sm ${page === currentPage ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => typeof page === "number" && handlePageClick(page)}
                    disabled={page === "..."}
                >
                    {page}
                </button>
            ))}

            <button
                className={`btn btn-sm ${currentPage === totalPages ? "disabled" : "btn-outline-primary"}`}
                onClick={() => handlePageClick(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                <FontAwesomeIcon icon={faCaretRight} />
            </button>
        </div>
    );
};

export default PageNumber;