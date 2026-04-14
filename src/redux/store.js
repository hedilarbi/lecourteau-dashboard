import { configureStore } from "@reduxjs/toolkit";
import globalRefreshReducer from "./slices/globalRefreshSlice";
import staffReducer from "./slices/StaffSlice";
import ordersFiltersReducer from "./slices/ordersFiltersSlice";
export const store = configureStore({
  reducer: {
    staff: staffReducer,
    globalRefresh: globalRefreshReducer,
    ordersFilters: ordersFiltersReducer,
  },
});
