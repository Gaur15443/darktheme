import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import Axios from '../../../plugin/Axios';

export const getDeepSearch = createAsyncThunk(
    'deepSearch/getDeepSearch',
    async ({ name }, { rejectWithValue }) => {
        try {
            const response = await Axios.post('/deepSearch', {
                name,
                
            });
            return response?.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
  deepSearch: [],
};

const deepSearchSlice = createSlice({
  name: 'deepSearch',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase('LOGOUT', state => {
        Object.assign(state, initialState);
      })

            .addCase(getDeepSearch?.pending, (state) => {
                state.deepSearch = [];
            })
            .addCase(getDeepSearch?.fulfilled, (state, action) => {
                if (action.payload) {
                    state.deepSearch = action.payload;
                }
            })
            .addCase(getDeepSearch?.rejected, (state) => {
                state.deepSearch = [];
            });
    },
});

export default deepSearchSlice.reducer;
