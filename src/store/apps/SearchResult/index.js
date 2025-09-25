import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import Axios from '../../../plugin/Axios';

export const getCategoryData = createAsyncThunk('appHome/getCategoryData', async () => {
	const response = await Axios.get('/getCategoryData');
	return response.data;
})

const initialState = {
	getCategory:[],
	formDataStore:{},
};

export const searchResult = createSlice({
	name: 'searchRes',
	initialState,
	reducers: {
		setformDataStore(state, {payload}) {
			state.formDataStore = payload;
		  },
		  resetFormDataStore(state) {
			state.formDataStore = {};
		  },
	},
	extraReducers: (builder) => {
			builder
			.addCase('LOGOUT', state => {
				Object.assign(state, initialState);
			})
			.addCase(getCategoryData.pending, (state) => {
				state.getCategory = {};
			})
			.addCase(getCategoryData.fulfilled, (state, action) => {
				state.loading = 'succeeded';
				state.getCategory = action?.payload;
			})
			.addCase(getCategoryData.rejected, (state, action) => {
				state.getCategory = {};
			});

    },
});

export const {
	setformDataStore,
	resetFormDataStore
} = searchResult.actions

export default searchResult.reducer;