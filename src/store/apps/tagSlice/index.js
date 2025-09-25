import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import Axios from './../../../plugin/Axios';
import {capitalize} from './../../../utils/format';
import {setSingleStory} from '../story';

// for mentioning users inside an input box.
export const mentionUsers = createAsyncThunk('tag/tagUsers', async payload => {
  const url = payload.customApi || '/user/getLiveRegAllGroupMembers';
  const body = {
    name: payload.searchTerm,
    groupId: payload.groupId,
  };
  const response = await Axios.post(url, body);

  if (!Array.isArray(response?.data?.[0]?.members)) {
    return [];
  }

  return response.data[0].members.map(({fullName: name, _id: id, ...rest}) => ({
    name: name,
    id,
    ...rest,
  }));
});

export const fetchFamilyTags = createAsyncThunk(
  'tag/fetchFamilyTags',
  async (_payload, {getState}) => {
    const state = getState().userInfo;
    const response = await Axios.get(`/allTagMembers/${state._id}/${_payload}`);
    return response.data;
  },
);

export const getStoryTaggedMembers = createAsyncThunk(
  'tag/getTaggedMembers',
  async id => {
    const response = await Axios.get(`/getTagById/${id}`);
    return response.data?.featureTags || [];
  },
);

export const removeStoryTaggedMembers = createAsyncThunk(
  'tag/removeTaggedMember',
  async (payload, {dispatch, getState}) => {
    const idToRemove = payload.removedTag[0];
    const state = getState();

    if (Array.isArray(state.story?.singleStory?.featureTags)) {
      const newFeatureTags = state.story.singleStory.featureTags.filter(
        item => item !== idToRemove,
      );
      const updatedSingleStory = {
        ...state.story.singleStory,
        featureTags: newFeatureTags,
      };

      dispatch(setSingleStory(updatedSingleStory));
    }

    const response = await Axios.put('/removeTags', payload);

    dispatch(tagSlice.actions.removeTag(idToRemove));

    return response.data;
  },
);

const initialState = {
  mentionedUsers: [],
  allFamilyTags: {},
  singleStoryTags: [],
};

export const tagSlice = createSlice({
  name: 'tag',
  initialState,
  reducers: {
    removeTag(state, {payload}) {
      state.singleStoryTags = state.singleStoryTags.filter(
        item => item._id !== payload,
      );
    },
  },
  extraReducers: builder => {
    builder
      .addCase('LOGOUT', state => {
        Object.assign(state, initialState);
      })
      .addCase(mentionUsers.pending, state => {
        state.mentionedUsers = [];
      })
      .addCase(mentionUsers.fulfilled, (state, action) => {
        if (action.payload) {
          state.mentionedUsers = action.payload;
        }
      })
      .addCase(mentionUsers.rejected, state => {
        state.mentionedUsers = [];
      })

      .addCase(fetchFamilyTags.pending, state => {
        state.allFamilyTags = {};
      })
      .addCase(fetchFamilyTags.fulfilled, (state, action) => {
        if (action.payload) {
          state.allFamilyTags = action.payload;
        }
      })
      .addCase(fetchFamilyTags.rejected, state => {
        state.allFamilyTags = {};
      })

      .addCase(getStoryTaggedMembers.pending, state => {
        state.singleStoryTags = [];
      })
      .addCase(getStoryTaggedMembers.fulfilled, (state, {payload}) => {
        state.singleStoryTags = payload;
      })
      .addCase(getStoryTaggedMembers.rejected, state => {
        state.singleStoryTags = [];
      });
  },
});

export const {removeTag} = tagSlice.actions;

export default tagSlice.reducer;
