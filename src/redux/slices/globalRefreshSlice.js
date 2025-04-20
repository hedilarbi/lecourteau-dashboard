import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  refresh: 0,
};

export const globalRefreshSlice = createSlice({
  name: "globalRefresh",
  initialState,
  reducers: {
    setGlobalRefresh: (state, action) => {
      return {
        ...state,
        refresh: state.refresh + 1,
      };
    },
  },
});

export const { setGlobalRefresh } = globalRefreshSlice.actions;
export const selectGlobalRefresh = (state) => state.globalRefresh.refresh;
export default globalRefreshSlice.reducer;
