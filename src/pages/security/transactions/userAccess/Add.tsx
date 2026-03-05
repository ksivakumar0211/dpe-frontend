import React, { useCallback, useEffect, useRef, useState } from "react";
import { validationRequest, ValidationRules } from "@/utils/validationRequest";
import { toast } from "react-toastify";
import RowFormSelectField from "@/components/Form/RowFormSelectField";
import { setBreadcrumbs } from "@/store/slice/bredCrumbs";
import { useDispatch } from "react-redux";
import { apiRequest } from "@/store/services/api";
import LoadingFetchLoader from "@/components/LoadingFetchLoader";
import { Link, useNavigate } from "react-router-dom";
import { checkParentMenuCheck, checkParentNodeMenuCheck } from "@/utils/commonHelper";
export interface Column {
    id: number;
    key: string;
    label: string;
}

export interface User {
    id: number;
    name: string;
    value?: string;
    label?: string

}

interface TableRow {
    moduleId: string;
    moduleName: string;
    menuId: string;
    menuName: string;
    isChecked: any;
    isMenu?: boolean
}

const Add: React.FC = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(
            setBreadcrumbs([
                { label: "Security", path: "" },
                { label: "Transaction", path: "" },
                { label: "User Access", path: "" },
                { label: "Add" }
            ])
        );
    }, [dispatch]);
    const [formData, setFormData] = useState({
        username: "",
        userID: "",
    });
    const [userLoading, setUserLoading] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [errors, setErrors] = useState<Record<string, any>>({});
    const [menulist, setMenuList] = useState<any[]>([]);
    const [success, setSuccess] = useState<string>("");
    type UserOption = {
        value: string;
        label: string;
    };
    const [userList, setUserList] = useState<UserOption[]>([]);
    const validationRules: ValidationRules = {
        username: { required: true, minLength: 1, maxLength: 255 },
    };

    const fetchUserData = async () => {
        try {
            setUserLoading(true)
            const url = "/getAllUser";
            const response = await apiRequest({ url: url, method: "GET" });
            if (response.users.length > 0) {
                const users = response.users.map(
                    (user: { id: string; label: string, name?: string }) => ({
                        value: user.id,
                        label: `${user.name} (${user.id})`,
                        item: user
                    })
                );
                setUserList(users)
            }
        } catch (error) {
            console.error(error);
        } finally {
            setUserLoading(false)
        }
    };

    useEffect(() => {
        fetchUserData();
        // fetchData();
    }, []);


    const [menuRows, setMenuRows] = useState<TableRow[]>([]);


    const handleRowChange = useCallback(async (e: any, index: number, field: keyof TableRow, row: any) => {
        const isPreCheck = await checkParentNodeMenuCheck(menuRows, row.menuId);
        setMenuRows((prev) => {
            const isChecking = row.isChecked ? 0 : 1;
            return prev.map((item: any) => {
                if (item.rootId !== row.rootId) return item;
                if (isChecking === 1) {
                    if (row.leaf === 1) {
                        return {
                            ...item,
                            checked: 1,
                            isChecked: 1,
                        };
                    } else {
                        return {
                            ...item,
                            checked: 1,
                            isChecked: 1,
                        };
                    }
                    // if (item.leaf === 0) {
                    //     return {
                    //         ...item,
                    //         checked: 1,
                    //         isChecked: 1,
                    //     };
                    // }
                    // if (item.menuId === row.menuId || item.leaf === 0) {
                    // return {
                    //     ...item,
                    //     checked: 1,
                    //     isChecked: 1,
                    // };
                    // }
                }
                if (isChecking === 0 && isPreCheck) {
                    if (item.menuId === row.menuId) {
                        return {
                            ...item,
                            checked: 0,
                            isChecked: 0,
                        };
                    }
                }
                if (isChecking === 0 && !isPreCheck) {
                    return {
                        ...item,
                        checked: 0,
                        isChecked: 0,
                    };
                }
                return item;
            });
        });

    }, [menuRows]);



    const handleSelectChange = useCallback(async (selectedOption: any, name: string) => {
        try {
            setLoading(true)
            const { item } = selectedOption
            const url = `/add-edit/menu?userId=${item?.id}&isAdd=true`;
            const response = await apiRequest({ url: url, method: "GET" })
            if (Array.isArray(response.success) && response.success.length > 0) {
                const check_record_set = response.success
                const repo_data = check_record_set.filter((item: any) => item.leaf === 1 && item.checked === 1);
                const checkedRootIds = [...new Set(repo_data.map((item: any) => item.rootId))];

                const updatedData = check_record_set.map((item: any) => {
                    return {
                        ...item,
                        checked: item.leaf === 0 && checkedRootIds.includes(item.rootId) ? 1 : item.leaf === 1 && checkedRootIds.includes(item.rootId) ? item.checked : 0,
                        isChecked: item.leaf === 0 && checkedRootIds.includes(item.rootId) ? 1 : item.leaf === 1 && checkedRootIds.includes(item.rootId) ? item.checked : 0,
                    };
                });
                setMenuRows(updatedData);
            }

            setFormData((prev) => ({ ...prev, [name]: item?.name || "", userID: item?.id }));
            setErrors({})
        } catch (error) {

        } finally {
            setLoading(false)
        }
    }, [menulist]);


    const handleFormSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        const { isValid, errors } = validationRequest(formData, validationRules);
        setErrors(errors);

        if (!isValid) {
            toast.error("Please fill in all mandatory fields.", { position: "top-right", autoClose: 6000 });
            console.log("Validation Errors:", errors);
            return;
        }
        const selectedMenus = menuRows.filter(menu => menu.isChecked).map(menu => ({ moduleId: menu.moduleId, menuId: menu.menuId }));

        if (selectedMenus.length === 0) {
            toast.error("Please check at least one menu access.", {
                position: "top-right",
                autoClose: 6000,
            });
            return;
        }
        setSubmitting(true)
        try {
            const payload = {
                userId: formData?.userID,
                selections: selectedMenus
            }
            const resp = await apiRequest({ url: "/saveUserAccess", method: "POST", data: payload })
            setSuccess(resp.message)
            toast.success(resp.message, { position: "top-right", autoClose: 6000 });
        } catch (err: any) {
            let apiError = "Something went wrong! Please try again.";
            if (err?.status === 422 && err?.data?.errors) {
                setErrors(err.data.errors);
                apiError = "Please correct the highlighted errors.";
            } else if (err?.data?.message) {
                apiError = err.data.message;
            }
            toast.error(apiError, { position: "top-right", autoClose: 3000 });
        } finally {
            setSubmitting(false)

            const timer = setTimeout(() => {
                setSuccess("");
                setFormData({ username: "", userID: "", })
                setMenuRows([])
                fetchUserData();
            }, 2000);
            return () => clearTimeout(timer);

        }
    }, [formData, menuRows]);

    const handleSelectAll = (checked: boolean) => {
        setMenuRows((prev: any) =>
            prev.map((row: any) => ({
                ...row,
                isChecked: checked,
                checked: checked ? 1 : 0,
            }))
        );
    };
    const selectAllRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        if (!selectAllRef.current) return;
        const nonMenuRows = menuRows.filter(r => !r.isMenu);
        if (nonMenuRows.length === 0) {
            selectAllRef.current.indeterminate = false;
            return;
        }
        const allChecked = nonMenuRows.length > 0 && nonMenuRows.every(r => r.isChecked)
        const someChecked = nonMenuRows.some(r => r.isChecked);
        selectAllRef.current.indeterminate = someChecked && !allChecked;
    }, [menuRows]);

    const navigate = useNavigate();


    return (

        <div className="_rkContentBorder container-fluid py-3 " style={{ border: "1px solid black", marginTop: "7px", marginBottom: "70px" }}>
            <div className="d-flex justify-content-between align-items-center text-white px-3 py-1 mb-3 fw-bold" style={{ backgroundColor: "#023e8a" }} >
                <span style={{ fontSize: "12px" }}>
                    👉 User Access &gt;&gt; Add
                </span>
                <Link
                    to="/editUserAccess"
                    style={{ fontSize: "11px" }}
                    className="text-white"
                >
                    Click here to Search Page
                </Link>
            </div>

            <form onSubmit={handleFormSubmit}>
                <div className="row">
                    <RowFormSelectField
                        name="username"
                        label="User Name"
                        isLoading={userLoading}
                        options={userList}
                        value={formData.username}
                        onChange={handleSelectChange}
                        isEdit={true}
                        error={errors.username}
                        required={true}
                        // isLoading={false}
                        formData={formData}
                        row="col-md-5"
                        col1="col-md-3"
                        col2="col-md-9"
                    />
                    {/* <RowFormInputField row="col-md-4" label="User ID" name="userID" inputValue={formData.userID} error={errors.userID} isDefault={true} onChange={() => { }} /> */}
                </div>


                <div className="row mt-3">
                    <div className="col-12">
                        <div style={{ overflowX: "auto" }}>
                            <table className="custom-table table-bordered table-sm">
                                <thead className="text-white">
                                    <tr>
                                        <th>Modules</th>
                                        <th>Menus</th>
                                        <th style={{ width: "25%" }}>
                                            Allow Access
                                            {menuRows.length > 0 && <input
                                                ref={selectAllRef}
                                                type="checkbox"
                                                className="form-check-input pl-5"
                                                style={{
                                                    marginLeft: "10px",
                                                    borderRadius: "0px",
                                                    transform: "scale(1.4)",
                                                    cursor: "pointer",
                                                    border: "1px solid #023e8a",
                                                }}
                                                checked={
                                                    menuRows.length > 0 &&
                                                    menuRows.filter(r => !r.isMenu).every(row => row.isChecked)
                                                }
                                                onChange={(e) => handleSelectAll(e.target.checked)}
                                            />}
                                        </th>

                                    </tr>
                                </thead>


                                <tbody>
                                    {menuRows?.length === 0 && (
                                        <tr>
                                            <td colSpan={12} className="text-center">
                                                No menus
                                            </td>
                                        </tr>
                                    )}
                                    {
                                        menuRows && menuRows?.map((row: any, index) => (
                                            <tr key={row.menuId ?? index}>
                                                {/* <td> <input readOnly style={{ height: "23px", fontSize: "10px", fontWeight: "bold" }} value={row.moduleId} className={`form-control custom-form-control`} />  </td> */}
                                                <td> <input readOnly style={{ height: "23px", fontSize: "10px", fontWeight: "bold", minHeight: "25px" }} value={row.moduleName ?? ""} className={`form-control custom-form-control`} />  </td>
                                                {/* <td> <input readOnly style={{ height: "23px", fontSize: "10px", fontWeight: "bold" }} value={row.menuId} className={`form-control custom-form-control`} />  </td> */}
                                                <td> <input readOnly style={{ height: "23px", fontSize: "12px", fontWeight: "bold", minHeight: "25px" }} value={row.menuNameTree ?? ""} className={`form-control custom-form-control`} />  </td>

                                                <td className="text-left" style={{ paddingLeft: `${row.level * 20}px`, }}>
                                                    {

                                                        <input
                                                            type="checkbox"
                                                            disabled={row.leaf === 0}
                                                            className="form-check-input"
                                                            style={{
                                                                borderRadius: "0px",
                                                                transform: "scale(1.4)",
                                                                cursor: "pointer",
                                                                border: "1px solid #023e8a",
                                                            }}
                                                            checked={row?.checked === 1 ? true : false}
                                                            onChange={(e) => handleRowChange(e, index, "isChecked", row)}
                                                        />
                                                    }
                                                </td>


                                            </tr>
                                        ))

                                    }
                                </tbody>
                            </table>
                            {loading && <LoadingFetchLoader />}
                        </div>
                    </div>
                </div>

                <div className="d-flex gap-3 justify-content-end">
                    <button
                        type="button"
                        disabled={submitting}
                        className="btn btn-sm btn-secondary custom-form-control"
                        onClick={() => navigate("/editUserAccess")}
                    >
                        Back to Search Page
                    </button>

                    <button
                        type="submit"
                        className={`btn btn-success btn-sm px-4 custom-form-control position-relative ${submitting ? "loading" : ""}`}
                        disabled={submitting}
                        style={{
                            minWidth: "100px"
                        }}
                    >
                        {submitting && <span className="spinner-center"></span>}
                        {!submitting && <span className="btn-text">Submit</span>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Add;
