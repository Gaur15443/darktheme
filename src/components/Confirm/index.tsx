import React, {MemoExoticComponent, useEffect, useState} from 'react';
import Animated, {ZoomIn} from 'react-native-reanimated';
import {
  View,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import {Button, Dialog, Modal, Paragraph, Portal} from 'react-native-paper';
import {CrossIcon} from '../../images';
import NewTheme from '../../common/NewTheme';
import Spinner from '../../common/ButtonSpinner';
import GradientView from '../../common/gradient-view';

interface ConfirmProps {
  showCross?: boolean;
  heading?: string;
  continueCtaText?: string | boolean;
  title?: string | React.ReactNode;
  subTitle?: string | null;
  discardCtaText?: string | boolean;
  onContinue?: () => void;
  onBackgroundClick?: () => void;
  onDiscard?: () => void;
  onCrossClick?: () => void;
  loading?: boolean;
  components?:
    | React.ReactNode
    | React.ReactElement<any, any>
    | (() => React.ReactNode | React.ReactElement<any, any> | null)
    | MemoExoticComponent<any>;

  componentWrapperStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subTitleStyle?: StyleProp<TextStyle>;
  confirmButtonStyle?: StyleProp<ViewStyle>;
  confirmButtonLabelStyle?: StyleProp<TextStyle>;
  discardButtonStyle?: StyleProp<ViewStyle>;
  discardButtonLabelStyle?: StyleProp<TextStyle>;
  titleId?: string;
  subTitleId?: string;
  continueId?: string;
  discardId?: string;
  crossIconId?: string;
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  crossStyle?: StyleProp<ViewStyle>;
  crossFill?: string;
  isAstrology?: boolean;
  disableDiscardBtn?: boolean;
  disableContinueBtn?: boolean;
}

const Confirm: React.FC<ConfirmProps> = ({
  showCross = true,
  heading = '',
  continueCtaText = 'CONTINUE EDITING',
  title = 'Are you sure you want to leave?',
  subTitle = 'If you discard, you will lose your changes',
  discardCtaText = 'DISCARD',
  onContinue,
  onBackgroundClick,
  onDiscard = () => undefined,
  onCrossClick = () => undefined,
  loading = false,
  components = null,
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
  backgroundColor = 'white',
  crossStyle = {},
  crossFill = 'rgb(133,130,126)',
  isAstrology = false,
  disableDiscardBtn = false,
  disableContinueBtn = false,
}) => {
  const [continueButtonHovered, setContinueButtonHovered] =
    useState<boolean>(false);
  const [discardButtonHovered, setDiscardButtonHovered] =
    useState<boolean>(false);
  const [Component, setComponent] = useState<
    | React.ReactNode
    | React.ReactElement<any, any>
    | (() => React.ReactNode | React.ReactElement<any, any> | null)
    | MemoExoticComponent<any>
  >(components);

  useEffect(() => {
    if (typeof onCrossClick !== 'function' && typeof onDiscard === 'function') {
      onCrossClick = onDiscard;
    }
  }, []);

  useEffect(() => {
    setComponent(components);
  }, [components]);


  function handleOnDismiss() {
    if (typeof onBackgroundClick === 'function') {
      onBackgroundClick();
    } else if (typeof onContinue === 'function') {
      onContinue();
    } else {
      onDiscard();
    }
  }

  return (
    <Portal>
      <Modal
        visible={true}
        onDismiss={handleOnDismiss}
        style={{
          backgroundColor: 'transparent',
          borderRadius: 6,
          paddingHorizontal: 25,
        }}>
        <Animated.View
          entering={ZoomIn.duration(200).damping(0)}
          style={{backgroundColor: backgroundColor, borderRadius: 8}}>
          {isAstrology ? (
            <View>
              {showCross && (
                <TouchableOpacity
                  accessibilityLabel={crossIconId}
                  onPress={onCrossClick}
                  style={[
                    {
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
                    },
                    crossStyle,
                  ]}>
                  <View>
                    <CrossIcon fill={crossFill} testID="cancelButton" />
                  </View>
                </TouchableOpacity>
              )}
              <GradientView style={{borderRadius: 8}}>
                <Dialog.Content>
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
                  {subTitle && subTitle?.length > 0 && (
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
                  {Component && (
                    <View style={componentWrapperStyle}>{Component}</View>
                  )}
                </Dialog.Content>

                {continueCtaText && (
                  <View style={{position: 'relative', zIndex: 1}}>
                    <Button
                      mode="contained"
                      accessibilityLabel={continueId}
                      onPress={onContinue}
                      onPressIn={() => setContinueButtonHovered(true)}
                      onPressOut={() => setContinueButtonHovered(false)}
                      style={[
                        {
                          backgroundColor: continueButtonHovered
                            ? NewTheme.colors.primaryOrange
                            : NewTheme.colors.primaryOrange,
                          zIndex: 99,
                          borderRadius: 8,
                          marginHorizontal: 20,
                          marginVertical: -10,
                          marginBottom: !discardCtaText ? 20 : 0,
                          opacity: disableContinueBtn || loading ? 0.4 : 1,
                        },
                        confirmButtonStyle,
                      ]}
                      labelStyle={[
                        {
                          color: 'white',
                          fontWeight: '700',
                          zIndex: 9,
                          fontSize: 15,
                        },
                        confirmButtonLabelStyle,
                      ]}
                      testID="continueButton"
                      disabled={loading || disableContinueBtn}>
                      {loading ? <Spinner color={'#fff'} /> : continueCtaText}
                    </Button>
                  </View>
                )}

                {discardCtaText && (
                  <Button
                    mode="outlined"
                    onPress={onDiscard}
                    onPressIn={() => setDiscardButtonHovered(true)}
                    onPressOut={() => setDiscardButtonHovered(false)}
                    style={[
                      {
                        backgroundColor: discardButtonHovered
                          ? '#eaeff6'
                          : '#fff',
                        borderWidth: 2,
                        borderColor: 'lightgrey',
                        borderRadius: 8,
                        marginHorizontal: 20,
                        marginVertical: 10,
                        marginBottom: 20,
                        opacity: disableDiscardBtn || loading ? 0.4 : 1,
                      },
                      discardButtonStyle,
                    ]}
                    labelStyle={[
                      {
                        color: NewTheme.colors.darkText,
                        fontWeight: '700',
                        fontSize: 15,
                      },
                      discardButtonLabelStyle,
                    ]}
                    testID="discardButton"
                    accessibilityLabel={discardId}
                    disabled={loading || disableDiscardBtn}>
                    {discardCtaText}
                  </Button>
                )}
              </GradientView>
            </View>
          ) : (
            <>
              {showCross && (
                <TouchableOpacity
                  accessibilityLabel={crossIconId}
                  onPress={onCrossClick}
                  style={[
                    {
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
                    },
                    crossStyle,
                  ]}>
                  <View>
                    <CrossIcon fill={crossFill} testID="cancelButton" />
                  </View>
                </TouchableOpacity>
              )}
              <Dialog.Content>
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
                {subTitle && subTitle?.length > 0 && (
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
                {Component && (
                  <View style={componentWrapperStyle}>{Component}</View>
                )}
              </Dialog.Content>

              {continueCtaText && (
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
                          ? NewTheme.colors.primaryOrange
                          : NewTheme.colors.primaryOrange,
                        zIndex: 10,
                        borderRadius: 8,
                        marginHorizontal: 20,
                        marginVertical: -10,
                        marginBottom: !discardCtaText ? 20 : 0,
                        opacity: disableContinueBtn || loading ? 0.4 : 1,
                      },
                      confirmButtonStyle,
                    ]}
                    labelStyle={[
                      {
                        color: 'white',
                        fontWeight: '700',
                        zIndex: 9,
                        fontSize: 15,
                      },
                      confirmButtonLabelStyle,
                    ]}
                    testID="continueButton"
                    disabled={loading}>
                    {loading ? <Spinner color={'#fff'} /> : continueCtaText}
                  </Button>
                </View>
              )}

              {discardCtaText && (
                <Button
                  mode="outlined"
                  onPress={onDiscard}
                  onPressIn={() => setDiscardButtonHovered(true)}
                  onPressOut={() => setDiscardButtonHovered(false)}
                  style={[
                    {
                      backgroundColor: discardButtonHovered
                        ? '#eaeff6'
                        : '#fff',
                      borderWidth: 2,
                      borderColor: 'lightgrey',
                      borderRadius: 8,
                      marginHorizontal: 20,
                      marginVertical: 10,
                      marginBottom: 20,
                      opacity: disableDiscardBtn || loading ? 0.4 : 1,
                    },
                    discardButtonStyle,
                  ]}
                  labelStyle={[
                    {
                      color: NewTheme.colors.darkText,
                      fontWeight: '700',
                      fontSize: 15,
                    },
                    discardButtonLabelStyle,
                  ]}
                  testID="discardButton"
                  accessibilityLabel={discardId}
                  disabled={loading || disableDiscardBtn}>
                  {discardCtaText}
                </Button>
              )}
            </>
          )}
        </Animated.View>
      </Modal>
    </Portal>
  );
};

Confirm.displayName = 'Confirm';

export default Confirm;
