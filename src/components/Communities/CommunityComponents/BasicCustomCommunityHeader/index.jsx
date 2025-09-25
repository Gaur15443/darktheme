import {BackIcon} from '../../../../images';
import React from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import {Text, useTheme} from 'react-native-paper';

const BasicCustomCommunityHeader = ({
  leftComponent,
  rightComponent,
  onPressLeft,
  onPressRight,
  title,
  subTitle,
  titleStyle = {},
  subTitleStyle = {},
  rightComponentStyle = {},
  headerContainerStyle = {},
}) => {
  const theme = useTheme();

  return (
    <View style={[styles.headerContainer, headerContainerStyle]}>
      <TouchableOpacity style={styles.leftComponent} onPress={onPressLeft}>
        {leftComponent ? leftComponent : <BackIcon />}
      </TouchableOpacity>

      <View style={styles.titleContainer}>
        <Text
          variant="bold"
          style={[styles.title, {color: theme.colors.text}, titleStyle]}>
          {title}
        </Text>
        {subTitle && (
          <Text style={[styles.subTitle, subTitleStyle]}>{subTitle}</Text>
        )}
      </View>
      <TouchableOpacity
        style={[styles.rightComponent, rightComponentStyle]}
        onPress={onPressRight}
        disabled={!onPressRight}>
        {rightComponent ? rightComponent : null}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 67,
    alignItems: 'center',
    marginBottom: 10,
  },
  leftComponent: {
    width: 28,
    height: 28,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
  },
  subTitle: {fontSize: 12, textAlign: 'center'},
  rightComponent: {
    width: 28,
    height: 28,
    alignItems: 'flex-end',
  },
});

export default BasicCustomCommunityHeader;
