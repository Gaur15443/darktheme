import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import {Card, Text, Button} from 'react-native-paper';
import NewTheme from '../../common/NewTheme';
import {InviteProfile} from '../../images';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {Track} from '../../../App';

const Search = () => {
  const userInfo = useSelector(state => state.userInfo);
  const navigation = useNavigation();

  const handleImeusweUsers = () => {
    /* customer io and mixpanel event changes  start */
    Track({
      cleverTapEvent: 'Visited_ImeusweUsers_Search',
      mixpanelEvent: 'Visited_ImeusweUsers_Search',
      userInfo,
    });
    navigation.navigate('ImeusweUser');
  };

  return (
    <View>
      <Card
        style={{
          marginBottom: 12,
          boxShadow: '0px 2px 6px 0px rgba(0, 0, 0, 0.2509803922)',
        }}>
        <View style={{borderRadius: 10, overflow: 'hidden'}}>
          <ImageBackground
            source={{
              uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/globe.png',
            }}>
            <Text style={styles.text}>
              Connect with your family members who are already on iMeUsWe
            </Text>
            <View
              style={{padding: 12, paddingHorizontal: 48, paddingVertical: 18}}>
              <TouchableOpacity onPress={handleImeusweUsers}>
                <View
                  style={{
                    borderRadius: 6,
                    backgroundColor: NewTheme.colors.primaryOrange,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 8,
                  }}
                  accessibilityLabel="search-connect">
                  <View style={{paddingRight: 5}}>
                    <InviteProfile fill="#fff" />
                  </View>
                  <Text
                    style={{
                      color: NewTheme.colors.whiteText,
                      fontWeight: 600,
                      fontSize: 18,
                    }}>
                    Connect Now
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    fontWeight: '700',
    fontSize: 21,
    textAlign: 'center',
    color: NewTheme.colors.secondaryDarkBlue,
    paddingHorizontal: 24,
    paddingVertical: 18,
  },
});

export default Search;
