import { createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import { AstroAxios } from "../../../plugin/Axios";
import type { OrderGroup } from "./index.d";


export const getOrderHistory = createAsyncThunk("orderHistory/getOrderHistory", async (userId: string) => {
    const response = await AstroAxios.get(`/payment/get-chronological-orders?userId=${userId}`);
    return response.data?.data as OrderGroup[];
});

interface States {
    orderHistory: OrderGroup[]
}

const initialState: States = {
    orderHistory: []
};
 const orderHistorySlice = createSlice({
    name: "orderHistory",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getOrderHistory.pending, (state) => {
            state.orderHistory = [];
        })
        .addCase(getOrderHistory.fulfilled, (state, action) => {
            state.orderHistory = action.payload;
        })
        .addCase(getOrderHistory.rejected, (state, action) => {
            state.orderHistory = [];
        })
    },
});

export default orderHistorySlice.reducer;