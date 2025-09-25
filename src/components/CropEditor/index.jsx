import {useRef, useState, useEffect} from 'react';
import {CropView} from 'react-native-image-crop-tools';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {Text, Button, Appbar, useTheme} from 'react-native-paper';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ErrorBoundary from '../../common/ErrorBoundary';

/**
 * Crop for facilitating image crop.
 *
 * @param {Object} props
 * @param {boolean} props.autoCrop - If `true` the images will automatically crop using the defined aspect ratio
 * @param {Object} [props.autoCropRatio] - The default aspect ratio to use for auto cropping.
 * @param {number} props.autoCropRatio.width - The default width ratio to use for auto cropping.
 * @param {number} props.autoCropRatio.height - The default height ratio to use for auto cropping.
 * else if `false`, user interaction is required to perform cropping.
 * @param {string} props.mediaUrl - Path of the image to edit.
 * @param {Function} props.onCloseImageEditor - Function to handle when the editor is closed.
 * @param {Function} props.onSaveCrop - Function to handle when the cropped image is saved.
 * @returns {JSX.Element} - The rendered Image Editor component.
 */
function CropEditor({
  autoCrop = false,
  autoCropRatio = null,
  mediaUrl,
  isEditing,
  onCloseImageEditor,
  onSaveCrop,
  isAstrology = false,
}) {
  const theme = useTheme();
  const styles = useCreateStyles(isAstrology);
  const cropViewRef = useRef(null);

  const {bottom, top} = useSafeAreaInsets();
  const [aspectRatio, setAspectRatio] = useState(
    autoCropRatio
      ? autoCropRatio
      : {
          width: 1,
          height: 1,
        },
  );

  const supportedAspectRatios = [
    {
      width: 1,
      height: 1,
    },
    {
      width: 16,
      height: 9,
    },
    {
      width: 4,
      height: 3,
    },
    {
      width: 3,
      height: 4,
    },
  ];

  useEffect(() => {
    if (
      autoCrop &&
      autoCropRatio.width &&
      autoCropRatio.height &&
      typeof cropViewRef.current?.saveImage === 'function'
    ) {
      handleCropSave();
    }
  }, [autoCrop, autoCropRatio, handleCropSave, cropViewRef.current]);

  function handleCropSave() {
    cropViewRef.current.saveImage(true, 90);
  }

  function handleOnImageCrop(event) {
    const data = {
      ...event,
      aspectRatio,
    };
    onSaveCrop(data);
  }

  return (
    <ErrorBoundary.Screen>
      <View
        style={{
          height: '100%',
          backgroundColor: isAstrology
            ? theme.colors.astrologyDeepBlue
            : theme.colors.onWhite100,
          marginTop:
            Platform.OS === 'android' ? 0 : 0,
        }}>
        <Appbar.Header
          statusBarHeight={0}
          style={[styles.header]}
          theme={{
            colors: {
              surface: isAstrology
                ? theme.colors.astrologyDeepBlue
                : theme.colors.onWhite100,
            },
          }}>
          <Appbar.BackAction
            color={isAstrology ? '#fff' : ''}
            onPress={onCloseImageEditor}
            accessibilityLabel="backToPreview"
          />
          <TouchableOpacity
            onPress={handleCropSave}
            style={styles.ctaButton}
            accessibilityLabel="save crop">
            <Text style={styles.ctaText}>Save</Text>
          </TouchableOpacity>
        </Appbar.Header>
        <CropView
          sourceUrl={mediaUrl}
          ref={event => {
            cropViewRef.current = event;
          }}
          keepAspectRatio
          style={[
            styles.cropArea,
            {
              // 64 is default header height and 167 is the edit tools height.
              height:
                Dimensions.get('window').height -
                64 -
                167 -
                bottom,
            },
          ]}
          aspectRatio={
            autoCropRatio.height && autoCropRatio.width && autoCrop
              ? autoCropRatio
              : aspectRatio
          }
          onImageCrop={handleOnImageCrop}
        />
        <View style={styles.editActionsContainer}>
          <View style={styles.aspectRatioContainer}>
            {supportedAspectRatios.map((ratio, index) => (
              <TouchableOpacity
                accessibilityLabel={`ration${index}`}
                onPress={() => setAspectRatio(ratio)}
                key={`${ratio.width}:${ratio.height}`}
                disabled={
                  JSON.stringify(ratio) !== JSON.stringify(aspectRatio) &&
                  isEditing
                }
                style={styles.touchableOpacity}>
                <Text
                  style={[
                    {color: isAstrology ? '#fff' : ''},
                    styles.ratio,
                    JSON.stringify(ratio) === JSON.stringify(aspectRatio)
                      ? styles.activeRatio
                      : null,
                    {
                      opacity:
                        JSON.stringify(ratio) !== JSON.stringify(aspectRatio) &&
                        isEditing
                          ? 0.2
                          : 1,
                    },
                  ]}>
                  {ratio.width}:{ratio.height}
                </Text>
                <View
                  style={[
                    JSON.stringify(ratio) === JSON.stringify(aspectRatio)
                      ? null
                      : {opacity: 0},
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.rotationsContainer, {paddingBottom: bottom}]}>
            <TouchableOpacity
              style={styles.buttonContainer}
              onPress={() => {
                cropViewRef.current.rotateImage(false);
              }}
              accessibilityLabel="rotateLeft">
              <Icon name="rotate-left" size={30} style={styles.icon} />
              <Button
                mode="text"
                textColor={isAstrology ? '#fff' : theme.colors.primary}
                style={styles.rotationButton}>
                Rotate left
              </Button>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonContainer}
              onPress={() => cropViewRef.current.rotateImage(true)}
              accessibilityLabel="rotateRight">
              <Icon name="rotate-right" size={30} style={styles.icon} />
              <Button
                mode="text"
                textColor={isAstrology ? '#fff' : theme.colors.primary}
                style={styles.rotationButton}>
                Rotate right
              </Button>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ErrorBoundary.Screen>
  );
}

function useCreateStyles(isAstrology) {
  const theme = useTheme();
  return StyleSheet.create({
    header: {
      justifyContent: 'space-between',
      paddingRight: 20,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    },
    ctaButton: {
      backgroundColor: isAstrology ? '#fff' : theme.colors.primary,
      width: 88,
      height: 33,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ctaText: {
      color: isAstrology ? theme.colors.astrologylightBlue : '#fff',
      fontWeight: 'bold',
    },
    icon: {
      color: isAstrology ? '#fff' : theme.colors.primary,
    },
    cropArea: {
      width: '100%',
    },
    ratio: {
      fontWeight: 'bold',
    },
    activeRatio: {
      color: isAstrology ? '#fff' : theme.colors.primary,
      borderBottomColor: isAstrology
        ? theme.colors.astrologylightBlue
        : theme.colors.primary,
      borderBottomWidth: 2,
    },
    aspectRatioContainer: {
      flex: 1,
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomColor: '#E7E7E7',
      borderBottomWidth: 2,
    },
    touchableOpacity: {
      flex: 1,
      alignItems: 'center',
    },
    editActionsContainer: {
      height: 167,
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between',
      borderTopRightRadius: 18,
      borderTopLeftRadius: 18,
      borderWidth: 1,
      borderColor: '#a2a2a2',
    },
    rotationsContainer: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: isAstrology ? theme.colors.astrologyDeepBlue : '#fff',
    },
    buttonContainer: {
      paddingTop: 6,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}

CropEditor.propTypes = {
  isEditing: PropTypes.bool,
  autoCrop: PropTypes.bool,
  autoCropRatio: PropTypes.object,
  mediaUrl: PropTypes.string.isRequired,
  onCloseImageEditor: PropTypes.func.isRequired,
  onSaveCrop: PropTypes.func.isRequired,
};

CropEditor.displayName = 'CropEditor';

export default CropEditor;
