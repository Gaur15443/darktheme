import React, {useEffect, useState} from 'react';
import Animated, {ZoomIn} from 'react-native-reanimated';
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import {Button, Dialog, Modal, Paragraph, Portal} from 'react-native-paper';
import PropTypes from 'prop-types';
import {CrossIcon} from '../../../../images';

/**
 *  Date Picker Component
 * @param {String} heading - Represents Heading
 * @param {String} continueCtaText - Label of continue button
 * @param {String} discardCtaText - Label of discard button
 * @param {String} title - Represents title
 * @param {String} subTitle - Represents subTitle
 * @param {Function} onBackgroundClick - Callback function triggered when modal background is clicked
 * @param {Function} onContinue - Callback function triggered when clicked in continue button
 * @param {Function} onDiscard - Callback function triggered when clicked in discard button
 * @param {Function} onCrossClick - Callback function triggered when clicked in cross button
 * @param {boolean} loading - Trigger for loader
 * @param {function} components - slot to insert custom component
 * @param {Object} componentWrapperStyle - Style for the wrapper of the inserted component
 * @param {Object} titleStyle - Style for the title
 * @param {Object} subTitleStyle - Style for the subtitle
 * @param {Object} confirmButtonStyle - Style for the confirm button
 * @param {Object} confirmButtonLabelStyle - Style for the label of confirm button
 * @param {Object} discardButtonStyle - Style for the discard button
 * @param {Object} discardButtonLabelStyle - Style for the label of discard button
 */

