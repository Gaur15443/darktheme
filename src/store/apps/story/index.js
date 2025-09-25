/* eslint-disable no-use-before-define */

import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';

import Axios from '../../../plugin/Axios';

// ** Fetch All Stories
export const fetchAllStories = createAsyncThunk(
  'stories/fetchAllStories',
  async (data, {dispatch, getState}) => {
    const state = await getState().story;
    const normalFilters = ['Public_Stories', 'My_posts', 'Drafts', 'Saved'];
    const hasFamily = data.filters.some(
      filter => !normalFilters.includes(filter),
    );
    if (
      !hasFamily &&
      data?.groupId?.length &&
      !data?.filters?.includes?.('Public_Stories') &&
      !data?.filters?.length === 1
    ) {
      data.filters = [...data.filters, ...data.groupId];
    }
    const payload = {
      groupId: data.groupId,
      filters: data?.filters.filter(e => e !== 'Everyone'),
      categories: data?.categories,
      isEveryoneSelected: data?.isEveryoneSelected,
    };
    const groupId = data.groupId;
    const filters = data.filters;
    const response = await Axios.post(
      `/getAllpublishedStory/${data.pageNo}`,
      payload,
    );

    if (Array.isArray(response?.data) && response?.data?.length > 0) {
      if (state.lastPublishedMedia?.length) {
        const index = response.data.findIndex(
          _data => _data._id === state.lastPublishedMedia?.[0]?.storyId,
        );
        if (Array.isArray(response.data[index]?.contents?.[0]?.elements)) {
          response.data[index].contents[0].elements = response.data[
            index
          ].contents[0].elements.map(content => ({
            ...content,
            mediaUrl:
              state.lastPublishedMedia[0]?.media?.filter?.(
                _data => _data.mediaId === content.mediaId,
              )?.[0]?.mediaUrl || content.mediaUrl,
            thumbnailUrl:
              state.lastPublishedMedia[0]?.media?.filter?.(
                _data => _data.mediaId === content.mediaId,
              )?.[0]?.mediaUrl || content.thumbnailUrl,
          }));
        }
      }

      dispatch(
        setAllPages({
          ...state?.feedPages,
          allPublishedStoryPage: data?.pageNo,
        }),
      );
    } else {
      dispatch(
        setStoriesEmptyStatus({
          ...state?.storiesEmptyStatus,
          allPublishedStory: true,
        }),
      );
    }

    return {response, groupId, filters};
  },
);

// ** Fetch my published Stories
export const fetchMyStory = createAsyncThunk(
  'stories/fetchMyStory',
  async (data, {dispatch, getState}) => {
    const state = await getState().story;
    const response = await Axios.get(
      `/getMyStorybyStatus/Published/${data.pageNo}`,
    );

    if (Array.isArray(response.data) && response.data?.length > 0) {
      dispatch(
        setAllPages({
          ...state.feedPages,
          allMyStoriesPage: data.pageNo,
        }),
      );
    } else {
      dispatch(
        setStoriesEmptyStatus({
          ...state.storiesEmptyStatus,
          allMyStories: true,
        }),
      );
    }

    return response;
  },
);

// ** Fetch saved/favorite Stories
export const fetchMyFavourites = createAsyncThunk(
  'stories/fetchMyFavourites',
  async (data, {dispatch, getState}) => {
    const state = await getState().story;
    const response = await Axios.get(`/getAllFavouriteStories/${data.pageNo}`);

    if (Array.isArray(response.data) && response.data?.length > 0) {
      dispatch(
        setAllPages({
          ...state.feedPages,
          allMyFavouritesPage: data.pageNo,
        }),
      );
    } else {
      dispatch(
        setStoriesEmptyStatus({
          ...state.storiesEmptyStatus,
          allMyFavourites: true,
        }),
      );
    }

    return response;
  },
);

// ** Fetch drafts Stories
export const fetchMyDrafts = createAsyncThunk(
  'stories/fetchMyDrafts',
  async (data, {dispatch, getState}) => {
    const state = await getState().story;
    const response = await Axios.get(
      `/getMyStorybyStatus/Draft/${data.pageNo}`,
    );

    if (Array.isArray(response.data) && response.data?.length > 0) {
      dispatch(
        setAllPages({
          ...state.feedPages,
          allMyDraftsPage: data.pageNo,
        }),
      );
    } else {
      dispatch(
        setStoriesEmptyStatus({
          ...state.storiesEmptyStatus,
          allMyDrafts: true,
        }),
      );
    }

    return response;
  },
);

// fetch my Collab stories
export const fetchMyCollaboratives = createAsyncThunk(
  'stories/fetchMyCollaboratives',
  async data => {
    const response = await Axios.get(
      `/getMyStorybyStatus/Collaborative/${data.pageNo}`,
    );
    return response;
  },
);

