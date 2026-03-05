import { faCog, faPlus, faSearch, faSyncAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, InputGroup, FormControl } from "react-bootstrap";
import Pagination from "./Pagination";

interface PageHeaderProps {
    title: string,
    currentPage: number;
    totalPages: number;
    totalCount?: number;
    itemsPerPage?: number;
    onPageChange: (page: number) => void;
    onSearch: (query: string) => void;
    onRefresh: () => void;
    onAdd?: () => void;
    onPreference?: () => void;
    advancedSearch?: () => void;
}

const Toolbar: React.FC<PageHeaderProps> = ({ title, currentPage, totalPages, totalCount = 0, onPageChange, onAdd, onRefresh, onPreference, advancedSearch, itemsPerPage }) => {
    return (
        <> 
            <div className="d-flex align-items-center primary-light-bg text-bold position-relative p-2">
                {/* Page Title on the Left */}
                <h6 className="text-start ms-2 flex-grow-1">{title}</h6> 
                <div className="d-flex gap-2 me-2">
                    <Button
                        variant="light"
                        className="btn-sm rounded-circle border"
                        onClick={onRefresh}
                        title="Refresh"
                    >
                        <FontAwesomeIcon icon={faSyncAlt} />
                    </Button>
                    {onAdd && (
                        <Button variant="primary" className="cbtn-sm" onClick={onAdd}>
                            <FontAwesomeIcon icon={faPlus} /> Add
                        </Button>
                    )}
                    <button
                        type="button"
                        className="cbtn-sm"
                        onClick={advancedSearch}
                        style={{
                            backgroundColor: "rgb(193, 80, 101)",
                            color: "rgb(255, 255, 255)"
                        }}
                    >
                        <svg
                            stroke="currentColor"
                            fill="currentColor"
                            strokeWidth={0}
                            viewBox="0 0 512 512"
                            className="me-1"
                            height="1em"
                            width="1em"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M487.976 0H24.028C2.71 0-8.047 25.866 7.058 40.971L192 225.941V432c0 7.831 3.821 15.17 10.237 19.662l80 55.98C298.02 518.69 320 507.493 320 487.98V225.941l184.947-184.97C520.021 25.896 509.338 0 487.976 0z" />
                        </svg>{" "}
                        Filter
                    </button>
                </div>
            </div> 
            <div className="d-flex align-items-center primary-light-bg text-bold position-relative p-2">
                <div className="d-flex align-items-center flex-grow-1">
                    <InputGroup>
                        <InputGroup.Text>
                            <FontAwesomeIcon icon={faSearch} />
                        </InputGroup.Text>
                        <FormControl type="text" placeholder="Search..." />
                    </InputGroup>
                </div>

                <div className="d-flex align-items-center gap-2 me-2">
                    <Pagination
                        itemsPerPage={itemsPerPage}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalCount={totalCount}
                        handlePageChange={onPageChange}
                    />
                    <Button variant="light" onClick={onPreference} className="btn-sm rounded-circle border" title="Settings">
                        <FontAwesomeIcon icon={faCog} />
                    </Button>
                </div>
            </div>
        </ >
    );
};

export default Toolbar;
