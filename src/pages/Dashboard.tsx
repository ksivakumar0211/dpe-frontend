import React, { useEffect } from "react";
import "./Dashboard.css";
import { useDispatch, useSelector } from "react-redux";
import { setBreadcrumbs } from "@/store/slice/bredCrumbs";
import { useGetMenuQuery } from "@/store/apiSlice";
import { RootState } from "@/store";
// import { setMenu } from "@/store/slice/menuSlice";
import { extractUserId } from "@/utils/commonHelper";
import { setMenu } from "@/store/slice/menuSlice";
// import { RootState } from "@reduxjs/toolkit/query";


const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const currentId: any = useSelector((state: RootState) => state.auth.userId);

  const cleanedUserId = extractUserId(currentId);

  const { data, isLoading } = useGetMenuQuery(cleanedUserId!, { skip: !cleanedUserId, });
  const menus: any = useSelector((state: RootState) => state);

  useEffect(() => {
    if (data?.success?.length) {
      dispatch(setMenu(data?.success));
    }
  }, [data, dispatch]); 


  useEffect(() => {
    dispatch(
      setBreadcrumbs([])
    );
  }, [dispatch]);


  return (
    <div className="_rkContentBorder row py-3">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap grid-margin mb-3">
        <div>
          <h4 className="mb-1">V.O. Chidambaranar Port Authority</h4>
          <p className="text-muted mb-0">Welcome, ADMIN Tester (DCI)</p>
        </div>
      </div>

      {/* <div className="row g-3">
        <div className="col-xl-3 col-md-6">
          <div className="dashboard-card">
            <h6>Total Vessels Today</h6>
            <h3>12</h3>
            <span className="text-success">▲ 8% from yesterday</span>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="dashboard-card">
            <h6>Containers Handled</h6>
            <h3>1,248</h3>
            <span className="text-success">▲ 5% increase</span>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="dashboard-card">
            <h6>Gate In</h6>
            <h3>684</h3>
            <span className="text-muted">Today</span>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="dashboard-card">
            <h6>Gate Out</h6>
            <h3>564</h3>
            <span className="text-muted">Today</span>
          </div>
        </div>
      </div>

      
      <div className="row g-3 mt-2">
        <div className="col-lg-6">
          <div className="dashboard-card h-100">
            <h6>Pending Transactions</h6>
            <h3>37</h3>
            <p className="text-warning mb-0">
              Requires approval / verification
            </p>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="dashboard-card h-100">
            <h6>Document Upload Status</h6>
            <ul className="status-list">
              <li>
                <span>Uploaded</span>
                <strong className="text-success">142</strong>
              </li>
              <li>
                <span>Pending</span>
                <strong className="text-warning">19</strong>
              </li>
              <li>
                <span>Rejected</span>
                <strong className="text-danger">4</strong>
              </li>
            </ul>
          </div>
        </div>
      </div> */}

    </div>
  );
};

export default Dashboard;
