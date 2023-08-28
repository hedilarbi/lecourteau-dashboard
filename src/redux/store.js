import { configureStore } from "@reduxjs/toolkit";

import staffReducer from "./slices/StaffSlice";
export const store = configureStore({
  reducer: {
    staff: staffReducer,
  },
});
