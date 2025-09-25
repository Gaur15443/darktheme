import React, {useState, useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import {
  View,
  TouchableOpacity,
  Text,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import ImageCropPicker from 'react-native-image-crop-picker';
import {useDispatch, useSelector} from 'react-redux';
import Toast from 'react-native-toast-message';
import {PERMISSIONS, request} from 'react-native-permissions';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import {CameraIcon, PhotoLibrary} from '../../images/Icons/UploadMedia';
import {updateProfilePic} from './updateProfilePic.js';
import {Icon, Modal, Portal} from 'react-native-paper';
import {getUserInfo} from '../../store/apps/userInfo';
import * as Sentry from "@sentry/react-native";

const ProfilePicCropper = ({
  children,
  userId,
  setProfilePicture,
  byForm,
  setCroppedImageData,
  setShowSelectOption,
  openType = 'null',
}) => {
  const dispatch = useDispatch();
  const groupId = useSelector(state => state.userInfo.linkedGroup);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const bottomSheetRef = useRef(null);
  const [imageUri, setImageUri] = useState(null);

  const toggleModal = () => setIsModalVisible(!isModalVisible);

  const uploadAction = image => {
    if (byForm) {
      setCroppedImageData(image);
      if (!openType) toggleModal();
      if (typeof setShowSelectOption === 'function') {
        setShowSelectOption(false);
      }
    } else {
      updateProfilePic(
        image,
        userId,
        groupId,
        dispatch,
        setProfilePicture,
        clinkOwner || null,
        toastMessages,
      );
      toggleModal();
    }
  };

  const handleImagePick = async () => {
    try {
      const initialImage = await ImageCropPicker.openPicker({
        width: 1000,
        height: 1000,
        includeBase64: true,
        mediaType: 'photo',
        cropping: false,
      });
  
      const imageSize = initialImage.size / 1024 / 1024; // Size in MB
      
      if (imageSize > 5) {
        Toast.show({
          type: 'error',
          text1: 'One or more images exceed the maximum file size allowed',
        });
        return;
      }
      
      // If size is acceptable, proceed with cropping the SAME image
      const croppedImage = await ImageCropPicker.openCropper({
        path: initialImage.path, // Use the path from the first selection
        width: 1000,
        height: 1000,
        cropping: true,
        cropperCircleOverlay: true,
        includeBase64: true,
      });
  
      uploadAction(croppedImage);
  
    } catch (error) {
      if (error.message !== 'User cancelled image selection') {
        Toast.show({
          type: 'error',
          text1:
            'Error selecting image: ' +
            (error.message === 'User did not grant library permission.'
              ? 'Please enable access to photo library in settings.'
              : error.message),
        });
      }
    }
  };

  const handleCameraCapture = async () => {
    try {
      let permission =
        Platform.OS === 'android'
          ? await request(PERMISSIONS.ANDROID.CAMERA)
          : await request(PERMISSIONS.IOS.CAMERA);

      if (permission !== 'granted') {
        if (!openType) toggleModal();
        Toast.show({
          type: 'error',
          text1: 'Please enable access to camera in settings.',
        });
        return;
      }

      const image = await ImageCropPicker.openCamera({
        width: 300,
        height: 300,
        cropping: true,
        cropperCircleOverlay: true,
        compressImageQuality: 0.6,
        includeBase64: true,
        mediaType: 'photo',
      });
      uploadAction(image);
    } catch (error) {
      if (!openType) toggleModal();
      Toast.show({
        type: 'error',
        text1: 'Error capturing image: ' + error.message,
      });
    }
  };

  const getUserData = useSelector(
    state => state?.fetchUserProfile?.basicInfo[userId]?.myProfile,
  );
  const userInfo = useSelector(state => state.userInfo);
  const [clinkOwner, setClinkOwner] = useState(null);
  const toastMessages = useSelector(
    state => state?.getToastMessages?.toastMessages?.Profile_Settings,
  );
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userId) {
          await dispatch(getUserInfo()).unwrap();
        }
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Error fetching user info:',
          text2: error,
        });
      }
    };

    fetchData();
  }, [dispatch, userId]);

  useEffect(() => {
    if (getUserData?.cLink?.length > 0) {
      if (!getUserData?._id) {
        getUserProfile();
      }
      setClinkOwner(getUserData?._id);
      if (getUserData?.isClone) {
        setClinkOwner(getUserData?.cLink?.[0]?.linkId?.[0]);
      }
    }
  }, [getUserData?._id]);

  useEffect(() => {
    if (userInfo?.cLink?.length > 0) {
      if (userInfo?._id && !getUserData?._id) {
        setClinkOwner(userInfo?._id);
        if (userInfo?.isClone) {
          setClinkOwner(userInfo?.cLink?.[0]?.linkId?.[0]);
        }
      }
    }
  }, [userInfo?._id]);

  const snapPoints = ['25%', '50%'];

  const handleChilderenPress = () => {
    if (openType === 'camera') {
      handleCameraCapture();
    }
    if (openType === 'gallary') {
      handleImagePick();
    }
    if (openType === 'null') {
      toggleModal();
    }
  };

  return (
    <Sentry.Mask>
    <View>
      <TouchableOpacity
        testID="open-bottomsheet"
        onPress={handleChilderenPress}>
        {children}
      </TouchableOpacity>
      <Portal>
        <Modal
          visible={isModalVisible}
          transparent={true}
          style={{marginBottom: 0, marginTop: 0}}
          contentContainerStyle={{
            flex: 1,
            height: '100%',
            justifyContent: 'flex-end',
          }}
          animationType="fade"
          onRequestClose={toggleModal}>
          <TouchableWithoutFeedback onPress={toggleModal}>
            <View style={styles.overlay} />
          </TouchableWithoutFeedback>
          <BottomSheet
            ref={bottomSheetRef}
            index={0}
            snapPoints={snapPoints}
            enablePanDownToClose={true}
            onClose={toggleModal}
            backgroundStyle={styles.bottomSheet}>
            <BottomSheetView style={styles.bottomDialogContainer}>
              <View style={styles.headerContainer}>
                <Text variant={'default'} style={[styles.headerText]}>
                  Upload Media
                </Text>

                {/* <TouchableOpacity
                  onPress={toggleModal}
                  accessibilityLabel="close media upload options">
                  <CloseIcon color="black" />
                </TouchableOpacity> */}
              </View>

              <TouchableOpacity
                style={[styles.buttonStyle]}
                onPress={handleCameraCapture}>
                <CameraIcon style={styles.icon} />
                <Text
                  variant={'default'}
                  style={{
                    color: 'gray',
                    fontSize: 16,
                    paddingLeft: 16,
                    fontWeight: '400',
                  }}>
                  Take Photo
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.buttonStyle]}
                onPress={handleImagePick}>
                <PhotoLibrary style={styles.icon} />
                <Text
                  variant={'default'}
                  style={{
                    color: 'gray',
                    fontSize: 16,
                    paddingLeft: 16,
                    fontWeight: '400',
                  }}>
                  Choose from Gallery
                </Text>
              </TouchableOpacity>
            </BottomSheetView>
          </BottomSheet>
        </Modal>
      </Portal>
    </View>
    </Sentry.Mask>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    position: 'relative',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  indicator: {
    backgroundColor: 'gray',
    width: 40,
  },
  bottomDialogContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    width: '100%',
    maxHeight: Dimensions.get('window').height * 0.5,
    paddingVertical: 23,
    paddingHorizontal: 25,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 20,
    color: 'black',
  },
  buttonStyle: {
    alignItems: 'center',
    width: '100%',
    flexDirection: 'row',
    // paddingLeft: 30,
    paddingTop: 10,
    paddingBottom: 10,
  },

  icon: {
    width: 24,
    height: 24,
  },
});

ProfilePicCropper.propTypes = {
  children: PropTypes.element.isRequired,
  userId: PropTypes.string,
  setProfilePicture: PropTypes.func,
  setCroppedImageData: PropTypes.func,
  setShowSelectOption: PropTypes.func,
};

export default ProfilePicCropper;
