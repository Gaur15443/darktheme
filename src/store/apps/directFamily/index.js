import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Axios from '../../../plugin/Axios';

export const getUserDirectFamily = createAsyncThunk(
	'DirectFamily/getUserImmediateFamilyMember',
	async ({ userId, treeId }) => {
		const response = await Axios.get(
			`/getImmediateMemberbyIdNew/${userId}/${treeId}`
		);
		return response.data;
	}
);
const initialState = { data: null, error: null, immediateFamilyMember: {} };

const apiSlice = createSlice({
	name: 'DirectFamily',
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase('LOGOUT', (state) => {
			Object.assign(state, initialState);
		});

		builder
			.addCase(getUserDirectFamily.fulfilled, (state, action) => {
				state.data = action.payload;
				state.error = null;
			})
			.addCase(getUserDirectFamily.rejected, (state, action) => {
				state.data = null;
				state.error = action.error.message;
			});
	},
});

export default apiSlice.reducer;
