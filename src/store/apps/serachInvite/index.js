import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import Axios from '../../../plugin/Axios';

export const sendSearchInvitation = createAsyncThunk(
	'inviteSearchMember/getSearchInviteUrl',

	async (data) => {
		const response = await Axios.post('/newInvite', data);
		return response?.data;
	}
);

const getSearchInviteUrlSlice = createSlice({
	name: 'inviteSearchMember',
	initialState: {
		inviteSearchMember: null,
	},
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(sendSearchInvitation.pending, (state) => {
				state.inviteSearchMember = null;
			})
			.addCase(sendSearchInvitation.fulfilled, (state, action) => {
				if (action.payload) {
					state.inviteSearchMember = action.payload;
				}
			})
			.addCase(sendSearchInvitation.rejected, (state) => {
				state.inviteSearchMember = null;
			});
	},
});

export default getSearchInviteUrlSlice.reducer;
