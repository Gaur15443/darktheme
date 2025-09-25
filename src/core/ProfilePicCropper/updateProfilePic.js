import {
  resetUploadedMedia,
  resetUploadedProfile,
  uploadMedia,
  uploadProfile,
} from '../../store/apps/mediaSlice';
import Toast from 'react-native-toast-message';
import {setUserProfilePic} from '../../store/apps/userInfo';
import {Alert} from 'react-native';

export const updateProfilePic = async (
  croppedImage,
  userId,
  groupId,
  dispatch,
  setProfilePicture,
  clinkOwner,
  toastMessages,
) => {
  try {
    const uploadPercentageRef = {current: ''};
    const uploadProgressInMbRef = {current: ''};
    const croppedImageUrl = croppedImage.path;
    const data = await fetch(croppedImageUrl).then(res => res.blob());

    if (data.size > 5 * 1024 * 1024) {
      Alert.alert('Image size cannot be more than 5 MB');
      return;
    }
    const imageData = {
      uri: croppedImage.path,
      name: data?._data?.name,
      type: data?._data?.type,
      data: croppedImage?.data,
    };
    const formData = new FormData();
    formData.append('image', imageData);
    formData.append('urlType', 'Image');
    formData.append('groupId', JSON.stringify(groupId));
    formData.append('imgCategory', 'Profile');
    const payload = {
      id: userId,
      uploadPercentageRef,
      uploadProgressInMbRef,
      formData,
      clinkOwner,
    };
    let apiResult1 = await dispatch(uploadProfile(payload)).unwrap();
    if (setProfilePicture && typeof setProfilePicture === 'function') {
      // To show image on UI
      setProfilePicture(apiResult1[0]?.imageUrl);

      dispatch(setUserProfilePic(apiResult1[0]?.imageUrl));

      Toast.show({
        type: 'success',
        text1: toastMessages?.['8004'],
      });
    }
    return apiResult1[0]?.imageUrl;
  } catch (error) {
    Toast.show({
      type: 'error',
      text1: error.message,
    });
  } finally {
    resetUploadedMedia();
    resetUploadedProfile();
  }
};
