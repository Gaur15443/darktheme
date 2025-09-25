/** @format */

// Colors based on your UI palette
const light = {
  // Primary Colors
  primary: '#E77237',
  primaryAlt: '#FFFFFF',

  // Background Colors
  backgroundMobile: '#FEF9F1',
  backgroundWeb: '#F8F7FA',

  // Secondary Colors
  secondary1: '#FFCA01',
  secondary2: '#035997',
  secondary3: '#2892FF',

  // Text Colors
  textPrimary: '#444444',
  textSecondary: '#888888',
  textBlack: '#000000',

  // Family Wall Elements
  familyWallStories: '#2DAAFF',
  familyWallAudio: '#27C394',
  familyWallMoments: '#EFBE29',
  familyWallQuotes: '#FF4F4F',
};

const dark = {
  // Primary Colors
  primary: '#E77237',
  primaryAlt: '#212124',

  // Background Colors
  backgroundMobile: '#131416',
  backgroundWeb: '#131416',

  // Secondary Colors
  secondary1: '#533300',
  secondary2: '#FFFFFF',
  secondary3: '#6990CE',

  // Text Colors
  textPrimary: '#FFFFFF',
  textSecondary: '#EDEDED',
  textMuted: '#777777',

  // Family Wall Elements
  familyWallStories: '#005086',
  familyWallAudio: '#007351',
  familyWallMoments: '#8B6800',
  familyWallQuotes: '#720000',
};

// Font settings
const fontWeights = {
  light: '200',
  normal: '400',
  bold: '700',
};

const fontSizes = {
  text: {
    sm: 12,
    md: 14,
    lg: 16,
  },
  heading: {
    sm: 22,
    md: 30,
    lg: 40,
  },
};

const fontFamily = {
  primary: 'PublicSans-Regular',
  secondary: 'Quicksand-Regular',
};

const fonts = {
  weight: fontWeights,
  size: fontSizes,
  family: fontFamily,
};

export default { light, dark, fonts };
