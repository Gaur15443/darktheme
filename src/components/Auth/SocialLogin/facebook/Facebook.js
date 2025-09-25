import React, {useState} from 'react';
import {TouchableOpacity, Text, StyleSheet, View, Platform} from 'react-native';
import {
  LoginManager,
  AccessToken,
  GraphRequest,
  GraphRequestManager,
} from 'react-native-fbsdk-next';
import {useTheme} from 'react-native-paper';
import {useAuth} from '../../../../hooks/useAuth';
import Toast from 'react-native-toast-message';
import {useDispatch} from 'react-redux';
import {setSocialData} from '../../../../store/apps/socialLoginData';
import PropTypes from 'prop-types';
import ButtonSpinner from '../../../../common/ButtonSpinner';
import {Path, Svg} from 'react-native-svg';

const Facebook = ({title, wrapperStyles}) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const auth = useAuth();

  const getInfoFromToken = (token, data) => {
    try {
      const PROFILE_REQUEST_PARAMS = {
        fields: {
          string: 'id, name,  first_name, last_name, email',
        },
      };
      const profileRequest = new GraphRequest(
        '/me',
        {token, parameters: PROFILE_REQUEST_PARAMS},
        (error, result) => {
          if (error) {
            Toast.show({
              type: 'error',
              text1: 'login info has error: ' + JSON.stringify(error),
            });
            setLoading(false);
          } else {
            const allData = {
              token,
              data,
              result,
            };
            const login = 'Facebook';
            const userInfo = {
              givenName: result?.first_name,
              familyName: result?.last_name,
              id: result?.id,
              email: result?.email,
            };
            dispatch(setSocialData(userInfo));
            auth
              .login({allData, login})
              .then(res =>
                res === true ? setLoading(false) : setLoading(true),
              )
              .catch(() => setLoading(false))
              .finally(() => setLoading(false));
            // Perform additional actions with profile data if needed
          }
        },
      );
      new GraphRequestManager().addRequest(profileRequest).start();
    } catch (e) {
      setLoading(false);
    }
  };
  const handleFacebookLogin = async () => {
    try {
      setLoading(true);
      const result = await LoginManager.logInWithPermissions([
        'public_profile',
        'email',
      ]);
      if (result.isCancelled) {
        setLoading(false);
        return;
      } else {
        const data = await AccessToken.getCurrentAccessToken();
        const accessToken = data.accessToken.toString();
        getInfoFromToken(accessToken, data);
      }
    } catch (error) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, {...wrapperStyles}]}>
      <TouchableOpacity
        style={[styles.buttonContainer, styles.buttonShadow]}
        onPress={() => handleFacebookLogin()}
        disabled={loading}>
        {loading ? (
         <ButtonSpinner />
        ) : (
          <View style={styles.buttonContent}>
            <View style={{paddingLeft: Platform.OS === 'ios' ? 22 : 22}}>
              <Svg
                width="45px"
                height="45px"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <Path
                  d="M23.5 12.0699C23.5 5.7186 18.3513 0.56988 12 0.56988C5.64872 0.56988 0.5 5.7186 0.5 12.0699C0.5 17.8099 4.70538 22.5674 10.2031 23.4302V15.3941H7.2832V12.0699H10.2031V9.53629C10.2031 6.6541 11.92 5.06207 14.5468 5.06207C15.805 5.06207 17.1211 5.28668 17.1211 5.28668V8.11675H15.671C14.2424 8.11675 13.7969 9.00322 13.7969 9.91266V12.0699H16.9863L16.4765 15.3941H13.7969V23.4302C19.2946 22.5674 23.5 17.8099 23.5 12.0699Z"
                  fill="#1878f3"
                />
              </Svg>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

Facebook.propTypes = {
  wrapperStyles: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
};

function createStyles(theme) {
  return StyleSheet.create({
   
  });
}

export default Facebook;
