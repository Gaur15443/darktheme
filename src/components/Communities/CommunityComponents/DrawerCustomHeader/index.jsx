import React, {useEffect, useRef, useState} from 'react';
import {Text} from 'react-native-paper';
import {View, TouchableOpacity, Platform} from 'react-native';
import {SCREEN_WIDTH} from '../../../../constants/Screens';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import NewTheme from '../../../../common/NewTheme';
import CustomHamburger from './CustomHamburger';
import SearchIcon from '../../../../images/Icons/SearchIcon';
import CommunityInfoScreen from '../../MainScreens/CommunityHomeScreen/CommunityInfoScreen';
import { CommunityInfo } from '../../../../images';

export default function DrawerCustomHeader({
  toggleDrawer,
  heading,
  drawerVisible,
  backgroundColor,
  onPressAction,

  hideBackButton = false,
  headerStyles = {},
}) {
  const ios = Platform.OS === 'ios';
  const {top} = useSafeAreaInsets();

  const hasVisitedRef = useRef(true);
  const [infoVisible, setInfoVisible] = useState(false);

  useEffect(() => {
    if (!hasVisitedRef.current) {
      hasVisitedRef.current = true;
    }

    return () => {
      hasVisitedRef.current = false;
    };
  }, []);

  return (
    <View
      style={{
        // elevation: 7,
        ...Platform.select({
          ios: {
            // shadowColor: '#333',
            // shadowOffset: {width: 0, height: 4},
            // shadowOpacity: 0.3,
            // shadowRadius: 2,
          },
        }),

        paddingTop: ios ? 0 : top,
        backgroundColor: backgroundColor || NewTheme.colors.backgroundCreamy,
        zIndex: 1001,
        alignItems: 'center',
        ...headerStyles,
      }}>
      <View
        style={{
          width: SCREEN_WIDTH,
          backgroundColor: backgroundColor || NewTheme.colors.backgroundCreamy,
        }}>
        <TouchableOpacity
          testID="GlobalBackButton"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            height: 52,
            marginRight: -25,
          }}>
          {!hideBackButton ? (
            <View
              style={{
                width: 50,
                alignItems: 'center',
                // marginLeft: 20,
              }}>
              <CustomHamburger
                onPress={toggleDrawer}
                drawerVisible={drawerVisible}
                hasVisitedRef={hasVisitedRef}
                clickableAreaSize={{
                  top: 20,
                  bottom: 20,
                  left: 40,
                  right: 40,
                }}
              />
            </View>
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
              alignItems: 'center',
              // justifyContent: 'center',
            }}>
            <Text
              style={{
                fontSize: 22,
                ...(Platform.OS === 'android' && {lineHeight: 24}),
              }}
              variant="bold"
              accessibilityLabel={`Heading-${heading}`}>
              {heading}
            </Text>
            <TouchableOpacity style={{marginLeft: 5, marginTop: 2 }} onPress={() => setInfoVisible(true)}>
              <CommunityInfo />
            </TouchableOpacity>
          </View>
          {onPressAction && (
            <TouchableOpacity
              accessibilityLabel={`GlobalActionButton-${heading}`}
              onPress={() => {
                onPressAction();
              }}>
              <SearchIcon width={24} height={24} color="black" />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </View>
      <CommunityInfoScreen visible={infoVisible} onClose={() => setInfoVisible(false)} />
    </View>
  );
}
