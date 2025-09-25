import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LocationData } from "../../../components/Location/location";


const initialState: {
    componentId: string|null,
    data: LocationData|null
} = {
  componentId: null,
  data: null
};

const locationSearchSlice = createSlice({
  name: "locationSearch",
  initialState,
  reducers: {
    setComponentId: (state, action: PayloadAction<string | null>) => {
      state.componentId = action.payload;
    },
    setComponentData: (state, action: PayloadAction<LocationData | null>) => {
      state.data = action.payload;
    },
  },
});

export const { setComponentId, setComponentData } = locationSearchSlice.actions;
export default locationSearchSlice.reducer;
