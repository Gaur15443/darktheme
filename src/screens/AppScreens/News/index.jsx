import React from 'react';
import {View, StyleSheet, Platform} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ListofNews from '../../../components/News/ListofNews/index';
import {GlobalHeader} from '../../../components';
import {useTheme} from 'react-native-paper';
import newTheme from '../../../common/NewTheme';
import ErrorBoundary from '../../../common/ErrorBoundary';

const News = () => {
  const {top} = useSafeAreaInsets();
  const navigation = useNavigation();
  const theme = useTheme();

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <ErrorBoundary.Screen>
      <View
        style={[styles.container, {paddingBottom: top}]}
        accessibilityLabel="news-page">
        <GlobalHeader
          accessibilityLabel="newsBack"
          onBack={handleBack}
          heading={'News'}
          backgroundColor={newTheme.colors.backgroundCreamy}
          fontSize={24}
        />
        <ListofNews />
      </View>
    </ErrorBoundary.Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: Platform.OS === 'ios'?0:1,
    marginBottom: 50,
    backgroundColor: newTheme.colors.backgroundCreamy,
  },
});

export default News;
