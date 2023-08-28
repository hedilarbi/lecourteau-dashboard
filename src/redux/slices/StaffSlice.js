import { createSelector, createSlice } from "@reduxjs/toolkit";

const initialState = {
  data: {},
  token: null,
};

export const staffSlice = createSlice({
  name: "staff",
  initialState,
  reducers: {
    setStaffData: (state, action) => {
      return {
        ...state,
        data: action.payload,
      };
    },
    setStaffToken: (state, action) => {
      return {
        ...state,
        token: action.payload,
      };
    },

    clearStaff: (state, action) => {
      state.data = {};
      state.token = null;
    },
  },
});

export const { setStaffData, clearStaff, setStaffToken } = staffSlice.actions;

export const selectStaffData = (state) => state.staff.data;
export const selectStaffToken = (state) => state.staff.token;

export default staffSlice.reducer;
