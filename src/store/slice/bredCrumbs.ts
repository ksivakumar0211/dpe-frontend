import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BreadcrumbItem } from "../types";
 
interface BreadcrumbState {
  items: BreadcrumbItem[];
}

const initialState: BreadcrumbState = {
  items: []
};

const breadcrumbSlice = createSlice({
  name: "breadcrumbs",
  initialState,
  reducers: {
    setBreadcrumbs(state, action: PayloadAction<BreadcrumbItem[]>) {
      state.items = action.payload;
    },
    clearBreadcrumbs(state) {
      state.items = [];
    }
  }
});

export const { setBreadcrumbs, clearBreadcrumbs } = breadcrumbSlice.actions;
export default breadcrumbSlice.reducer;