function Confirm({
  heading = '',
  continueCtaText = 'CONTINUE EDITING',
  title = 'Are you sure you want to leave?',
  subTitle = 'If you discard, you will lose your changes',
  hideSubtitle = false,
  discardCtaText = 'DISCARD',
  onContinue,
  onBackgroundClick,
  onDiscard,
  onCrossClick = () => undefined,
  loading = false,
  components = () => undefined,
  componentWrapperStyle = {},
  titleStyle = {},
  subTitleStyle = {},
  confirmButtonStyle = {},
  confirmButtonLabelStyle = {},
  discardButtonStyle = {},
  discardButtonLabelStyle = {},
  titleId = '',
  subTitleId = '',
  continueId = '',
  discardId = '',
  crossIconId = 'close pop up',
  buttonSwap = false,
}) {
  const [continueButtonHovered, setContinueButtonHovered] = useState(false);
  const [discardButtonHovered, setDiscardButtonHovered] = useState(false);

  useEffect(() => {
    if (onCrossClick !== 'function' && typeof onDiscard === 'function') {
      onCrossClick = onDiscard;
    }
  }, []);

  function handleOnDismiss() {
    if (typeof onBackgroundClick === 'function') {
      onBackgroundClick();
    } else {
      // To avoid calling function if second button is used for confirm action
      if (!buttonSwap) {
        onDiscard();
      }
      if (buttonSwap) {
        onContinue();
      }
    }
  }

  return (
    <Portal>
      <Modal
        visible={true}
        dismissable={false}
        onDismiss={handleOnDismiss}
        onRequestClose={handleOnDismiss}
        style={{
          marginBottom: 0,
          marginTop: 0,
          backgroundColor: 'transparent',
          borderRadius: 6,
          shadowColor: 'transparent',
        }}
        contentContainerStyle={{
          height: '100%',
          width: '100%',
          padding: 0,
          margin: 0,
          paddingHorizontal: 30,
        }}>
        <Pressable
          style={{
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: -1,
            position: 'absolute',
          }}
          onPress={handleOnDismiss}></Pressable>
        <Animated.View
          entering={ZoomIn.duration(200).damping(0)}
          style={{
            backgroundColor: 'white',
            borderRadius: 8,
          }}>
          <TouchableOpacity
            accessibilityLabel={crossIconId}
            onPress={onCrossClick}
            style={{
              marginTop: 0,
              position: 'absolute',
              right: -14,
              top: -15,
              zIndex: 1,
              padding: 8,
              backgroundColor: 'rgb(211,211,211)',
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 1,
              },
              shadowOpacity: 0.22,
              shadowRadius: 2.22,
              elevation: 3,
              borderRadius: 6,
            }}>
            <View>
              <CrossIcon
                fill={'rgb(133,130,126)'}
                style={{position: 'absolute', right: 0, top: 0, zIndex: 1}}
                testID="cancelButton"
              />
            </View>
          </TouchableOpacity>
          <Dialog.Content style={hideSubtitle ? {marginBottom: -10} : {}}>
            {heading && (
              <Paragraph
                style={{
                  color: 'black',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  fontSize: 22,
                  paddingTop: 30,
                }}>
                {heading}
              </Paragraph>
            )}
            <Paragraph
              accessibilityLabel={titleId}
              style={[
                {
                  color: 'black',
                  fontWeight: '700',
                  fontSize: 18,
                  textAlign: 'center',
                  paddingTop: 20,
                  paddingBottom: 4,
                },
                titleStyle,
              ]}>
              {title}
            </Paragraph>
            {subTitle?.length > 0 && !hideSubtitle && (
              <Paragraph
                accessibilityLabel={subTitleId}
                style={[
                  {
                    color: 'black',
                    fontWeight: 'normal',
                    textAlign: 'center',
                  },
                  subTitleStyle,
                ]}>
                {subTitle}
              </Paragraph>
            )}
            {components && (
              <View style={componentWrapperStyle}>{components()}</View>
            )}
          </Dialog.Content>
          {/* <Dialog.Actions> */}

          <View style={{position: 'relative', zIndex: -1}}>
            <Button
              mode="contained"
              accessibilityLabel={continueId}
              onPress={onContinue}
              onPressIn={() => setContinueButtonHovered(true)}
              onPressOut={() => setContinueButtonHovered(false)}
              style={[
                {
                  backgroundColor: continueButtonHovered
                    ? '#E77237'
                    : '#E77237',
                  zIndex: 10,
                  borderRadius: 8,
                  marginHorizontal: 20,
                  marginVertical: 0,
                  marginBottom: !discardCtaText ? 20 : 0,
                },
                confirmButtonStyle,
              ]}
              labelStyle={[
                {color: 'white', fontWeight: '700', zIndex: 9},
                confirmButtonLabelStyle,
              ]}
              testID="continueButton"
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="white" /> // Show loader if loading
              ) : (
                continueCtaText
              )}
            </Button>
          </View>

          {/* </Dialog.Actions> */}

          {discardCtaText && (
            <Button
              mode="outlined"
              onPress={onDiscard}
              onPressIn={() => setDiscardButtonHovered(true)}
              onPressOut={() => setDiscardButtonHovered(false)}
              style={[
                {
                  backgroundColor: discardButtonHovered ? '#FFE9DE' : '#fff',
                  borderWidth: 1.5,
                  borderColor: '#E0DEF7',
                  borderRadius: 8,

                  marginHorizontal: 20,
                  marginVertical: 10,
                  marginBottom: 20,
                },
                discardButtonStyle,
              ]}
              labelStyle={[
                {color: '#E77237', fontWeight: '700'},
                discardButtonLabelStyle,
              ]}
              testID="discardButton"
              accessibilityLabel={discardId}
              disabled={loading}>
              {discardCtaText}
            </Button>
          )}
        </Animated.View>
      </Modal>
    </Portal>
  );
}

Confirm.propTypes = {
  heading: PropTypes.string,
  continueCtaText: PropTypes.string,
  discardCtaText: PropTypes.string,
  onBackgroundClick: PropTypes.func,
  onContinue: PropTypes.func.isRequired,
  onDiscard: PropTypes.func.isRequired,
  onCrossClick: PropTypes.func,
  title: PropTypes.string,
  subTitle: PropTypes.string,
  titleStyle: PropTypes.object,
  subTitleStyle: PropTypes.object,
  loading: PropTypes.bool,
  componentWrapperStyle: PropTypes.object,
  confirmButtonStyle: PropTypes.object,
  confirmButtonLabelStyle: PropTypes.object,
  discardButtonStyle: PropTypes.object,
  discardButtonLabelStyle: PropTypes.object,
  components: PropTypes.func,
};

Confirm.displayName = 'Confirm';

export default Confirm;
