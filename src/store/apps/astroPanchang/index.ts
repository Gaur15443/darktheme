import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {AstroAxios} from "../../../plugin/Axios";
import { PanchangPayload, PanchangResponse, PanchangResponseData } from "./index.d";

export const getPanchang = createAsyncThunk(
    'panchang/getPanchang',
    async (data, {dispatch}) => {
            const res = await AstroAxios.post(
                "/getPanchang",
                data
            );
            dispatch(setSelectedLocation(res.data.data.location));
            return res.data.data;
    }
);
export const setPanchang = createAsyncThunk<
  PanchangResponseData, 
  PanchangPayload
>(
  'panchang/setPanchang',
  async (data: PanchangPayload) => {
      const res = await AstroAxios.post<PanchangResponse>(
        "/setPanchang",
        data
      );
      return res.data.data;
  }
);



const initialState = {
    panchangData: {},
    festivalData: [],
    selectedLocation: {},
    selectedDateObject: {
        date: null,
        month: null,
        year: null
    }
}

const astroPanchangSlice = createSlice({
    name: 'panchang',
    initialState,
    reducers: {
        setSelectedDate(state, {payload}){
            state.selectedDateObject = payload
        },
        setSelectedLocation(state, {payload}){
            state.selectedLocation = payload;
        }
    },
    extraReducers: builder => builder.
        addCase(getPanchang.fulfilled, (state, {payload}) => {
            state.panchangData = payload?.panchangData?.response || {};
            
            state.festivalData = payload?.festivals?.response?.festival_list || [];
        })
        .addCase(getPanchang.rejected, (state) => {
            state.panchangData = {};
        })
})

export const {
    setSelectedDate,
    setSelectedLocation
} = astroPanchangSlice.actions

export default astroPanchangSlice.reducer