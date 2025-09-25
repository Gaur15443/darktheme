import {Button, Text, useTheme} from 'react-native-paper';
import {View, StyleSheet, ScrollView, Linking, Image} from 'react-native';
import {useRef} from 'react';
import {GlobalHeader, ImuwSocial} from '../../../components';
import {GlobalStyle} from '../../../core';
import {useNavigation} from '@react-navigation/native';
import {WebView} from 'react-native-webview';
import {Genome, Lab, Bag, Iso, Bonus} from '../../../images';
import LottieView from 'lottie-react-native';
import ErrorBoundary from '../../../common/ErrorBoundary';

const AccountDna = () => {
  const Theme = useTheme();
  const navigation = useNavigation();
  const webViewRef = useRef(null);
  function handleBack() {
    navigation.goBack();
  }

  function navigateToYoutube(data) {
    const embedString = /embed/i;
    if (!embedString.test(data.url) && webViewRef?.current) {
      webViewRef?.current?.stopLoading?.();
      Linking?.openURL?.(data.url);
    }
  }

  const handleDna = () => {
    const url = 'https://www.imeuswe.in/dna/';
    Linking.openURL(url);
  };
  const videoId = 'oCIB5RQICjc';
  const autoplayUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=oCIB5RQICjc`;

  return (
    <ErrorBoundary.Screen>
      <GlobalHeader
        onBack={handleBack}
        heading={'DNA'}
        backgroundColor={Theme.colors.background}
        fontSize={20}
      />

      <View accessibilityLabel="dna-page">
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{marginBottom: '15%'}}>
          <GlobalStyle>
            <View style={{paddingTop: 10}}>
              <View style={styles.webViewContainer}>
                <WebView
                  ref={webViewRef}
                  onNavigationStateChange={navigateToYoutube}
                  source={{uri: autoplayUrl}}
                  style={styles.webview}
                  allowsInlineMediaPlayback={true}
                  allowsFullscreenVideo={true}
                />
              </View>
              <View
                style={{
                  paddingVertical: 20,
                  marginBottom: 12,
                  paddingHorizontal: 6,
                }}>
                <View style={styles.container}>
                  <Image
                    style={styles.imuwLogo}
                    source={{uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/Default.png'}}
                  />

                  <Text style={{color: 'black', fontSize: 18}}> & </Text>
                  <View style={{marginTop: 12}}>
                    <Genome />
                  </View>
                </View>
                <View style={styles.dnacontainer}>
                  <View>
                    <View style={{paddingTop: 12}}>
                      <Bag />
                    </View>
                    <View style={{paddingTop: 30}}>
                      <Lab />
                    </View>
                  </View>
                  <View style={{paddingTop: 24}}>
                    <LottieView
                      source={require('../../../animation/lottie/dna_anim.json')}
                      style={{
                        width: 112,
                        height: 100,
                        transform: [{rotate: '90deg'}],
                      }}
                      autoPlay
                      speed={1.5}
                      loop
                    />
                    <LottieView
                      source={require('../../../animation/lottie/dna_anim.json')}
                      style={{
                        width: 112,
                        height: 100,
                        transform: [{rotate: '90deg'}],
                      }}
                      autoPlay
                      speed={1.5}
                      loop
                    />
                  </View>
                  <View style={{marginRight: 30}}>
                    <View style={{paddingTop: 12}}>
                      <Iso />
                    </View>
                    <View style={{paddingTop: 30}}>
                      <Bonus />
                    </View>
                  </View>
                </View>
              </View>
              <View>
                <Text style={styles.para}>
                  At iMeUsWe, we're committed to unlocking the secrets of your
                  ancestry and empowering you to chart your genetic destiny.
                  Teaming up with MapMyGenome, we offer a transformative DNA
                  testing experience that goes beyond numbers – it's a journey
                  of self-awareness, health empowerment, and the weaving of a
                  more vibrant family legacy.
                </Text>
              </View>
              <View style={styles.buttonView}>
                <Button
                  mode="contained"
                  style={styles.button}
                  onPress={handleDna}>
                  <Text style={styles.buttonText}>Check out our products</Text>
                </Button>
              </View>
              <View style={{paddingHorizontal: 24, marginBottom: 24}}>
                <ImuwSocial />
              </View>
            </View>
          </GlobalStyle>
        </ScrollView>
      </View>
    </ErrorBoundary.Screen>
  );
};
const styles = StyleSheet.create({
  para: {
    fontWeight: 500,
    fontSize: 14,
    paddingHorizontal: 24,
    textAlign: 'center',
  },
  buttonView: {
    padding: 24,
  },
  button: {
    borderRadius: 6,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  webview: {
    width: '100%',
    height: '100%',
  },
  webViewContainer: {
    height: 220,
  },
  imuwLogo: {
    width: 140,
    height: 28,
    marginTop: 3,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center', // Align items vertically in the center
    justifyContent: 'space-between',
  },
  dnacontainer: {
    display: 'flex',
    flexDirection: 'row',
    paddingTop: 12,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginLeft: 30,
  },
  animatedGif: {
    width: 100, // Adjust the width as needed
    height: 250, // Adjust the height as needed
  },
});

export default AccountDna;
