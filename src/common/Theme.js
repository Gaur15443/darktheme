/** @format */

// Colors based on your Figma palette
const light = {
  primary: '#E77237',
  backgroundMobile: '#FEF9F1',
  backgroundWeb: '#F8F7FA',
  secondary1: '#FFCA01',
  secondary2: '#035997',
  secondary3: '#2892FF',
  textPrimary: '#444444',
  textSecondary: '#888888',
  textBlack: '#000000',
  familyWallStories: '#2DAAFF',
  familyWallAudio: '#27C394',
  familyWallMoments: '#EFBE29',
  familyWallQuotes: '#FF4F4F',
};

const dark = {
  primary: '#E77237',
  primaryAlt: '#212124',
  backgroundMobile: '#131416',
  backgroundWeb: '#131416',
  secondary1: '#533300',
  secondary2: '#FFFFFF',
  secondary3: '#6990CE',
  textPrimary: '#FFFFFF',
  textSecondary: '#EDEDED',
  textMuted: '#777777',
  familyWallStories: '#005086',
  familyWallAudio: '#007351',
  familyWallMoments: '#8B6800',
  familyWallQuotes: '#720000',
};

// font
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
