import React from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {WebView} from 'react-native-webview';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useHeaderHeight} from '@react-navigation/elements';
import {Theme, Constants} from '../../../common';
import {GlobalHeader} from '../../../components';
import {useNavigation} from '@react-navigation/native';
import ErrorBoundary from '../../../common/ErrorBoundary';
const FeedbackSurvey = () => {
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation();
  const styles = createStyles();
  const {top} = useSafeAreaInsets();
  function handleBack() {
    navigation.goBack();
  }

  return (
    <ErrorBoundary.Screen>
      <GlobalHeader
        onBack={handleBack}
        heading={'Feedback Survey'}
        backgroundColor={Theme.light.background}
        fontSize={20}
      />

      <View style={styles.container} accessibilityLabel="feedback-survay-page">
        <ScrollView showsVerticalScrollIndicator={false}>
          <View>
            <View style={styles.FeedbackSurveydiv} />
            <View style={styles.myIframe}>
              <WebView
                nestedScrollEnabled
                source={{
                  uri: 'https://forms.office.com/Pages/ResponsePage.aspx?id=vIVfr9ycnUyVqn-stMkW-QALBcWr_alArOgsNVNZnNhUMjZRT0gwNDBQQU44Q0tKU004TUs3R0VRWC4u',
                }}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </ErrorBoundary.Screen>
  );
};

function createStyles() {
  const headerHeight = useHeaderHeight();

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Theme.light.background,
      paddingHorizontal: 10,
    },
    FeedbackSurveydiv: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    backButton: {
      marginRight: 10,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    myIframe: {
      height: Constants.Dimension.ScreenHeight() - headerHeight - 20,

      overflow: 'scroll',
    },
  });
}

export default FeedbackSurvey;
