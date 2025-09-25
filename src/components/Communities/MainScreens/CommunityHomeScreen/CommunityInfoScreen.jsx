import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import CustomBottomSheet from '../../../CustomBottomSheet';
import { CommunityIcon } from '../../../../images';

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 0,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  image: {
    width: '96%',
    height: '36%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderRadius: 16,
  },
  contentContainer: {
    width: '92%',
    alignSelf: 'center',
    backgroundColor: '#fff',
    marginTop: 0,
    marginBottom: 0,
    paddingBottom: 0,
  },
  iconTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E77237',
    textAlign: 'center',
    marginBottom: 4,
    marginTop: 8,
    fontFamily: 'PublicSans Bold',
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#222',
    fontFamily: 'PublicSans Bold',
    marginLeft: 10,
  },
  description: {
    fontSize: 14,
    textAlign: 'justify',
    color: '#222',
    marginBottom: 10,
    fontWeight: 'bold',
    fontFamily: 'PublicSans Regular',
  },
  bulletSection: {
    marginBottom: 8,
    marginTop: 2,
    width: '100%',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 1,
    width: '98%',
    alignSelf: 'flex-end',
  },
  bulletDot: {
    fontSize: 14,
    color: '#222',
    marginRight: 8,
    fontFamily: 'PublicSans Regular',
    fontWeight: '400',
  },
  bulletText: {
    fontSize: 14,
    color: '#222',
    fontFamily: 'PublicSans Regular',
    fontWeight: '400',
    flex: 1,
    textAlign: 'left', // changed from 'justify' to 'left'
    lineHeight: 18,
  },
  bold: {
    fontWeight: 'bold',
    color: '#222',
    fontFamily: 'PublicSans Bold',
  },
  footerText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#222',
    textAlign: 'center',
    fontFamily: 'PublicSans Bold',
  },
  button: {
    backgroundColor: '#E77237',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    width: '92%',
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'PublicSans Bold',
  },
  topicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 8,
    marginTop: 8,
  },
});

const bulletPoints = [
  {
    key: 'types',
    text: (
      <Text style={styles.bulletText}>
        <Text style={styles.bold}>Community types:</Text> Public (open to
        everyone) & Private (invite-only)
      </Text>
    ),
  },
  {
    key: 'discussions',
    text: 'Join discussions, ask questions and share your thoughts.',
  },
  {
    key: 'polls',
    text: 'Create polls to gather opinions and see what others think.',
  },
  {
    key: 'discover',
    text: 'Discover new communities or create your own.',
  },
  {
    key: 'updates',
    text: 'Stay updated with posts from your favourite communities.',
  },
];

const CommunityInfoScreen = ({ visible, onClose }) => {
  if (!visible) return null;

  return (
    <CustomBottomSheet
      snapPoints={['86%']}
      onClose={onClose}
      enableDynamicSizing={false}>
      <View style={styles.wrapper}>
        <FastImage
          source={{
            uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/countryCommunity.png',
          }}
          style={styles.image}
          resizeMode={FastImage.resizeMode.contain}
        />
        <View style={styles.contentContainer}>
          <View style={styles.topicHeader}>
            <CommunityIcon />
            <Text style={styles.heading}>Communities</Text>
          </View>
          <Text style={styles.description}>
            Communities is a space where you can connect with like-minded
            people, discuss topics you care about and share content.
          </Text>
          <View style={styles.bulletSection}>
            {bulletPoints.map((item, idx) => (
              <View key={item.key} style={styles.bulletRow}>
                <Text style={styles.bulletDot}>&#8226;</Text>
                {typeof item.text === 'string' ? (
                  <Text style={styles.bulletText}>{item.text}</Text>
                ) : (
                  item.text
                )}
              </View>
            ))}
          </View>
          <Text style={styles.footerText}>Explore, connect and engage!</Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={onClose}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </CustomBottomSheet>
  );
};

export default CommunityInfoScreen;
