import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  search: "",
  filter: "",
  orderTypeFilter: "",
  fromDate: null,
  toDate: null,
  showFilters: false,
  page: 1,
  selectedRestaurant: {
    label: "Tous",
    value: "",
  },
};

const ordersFiltersSlice = createSlice({
  name: "ordersFilters",
  initialState,
  reducers: {
    setOrdersFilters: (state, action) => ({
      ...state,
      ...action.payload,
      selectedRestaurant:
        action.payload?.selectedRestaurant || state.selectedRestaurant,
    }),
    resetOrdersFilters: () => initialState,
  },
});

export const { setOrdersFilters, resetOrdersFilters } =
  ordersFiltersSlice.actions;
export const selectOrdersFilters = (state) => state.ordersFilters;

export default ordersFiltersSlice.reducer;

