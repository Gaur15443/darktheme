// ProfilePicturePicker.js
import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {View, StyleSheet, Text, TouchableOpacity, Platform} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import {BottomSheet} from 'react-native-paper';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {CloseIcon} from '../../images/Icons/ModalIcon';
import {CameraIcon, PhotoLibrary} from '../../images/Icons/UploadMedia';
import Theme from '../../common/Theme';
import {PERMISSIONS} from 'react-native-permissions';
import * as Sentry from "@sentry/react-native";

const ProfilePicturePicker = ({
  isProfileUpload,
  setImageUrl,
  setProfileUpload,
}) => {
  const [profileImage, setProfileImage] = useState('');
  const navigation = useNavigation();
  const selectImage = async () => {
    try {
      if (!ImagePicker) {
        return;
      }
      const image = await ImagePicker?.openPicker({
        width: 30,
        height: 30,
        cropping: true,
        cropperCircleOverlay: true,
        compressImageQuality: 0.7,
        includeBase64: true,
      });

      // setProfileImage({uri: `data:${image.mime};base64,${image.data}`});
      setImageUrl({uri: `data:${image.mime};base64,${image?.data}`});

      // onSelectImage({uri: `data:${image.mime};base64,${image.data}`});
    } catch (error) {}
  };

  const imagePickerErrorHandler = error => {
    switch (error.code) {
      case 'E_PICKER_CANCELLED':
        return false;
      case 'E_NO_CAMERA_PERMISSION':
        console.warn('Please grant camera permission.');
      case 'E_PICKER_CANNOT_RUN_CAMERA_ON_SIMULATOR':
        console.warn('Cannot run camera on simulator');
    }
  };
  const launchCamera = async type => {
    await checkCameraPermissions();
    setTimeout(() => {
      ImagePicker.openCamera({
        compressImageQuality: 0.6,
        cropping: true,
        freeStyleCropEnabled: true,
      })
        .then(image => {
          uploadFile(image, type);
        })
        .catch(imagePickerErrorHandler);
      PopupClose();
    }, 400);
  };

  const onPressLaunchCamera = () => {
    PopupClose();
    setTimeout(() => {
      launchCamera();
    }, 300);
  };
  const onPressChooseImage = () => {
    PopupClose();
    setTimeout(() => {
      selectImage();
    }, 300);
  };
  const PopupClose = () => {
    setProfileUpload(false);
  };
  async function checkCameraPermissions() {
    let permission;
    if (Platform.OS === 'ios') {
      permission = PERMISSIONS.IOS.CAMERA;
    } else {
      permission = PERMISSIONS.ANDROID.CAMERA;
    }

    const result = await request(permission);

    return result;
  }
  return (
    
    <Sentry.Mask>
      <View style={styles.container}>
        <SafeAreaProvider>
          <BottomSheet modalProps={{}} isVisible={isProfileUpload}>
            <View style={styles.bottomDialogContainer}>
              <View
                style={{
                  flexDirection: 'row',
                  margin: 20,
                  justifyContent: 'space-between',
                }}>
                <Text style={{fontSize: 20, fontWeight: '500'}}>
                  Upload Media
                </Text>
                <TouchableOpacity onPress={PopupClose}>
                  <CloseIcon color="black" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.buttonStyle}
                onPress={onPressLaunchCamera}>
                <PhotoLibrary />
                <Text style={styles.bottomOptionText}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.buttonStyle}
                onPress={onPressChooseImage}>
                <CameraIcon />
                <Text style={styles.bottomOptionText}>Photo Library</Text>
              </TouchableOpacity>
            </View>
          </BottomSheet>
        </SafeAreaProvider>
      </View>
    </Sentry.Mask>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
  },
  bottomDialogContainer: {
    backgroundColor: Theme.light.onSecondary,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    marginBottom: 0,
    width: '100%',
    height: 200,
  },
  buttonStyle: {
    alignItems: 'center',
    width: '100%',
    flexDirection: 'row',
    paddingLeft: 30,
    paddingTop: 10,
    paddingBottom: 20,
  },
  bottomOptionText: {
    color: Theme.light.shadow,
    fontSize: 16,
    paddingLeft: 16,
  },
});

export default ProfilePicturePicker;
