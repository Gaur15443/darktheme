import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  familyType: 'owner',
};
const familyTypeSlice = createSlice({
  name: 'familyType',
  initialState,
  reducers: {
    updateFamilyType: (state, action) => {
      state.familyType = action.payload;
    },
  },
  extraReducers: (builder) => {
		builder.addCase('LOGOUT', (state) => {
			Object.assign(state, initialState);
		});
  },
});

export const {updateFamilyType} = familyTypeSlice.actions;

export default familyTypeSlice.reducer;
