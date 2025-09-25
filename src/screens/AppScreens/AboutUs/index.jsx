import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  ScrollView,
} from 'react-native';
import {GlobalStyle} from '../../../core';
import {Text} from 'react-native-paper';
import DeviceInfo from 'react-native-device-info';
import {
  AboutTree,
  FamilyStory,
  AboutAccess,
  Facebook,
  Instragram,
  Twitter,
  Youtube,
  LinkedThread,
  LinkedIn,
  AboutUsDna,
  AboutUsCommunity,
} from '../../../images';
import {Theme} from '../../../common';
import {GlobalHeader} from '../../../components';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from 'react-native-paper';
import ErrorBoundary from '../../../common/ErrorBoundary';

const AboutUs = () => {
  const [appVersion, setAppVersion] = useState('');
  const navigation = useNavigation();
  const theme = useTheme();
  const {top} = useSafeAreaInsets();
  function handleBack() {
    navigation.goBack();
  }
  const handleSocialMediaPress = url => {
    Linking.openURL(url).catch(() => {});
  };

  useEffect(() => {
    setAppVersion(DeviceInfo.getVersion());
  }, []);

  return (
    <ErrorBoundary.Screen>
      <View
        style={{paddingBottom: top, flex: 1}}
        accessibilityLabel="aboutUs-page">
        <GlobalHeader
          accessibilityLabel="aboutBack"
          onBack={handleBack}
          heading={'About iMeUsWe'}
          backgroundColor={Theme.light.background}
          fontSize={24}
        />

        <GlobalStyle>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.container}>
              <View style={styles.logoContainer}>
                <Image
                  style={styles.imuwLogo}
                  source={{ uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/Default.png' }}
                />
              </View>

              <View style={styles.textContainer}>
                <Text style={[styles.bold, {paddingBottom: 12}]}>
                  What is iMeUsWe?
                </Text>
                <Text style={styles.paragraph}>
                  iMeUsWe is an award-winning app, designed to empower you to
                  forge enduring and sacred connections with your loved ones.
                  {'\n\n'}
                  The essence of iMeUsWe encapsulates the idea of unity and
                  togetherness, focusing on the remarkable and distinct
                  narratives and celebrations within each family, destined to be
                  cherished for generations to come.
                  {'\n\n\n'}
                  <Text style={styles.bold}>What can you do on iMeUsWe?</Text>
                  {'\n'}
                </Text>

                <View style={styles.row}>
                  <View style={styles.column2}>
                    <AboutTree />
                  </View>
                  <View style={styles.column10}>
                    <Text style={styles.para}>
                      <Text style={{fontWeight: '700'}}>
                        Build your family tree
                      </Text>
                      {'\n'}
                      <Text>
                        Create a lasting legacy for your family by preserving
                        your history for future generations.
                      </Text>
                    </Text>
                  </View>
                </View>

                <View style={styles.row}>
                <View style={styles.column2}>
                  <AboutUsCommunity />
                </View>
                <View style={styles.column10}>
                  <Text style={styles.para}>
                    <Text style={{fontWeight: '700'}}>Join communities</Text>
                    {'\n'}
                    <Text>
                    Discover new connections beyond your family. Join communities of like-minded individuals to share, collaborate, and grow together.
                    </Text>
                  </Text>
                </View>
              </View>

                <View style={styles.row}>
                  <View style={styles.column2}>
                    <FamilyStory />
                  </View>
                  <View style={styles.column10}>
                    <Text style={styles.para}>
                      <Text style={{fontWeight: '700'}}>
                        Share family stories
                      </Text>
                      {'\n'}
                      <Text>
                        Bring memories to life by sharing cherished stories with
                        your family, ensuring they're never forgotten.
                      </Text>
                    </Text>
                  </View>
                </View>

                <View style={styles.row}>
                <View style={styles.column2}>
                  <AboutUsDna />
                </View>
                <View style={styles.column10}>
                  <Text style={styles.para}>
                    <Text style={{fontWeight: '700'}}>Get your DNA tested</Text>
                    {'\n'}
                    <Text>
                      Our DNA tests offer valuable genetic insights for informed
                      health decisions. Explore your ancestry and heritage
                      through comprehensive DNA analysis with us.
                    </Text>
                  </Text>
                </View>
              </View>

                <View style={styles.row}>
                  <View style={styles.column2}>
                    <AboutAccess />
                  </View>
                  <View style={styles.column10}>
                    <Text style={styles.para}>
                      <Text style={{fontWeight: '700'}}>
                        Access to an extensive database
                      </Text>
                      {'\n'}
                      <Text>
                        Gain a more complete picture of your family history by
                        accessing a vast collection of historical records.
                      </Text>
                    </Text>
                  </View>
                </View>

                <View style={[styles.row, { alignItems: 'center' }]}>
                  <View style={styles.column2}>
                     <Image
                                      source={{
                                            uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/horoscope.png',
                                      }}
                                       style={styles.imuwHoroscopeLogo}
                                    />
                  </View>
                  <View style={styles.column10}>
                    <Text style={styles.para}>
                      <Text style={{fontWeight: '700'}}>
                        Astrology Service 
                      </Text>
                      {'\n'}
                      <Text>
                        Rooted in Vedic wisdom, our astrology service offers trusted guidance through accurate horoscopes, detailed panchang, 36-guna matchmaking, and personalised reports for career, marriage, and kundli insights.
                      </Text>
                    </Text>
                  </View>
                </View>

              </View>

              <View style={styles.versionContainer}>
                <Text style={[styles.versionText, {fontWeight: '500'}]}>
                  Version {appVersion}
                </Text>
              </View>

              <View style={styles.chooseUsContainer}>
                {/* <ImuwChooseus /> */}
                {/* <Text style={[styles.versionText, {fontWeight: '600'}]}>
                  Follow us on social media
                </Text> */}
              </View>
              <View style={styles.chooseUsContainer1}>
                <TouchableOpacity
                  accessibilityLabel="facebook-media"
                  style={styles.tinyLogo1}
                  onPress={() =>
                    handleSocialMediaPress(
                      'https://www.facebook.com/I-Me-Us-We-105148551935968',
                    )
                  }>
                  <Facebook />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.tinyLogo2}
                  accessibilityLabel="instamedia"
                  onPress={() =>
                    handleSocialMediaPress('https://www.instagram.com/imeuswe/')
                  }>
                  <Instragram />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.tinyLogo2}
                  accessibilityLabel="twitter"
                  onPress={() =>
                    handleSocialMediaPress('https://twitter.com/iMeUsWe_in')
                  }>
                  <Twitter />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.tinyLogo2}
                  accessibilityLabel="in"
                  onPress={() =>
                    handleSocialMediaPress(
                      'https://www.linkedin.com/company/imeuswe/',
                    )
                  }>
                  <LinkedIn />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.tinyLogo2}
                  testID="threads"
                  onPress={() =>
                    handleSocialMediaPress('https://www.threads.net/@imeuswe/')
                  }>
                  <LinkedThread />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.tinyLogo3}
                  testID="youtube"
                  onPress={() =>
                    handleSocialMediaPress(
                      'https://www.youtube.com/channel/UC2cPjr-9ccLaiJGnLPkLb7A/featured',
                    )
                  }>
                  <Youtube />
                </TouchableOpacity>
              </View>

            </View>
          </ScrollView>
        </GlobalStyle>
      </View>
    </ErrorBoundary.Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF9F1',
    padding: 10,
  },
  logoContainer: {
    alignItems: 'center',
  },
  textContainer: {
    marginTop: 15,
  },
  paragraph: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
    color: 'black',
  },
  bold: {
    fontWeight: '800',
    fontSize: 18,
    textAlign: 'center',
  },
  versionContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  versionText: {
    color: 'black',
    fontSize: 14,
  },
  chooseUsContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  chooseUsContainer1: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 20,
    marginBottom: 100,
    alignItems: 'center',
  },
  tinyLogo1: {
    marginRight: 12,
  },
  tinyLogo2: {
    marginRight: 12,
  },
  tinyLogo3: {
    marginRight: 12,
  },
  row: {
    flexDirection: 'row',
  },
  column2: {
    flex: 2,
    paddingRight: 12,
    paddingTop: 20,
  },
  column10: {
    flex: 10,
    paddingLeft: 12,
  },
  para: {
    color: 'black',
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  imuwLogo: {
    width: 315,
    height: 70,
  },
  imuwHoroscopeLogo: {
    width: 70,
    height: 70,
  },
});

export default AboutUs;
