import { StyleSheet } from 'react-native';

export const createStoryStyles = StyleSheet.create({
  backgroundColor: '#FEF8F1',
  /**
   * ios doesn't center label, this is workaround for it.
   */
  titlePadding: {
    paddingTop: 2,
  },
  inputContainer: {
    borderRadius: 8,
    marginHorizontal: 28,
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: '#FEF8F1',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
  },
  mediapickerContainer: {
    borderRadius: 8,
    width: 75,
    height: 60,
    //marginHorizontal: 28,
    //marginTop: 3,
    //marginBottom: 7,
    backgroundColor: '#FFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    marginLeft: 32,
    // padding: 2,
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
  },
});
