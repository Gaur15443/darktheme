import Axios from '../plugin/Axios';
import nativeConfig from 'react-native-config';

export const createDiscussionAPI = async payload => {
  try {
    const response = await Axios.post(`/createDiscussion`, payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const uploadMediaDiscussion = async payload => {
  try {
    const response = await Axios.post(
      `${nativeConfig.MEDIA_URL}/uploadDiscussionMedia/${payload.userId}/${payload.discussionId}`,
      payload.formData,
      {
        headers: {
          Authorization: `Bearer ${payload.token}`,
          'Content-Type': 'multipart/form-data',
        },
        ...payload.config,
      },
    );
    return response;
  } catch (error) {
    throw error;
  }
};

// 🟢 Fetch all user communities (non-paginated)
export const fetchAllUserCommunities = async () => {
  const { data } = await Axios.get('/userAllCommunities');
  return data?.data;
};

// 🟢 Fetch owned communities (paginated)
export const fetchOwnedCommunities = async ({ pageParam = 1 }) => {
  const { data } = await Axios.get(`/userOwnedCommunities/${pageParam}`);
  return data;
};

// 🟢 Fetch joined communities (paginated)
export const fetchJoinedCommunities = async ({ pageParam = 1 }) => {
  const { data } = await Axios.get(`/userJoinedCommunities/${pageParam}`);
  return data;
};

// 🟢 Fetch community categories
export const fetchAllCommunityCategories = async () => {
  const { data } = await Axios.get('/getAllCategories');
  return data;
};

// 🟢 Fetch community Active Members
export const fetchCommunityMembers = async ({ communityId, pageNo }) => {
  const response = await Axios.get(
    `commmunityActiveMembers/${communityId}/${pageNo}`,
  );
  return response.data;
};

// Fetch All Tree Family Active Members
export const fetchAllTreeMember = async ({ communityId }) => {
  const response = await Axios.get(`/communityUsersGroup/${communityId}`);
  return response.data;
};

// Fetch Individual Community Data For Edit Community
export const viewSingleCommunity = async ({ communityId }) => {
  const response = await Axios.get(`/commmunityDetail/${communityId}`);
  return response.data;
};

// Fetch Individual Community Data
export const getCommunityDetails = async ({ communityId }) => {
  const response = await Axios.get(`/commmunityDetail/${communityId}`);
  return response.data;
};

// Fetch All Community Posts
export const fetchAllCommunityPosts = async ({
  communityId,
  page = 1,
  postedOn,
  random,
}) => {
  const { data } = await Axios.post('/communityAllPosts', {
    page,
    postedOn,
    communityId,
    random,
  });
  return data;
};

// Fetch Individual Community Data
export const fetchDiscussionById = async ({ discussionId }) => {
  const response = await Axios.get(`/getDiscussionById/${discussionId}`);
  return response.data;
};

// Fetch Individual Community Data
export const searchAndFilterCommunities = async ({ payload }) => {
  const response = await Axios.post(`/searchCommunities`, payload);

  return response?.data;
};

// Fetch Private Community Joining Requests
export const fetchCommunityJoiningRequests = async ({ communityId, pageNo }) => {
  const response = await Axios.get(
    `/communityJoinRequests/${communityId}/${pageNo}`,
  );
  return response.data;
};

// Mark Community As Seen And Remove New Tag
export const markCommunityAsSeen = async ({ communityId }) => {
  const response = await Axios.put(
    `/updateCommunityRecentlyJoined/${communityId}`,
  );
  return response.data;
};