// fetch Public Stories
export const fetchPublicStories = createAsyncThunk(
  'stories/fetchPublicStories',
  async (data, {dispatch, getState}) => {
    const state = await getState().story;
    const response = await Axios.get(
      `/getMyStorybyStatus/Public/${data.pageNo}`,
    );

    if (Array.isArray(response.data) && response.data?.length > 0) {
      dispatch(
        setAllPages({
          ...state.feedPages,
          allPublicStoriesPage: data.pageNo,
        }),
      );
    } else {
      dispatch(
        setStoriesEmptyStatus({
          ...state.storiesEmptyStatus,
          allPublicStory: true,
        }),
      );
    }

    return response;
  },
);

//  story likes
export const fetchStoryLikes = createAsyncThunk(
  'stories/fetchStoryLikes',
  async (id, {dispatch}) => {
    const response = await Axios.put(`/markStoryLikes/${id}`);
    const commitPayload = {
      id,
      likes: response?.data?.storylikes,
    };

    dispatch(setLikePost(commitPayload));
    return response;
  },
);

// story favorite
export const markStoryFavorite = createAsyncThunk(
  'stories/markStoryFavorite',
  async (id, {dispatch}) => {
    const response = await Axios.put(`/storyAsFavourite/${id}`);
    const commitPayload = {
      _id: id,
      favouriteUsers: response?.data?.favouriteUsers || [],
    };

    dispatch(setFavoritePost(commitPayload));
    return response;
  },
);

export const publishStory = createAsyncThunk(
  'stories/publishStory',
  async (_payload, {dispatch, getState}) => {
    dispatch(storiesSlice.actions.setPublishStatus('publishing'));
    const state = await getState().story;

    const {isLifestory, blobData, ...currentlyWritten} = state.currentlyWritten;
    const {...payload} = _payload;

    const data = {
      ...currentlyWritten,
      ...payload,
      status: payload?.status || 'Published',
      isStory: true,
      isEvent: payload?.isEvent,
      EventTitle: payload?.EventTitle,
      description: payload?.description,
    };

    const res = await Axios.post('/createStory', data);

    dispatch(storiesSlice.actions.setPublishStatus('published'));

    dispatch(storiesSlice.actions.setSingleStory(res.data));

    dispatch(storiesSlice.actions.setCurrentlyWritten({...res.data}));

    return res.data;
  },
);

export const generateAIStory = createAsyncThunk(
  'stories/generateAIStory',
  async _payload => {
    const res = await Axios.post('/generateAIStory', _payload);
    return res.data;
  },
);

export const updateStory = createAsyncThunk(
  'stories/updateStory',
  async ({storyId, ...payload}, {dispatch, getState}) => {
    const state = getState().story;

    dispatch(storiesSlice.actions.setPublishStatus('publishing'));
    const {isLifestory, blobData, collaboratingMembers, ...currentlyWritten} =
      state.currentlyWritten;

    const collabs = !Array.isArray(collaboratingMembers)
      ? []
      : collaboratingMembers.map(({collaboratorId, fullName}) => ({
          collaboratorId,
          fullName,
        }));

    const data = {
      ...currentlyWritten,
      ...payload,
      status: payload.status,
      collaboratingMembers: collabs,
      favouriteUsers: [],
      isStory: true,
      isEvent: payload?.isEvent,
      EventTitle: payload?.EventTitle,
      description: payload?.description,
    };
    const res = await Axios.put(`/updateStory/${storyId}`, data);

    if (res.data) {
      dispatch(storiesSlice.actions.setPublishStatus('published'));
      dispatch(storiesSlice.actions.setSingleStory(res.data));

      if (res?.data?.status === 'Draft') {
        dispatch(storiesSlice.actions.setCurrentlyWritten({_id: res.data._id}));
      }

      return res.data._id;
    }
  },
);

/** Fetches all story modes. */
export const fetchStoryModes = createAsyncThunk(
  'stories/fetchStoryModes',
  async () => {
    const res = await Axios.get(
      '/getStoriesAllDropDownsByParentId/606ee3c3e66b6884b2de11a6',
    );
    return res.data;
  },
);

export const fetchStoryCategories = createAsyncThunk(
  'stories/fetchStoryCategories',
  async () => {
    const res = await Axios.get(
      '/getStoriesAllDropDownsByParentId/606ee362e66b6884b2ddccf6',
    );
    return res.data;
  },
);

export const createComment = createAsyncThunk(
  'stories/createComment',
  async payload => {
    const res = await Axios.post('/createComment/', payload);

    return res;
  },
);

