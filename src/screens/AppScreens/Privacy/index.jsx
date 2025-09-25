import {
  ScrollView,
  View,
  StyleSheet,
  Platform,
  TouchableOpacity,
  SafeAreaView,
  ImageBackground,
} from 'react-native';
import {Text} from 'react-native-paper';
import React from 'react';
import {Linking} from 'react-native';
import {GlobalStyle} from '../../../core';
import {GlobalHeader} from '../../../components';
import {useNavigation} from '@react-navigation/native';
import {Theme} from '../../../common';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from 'react-native-paper';
import { Illustration} from '../../../images';
import NewTheme from '../../../common/NewTheme';
import ErrorBoundary from '../../../common/ErrorBoundary';

const Privacy = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const {top} = useSafeAreaInsets();
  const styles = StyleSheet.create({
    heading: {
      fontSize: 15,
      marginBottom: 3,
      marginHorizontal: 8,
      color: 'black',
      fontWeight: '600',
      marginTop: 10,
      flexWrap: 'wrap',
      textAlign: 'center',
    },
    link: {
      textDecorationLine: 'none',
      color: NewTheme.colors.secondaryLightBlue,
    },
    para: {
      color: 'black',
      padding: 12,
      fontWeight: '600',
      fontSize: 15,
      textAlign: 'center',
    },
    bold: {
      color: 'black',
      padding: 12,
      fontWeight: '800',
      fontSize: 15,
      textAlign: 'center',
    },

    image: {
      height: 400,
      width: 400,
      justifyContent: 'center',
      alignItems: 'center',
    },
    textContainer: {
      textAlign: 'center',
      paddingHorizontal: 20,
    },
    scrollViewContent: {
      padding: 12,
    },
    container: {
      alignItems: 'center',
      marginBottom: 100,
    },
  });

  function handleBack() {
    navigation.goBack();
  }
  const handleTC = () => {
    try {
      const url = 'https://www.imeuswe.in/terms-conditions/';
      Linking.openURL(url);
    } catch (error) {}
  };

  const handlePrivacy = () => {
    try {
      const url = 'https://www.imeuswe.in/privacy-policy/';
      Linking.openURL(url);
    } catch (error) {}
  };
  return (
    <ErrorBoundary>
      <View
        style={{paddingBottom: top}}
        accessibilityLabel="privacy-policy-page">
        <GlobalHeader
          accessibilityLabel="privacyBack"
          onBack={handleBack}
          heading={'Privacy Policy'}
          backgroundColor={Theme.light.background}
          fontSize={24}
        />

        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}>
          <GlobalStyle>
            <View style={styles.container}>
              <View style={{padding: 12, alignItems: 'center'}}>
                <Illustration />
              </View>
              <View>
                <Text style={styles.para}>
                  At iMeUsWe, your privacy and the security of your information
                  are our highest priorities. We adhere to strict privacy
                  guidelines to ensure that your data remains protected.
                </Text>
              </View>
              <View style={{alignItems: 'center'}}>
                <ImageBackground source={{uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/imagepr.png'}} style={styles.image}>
                  <Text style={styles.textContainer}>
                    <Text style={styles.bold}>Ownership of Information</Text>
                    {'\n'}
                    <Text style={styles.para}>
                      You are the sole owner of the information you provide on
                      iMeUsWe. This information remains private to you and your
                      family unless you choose to share it.
                    </Text>
                    {'\n\n\n'}
                    <Text style={styles.bold}>Data Minimisation</Text>
                    {'\n'}
                    <Text style={styles.para}>
                      We are committed to collecting only the minimal amount of
                      data necessary for you to use our services effectively.
                    </Text>
                    {'\n\n\n'}
                    <Text style={styles.bold}>Usage of Data</Text>
                    {'\n'}
                    <Text style={styles.para}>
                      To enhance our product, we may use anonymous and
                      aggregated app usage data. This data will not identify you
                      personally.
                    </Text>
                  </Text>
                </ImageBackground>
              </View>
              <View>
                <Text style={styles.para}>
                  Your trust is important to us, and we are dedicated to
                  safeguarding your privacy at all times.
                </Text>
              </View>
              {Platform.OS === 'ios' ? (
                <View style={{marginHorizontal: 24, marginTop: 10}}>
                  <Text
                    style={{color: 'black', fontWeight: '600', fontSize: 15}}>
                    Head to our website to learn more about our{' '}
                    <Text
                      style={[styles.link, {fontSize: 15, fontWeight: '600'}]}
                      onPress={handleTC}
                      suppressHighlighting={true}>
                      T&Cs
                    </Text>
                    <Text style={{fontWeight: '600'}}> and </Text>
                    <Text
                      style={[styles.link, {fontSize: 15, fontWeight: '600'}]}
                      onPress={handlePrivacy}
                      suppressHighlighting={true}>
                      Privacy policy
                    </Text>
                  </Text>
                </View>
              ) : (
                <View>
                  <Text style={styles.heading}>
                    Head to our website to learn more about our{' '}
                    <Text style={styles.link} onPress={handleTC}>
                      T&Cs
                    </Text>{' '}
                    and{' '}
                    <Text style={styles.link} onPress={handlePrivacy}>
                      Privacy policy
                    </Text>
                  </Text>
                </View>
              )}
            </View>
          </GlobalStyle>
        </ScrollView>
      </View>
    </ErrorBoundary>
  );
};

export default Privacy;
