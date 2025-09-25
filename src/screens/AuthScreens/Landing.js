import {
  StyleSheet,
  View,
  useWindowDimensions,
  Image,
} from 'react-native';
import React from 'react';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedRef,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import Pagination from '../../animation/landingPage/Pagination';
import {Text, useTheme} from 'react-native-paper';
import CustomButton from '../../animation/landingPage/CustomButton';
import {SafeAreaView} from 'react-native-safe-area-context';
import {SCREEN_WIDTH} from '@gorhom/bottom-sheet';

const Landing = ({navigation}) => {
  const {width: SCREEN_WIDTH} = useWindowDimensions();
  const flatListRef = useAnimatedRef(null);
  const x = useSharedValue(0);
  const flatListIndex = useSharedValue(0);
  const theme = useTheme();

  const onViewableItemsChanged = ({viewableItems}) => {
    flatListIndex.value = viewableItems[0]?.index;
  };

  const onScroll = useAnimatedScrollHandler({
    onScroll: event => {
      x.value = event.contentOffset.x;
    },
  });

  const slides = [
    {
      id: 1,
      src: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/co-img/slide1.png',
      title: 'Build your family tree',
      text: 'With iMeUsWe, your family tree is not just a record of your past but a gateway to your present and a legacy for the future.',
    },
    {
      id: 2,
      src: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/co-img/slide2.png',
      title: 'Preserve & share stories for generations',
      text: 'Uncover hidden family stories & collaboratively write stories with family members.',
    },
    {
      id: 3,
      src: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/slide4.png',
      title: 'Join Communities',
      text: 'Discover new connections beyond your family. Join communities of like-minded individuals to share, collaborate, and grow together.',
    },
    {
      id: 4,
      src: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/co-img/slide3.png',
      title: 'Access billions of historical records',
      text: 'Imagine tracing your entire family history at your fingertips. With iMeUsWe, the dream becomes a reality.',
    },
    {
      id: 5,
      src: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/slide5.png',
      title: 'Deep dive into your life with Astrology',
      text: 'Experience trusted astrological guidance rooted in Vedic wisdom — with personalized reports, daily horoscopes, kundli insights, matchmaking, and more.',
    },
  ];

  // eslint-disable-next-line react/no-unstable-nested-components
  const RenderItem = ({item, index}) => {
    const imageAnimationStyle = useAnimatedStyle(() => {
      const opacityAnimation = interpolate(
        x.value,
        [
          (index - 1) * SCREEN_WIDTH,
          index * SCREEN_WIDTH,
          (index + 1) * SCREEN_WIDTH,
        ],
        [0, 1, 0],
        Extrapolation.CLAMP,
      );
      const translateYAnimation = interpolate(
        x.value,
        [
          (index - 1) * SCREEN_WIDTH,
          index * SCREEN_WIDTH,
          (index + 1) * SCREEN_WIDTH,
        ],
        [100, 0, 100],
        Extrapolation.CLAMP,
      );
      return {
        opacity: opacityAnimation,
        width: '100%',
        borderRadius: 5,
        height: SCREEN_WIDTH * 0.8,
        transform: [{translateY: translateYAnimation}],
      };
    });
    const textAnimationStyle = useAnimatedStyle(() => {
      const opacityAnimation = interpolate(
        x.value,
        [
          (index - 1) * SCREEN_WIDTH,
          index * SCREEN_WIDTH,
          (index + 1) * SCREEN_WIDTH,
        ],
        [0, 1, 0],
        Extrapolation.CLAMP,
      );
      const translateYAnimation = interpolate(
        x.value,
        [
          (index - 1) * SCREEN_WIDTH,
          index * SCREEN_WIDTH,
          (index + 1) * SCREEN_WIDTH,
        ],
        [100, 0, 100],
        Extrapolation.CLAMP,
      );

      return {
        opacity: opacityAnimation,
        transform: [{translateY: translateYAnimation}],
      };
    });
    const imageSource =
      typeof item.src === 'string' ? {uri: item.src} : item.src;

    return (
      <View style={[styles.itemContainer, {width: SCREEN_WIDTH}]}>
        <Animated.Image source={imageSource} style={imageAnimationStyle} />
        <Animated.View style={textAnimationStyle}>
          <View style={{marginVertical: 25}}>
            <Text variant="headlineMedium" style={styles.itemTitle}>
              {item.title}
            </Text>
            <Text style={styles.itemText}>{item.text}</Text>
          </View>
        </Animated.View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={{
          uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/Default.png',
        }}
        style={styles.logo}
      />

      <Animated.FlatList
        ref={flatListRef}
        onScroll={onScroll}
        data={slides}
        renderItem={({item, index}) => {
          return <RenderItem item={item} index={index} />;
        }}
        keyExtractor={item => item.id}
        scrollEventThrottle={16}
        horizontal={true}
        bounces={false}
        pagingEnabled={true}
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{
          minimumViewTime: 300,
          viewAreaCoveragePercentThreshold: 10,
        }}
      />
      <View style={styles.bottomContainer}>
        <Pagination data={slides} x={x} screenWidth={SCREEN_WIDTH} />
        <CustomButton
          flatListRef={flatListRef}
          flatListIndex={flatListIndex}
          dataLength={slides.length}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  logo: {
    width: 230,
    height: 100,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: 10,
  },
  itemContainer: {
    flex: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  itemTitle: {
    textAlign: 'center',
    fontSize: 24,
    width: SCREEN_WIDTH - 20,
    marginBottom: 10,
    color: 'black',
    fontWeight: '600',
    lineHeight: 20 * 1.5,
  },
  itemText: {
    textAlign: 'center',
    marginHorizontal: 8,
    color: '#000000',
    fontSize: 20,
    letterSpacing: 0,
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingVertical: 20,
  },
});
export default Landing;