/** Fetches a single story from the api. */
export const fetchOneStory = createAsyncThunk(
  'stories/fetchOneStory',
  async id => {
    const res = await Axios.get(`/getStoryById/${id}`);
    return res.data;
  },
);

export const fetchFamilyMembers = createAsyncThunk(
  'stories/fetchFamilyMembers',
  async ({name, groupId}) => {
    const data = {
      name,
      groupId,
    };
    const response = await Axios.post('/user/getLiveRegAllGroupMembers', data);
    return response.data?.[0]?.members || [];
  },
);

export const deleteStory = createAsyncThunk(
  'stories/deleteStory',
  async (id, {dispatch}) => {
    const res = await Axios.delete(`/deleteStory/${id}`);

    dispatch(setDeletedPost(id));
    return res.data;
  },
);

export const fetchStoryCommentByID = createAsyncThunk(
  'stories/fetchStoryCommentByID',
  async (payload, {dispatch}) => {
    const res = await Axios.get(
      `/getComment/${payload.storyId}/${payload.pageNo}`,
    );
    if (res?.data?.response?.length > 0) {
      const data = res.data.response;
      dispatch(setStoryComments(data));
    } else {
      dispatch(setCommentEmptyStatus(true));
    }
  },
);

export const deleteComment = createAsyncThunk(
  'stories/deleteComment',
  async (payload, {dispatch}) => {
    const {commentId, storyId, parentId} = payload;
    await Axios.delete(`/deleteComment/${commentId}/${storyId}`);

    if (!parentId) {
      dispatch(setDeletedComment(commentId));
    } else {
      dispatch(
        setDeletedReply({
          commentId,
          parentId,
        }),
      );
    }
    if (commentId) {
      dispatch(setDeleteCommentsCount(storyId));
    }
  },
);

export const likeComment = createAsyncThunk(
  'stories/likeComment',
  async (commentId, {dispatch}) => {
    const res = await Axios.put(`/updateLikes/${commentId}`);
    if (res.data) {
      const {likes} = res.data;
      const payload = {
        commentId,
        likes,
      };
      dispatch(setCommentsLike(payload));
    }
  },
);

export const likeReply = createAsyncThunk(
  'stories/likeReply',

  async ({commentIndex, replyIndex, likes}, {getState, dispatch}) => {
    const state = await getState().story;

    // The backend was putting an empty reply as the default reply.
    // If you don't do this check and the default reply is there,
    // an error will occur.
    if (!state.storyComments?.[commentIndex]?.replies?.[0]?._id) {
      replyIndex += 1;
    }

    const commentId =
      state.storyComments?.[commentIndex]?.replies?.[replyIndex]?._id;
    if (commentId) {
      const res = await Axios.put(`/updateLikes/${commentId}`);
      if (res.data) {
        const payload = {
          commentIndex,
          replyIndex,
          likes: res.data.likes,
        };
        dispatch(setReplyLike(payload));
      }
    }
  },
);

export const fetchAllUsersStoryLikes = createAsyncThunk(
  'stories/fetchAllUsersStoryLikes',
  async storyId => {
    const res = await Axios.get(`/getStoryLikesAllUsers/${storyId}`);
    return res.data;
  },
);

export const fetchAllUsersList = createAsyncThunk(
  'stories/fetchAllUsersList',
  async (params, {rejectWithValue}) => {
    try {
      const response = await Axios.get(
        `/getGroupMembers/${params?.data?._id}/${params?.data?.pageNo}`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data);
    }
  },
);

export const fetchQuotePrompts = createAsyncThunk(
  'stories/fetchQuotePrompts',
  async () => {
    const response = await Axios.get('/getQuotes');
    return response.data;
  },
);

const initialState = {
  pageNo: 1,
  allPublishedStory: [],
  allStories: {},
  allPublicStory: [],
  allMyDrafts: [],
  allMyFavourites: [],
  allMyStory: [],
  allMyCollaborative: [],
  addingSubgroup: false,
  familyMembers: [],
  currentlyWritten: {},
  editGroup: false,
  groupName: '',
  groupMem: 0,
  singleStory: {},
  refreshStatus: true,
  recentlyPublishedBlob: [],
  lastPublishedMedia: [],
  publishStatus: null,
  publishedStoryId: null,
  storyModes: [],
  storyCategories: [],
  storyComments: [],
  quotesPrompts: [],
  commentEmptyStatus: false,
  selectedQuote: null,
  selectedCategory: null,
  aiStory: null,
  newWrittenStory: {
    storiesTitle: '',
    description: '',
    EventDate: '',
    collabsLength: 0,
    location: '',
    mediaLength: 0,
    collabIds: [],
  },
  feedPages: {
    allPublishedStoryPage: 1,
    allMyFavouritesPage: 1,
    allRecentlyCommentedPage: 1,
    allMyStoriesPage: 1,
    allMyCollaborativePage: 1,
    allMyDraftsPage: 1,
    allPublicStoriesPage: 1,
  },
  emptyFilterStack: [],
  storiesEmptyStatus: {
    allPublishedStory: false,
    allMyFavourites: false,
    allRecentlyCommented: false,
    allMyStories: false,
    allMyCollaborative: false,
    allMyDrafts: false,
    allPublicStory: false,
  },
  isStoryReset: false,
  storyFilters: '',
  storyCategories: [],
};

