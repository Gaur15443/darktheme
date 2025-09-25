import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ReportsSlideState {
    selected: boolean;
    selectedIndex: number;
}

const initialState: ReportsSlideState = {
    selected: false,
    selectedIndex: 0
};

const reportsSlide = createSlice({
    name: "reportsSlide",
    initialState,
    reducers: {
        setSelected(state, action: PayloadAction<boolean>){
            state.selected = action.payload;
        },
        setSelectedIndex(state, action: PayloadAction<number>) {
            state.selectedIndex = action.payload;
            state.selected = true;
        },
        resetSelection(state) {
            state.selected = false;
            state.selectedIndex = 0;
        }
    }
});

export const { setSelectedIndex, resetSelection, setSelected } = reportsSlide.actions;
export default reportsSlide.reducer;
