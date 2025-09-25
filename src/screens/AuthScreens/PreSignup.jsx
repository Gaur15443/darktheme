import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  Platform,
  Linking,
  Dimensions,
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import TermsAndPolicy from '../../components/Auth/TermsAndPolicy';
import EmailNewIcon from '../../images/Icons/EmailNewIcon';
import MobileIcon from '../../images/Icons/MobileIcon';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { mixpanel } from '../../../App';
import CleverTap from 'clevertap-react-native';

import { Shadow } from 'react-native-shadow-2';

function ShadowWrapper({ children }) {
  return (
    <Shadow
      distance={2}
      startColor="rgba(0, 0, 0, 0.2)"
      offset={[0, 1]}
      radius={1.41}
      style={{
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      containerStyle={{
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      {children}
    </Shadow>
  );
}

export default function PreSignup({ navigation }) {
  const styles = useCreateStyles();
  const theme = useTheme();
  const { bottom } = useSafeAreaInsets();
  async function handleExternalLink(url) {
    await Linking.openURL(url);
  }

  return (
    <View
      style={{ flex: 1, backgroundColor: 'white' }}
      accessibilityLabel="presignup-page">
      <SafeAreaView>
        <View style={styles.parent}>
          <Image
            source={{
              uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/Default.png',
            }}
            style={styles.logo}
          />
        </View>
      </SafeAreaView>

      <View style={styles.bottomContent}>
        <View style={styles.socialsContainer}>
          <View style={styles.container}>
            <ShadowWrapper>
              <TouchableOpacity
                accessibilityLabel="mobileOtp"
                style={[
                  styles.buttonContainer,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={() => {
                  /* customer io and mixpanel event chagnes  start */
                  CleverTap.recordEvent('Select_Mobile');
                  mixpanel.track('Select_Mobile');
                  /* customer io and mixpanel event chagnes  end */
                  navigation.navigate('LoginWithOtp');
                }}>
                <View style={styles.buttonContent}>
                  <MobileIcon />
                  <Text style={styles.buttonTextMobile}>
                    Continue with Mobile
                  </Text>
                </View>
              </TouchableOpacity>
            </ShadowWrapper>

            <ShadowWrapper>
              <TouchableOpacity
                accessibilityLabel="emailLogin"
                style={[
                  styles.buttonContainer,
                  { backgroundColor: theme.colors.onWhite100 },
                ]}
                onPress={() => {
                  /* customer io and mixpanel event chagnes  start */
                  CleverTap.recordEvent('Select_Email');
                  mixpanel.track('Select_Email');
                  navigation.navigate('SignUp');
                }}>
                <View
                  style={[
                    styles.buttonContent,
                    { position: 'relative', right: 5 },
                  ]}
                >
                  <EmailNewIcon />
                  <Text
                    style={[
                      styles.buttonTextMobile,
                      { color: 'black', position: 'relative', right: 3 },
                    ]}>
                    Continue with Email
                  </Text>
                </View>
                {/* <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  width: '100%',
                  paddingHorizontal: Platform.OS === 'ios' ? 60 : 36,
                }}>
                <View>
                  <EmailNewIcon />
                </View>
                <View>
                  <Text style={styles.buttonText}>Continue with Email</Text>
                </View>
              </View> */}
              </TouchableOpacity>
            </ShadowWrapper>
          </View>
        </View>
        <TermsAndPolicy
          style={{
            paddingTop: 15,
            paddingBottom: bottom || 20,
          }}
        />
      </View>
    </View>
  );
}

function useCreateStyles() {
  const theme = useTheme();
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  return StyleSheet.create({
    parent: {
      height: '100%',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'center',
      backgroundColor: 'white',
    },
    logo: {
      width: windowWidth - 120,
      height: windowHeight - 200,
      resizeMode: 'contain',
      width: 320,
    },

    bottomContent: {
      position: 'absolute',
      bottom: 0,
      height: 260,
      width: '100%',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      backgroundColor: 'white',
      display: 'flex',
      justifyContent: 'center',
      paddingHorizontal: 25,
      // shadow start
      shadowColor: '#000000',
      shadowOffset: {
        width: 0,
        height: 18,
      },
      shadowOpacity: 0.25,
      shadowRadius: 20.0,
      elevation: 10,
      // shadow end
    },

    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },

    buttonContainer: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      height: 46,
      borderRadius: 10,
      backgroundColor: theme.colors.onWhite100,
      paddingVertical: 12,
      marginBottom: 15,
    },

    buttonShadow: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,

      elevation: 2,
    },

    buttonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      justifyContent: 'center',
      gap: 20,
    },

    icon: {
      alignSelf: 'flex-end',
      marginRight: 7,
    },

    buttonTextMobile: {
      fontSize: 16,
      fontWeight: '400',
      color: 'white',
    },

    buttonText: {
      marginLeft: 22,
      alignSelf: 'flex-start',
      fontSize: 16,
      fontWeight: '400',
      color: 'black',
    },

    socialsContainer: {
      display: 'flex',
      gap: 16,
    },

    MobileIcon: {
      width: 13.5,
      height: 21.4,
    },

    emailIcon: {
      width: 22.85,
      height: 22.4,
    },
  });
}
