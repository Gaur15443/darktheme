import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AstroAxios, ConsultationAxios, } from "../../../plugin/Axios";
import type { AstroFilters } from "./index.d";
import Config from "react-native-config";

interface AstroFiltersState {
  filterOptions: AstroFilters | null;
}

export const getFilterOptions = createAsyncThunk('astroFilters/getFilterOptions', async () => {
  const response = await ConsultationAxios.get<AstroFilters>(`/getFilterOptions`);
  return response.data;
});

const initialState: AstroFiltersState = {
  filterOptions: null
};

const astroFiltersSlice = createSlice({
  name: 'astroFilters',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getFilterOptions.pending, (state) => {
      state.filterOptions = null;
    });
    builder.addCase(getFilterOptions.fulfilled, (state, action) => {
      state.filterOptions = action.payload;
    });
  },
});

export default astroFiltersSlice.reducer;