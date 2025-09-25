import { createSlice } from '@reduxjs/toolkit';

const initialState: { path: string | null, params: any } = {
  path: null,
  params: null,
};

const astroLinkingSlice = createSlice({
  name: 'astroLinking',
  initialState,
  reducers: {
    setAstroLinking: (state, action) => {
      state.path = action.payload;
    },
    setAstroLinkingParams: (state, action) => {
      state.params = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase('LOGOUT', state => {
        Object.assign(state, initialState);
      })
  },
});

export const { setAstroLinking, setAstroLinkingParams } = astroLinkingSlice.actions;
export default astroLinkingSlice.reducer;
