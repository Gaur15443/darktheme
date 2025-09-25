import React, {
  useCallback,
  useRef,
  forwardRef,
  useImperativeHandle,
  useMemo,
} from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';

import BottomSheet, {
  BottomSheetView,
  WINDOW_HEIGHT,
} from '@gorhom/bottom-sheet';
import {CloseIcon} from '../images/Icons/ModalIcon';
import {Portal, Modal, Text, Divider} from 'react-native-paper';

const BottomSheetOption = ({
  icon: Icon,
  text,
  onPress,
  titleFontWeight,
  customOptionStyle,
  optionVariant,
  optionsContainerStyle = {},
}) => (
  <TouchableOpacity
    style={[styles.buttonStyle, optionsContainerStyle]}
    onPress={onPress}
    accessibilityLabel={`open ${text.toLowerCase()}`}>
    {Icon && <Icon style={styles.icon} />}
    <Text
      variant={optionVariant || 'default'}
      style={{
        color: 'gray',
        fontSize: 16,
        paddingLeft: 16,
        paddingRight: 30,
        fontWeight: titleFontWeight ? titleFontWeight : '600',
        ...customOptionStyle,
      }}>
      {text}
    </Text>
  </TouchableOpacity>
);

const SmallBottomSheet = forwardRef(
  (
    {
      enableCrossIcon,
      options = [],
      title,
      snapPoints: propSnapPoints,
      contentHeight,
      titleFontWeight,
      customTitleStyle = {},
      customOptionStyle = {},
      optionVariant,
      titleVariant,
      enableDynamicSizingProp,
      containerStyle = {},
      disableSnapPoint,
      hideIndicator = false,
      optionsContainerStyle = {},
      showOptionDivider = false,
    },
    ref,
  ) => {
    const bottomSheetRef = useRef(null);
    const [isVisible, setIsVisible] = React.useState(false);

    const snapPoints = useMemo(() => {
      if (propSnapPoints) {
        return propSnapPoints;
      } else if (contentHeight) {
        const screenHeight = Dimensions.get('window').height;
        const percentage = Math.min((contentHeight / screenHeight) * 100, 90); // Cap at 90% of screen height
        return [`${percentage}%`];
      } else {
        return ['25%']; // Default fallback
      }
    }, [propSnapPoints, contentHeight]);

    const handleOpenPress = useCallback(() => {
      setIsVisible(true);
    }, []);

    const handleClosePress = useCallback(() => {
      bottomSheetRef.current?.close();
      setIsVisible(false);
    }, []);

    const handleOptionPress = useCallback(
      id => {
        const selectedOption = options[id];
        if (selectedOption && selectedOption.onPress) {
          selectedOption.onPress();
        }
        handleClosePress();
      },
      [options, handleClosePress],
    );

    useImperativeHandle(ref, () => ({
      open: handleOpenPress,
      close: handleClosePress,
    }));

    const handleBackgroundPress = useCallback(() => {
      handleClosePress();
    }, [handleClosePress]);

    return (
      <Portal>
        <Modal
          transparent={true}
          visible={isVisible}
          style={{marginBottom: 0, marginTop: 0}}
          contentContainerStyle={{
            flex: 1,
            height: '100%',
            marginTop: 0,
            justifyContent: 'flex-end',
          }}
          onRequestClose={handleClosePress}
          animationType="fade">
          <View style={styles.overlay}>
            <BottomSheet
              ref={bottomSheetRef}
              index={0}
              enableDynamicSizing={enableDynamicSizingProp || true}
              snapPoints={disableSnapPoint ? snapPoints : null}
              enablePanDownToClose={true}
              onClose={handleClosePress}
              backgroundStyle={styles.bottomSheet}
              handleIndicatorStyle={[
                styles.indicator,
                hideIndicator ? {height: 0} : {},
              ]}>
              <BottomSheetView
                style={[styles.bottomDialogContainer, containerStyle]}>
                {enableCrossIcon && (
                  <View style={styles.headerContainer}>
                    <Text
                      variant={titleVariant || 'default'}
                      style={[styles.headerText, customTitleStyle]}>
                      {title}
                    </Text>

                    <TouchableOpacity
                      onPress={handleClosePress}
                      accessibilityLabel="close media upload options">
                      <CloseIcon color="black" />
                    </TouchableOpacity>
                  </View>
                )}
                {options.map(({icon, text}, index) => (
                  <>
                    <BottomSheetOption
                      key={index}
                      id={index}
                      icon={icon}
                      text={text}
                      titleFontWeight={titleFontWeight}
                      onPress={() => handleOptionPress(index)}
                      customOptionStyle={customOptionStyle}
                      optionVariant={optionVariant}
                      optionsContainerStyle={optionsContainerStyle}
                    />
                    {showOptionDivider && index === 0 && (
                      <View
                        style={{
                          borderTopWidth: 1,
                          borderColor: '#E77237',
                          width: '94%',
                          alignSelf: 'center',
                        }}
                      />
                    )}
                  </>
                ))}
              </BottomSheetView>
            </BottomSheet>
          </View>
          {/* Overlay to close the bottom sheet */}
          <TouchableWithoutFeedback onPress={handleClosePress}>
            <View
              style={{
                flex: 1,
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: WINDOW_HEIGHT / 4,
              }}
            />
          </TouchableWithoutFeedback>
        </Modal>
      </Portal>
    );
  },
);

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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    paddingLeft: 30,
    paddingTop: 10,
    paddingBottom: 10,
  },

  icon: {
    width: 24,
    height: 24,
  },
});

export default SmallBottomSheet;
