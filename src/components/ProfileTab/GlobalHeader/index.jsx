import React from 'react';
import {Text} from 'react-native-paper';
import {View, TouchableOpacity, Platform} from 'react-native';
import {BackArrowIcon, DotsHorizontal} from '../../../images';
import {SCREEN_WIDTH} from '../../../constants/Screens';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import HeaderSeparator from '../../../common/HeaderSeparator';
import BetaIcon from '../../../images/Icons/BetaIcon/BetaIcon';
import NewTheme from '../../../common/NewTheme';
import DownloadIcon from '../../../images/Icons/DownloadIcon';

export default function GlobalHeader({
  onBack,
  heading,
  backgroundColor,
  onPressAction,
  isBeta,
  hideDefaultseparator = false,
  hideBackButton = false,
  headerStyles = {},
  showSkipButton = false,
  onSkip = () => {},
  download = false
}) {
  const ios = Platform.OS === 'ios';
  const {top} = useSafeAreaInsets();
  return (
    <View
      style={{
        paddingTop: ios ? top : top,
        backgroundColor: backgroundColor || 'white',
        zIndex: 1001,
        alignItems: 'center',
        ...headerStyles,
      }}>
      <View
        style={{
          width: SCREEN_WIDTH,
          backgroundColor: backgroundColor || 'white',
        }}>
        <TouchableOpacity
          testID="GlobalBackButton"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          {!hideBackButton ? (
            <TouchableOpacity
              accessibilityLabel={`GlobalBackButton-${heading}`}
              style={{padding: 12, marginRight: 10, marginTop: 5}}
              onPress={() => {
                onBack();
              }}>
              <BackArrowIcon />
            </TouchableOpacity>
          ) : (
            <View
              style={{
                padding: 12,
                marginRight: 10,
                marginTop: 30,
              }}>
              <View style={{width: 24}}></View>
            </View>
          )}

          <View
            style={{
              width: '73%',
              flexDirection: 'row',
              justifyContent: 'center',
            }}>
            <Text
              style={{fontSize: 20}}
              variant="bold"
              accessibilityLabel={`Heading-${heading}`}>
              {heading}
            </Text>
            {isBeta && (
              <View style={{paddingLeft: 3}}>
                <BetaIcon />
              </View>
            )}
          </View>
          {onPressAction && (
            <TouchableOpacity
              accessibilityLabel={`GlobalActionButton-${heading}`}
              style={{marginTop: 5}}
              onPress={() => {
                onPressAction();
              }}>
                {
                  download ?    <DownloadIcon stroke="black" />   :     <DotsHorizontal accessibilityLabel={'DotsHorizontal'} />
                }
          
            </TouchableOpacity>
          )}
          {showSkipButton && (
            <TouchableOpacity
              onPress={onSkip}
              hitSlop={{top: 10, left: 25, right: 20, bottom: 10}}
              style={{marginTop: 5}}>
              <Text
                style={{color: NewTheme.colors.primaryOrange, fontSize: 15}}>
                Skip
              </Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
        {!hideDefaultseparator && <HeaderSeparator />}
      </View>
    </View>
  );
}
