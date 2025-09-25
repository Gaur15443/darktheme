/** @format */

import {Dimensions} from 'react-native';

const {width, height} = Dimensions.get('window');

const Constants = {
  Language: 'en', // ar, en. Default to set redux. Only use first time
  fontFamily: 'OpenSans',
  fontHeader: 'Baloo',
  fontHeaderAndroid: 'Baloo',
  // SplashScreen: {
  //   Duration: 2000,
  // },
  Dimension: {
    ScreenWidth(percent = 1) {
      return Dimensions.get('window').width * percent;
    },
    ScreenHeight(percent = 1) {
      return Dimensions.get('window').height * percent;
    },
  },
  TagIdForProductsInMainCategory: 263,
  Window: {
    width,
    height,
    headerHeight: (65 * height) / 100,
    headerBannerAndroid: (55 * height) / 100,
    profileHeight: (45 * height) / 100,
  },
  fontText: {
    size: 16,
  },
};

export default Constants;
