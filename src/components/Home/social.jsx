import React from 'react';
import {View, StyleSheet, Image, Linking, TouchableOpacity} from 'react-native';
import {
  LinkedIn,
} from '../../images';
import {Text} from 'react-native-paper';
import ErrorBoundary from './../../common/ErrorBoundary/index';

const Social = () => {
  const handleLink = () => {
    const url = 'https://www.threads.net/@imeuswe/';
    Linking.openURL(url);
  };

  const handleFbLink = () => {
    const url = 'https://www.facebook.com/I-Me-Us-We-105148551935968';
    Linking.openURL(url);
  };

  const handleInstaLink = () => {
    const url = 'https://www.instagram.com/imeuswe/';
    Linking.openURL(url);
  };

  const handleTwitterLink = () => {
    const url = 'https://twitter.com/iMeUsWe_in';
    Linking.openURL(url);
  };

  const handleYoutubeLink = () => {
    const url =
      'https://www.youtube.com/channel/UC2cPjr-9ccLaiJGnLPkLb7A/featured';
    Linking.openURL(url);
  };

  const handleLinkedIn = () => {
    const url = 'https://www.linkedin.com/company/imeuswe/';
    Linking.openURL(url);
  };

  return (
    <ErrorBoundary>
      <View style={{paddingBottom: 64}} accessibilityLabel="home-social">
        {/* <View
          style={{
            padding: 12,
            margin: '12',
            alignContent: 'center',
            alignItems: 'center',
          }}>
          <Text style={{color: 'black', fontSize: 20, fontWeight: 700}}>
            Check us out on Social Media!
          </Text>
        </View> */}

        <View style={styles.row}>
          <TouchableOpacity accessibilityLabel="threadid" onPress={handleLink}>
            <View style={styles.col3}>
              <Image source={{uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/thread1.png'}} style={styles.img} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity accessibilityLabel="fbid" onPress={handleFbLink}>
            <View style={styles.col2}>
              <Image source={{uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/facebookmedia1.png'}} style={styles.img} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityLabel="instaid"
            onPress={handleInstaLink}>
            <View style={styles.col2}>
              <Image source={{uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/instamedia1.png'}} style={styles.img} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityLabel="twitid"
            onPress={handleTwitterLink}>
            <View style={styles.col2}>
              <Image source={{uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/twitter-icon1.png'}} style={styles.img} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity accessibilityLabel="inid" onPress={handleLinkedIn}>
            <View style={{lex: 10, padding: 6, margin: 3}}>
              <LinkedIn />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityLabel="youtubeid"
            onPress={handleYoutubeLink}>
            <View style={{flex: 10, padding: 6, margin: 4}}>
              <Image  source={{uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/youtube1.png'}} style={{width: 35, height: 35}} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ErrorBoundary>
  );
};
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'center',
  },
  col2: {
    flex: 2,
    padding: 6,
    margin: 6,
    alignItems: 'center',
  },
  col3: {
    flex: 10,
    padding: 6,
    margin: 6,
    alignItems: 'flex-end',
  },
  img: {
    width: 30,
    height: 30,
  },
});
export default Social;
