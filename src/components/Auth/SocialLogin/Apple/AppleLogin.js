// App.js

import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { useAuth } from '../../../../hooks/useAuth';
import Toast from 'react-native-toast-message';
import { Text, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';
import PropTypes from 'prop-types';
import ButtonSpinner from '../../../../common/ButtonSpinner';
export default function AppleLogin({ title, wrapperStyles }) {
  const auth = useAuth();
  const styles = createStyles();
  const [loading, setLoading] = useState(false);
  async function onAppleButtonPress() {
    try {
      setLoading(true);
      // performs login request
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        // Note: it appears putting FULL_NAME first is important, see issue #293
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      });
      const login = 'Apple';
      auth
        .login({ appleAuthRequestResponse, login })
        .then(res => (res === true ? setLoading(false) : setLoading(true)))
        .catch(error => setLoading(false));

      // get current authentication state for user
      // /!\ This method must be tested on a real device. On the iOS simulator it always throws an error.
      const credentialState = await appleAuth.getCredentialStateForUser(
        appleAuthRequestResponse.user,
      );

      /* customer io and mixpanel event chagnes  start
       mixpanel.track('appleLogin', {
        user_id: userData?._id,
        email: userData?.email,
        userFirstname: userData?.personalDetails?.name,
        userLastname: userData?.personalDetails?.lastname,
        gender: userData?.personalDetails?.gender,
      });
      /* customer io and mixpanel event chagnes  end */
      // use credentialState response to ensure the user is authenticated
      if (credentialState === appleAuth.State.AUTHORIZED) {
        // user is authenticated
      }
    } catch (e) {
      setLoading(false);
    }
  }
  useEffect(() => {
    // onCredentialRevoked returns a function that will remove the event listener. useEffect will call this function when the component unmounts
    return appleAuth.onCredentialRevoked(async () => {
      Toast.show({
        type: 'info',
        text1: 'If this function executes, User Credentials have been Revoked',
      });
    });
  }, []);

  return (
    <View style={[styles.container, { ...wrapperStyles }]}>
      <TouchableOpacity
        testID="GoogleAuth"
        style={[styles.buttonContainer, styles.buttonShadow]}
        onPress={() => onAppleButtonPress()}
        disabled={loading}>
        {loading ? (
          <ButtonSpinner />
        ) : (
          <View style={styles.buttonContent}>
            <View>
              <Icon name="apple" size={20} style={styles.icon} color="#fff" />
            </View>
            <View style={{ marginLeft: 12, width: '75%' }}>
              <Text style={styles.buttonText}>{title}</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
      {/* <AppleButton
        testID="appleAuth"
        buttonStyle={AppleButton.Style.BLACK}
        buttonType={AppleButton.Type.SIGN_IN}
        style={{
          width: '100%', // You must specify a width
          height: 45, // You must specify a height
        }}
        onPress={() => onAppleButtonPress()}
      /> */}
    </View>
  );
}
AppleLogin.propTypes = {
  wrapperStyles: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
};

function createStyles() {
  const theme = useTheme();

  return StyleSheet.create({
    container: {
      // flex: 1,
      // justifyContent: 'center',
      // alignItems: 'center',
      // marginLeft: '-1%',
      // marginTop: 25,
      // marginBottom: 25,
    },
    buttonContainer: {
      // width: '40%',
      // alignItems: 'center',
      // justifyContent: 'center',
      // height: 45,
      // borderRadius: 26,
      // borderWidth: 1,
      // backgroundColor: theme.colors.pitchBlack,
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
      justifyContent: 'center',
      // width: '70%',
      // flexDirection: 'row',
      // alignItems: 'center',
      // justifyContent: 'center',
      // borderWidth: 'black',
      // borderWidth: 1,
      // borderRadius: 15,
      // paddingLeft: 23,
      // padding: ,
    },
    buttonText: {
      fontSize: 16,
      color: 'white',
      fontWeight: '400',
      // borderWidth: 1,
      // marginLeft: 15,/
    },
    icon: {
      // paddingRight: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      padding: 13,
      borderRadius: 25,
      paddingHorizontal: 15,
      backgroundColor: theme.colors.pitchBlack,
      // paddingLeft: -20,
      // alignSelf: 'flex-end',
      // alignSelf: 'center',
      // justifyContent: 'center',
      // paddingLeft: 20,
      // borderWidth: 1,
      // borderColor: 'black',
      // marginRight: 10,
      // marginLeft: 15,
      // backgroundColor: 'black',
      // padding: 7,
      // borderRadius: 15,
      // paddingRight: 20,
      // paddingLeft: 25,
      // paddingHorizontal: 10,
      // marginRight: 10,
      // paddingRight: 10,
    },
    loader: {
      position: 'absolute',
      alignSelf: 'center',
      marginLeft: '50%',
    },
  });
}