export const storiesSlice = createSlice({
  name: 'stories',
  initialState,
  reducers: {
    /** Sets a single reply likes. */
    setNewWrittenStory(state, {payload}) {
      if (payload?.storiesTitle !== undefined) {
        state.newWrittenStory.storiesTitle = payload.storiesTitle;
      }
      if (payload?.description !== undefined) {
        state.newWrittenStory.description = payload.description;
      }
      if (payload?.EventDate !== undefined) {
        state.newWrittenStory.EventDate = payload.EventDate;
      }
      if (payload?.location !== undefined) {
        state.newWrittenStory.location = payload.location;
      }
      if (typeof payload?.collabsLength === 'number') {
        state.newWrittenStory.collabsLength = payload.collabsLength;
      }
      if (typeof payload?.mediaLength === 'number') {
        state.newWrittenStory.mediaLength = payload.mediaLength;
      }
      if (typeof payload?.collabIds === 'array') {
        state.newWrittenStory.collabIds = payload.collabIds;
      }
    },
    setStoryFilters(state, {payload}) {
      state.storyFilters = payload;
    },
    setStoryCategories(state, {payload}) {
      state.storyCategories = payload;
    },
    setSelectedQuote(state, {payload}) {
      state.selectedQuote = payload;
    },
    setSelectedCategory(state, {payload}) {
      state.selectedCategory = payload;
    },
    resetSelectedCategory(state) {
      state.selectedCategory = null;
    },
    setAIStory(state, {payload}) {
      state.aiStory = payload;
    },
    resetSelectedQuote(state) {
      state.selectedQuote = null;
    },
    resetNewWrittenStory(state) {
      state.newWrittenStory.storiesTitle = '';
      state.newWrittenStory.description = '';
      state.newWrittenStory.EventDate = '';
      state.newWrittenStory.location = '';
      state.newWrittenStory.collabsLength = 0;
      state.newWrittenStory.mediaLength = 0;
      state.newWrittenStory.collabIds = [];
    },
    setReplyLike(state, {payload}) {
      const {commentIndex, replyIndex, likes} = payload;
      state.storyComments[commentIndex].replies[replyIndex].likes = likes || [];
      state.storyComments[commentIndex].replies[replyIndex].likeCount =
        likes.length || 0;
    },
    /** Sets a single comments likes. */
    setCommentsLike(state, {payload}) {
      const commentIndex = state.storyComments.findIndex(
        comment => comment?._id === payload?.commentId,
      );
      if (state.storyComments[commentIndex]) {
        state.storyComments[commentIndex].likes = payload.likes || [];
        state.storyComments[commentIndex].likeCount =
          payload?.likes?.length || 0;
      }
    },
    setDeletedPost(state, {payload}) {
      const publishedResult = state.allPublishedStory.filter(
        data => data._id !== payload,
      );
      const myResult = state.allMyStory.filter(data => data._id !== payload);
      const myFaveResult = state.allMyFavourites.filter(
        data => data._id !== payload,
      );
      const myCollabResult = state.allMyCollaborative.filter(
        data => data._id !== payload,
      );
      const myDraftResult = state.allMyDrafts.filter(
        data => data._id !== payload,
      );

      state.allPublishedStory = publishedResult;
      state.allMyStory = myResult;
      state.allMyFavourites = myFaveResult;
      state.allMyCollaborative = myCollabResult;
      state.allMyDrafts = myDraftResult;

    },
    setDeleteCommentsCount(state, {payload}) {
      const published = state.allPublishedStory.filter(
        data => data?._id === payload,
      )[0];
      const myStory = state.allMyStory.filter(data => data?._id === payload)[0];
      const myFave = state.allMyFavourites.filter(
        data => data?._id === payload,
      )[0];
      const collab = state.allMyCollaborative.filter(
        data => data?._id === payload,
      )[0];
      const publicStory = state.allPublicStory.filter(
        data => data?._id === payload,
      )[0];
      const {singleStory} = state;

      if (published?.commentsCount) {
        published.commentsCount -= 1;
      }
      if (myStory?.commentsCount) {
        myStory.commentsCount -= 1;
      }
      if (myFave?.commentsCount) {
        myFave.commentsCount -= 1;
      }
      if (collab?.commentsCount) {
        collab.commentsCount -= 1;
      }
      if (publicStory?.commentsCount) {
        publicStory.commentsCount -= 1;
      }
      if (singleStory?.commentsCount) {
        singleStory.commentsCount -= 1;
      }
    },
    setCommentEmptyStatus(state, {payload}) {
      state.commentEmptyStatus = payload;
    },
    resetCommentEmptyStatus(state) {
      state.commentEmptyStatus = false;
    },
    /** Sets a single story comments. */
    setStoryComments(state, {payload}) {
      state.storyComments = [...state.storyComments, ...payload];
    },
    setNewStoryComments(state, {payload}) {
      state.storyComments = [...payload, ...state.storyComments];
    },
    /** Sets a single story comments. */
    resetStoryComments(state) {
      state.storyComments = [];
    },
    setDeletedComment(state, {payload}) {
      state.storyComments = state.storyComments.filter(
        comment => comment._id !== payload,
      );
    },
    setDeletedReply(state, {payload}) {
      const {commentId, parentId} = payload;
      const parentIndex = state.storyComments.findIndex(
        comment => comment._id === parentId,
      );
      state.storyComments[parentIndex].replies = state.storyComments[
        parentIndex
      ].replies.filter(reply => reply?._id !== commentId);
    },
    setPublishedId(state, {payload}) {
      state.publishedStoryId = payload;
    },
    setPublishStatus(state, {payload}) {
      state.publishStatus = payload;
    },
    setSingleStory(state, {payload}) {
      state.singleStory = payload;
      // FIXME: Delete after
      state.singleStory.aspectRatio = 16 / 9;
    },
    /** Sets the currently written story. */
    setCurrentlyWritten(state, {payload}) {
      state.currentlyWritten = {
        ...state.currentlyWritten,
        ...payload,
        contents: state.layoutData,
      };
    },
    setEditGroup(state, {payload}) {
      state.editGroup = true;
    },
    resetEditGroup(state, {payload}) {
      state.editGroup = false;
    },
    setGroupName(state, {payload}) {
      state.groupName = payload;
    },
    setGroupMem(state, {payload}) {
      state.groupMem = payload;
    },
    resetGroupMem(state, {payload}) {
      state.groupMem = 0;
    },
    resetGroupName(state, {payload}) {
      state.groupName = '';
    },
    resetSingleStory(state) {
      state.singleStory = {};
    },
    resetCurrentlyWritten(state) {
      state.currentlyWritten = {};
    },
    setSelectedTrees(state, {payload}) {
      if (!state.currentlyWritten.familyGroupId) {
        state.currentlyWritten.familyGroupId = [];
      }
      // Only add if not already added
      state.currentlyWritten.familyGroupId = Array.from(
        new Set([...state.currentlyWritten.familyGroupId, payload]),
      );
    },
    setSelectedFeatureTags(state, {payload}) {
      if (!('featureTags' in state.currentlyWritten)) {
        state.currentlyWritten.featureTags = [];
      }

      state.currentlyWritten.featureTags = payload;
    },
    /** Sets a single story layout data. */
    setLayoutData(state, {payload}) {
      state.layoutData = payload;
    },
    /**
     * @param {{media:[{mediaId: string; mediaUrl: string; type: string;}], storyId: string}[]} payload
     */
    setRecentlyPublishedBlob(state, {payload = []}) {
      state.recentlyPublishedBlob = payload;
    },
    /**
     * @param {{media:[{mediaId: string; mediaUrl: string; type: string;}], storyId: string}[]} payload
     */
    setLastPublishedMedia(state, {payload = []}) {
      state.lastPublishedMedia = payload;
    },
    resetRecentlyPublishedBlob(state) {
      state.recentlyPublishedBlob = [];
    },
    setRefreshStatus(state, {payload}) {
      state.refreshStatus = payload;
    },
    setAddingSubgroup(state, {payload}) {
      state.addingSubgroup = payload;
    },
    resetPublishStatus(state) {
      state.publishStatus = null;
    },
    removeSelectedTree(state, {payload}) {
      if (!state.currentlyWritten?.familyGroupId) {
        state.currentlyWritten.familyGroupId = [];
      }
      state.currentlyWritten.familyGroupId = [
        ...state.currentlyWritten.familyGroupId.filter(id => id !== payload),
      ];
    },
    resetFamilyMembers(state) {
      state.familyMembers = [];
    },
    setSelectedSubgroupTrees(state, {payload}) {
      if (!state.currentlyWritten.familySubGroupId) {
        state.currentlyWritten.familySubGroupId = [];
      }
      // Only add if not already added
      state.currentlyWritten.familySubGroupId = Array.from(
        new Set([...state.currentlyWritten.familySubGroupId, payload]),
      );
    },
    removeSelectedSubgroupTree(state, {payload}) {
      if (!state.currentlyWritten.familySubGroupId) {
        state.currentlyWritten.familySubGroupId = [];
      }

      state.currentlyWritten.familySubGroupId = [
        ...state.currentlyWritten.familySubGroupId.filter(id => id !== payload),
      ];
    },
    setLikePost(state, {payload}) {
      const likedPublishedPost = state.allPublishedStory.find(
        data => data._id === payload.id,
      );
      const likedMyPost = state.allMyStory.find(
        data => data._id === payload.id,
      );
      const likedMyFave = state.allMyFavourites.find(
        data => data._id === payload.id,
      );
      const likedCollab = state.allMyCollaborative.find(
        data => data._id === payload.id,
      );
      const likedPublic = state.allPublicStory.find(
        data => data._id === payload.id,
      );

      const likedSingleStory = state.singleStory;

      if (likedPublishedPost?.storylikes) {
        likedPublishedPost.storylikes = payload.likes;
      }
      if (likedMyPost?.storylikes) {
        likedMyPost.storylikes = payload.likes;
      }
      if (likedMyFave?.storylikes) {
        likedMyFave.storylikes = payload.likes;
      }
      if (likedCollab?.storylikes) {
        likedCollab.storylikes = payload.likes;
      }
      if (likedPublic?.storylikes) {
        likedPublic.storylikes = payload.likes;
      }
      if (likedSingleStory?.storylikes) {
        likedSingleStory.storylikes = payload.likes;
      }
    },
    resetSavedStories(state) {
      state.feedPages.allMyFavouritesPage = 1;
      state.allMyFavourites = [];
    },

    resetFetchAllStories(state, {payload}) {
      state.allStories[payload] = {
        allPosts: [],
        myPosts: [],
        drafts: [],
        saved: [],
      };

    },
    setFavoritePost(state, {payload}) {
      const favoritedPublished = state.allPublishedStory.find(
        data => data._id === payload._id,
      );
      const favoritedMyStory = state.allMyStory.find(
        data => data._id === payload._id,
      );
      const favoritedFaves = state.allMyFavourites.find(
        data => data._id === payload._id,
      );
      const favoritedCollab = state.allMyCollaborative.find(
        data => data._id === payload._id,
      );
      const favoritedPublic = state.allPublicStory.find(
        data => data._id === payload._id,
      );
      const favoritedSingleStory = state.singleStory;

      if (favoritedPublished?.hasOwnProperty?.('favouriteUsers')) {
        favoritedPublished.favouriteUsers = payload.favouriteUsers;
      }
      if (favoritedMyStory?.hasOwnProperty?.('favouriteUsers')) {
        favoritedMyStory.favouriteUsers = payload.favouriteUsers;
      }
      if (favoritedFaves?.hasOwnProperty?.('favouriteUsers')) {
        favoritedFaves.favouriteUsers = payload.favouriteUsers;
      }
      if (favoritedCollab?.hasOwnProperty?.('favouriteUsers')) {
        favoritedCollab.favouriteUsers = payload.favouriteUsers;
      }
      if (favoritedPublic?.hasOwnProperty?.('favouriteUsers')) {
        favoritedPublic.favouriteUsers = payload.favouriteUsers;
      }
      if (favoritedSingleStory?.hasOwnProperty?.('favouriteUsers')) {
        favoritedSingleStory.favouriteUsers = payload.favouriteUsers;
      }
      // If it's not available, add it.
      if (!favoritedFaves) {
        state.allMyFavourites.push(payload);
      }
    },
    setUnfavorite(state, {payload}) {
      const favoritedFaves = state.allMyFavourites.filter(
        data => data._id !== payload,
      );

      state.allMyFavourites = favoritedFaves || [];
    },
    toggleCommentReply(state, {payload}) {
      state.storyComments[payload].showReplies =
        !state.storyComments[payload].showReplies;
    },
    /** Sets a single story reply. */
    setStoryReply(state, {payload}) {
      state.storyComments[payload.index].replies.push(payload.reply);
      state.storyComments[payload.index].showReplies = true;
    },
    updateCommentsCount(state, {payload}) {
      const published = state.allPublishedStory.find(
        data => data?._id === payload.storyId,
      );
      const myStory = state.allMyStory.find(
        data => data?._id === payload.storyId,
      );
      const favorite = state.allMyFavourites.find(
        data => data?._id === payload.storyId,
      );
      const collab = state.allMyCollaborative.find(
        data => data?._id === payload.storyId,
      );
      const publicStories = state.allPublicStory.find(
        data => data?._id === payload.storyId,
      );
      const single = state.singleStory;

      if (published) {
        published.commentsCount = payload.count;
      }
      if (myStory) {
        myStory.commentsCount = payload.count;
      }
      if (favorite) {
        favorite.commentsCount = payload.count;
      }
      if (collab) {
        collab.commentsCount = payload.count;
      }
      if (publicStories) {
        publicStories.commentsCount = payload.count;
      }
      if (single) {
        single.commentsCount = payload.count;
      }
    },
    setAllPages(state, {payload}) {
      state.feedPages = payload;
    },
    setStoriesEmptyStatus(state, {payload}) {
      state.storiesEmptyStatus = payload;
    },
    resetViewStories(state) {
      state.allPublishedStory = [];
      state.allMyFavourites = [];
      state.allRecentlyCommented = [];
      state.allMyStory = [];
      state.allMyCollaborative = [];
      state.allMyDrafts = [];
      state.allPublicStory = [];
    },
    resetViewStoriesFromLifestory(state) {
      state.allPublishedStory = [];
      state.allMyFavourites = [];
      state.allRecentlyCommented = [];
      state.allMyStory = [];
      state.allMyCollaborative = [];
      state.allMyDrafts = [];
      state.allPublicStory = [];
      state.isStoryReset = true;
    },
    resetIsStoryReset(state) {
      state.isStoryReset = false;
    },
    resetEmptyFilterStack(state) {
      state.emptyFilterStack = [];
    },
    setEmptyFilterStack(state, {payload}) {
      state.emptyFilterStack = [payload];
    },
    resetAllPages(state) {
      for (const [key] of Object.entries(state.feedPages)) {
        state.feedPages[key] = 1;
      }
    },

    resetStoriesEmptyStatus(state) {
      Object.keys(state.storiesEmptyStatus).forEach(key => {
        state.storiesEmptyStatus[key] = false;
      });
    },
  },
  extraReducers: builder => {
    builder
      .addCase('LOGOUT', state => {
        Object.assign(state, initialState);
      })
      .addCase(fetchAllStories.pending, () => {})
      .addCase(fetchAllStories.fulfilled, (state, action) => {
        const {groupId, response, filters} = action.payload;
        const pageNo = action?.meta?.arg?.pageNo?.toString?.() || '1';
        const stories = response?.data;

        if (!groupId || !Array.isArray(stories)) return;

        if (!state.allStories[groupId]) {
          state.allStories[groupId] = {
            allPosts: [],
            myPosts: [],
            drafts: [],
            saved: [],
          };
        }
        let targetKey = 'allPosts'; // Default

        if (filters?.includes('My_posts')) {
          targetKey = 'myPosts';
        } else if (filters?.includes('Drafts')) {
          targetKey = 'drafts';
        } else if (filters?.includes('Saved')) {
          targetKey = 'saved';
        }
        if (pageNo?.toString?.() === '1') {
          state.allStories[groupId][targetKey] = stories;
        }
        // else the api has been called by pagination so push
        else {
          state.allStories[groupId][targetKey].push(...stories);
        }
      })
      .addCase(fetchAllStories.rejected, (state, action) => {
        state.error = action.error.message;
      })
      // .addCase(fetchAllStories.pending, () => {})
      // .addCase(fetchAllStories.fulfilled, (state, {payload: res}) => {
      //   // Get the page number
      //   const splitUrl = res.config.url.split('/');
      //   const pageNo = splitUrl[splitUrl.length - 1];

      //   // check if new story is there
      //   // const newStories = res.data.filter(
      //   //   newStory =>
      //   //     !state.allPublishedStory.some(
      //   //       existingStory => existingStory?._id === newStory?._id,
      //   //     ),
      //   // );

      //   // if (newStories.length > 0) {
      //     // if the page number is 1 then the api is called freshle so reassign
      //     if (pageNo?.toString?.() === '1') {
      //       state.allPublishedStory = res.data;
      //     }
      //     // else the api has been called by pagination so push
      //     else {
      //       state.allPublishedStory.push(...res.data);
      //     }
      //   // }
      // })
      // .addCase(fetchAllStories.rejected, (state, action) => {
      //   state.error = action.error.message;
      // })

      .addCase(fetchMyStory.pending, () => {})
      .addCase(fetchMyStory.fulfilled, (state, action) => {
        const newMystories = action.payload.data;

        state.allMyStory = state.allMyStory.concat(
          newMystories.filter(
            newMystorie =>
              !state.allMyStory.some(myStory => myStory.id === newMystorie.id),
          ),
        );
      })
      .addCase(fetchMyStory.rejected, () => {})

      .addCase(fetchMyDrafts.pending, () => {})
      .addCase(fetchMyDrafts.fulfilled, (state, action) => {
        const newDrafts = action.payload.data;

        state.allMyDrafts = state.allMyDrafts.concat(
          newDrafts.filter(
            newDraft =>
              !state.allMyDrafts.some(draft => draft.id === newDraft.id),
          ),
        );
      })
      .addCase(fetchMyDrafts.rejected, () => {})

      .addCase(fetchMyFavourites.pending, () => {})
      .addCase(fetchMyFavourites.fulfilled, (state, action) => {
        const newFavourites = action.payload.data;

        state.allMyFavourites = state.allMyFavourites.concat(
          newFavourites.filter(
            newFavourite =>
              !state.allMyFavourites.some(
                favour => favour.id === newFavourite.id,
              ),
          ),
        );
      })
      .addCase(fetchMyFavourites.rejected, () => {})

      .addCase(fetchMyCollaboratives.pending, () => {})
      .addCase(fetchMyCollaboratives.fulfilled, (state, action) => {
        state.allMyCollaborative.push(...action.payload.data);
      })
      .addCase(fetchMyCollaboratives.rejected, () => {})

      .addCase(fetchStoryLikes.pending, state => {
        state.data = '';
      })
      .addCase(fetchStoryLikes.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(fetchStoryLikes.rejected, state => {
        state.data = null;
      })
      .addCase(publishStory.fulfilled, (state, {payload}) => {
        state.currentlyWritten = payload;
      })

      .addCase(fetchStoryModes.fulfilled, (state, {payload}) => {
        state.storyModes = payload;
      })

      .addCase(fetchStoryCategories.fulfilled, (state, {payload}) => {
        state.storyCategories = payload;
      })

      .addCase(fetchOneStory.pending, state => {
        state.singleStory = {};
      })
      .addCase(fetchOneStory.fulfilled, (state, {payload}) => {
        state.singleStory = payload;
      })

      .addCase(fetchFamilyMembers.pending, (state, {payload}) => {
        state.familyMembers = payload;
      })
      .addCase(fetchFamilyMembers.fulfilled, (state, {payload}) => {
        state.familyMembers = payload;
      })

      .addCase(fetchAllUsersStoryLikes.pending, (state, {payload}) => {
        state.familyMembers = payload;
      })
      .addCase(fetchAllUsersStoryLikes.fulfilled, (state, {payload}) => {
        state.familyMembers = payload;
      })
      .addCase(fetchQuotePrompts.rejected, () => {})
      .addCase(fetchQuotePrompts.pending, () => {})
      .addCase(fetchQuotePrompts.fulfilled, (state, action) => {
        state.quotesPrompts = action.payload;
      })
      .addCase(fetchPublicStories.pending, () => {})
      .addCase(fetchPublicStories.fulfilled, (state, action) => {
        state.allPublicStory.push(...action.payload.data);
      })
      .addCase(fetchPublicStories.rejected, () => {});
  },
});

export const {
  setReplyLike,
  toggleCommentReply,
  setStoryReply,
  setCommentsLike,
  setDeleteCommentsCount,
  setCommentEmptyStatus,
  resetCommentEmptyStatus,
  setStoryComments,
  setNewStoryComments,
  resetStoryComments,
  removeSelectedSubgroupTree,
  removeSelectedTree,
  resetSingleStory,
  resetCurrentlyWritten,
  resetFamilyMembers,
  resetPublishStatus,
  setAddingSubgroup,
  setCurrentlyWritten,
  setFavoritePost,
  resetSavedStories,
  resetFetchAllStories,
  setSelectedFeatureTags,
  setLayoutData,
  setStoriesEmptyStatus,
  setAllPages,
  setLikePost,
  setPublishStatus,
  setRecentlyPublishedBlob,
  setRefreshStatus,
  setSelectedSubgroupTrees,
  setSelectedTrees,
  setSingleStory,
  setUnfavorite,
  setDeletedComment,
  setDeletedReply,
  updateCommentsCount,
  resetViewStories,
  resetEmptyFilterStack,
  setEmptyFilterStack,
  resetAllPages,
  resetStoriesEmptyStatus,
  setDeletedPost,
  setEditGroup,
  resetEditGroup,
  setGroupName,
  resetGroupName,
  resetGroupMem,
  setGroupMem,
  setNewWrittenStory,
  resetNewWrittenStory,
  setSelectedQuote,
  setSelectedCategory,
  resetSelectedCategory,
  setAIStory,
  resetSelectedQuote,
  resetRecentlyPublishedBlob,
  resetIsStoryReset,
  resetViewStoriesFromLifestory,
  setLastPublishedMedia,
  setStoryFilters,
  setStoryCategories,
  resetUserPublishedStory,
} = storiesSlice.actions;
export default storiesSlice.reducer;
