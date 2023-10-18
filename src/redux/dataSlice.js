// dataSlice.js
import { createSlice } from "@reduxjs/toolkit";

const dataSlice = createSlice({
  name: "data",
  initialState: {
    data: [],
    leadCount: 0,
    daysOfCount: 0,
    loading: false,
    error: null,
  },
  reducers: {
    addData: (state, action) => {
      state.data.push(action.payload);
    },
    deleteData: (state, action) => {
      state.data = state.data.filter((item) => item.id !== action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setLeadCount: (state, action) => {
      state.leadCount = action.payload;
    },
    setDaysOfCount: (state, action) => {
      state.daysOfCount = action.payload;
    },
  },
});

export const {
  addData,
  deleteData,
  setLoading,
  setError,
  setLeadCount,
  setDaysOfCount,
} = dataSlice.actions;

export default dataSlice.reducer;
