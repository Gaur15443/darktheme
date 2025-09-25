export const updateCommuityJoinStatusCache = (
  queryClient,
  updatedItemOrId,
  newValue,
) => {
  const communityId =
    typeof updatedItemOrId === 'string'
      ? updatedItemOrId
      : updatedItemOrId?._id;

  if (!communityId) {
    return;
  }

  // Update "filteredCommunities" cache
  queryClient.setQueriesData({queryKey: ['filteredCommunities']}, oldData => {
    if (!oldData) {
      return oldData;
    }

    let isUpdated = false;

    const newData = {
      ...oldData,
      pages: oldData.pages.map(page => ({
        ...page,
        data: page.data.map(item => {
          if (item._id === communityId) {
            isUpdated = true;
            return {...item, userJoined: newValue};
          }
          return item;
        }),
      })),
    };

    return newData;
  });

  //   //  Update "CommmunityDetail" cache
  //   queryClient.setQueriesData(
  //     {queryKey: ['CommmunityDetail', communityId]},
  //     oldData => {
  //       if (!oldData) {
  //         console.log(` No cache found for single community: ${communityId}`);
  //         return oldData;
  //       }

  //       console.log(
  //         `Updating userJoined for single community ${communityId}:`,
  //         {
  //           oldValue: oldData.userJoined,
  //           newValue: newValue,
  //         },
  //       );

  //       return {...oldData, userJoined: newValue};
  //     },
  //   );

  // 🔹 Ensure UI updates by invalidating queries (optional)
  queryClient.invalidateQueries({queryKey: ['filteredCommunities']});
  queryClient.invalidateQueries({queryKey: ['CommmunityDetail', communityId]});
  queryClient.refetchQueries({queryKey: ['CommmunityDetail', communityId]});
  queryClient.invalidateQueries({queryKey: ['userJoinedCommunities']});
};
