import React, {useRef, useCallback, useState} from 'react';
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  Animated,
  FlatList,
  Platform,
} from 'react-native';
import {Text, useTheme} from 'react-native-paper';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';

import HoroscopeCard from '../../../components/HoroscopeCard';
import AstroHeader from '../../../common/AstroHeader';
import HoroscopeDivider from '../../../images/Icons/HoroscopeDivider';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Track} from '../../../../App';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const zodiacSigns = [
  {
    name: 'Aries',
    image:
      'https://testing-email-template.s3.ap-south-1.amazonaws.com/zodiac_signs/Aries.png',
  },
  {
    name: 'Taurus',
    image:
      'https://testing-email-template.s3.ap-south-1.amazonaws.com/zodiac_signs/Taurus.png',
  },
  {
    name: 'Gemini',
    image:
      'https://testing-email-template.s3.ap-south-1.amazonaws.com/zodiac_signs/Gemini.png',
  },
  {
    name: 'Cancer',
    image:
      'https://testing-email-template.s3.ap-south-1.amazonaws.com/zodiac_signs/Cancer.png',
  },
  {
    name: 'Leo',
    image:
      'https://testing-email-template.s3.ap-south-1.amazonaws.com/zodiac_signs/Leo.png',
  },
  {
    name: 'Virgo',
    image:
      'https://testing-email-template.s3.ap-south-1.amazonaws.com/zodiac_signs/Virgo.png',
  },
  {
    name: 'Libra',
    image:
      'https://testing-email-template.s3.ap-south-1.amazonaws.com/zodiac_signs/Libra.png',
  },
  {
    name: 'Scorpio',
    image:
      'https://testing-email-template.s3.ap-south-1.amazonaws.com/zodiac_signs/Scorpio.png',
  },
  {
    name: 'Sagittarius',
    image:
      'https://testing-email-template.s3.ap-south-1.amazonaws.com/zodiac_signs/Sagittarius.png',
  },
  {
    name: 'Capricorn',
    image:
      'https://testing-email-template.s3.ap-south-1.amazonaws.com/zodiac_signs/Capricorn.png',
  },
  {
    name: 'Aquarius',
    image:
      'https://testing-email-template.s3.ap-south-1.amazonaws.com/zodiac_signs/Aquarius.png',
  },
  {
    name: 'Pisces',
    image:
      'https://testing-email-template.s3.ap-south-1.amazonaws.com/zodiac_signs/Pisces.png',
  },
];

export default function Horoscope() {
  const horoscopeBirthDetails = useSelector(
    state => state.astroHoroscope.horoscopeBirthDetails,
  );

  const ITEM_WIDTH = SCREEN_WIDTH / 3;
  const CARD_FULL_HEIGHT =
    !horoscopeBirthDetails?.data?.horoscopeReport?.generatedStatus &&
    horoscopeBirthDetails?.data?.horoscopeReport?.isFormSubmitted
      ? 308
      : 258;
  const CARD_SHRUNK_HEIGHT = 100;
  const SCROLL_THRESHOLD = 150;

  const theme = useTheme();
  const navigator = useNavigation();
  const insets = useSafeAreaInsets();
  const [isShrunk, setIsShrunk] = useState(false);

  const userData = useSelector(s => s.userInfo);
  const isPersonalisedHoroscopeEnabled = useSelector(
    s => s.astroFeature.isPersonalisedHoroscopeEnabled,
  );

  const scrollY = useRef(new Animated.Value(0)).current;

  const APP_HEADER_HEIGHT = 56;
  const HEADER_OFFSET = APP_HEADER_HEIGHT + insets.top;

  useFocusEffect(
    useCallback(() => {
      Track({
        cleverTapEvent: 'Horoscope_Page_Visited',
        mixpanelProps: 'Horoscope_Page_Visited',
        userData,
      });
    }, [userData]),
  );

  const cardHeight = scrollY.interpolate({
    inputRange: [0, SCROLL_THRESHOLD],
    outputRange: [CARD_FULL_HEIGHT, CARD_SHRUNK_HEIGHT],
    extrapolate: 'clamp',
  });

  const handleScroll = Animated.event(
    [{nativeEvent: {contentOffset: {y: scrollY}}}],
    {
      useNativeDriver: false,
      listener: event => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setIsShrunk(offsetY >= SCROLL_THRESHOLD);
      },
    },
  );

  const handlePress = (sign, image) => {
    const props = {Rashi: sign};
    Track({
      userData,
      cleverTapEvent: 'Horoscope_Rashi_Accessed',
      mixpanelEvent: 'Horoscope_Rashi_Accessed',
      cleverTapProps: props,
      mixpanelProps: props,
    });
    navigator.navigate('AstroHoroscopeBySign', {zodiacSign: sign, image});
  };

  const renderGridItem = ({item}) => (
    <TouchableOpacity
      style={[styles.card, {width: ITEM_WIDTH}]}
      onPress={() => handlePress(item.name, item.image)}>
      <View style={styles.imageContainer}>
        <Image source={{uri: item.image}} style={styles.image} />
      </View>
      <Text style={styles.name}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{flex: 1, backgroundColor: theme.colors.background}}>
      <AstroHeader>
        <AstroHeader.Content title="Horoscope" />
      </AstroHeader>

      {isPersonalisedHoroscopeEnabled && (
        <Animated.View
          style={[
            styles.fixedHeader,
            {
              overflow: 'hidden',
              top: Platform.OS === 'ios' ? HEADER_OFFSET - 5 : HEADER_OFFSET,
              height: cardHeight,
            },
          ]}>
          <HoroscopeCard
            screen="Horoscope"
            height="100%"
            width="100%"
            isScrolling={isShrunk}
          />
        </Animated.View>
      )}

      <AnimatedFlatList
        data={zodiacSigns}
        keyExtractor={item => item.name}
        numColumns={3}
        renderItem={renderGridItem}
        contentContainerStyle={{
          paddingTop: isPersonalisedHoroscopeEnabled
            ? !horoscopeBirthDetails?.data?.horoscopeReport?.generatedStatus &&
              horoscopeBirthDetails?.data?.horoscopeReport?.isFormSubmitted
              ? 320
              : 180 + HEADER_OFFSET
            : 0,
          paddingBottom:
            Platform.OS === 'ios'
              ? Math.max(SCREEN_HEIGHT * 0.1)
              : Math.max(SCREEN_HEIGHT * 0.1 - 40),
        }}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        overScrollMode="never"
        ListHeaderComponent={
          <View style={{marginTop: 0, alignItems: 'center'}}>
            <HoroscopeDivider />
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fixedHeader: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 8,
  },
  columnWrapper: {
    justifyContent: 'center',
  },
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 95,
    height: 95,
    borderRadius: 50,
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
    textAlign: 'center',
  },
});
