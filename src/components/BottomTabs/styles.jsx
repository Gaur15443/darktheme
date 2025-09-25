import NewTheme from '../../common/NewTheme';
import Theme from '../../common/Theme';
import { SCREEN_WIDTH } from '../../constants/Screens';
import { Platform } from 'react-native';

const { StyleSheet } = require('react-native');

const centerLinkWidth = 100;
const sideLinksWidth = SCREEN_WIDTH / 2 - centerLinkWidth;

const styles = StyleSheet.create({
  animationContainer: {
    position: 'relative',
    width: 30,
    height: 30,
  },
  redDotActive: {
    position: 'absolute',
    top: 2,
    right: 4,
    width: 11,
    height: 11,
    borderRadius: 5,
    backgroundColor: 'red',
  },
  redDotNonActive: {
    position: 'absolute',
    top: 6,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'red',
  },
  redDotSmall: {
    position: 'absolute',
    top: 7,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 3,
    backgroundColor: 'red',
  },
  redDotBellIcon: {
    position: 'absolute',
    top: 9,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 5,
    backgroundColor: 'red',
  },
  linkContainer: {
    width: sideLinksWidth,
    height: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 0 : 4,
    paddingTop: 5,
  },
  leftRadius: {
    borderTopLeftRadius: 44,
  },
  rightRadius: {
    borderTopRightRadius: 44,
  },
  circle: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    backgroundColor: Theme.light.onWhite100,
    width: 60,
    height: 60,
    top: -35,
    borderRadius: 30,
    alignSelf: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.19,
    shadowRadius: 5.62,
    elevation: 6,
  },
  centerLinkContainer: {
    position: 'relative',
    zIndex: 2,
    height: '100%',
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  centerLink: {
    height: 75 / 2,
    width: centerLinkWidth,
    backgroundColor: Theme.light.onWhite100,
    position: 'relative',
    zIndex: 1,
  },
  curve: {
    zIndex: 1,
    top: 48,
    right: 0,
    left: 0,
  },
  linkText: {
    fontSize: 12,
  },
  bellIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    marginTop: 10,
  },
  bellIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeHeaderRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default styles;
