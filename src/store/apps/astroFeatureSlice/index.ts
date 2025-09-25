import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface AstroFeatureState {
  isAstroFeatureEnabled: boolean;
  isPersonalisedHoroscopeEnabled: boolean;
  isConsultationEnabled: boolean;
}

const initialState: AstroFeatureState = {
  isAstroFeatureEnabled: false,
  isPersonalisedHoroscopeEnabled: false,
  isConsultationEnabled: false,
};

const astroFeatureSlice = createSlice({
  name: 'astroFeature',
  initialState,
  reducers: {
    setAstroFeatureEnabled: (state, action: PayloadAction<boolean>) => {
      state.isAstroFeatureEnabled = action.payload;
    },
    setPersonalisedHoroscopeEnabled: (
      state,
      action: PayloadAction<boolean>,
    ) => {
      state.isPersonalisedHoroscopeEnabled = action.payload;
    },
    setConsultationEnabled: (
      state,
      action: PayloadAction<boolean>,
    ) => {
      state.isConsultationEnabled = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addCase('LOGOUT', state => {
      Object.assign(state, initialState);
    });
  },
});

export const {setAstroFeatureEnabled, setPersonalisedHoroscopeEnabled, setConsultationEnabled} =
  astroFeatureSlice.actions;
export default astroFeatureSlice.reducer;
