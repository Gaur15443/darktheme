import React, {useState} from 'react';

import {Pressable, View} from 'react-native';
import Swiper from 'react-native-swiper';
import GradientView from '../../../common/gradient-view';
import {Text} from 'react-native-paper';
import {
  NavigationProp,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import {memo} from 'react';
import {SliderProps} from './index.d';
import FastImage from '@d11/react-native-fast-image';
import ErrorBoundary from '../../../common/ErrorBoundary';
import {useSelector} from 'react-redux';
import {RootState} from '../../../store';
import {Track} from '../../../../App';

const MemoizedSwiper = memo(
  ({vedic, onIndexChanged = () => {}}: SliderProps) => {
    const pageIsFocused = useIsFocused();
    return (
      <Swiper
        autoplay={pageIsFocused}
        autoplayTimeout={3}
        containerStyle={{height: 394, width: '100%'}}
        activeDotColor="#FFFFFF"
        dotColor="#FFFFFF40"
        onIndexChanged={index => {
          onIndexChanged(index);
        }}>
        {vedic.banners.map((item: {url: string; text: string}) => (
          <View
            key={item.url}
            style={{
              height: 300,
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'row',
              // backgroundColor: 'red'
            }}>
            <View style={{width: '50%'}}>
              <Text
                variant="headlineMedium"
                style={{fontSize: 24, color: '#FFFFFF', paddingLeft: 20}}>
                {item.text}
              </Text>
            </View>
            <FastImage
              source={{uri: item.url}}
              resizeMode="contain"
              style={{width: '50%', aspectRatio: 1}}
            />
          </View>
        ))}
      </Swiper>
    );
  },
);

const Slider = memo(({vedic}: SliderProps) => {
  const navigation = useNavigation<NavigationProp<any>>();
  const userData = useSelector((state: RootState) => state.userInfo);
  const [activeIndex, setActiveIndex] = useState(0);
  if (!Array.isArray(vedic?.banners)) return null;

  return (
    <ErrorBoundary>
      <View
        style={{
          borderWidth: 1,
          borderColor: '#FFFFFF33',
          borderRadius: 8,
          overflow: 'hidden',
          marginVertical: 10,
          height: 370,
          // backgroundColor: 'pink'
        }}>
        <MemoizedSwiper vedic={vedic} onIndexChanged={setActiveIndex} />
        <Pressable
          onPress={() => {
            Track({
              cleverTapEvent: 'Reports_CTA_Homepage',
              mixpanelEvent: 'Reports_CTA_Homepage',
              userData,
            });
            navigation.navigate('Reports');
          }}
          style={{
            margin: 20,
            borderRadius: 8,
            overflow: 'hidden',
            borderColor:
              activeIndex === 0
                ? '#6944D3'
                : activeIndex === 1
                  ? 'rgba(224, 71, 0, 1)'
                  : 'rgba(3, 87, 255, 1)',
            borderWidth: 1,
          }}>
          <GradientView
            colors={
              activeIndex === 0
                ? undefined
                : activeIndex === 1
                  ? ['rgba(224, 71, 0, 1)', 'rgba(125, 20, 1, 1)']
                  : ['rgba(7, 18, 126, 1)', 'rgba(0, 78, 183, 1)']
            }
            contentStyle={{paddingVertical: 10}}>
            <Text style={{textAlign: 'center'}}>Know more</Text>
          </GradientView>
        </Pressable>
      </View>
    </ErrorBoundary>
  );
});

export default Slider;
