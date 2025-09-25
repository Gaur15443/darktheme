import {LockIcon} from '../../../../images';
import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text} from 'react-native-paper';
import theme from '../../../../common/NewTheme';

const PrivateCommunityPopup = () => {
  return (
    <View
      style={styles.popupContainer}
      accessibilityLabel="Private community popup"
      accessible={true}>
      <View style={styles.popup}>
        <LockIcon />
        <Text
          variant="bold"
          style={styles.title}
          accessibilityLabel="This community is private">
          This community is private
        </Text>
        <View>
          <Text
            accessibilityLabel="Join the community to"
            style={styles.message}>
            Join the community to
          </Text>
          <Text accessibilityLabel="view the content" style={styles.message}>
            view the content
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  popupContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{translateX: -129}, {translateY: -108.5}],
    width: 258,
    height: 167,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
    // flexDirection:'row'
  },
  popup: {
    width: '100%',
    paddingVertical: 20,
    backgroundColor: theme.colors.secondaryLightPeach,
    borderRadius: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 10,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default PrivateCommunityPopup;
