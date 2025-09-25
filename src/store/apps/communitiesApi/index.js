import {useQuery, useInfiniteQuery} from '@tanstack/react-query';
import {
  fetchAllUserCommunities,
  fetchOwnedCommunities,
  fetchJoinedCommunities,
  fetchAllCommunityCategories,
  fetchCommunityMembers,
  fetchAllTreeMember,
  viewSingleCommunity,
  getCommunityDetails,
  fetchAllCommunityPosts,
  fetchDiscussionById,
  searchAndFilterCommunities,
  fetchCommunityJoiningRequests,
} from '../../../api/index';

// Non-Paginated Query
export const useGetAllUserCommunities = () => {
  return useQuery({
    queryKey: ['userAllCommunities'],
    queryFn: () => fetchAllUserCommunities(), // Pass function
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Infinite Query for Owned Communities (Pagination)
export const useGetOwnedCommunities = () => {
  return useInfiniteQuery({
    queryKey: ['userOwnedCommunities'],
    queryFn: ({pageParam = 1}) => fetchOwnedCommunities({pageParam}),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage?.data.length === 10 ? allPages.length + 1 : undefined;
    },
    staleTime: 10 * 60 * 1000,
  });
};

// Infinite Query for Joined Communities (Pagination)
export const useGetJoinedCommunities = () => {
  return useInfiniteQuery({
    queryKey: ['userJoinedCommunities'],
    queryFn: ({pageParam = 1}) => fetchJoinedCommunities({pageParam}),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage?.data.length === 10 ? allPages.length + 1 : undefined;
    },
    staleTime: 10 * 60 * 1000,
  });
};

// 🟢 Fetch Community Categories
export const useGetAllCommunityCategories = () => {
  return useQuery({
    queryKey: ['getAllCommunityCategories'],
    queryFn: () => fetchAllCommunityCategories(),
    staleTime: 10 * 60 * 1000,
  });
};

// Fetch All Tree Family Active Members
export const useGetAllTreeActiveMember = communityId => {
  return useQuery({
    queryKey: ['getAllFamilyTreeActiveMembers', communityId],
    queryFn: () => fetchAllTreeMember({communityId}),
    enabled: !!communityId,
    staleTime: 10 * 60 * 1000,
  });
};

// 🟢 Infinite Query for Community Members (Pagination)
export const useGetCommunityMembers = communityId => {
  return useInfiniteQuery({
    queryKey: ['communityActiveMembers', communityId], // Ensures unique cache per community
    queryFn: ({pageParam = 1}) =>
      fetchCommunityMembers({communityId, pageNo: pageParam}),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage?.data.length === 10 ? allPages.length + 1 : undefined;
    },
    enabled: !!communityId, // Prevents execution if communityId is missing
    staleTime: 10 * 60 * 1000,
  });
};

// Fetch Single Community Data For Edit Community
export const useGetSingleCommunity = communityId => {
  return useQuery({
    queryKey: ['singleCommmunityDetail', communityId],
    queryFn: () => viewSingleCommunity({communityId}),
    enabled: !!communityId,
    staleTime: 10 * 60 * 1000,
  });
};
// Fetch Single Community Data
export const useGetCommunityDetails = communityId => {
  return useQuery({
    queryKey: ['CommmunityDetail', communityId],
    queryFn: () => getCommunityDetails({communityId}),
    enabled: !!communityId,
    staleTime: 10 * 60 * 1000,
  });
};

// Fetch All Community Posts
export const useGetAllCommunityPosts = (
  postedOn,
  communityId = null,
  random,
) => {
  return useInfiniteQuery({
    queryKey: ['communityAllPosts', postedOn, communityId], // Unique cache per scenario
    queryFn: ({pageParam = 1}) =>
      fetchAllCommunityPosts({communityId, page: pageParam, postedOn, random}),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage?.data?.length === 7 ? allPages.length + 1 : undefined;
    },
    enabled: !!postedOn,
    staleTime: 10 * 60 * 1000,
  });
};

// Fetch Single Discussion Data
export const useGetDiscussionData = discussionId => {
  return useQuery({
    queryKey: ['singleDisscussionData', discussionId],
    queryFn: () => fetchDiscussionById({discussionId}),
    enabled: !!discussionId,
  });
};

// Fetch Communities By Filter
export const useGetFilteredCommunities = (filterType, searchStr = '') => {
  return useInfiniteQuery({
    queryKey: ['filteredCommunities', filterType, searchStr], // Cache per filter type
    queryFn: async ({pageParam = 1}) => {
      const payload = {page: pageParam, filterOn: filterType, searchStr};
      const response = await searchAndFilterCommunities({payload});
      return response || [];
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage?.data?.length === 10 ? allPages.length + 1 : undefined;
    },
    staleTime: 0, // Force refetch immediately
    cacheTime: 0, // Prevent caching old data
  });
};

// Community Joining Requests For Private Communities (Pagination)
export const useGetCommunityJoiningRequests = communityId => {
  return useInfiniteQuery({
    queryKey: ['CommunityJoiningRequests', communityId], // Ensures unique cache per community
    queryFn: ({pageParam = 1}) =>
      fetchCommunityJoiningRequests({communityId, pageNo: pageParam}),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage?.data.length === 10 ? allPages.length + 1 : undefined;
    },
    enabled: !!communityId, // Prevents execution if communityId is missing
    staleTime: 0,
  });
};
