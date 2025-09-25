import React, {
  cloneElement,
  forwardRef,
  memo,
  useCallback,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import {Pressable, StyleSheet, Animated, Keyboard, View} from 'react-native';
import BottomSheet, {
  BottomSheetView,
  BottomSheetScrollView,
  BottomSheetFlatList,
} from '@gorhom/bottom-sheet';
import {Portal} from 'react-native-paper';
import Toast, {BaseToast} from 'react-native-toast-message';
import CustomSheetBackground from './CustomSheetBackground';

import CustomSheetHandle from './CustomSheetHandle';

/**
 * A customizable bottom sheet component that can use a ScrollView, FlatList, or View as its content container.
 *
 * @param {Object} props - The props for the component.
 * @param {function} props.onClose - Function to call when the bottom sheet is closed.
 * @param {Array<string|number>} props.snapPoints - Array of points where the bottom sheet will snap to.
 * @param {number} [props.animationDuration=300] - Duration of the animation in milliseconds.
 * @param {boolean} [props.enableDynamicSizing=true] - Enable dynamic sizing for content view and scrollable
 * content size
 * @param {boolean} [props.enablePanDownToClose=true] - Enable pan down gesture to close the sheet.
 * @param {boolean} [props.enableOverDrag=true] - Enable over drag for the sheet..
 * @param {boolean} [props.useScrollView=false] - Whether to use BottomSheetScrollView as the content container.
 * @param {boolean} [props.useFlatList=false] - Whether to use BottomSheetFlatList as the content container.
 * @param {Array} [props.data=[]] - Data for the BottomSheetFlatList if used.
 * @param {function} [props.renderItem=null] - Function to render each item in the BottomSheetFlatList if used.
 * @param {React.ReactNode} [props.children=null] - Children components to render inside the bottom sheet.
 * @param {Object} [props.sheetContainerStyles={}] - Custom styles for the BottomSheet container.
 */
const CustomBottomSheet = forwardRef(
  (
    {
      onClose,
      snapPoints,
      animationDuration = 300,
      enablePanDownToClose = true,
      enableDynamicSizing = true,
      enableOverDrag = true,
      useScrollView = false,
      useFlatList = false,
      data = [],
      renderItem = null,
      children = null,
      sheetContainerStyles = {},
      contentStyle = {},
      backgroundColor = 'white',
      BottomSheetFooter = null,
      BottomSheetHeader = null,
      footerContainerStyles = {},
      hideIndicator = false,
      ...rest
    },
    ref,
  ) => {
    const bottomSheetRef = useRef(null);
    const [opacity] = useState(new Animated.Value(0.5));
    const toastConfig = {
      // eslint-disable-next-line react/no-unstable-nested-components
      success: props => (
        <BaseToast
          {...props}
          {...toastProps}
          style={[
            toastProps.style,
            {
              borderLeftColor: '#69C779',
            },
          ]}
          text1NumberOfLines={4}
        />
      ),
      // eslint-disable-next-line react/no-unstable-nested-components
      error: props => (
        <BaseToast
          {...props}
          {...toastProps}
          style={[
            toastProps.style,
            {
              borderLeftColor: 'red',
            },
          ]}
          text1NumberOfLines={4}
        />
      ),
    };

    const toastProps = {
      text1Style: {
        fontSize: 14,
        fontWeight: 500,
      },
      text2Style: {
        fontSize: 12,
        fontWeight: 300,
      },
      text2NumberOfLines: 4,
      style: {
        height: 'auto',
        paddingVertical: 10,
        paddingHorizontal: 0,
      },
    };

    const Container = useScrollView
      ? BottomSheetScrollView
      : useFlatList
        ? BottomSheetFlatList
        : BottomSheetView;

    const handleClose = useCallback(() => {
      if (typeof bottomSheetRef.current?.close === 'function') {
        bottomSheetRef.current.close();
        Animated.timing(opacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }
    }, [opacity]);

    const handleKeyboardDismiss = useCallback(() => {
      try {
        Keyboard.dismiss();
      } catch (_error) {
        /**empty */
      }
    }, []);

    const renderFooter = () => (
      <>
        {BottomSheetFooter ? (
          <View style={[styles.footer, footerContainerStyles]}>
            {typeof BottomSheetFooter === 'function' ? (
              <BottomSheetFooter />
            ) : (
              BottomSheetFooter
            )}
          </View>
        ) : null}
      </>
    );

    return (
      <Portal>
        <Animated.View style={[styles.sheetBackground, {opacity}]}>
          <Pressable
            onPress={() => {
              handleKeyboardDismiss();
              handleClose();
            }}
            style={styles.pressable}
          />
        </Animated.View>
        <BottomSheet
          ref={el => {
            bottomSheetRef.current = el;
            if (typeof ref === 'function') {
              ref(el);
            } else if (ref && ref.hasOwnProperty('current')) {
              ref.current = el;
            }
          }}
          animationConfigs={{
            duration: animationDuration,
          }}
          // footerComponent={renderFooter}
          snapPoints={snapPoints}
          enablePanDownToClose={enablePanDownToClose}
          enableDynamicSizing={enableDynamicSizing}
          enableOverDrag={enableOverDrag}
          onClose={onClose}
          handleHeight={16}
          animateOnMount
          handleComponent={hideIndicator ? null : CustomSheetHandle}
          backgroundComponent={backgroundComponentProps =>
            cloneElement(<CustomSheetBackground />, {
              ...backgroundComponentProps,
              backgroundColor: backgroundColor,
            })
          }
          style={[styles.sheetContainer, sheetContainerStyles]}
          {...rest}>
          {BottomSheetHeader}
          <Container
            keyboardShouldPersistTaps="always"
            style={[styles.contentContainer, contentStyle]}
            contentContainerStyle={[styles.contentContainer, contentStyle]}
            data={data}
            renderItem={renderItem}>
            {children}
          </Container>
          <Toast
            config={toastConfig}
            position="bottom"
            bottomOffset={20}
            autoHide
            visibilityTime={3000}
          />
          {renderFooter()}
        </BottomSheet>
      </Portal>
    );
  },
);

CustomBottomSheet.propTypes = {
  onClose: PropTypes.func.isRequired,
  backgroundColor: PropTypes.string,
  snapPoints: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  ).isRequired,
  animationDuration: PropTypes.number,
  useScrollView: PropTypes.bool,
  useFlatList: PropTypes.bool,
  data: PropTypes.array,
  renderItem: PropTypes.func,
  children: PropTypes.node,
  sheetContainerStyles: PropTypes.object,
};

const styles = StyleSheet.create({
  sheetContainer: {
    zIndex: 9999,
    position: 'absolute',
    marginBottom: 200,
  },
  pressable: {
    flex: 1,
  },
  contentContainer: {
    height: '100%',
  },
  sheetBackground: {
    backgroundColor: '#000',
    opacity: 0.5,
    height: '100%',
  },
  handleIndicator: {
    height: 4,
    backgroundColor: 'grey',
    borderRadius: 2,
  },
  footer: {
    padding: 16,
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
  },
  footerText: {
    color: '#333',
  },
});

CustomBottomSheet.displayName = 'CustomBottomSheet';

export default memo(CustomBottomSheet);
