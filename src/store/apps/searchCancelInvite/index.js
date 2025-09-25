import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import Axios from '../../../plugin/Axios';

export const sendSearchCancelInvitation = createAsyncThunk(
	'inviteCancelSearchMember/getSearchCanceInviteUrl',

	async (data) => {
		const response = await Axios.post('/InviteCancelRequest', data);
		return response?.data;
	}
);

const getSearchCancelUrlSlice = createSlice({
	name: 'inviteCancelSearchMember',
	initialState: {
		inviteCancelSearchMember: null,
	},
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(sendSearchCancelInvitation.pending, (state) => {
				state.inviteCancelSearchMember = null;
			})
			.addCase(sendSearchCancelInvitation.fulfilled, (state, action) => {
				if (action.payload) {
					state.inviteCancelSearchMember = action.payload;
				}
			})
			.addCase(sendSearchCancelInvitation.rejected, (state) => {
				state.inviteCancelSearchMember = null;
			});
	},
});

export default getSearchCancelUrlSlice.reducer;
