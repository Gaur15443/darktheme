import React, {useState, useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useColorScheme, Platform} from 'react-native';
import {useSelector} from 'react-redux';
import {Theme} from '../common';
import AppStack from './AppStack';
import SignUpScreen from '../screens/AuthScreens/SignUp';
import PreSignup from '../screens/AuthScreens/PreSignup';
import JwtHandler from './../components/JWTHandler/JwtHandler';
import LandingScreen from '../screens/AuthScreens/Landing';
import LoginScreen from './../screens/AuthScreens/Login';
import LoginWithMobile from './../screens/AuthScreens/LoginWithMobile';
import VerifyMobileOTP from './../screens/AuthScreens/VerifyMobileOTP';
import Members from './../screens/AppScreens/Members/index';
import ProfileDetailsScreen from './../screens/AppScreens/ProfileDetails/index';
import EmailVerification from './../screens/AuthScreens/EmailVerification';
import {useTheme} from 'react-native-paper';
import {enableScreens} from 'react-native-screens';
import config from 'react-native-config';
enableScreens(false);
const Stack = createNativeStackNavigator();

const AuthStack = ({children}) => {
  const theme = useTheme();
  const [currentTheme, setCurrentTheme] = useState(Theme?.light); // Default to light theme
  const colorScheme = useColorScheme();
  const isSignedIn = useSelector(state => state?.CheckAuth?.isSignedIn);
  const resData = useSelector(state => state?.userInfo?._id);
  const emailData = useSelector(state => state?.userInfo?.email);
  const checkAuth = isSignedIn ? 'Logged in' : 'Guest';



  useEffect(() => {
    const newTheme = colorScheme === 'dark' ? Theme?.dark : Theme?.light;
    setCurrentTheme(newTheme);
  }, [colorScheme]);

  return (
    <>
      <JwtHandler />

      {isSignedIn && <AppStack />}
      {!isSignedIn && (
        <Stack.Navigator>
          <>
            <Stack.Screen
              name="Landing"
              component={LandingScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="PreSignup"
              component={PreSignup}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="LoginWithOtp"
              component={LoginWithMobile}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="VerifyMobileOTP"
              component={VerifyMobileOTP}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Members"
              component={Members}
              options={{headerShown: false}}
            />

            <Stack.Screen
              name="SignUp"
              component={SignUpScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="EmailVerification"
              component={EmailVerification}
              options={{
                headerShown: false,
                headerBackTitleVisible: false,
                title: null,
                headerShadowVisible: false,
                headerStyle: {
                  backgroundColor: theme?.colors?.background,
                },
              }}
            />
            <Stack.Screen
              name="ProfileDetails"
              component={ProfileDetailsScreen}
              options={{
                headerShown: false,
                gestureEnabled: false,
                headerLeft: () => null,
                animationEnabled: false,
              }}
            />
          </>
        </Stack.Navigator>
      )}
      {children}
    </>
  );
};

export default AuthStack;
