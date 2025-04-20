import { configureStore } from "@reduxjs/toolkit";
import globalRefreshReducer from "./slices/globalRefreshSlice";
import staffReducer from "./slices/StaffSlice";
export const store = configureStore({
  reducer: {
    staff: staffReducer,
    globalRefresh: globalRefreshReducer,
  },
});
