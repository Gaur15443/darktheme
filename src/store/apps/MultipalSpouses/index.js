import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';

export const getMultipalSpouse = createAsyncThunk(
  'mSpouse',
  async payload => payload,
);

export const getRelationSeleced = createAsyncThunk(
  'getReletion',
  async payload =>
    payload === 'son' || payload === 'daughter' ? payload : null,
);

export const getSelectdSpouseId = createAsyncThunk(
  'getSpouseId',
  async payload => payload,
);

const initialState = {
  status: 'idle',
  error: null,
  mSpouse: null,
  relationSeleced: null,
  selectedSpouseId: null,
};

const getMultipalSpouseSlice = createSlice({
  name: 'checkInviteUser',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase('LOGOUT', (state) => {
			Object.assign(state, initialState);
		});
    builder
      .addCase(getMultipalSpouse.pending, state => {
        state.status = 'pending';
      })
      .addCase(getMultipalSpouse.fulfilled, (state, action) => {
        state.status = 'fulfilled';
        state.mSpouse = action.payload;
      })
      .addCase(getMultipalSpouse.rejected, (state, action) => {
        state.status = 'rejected';
        state.error = action.error.message;
      });

    builder
      .addCase(getRelationSeleced.pending, state => {
        state.status = 'pending';
      })
      .addCase(getRelationSeleced.fulfilled, (state, action) => {
        state.status = 'fulfilled';
        state.relationSeleced = action.payload;
      })
      .addCase(getRelationSeleced.rejected, (state, action) => {
        state.status = 'rejected';
        state.error = action.error.message;
      });

    builder
      .addCase(getSelectdSpouseId.pending, state => {
        state.status = 'pending';
      })
      .addCase(getSelectdSpouseId.fulfilled, (state, action) => {
        state.status = 'fulfilled';
        state.selectedSpouseId = action.payload;
      })
      .addCase(getSelectdSpouseId.rejected, (state, action) => {
        state.status = 'rejected';
        state.error = action.error.message;
      });
  },
});

export default getMultipalSpouseSlice.reducer;
