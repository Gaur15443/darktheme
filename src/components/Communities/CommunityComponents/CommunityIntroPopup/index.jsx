import React, {useState} from 'react';
import {StyleSheet, View, Image} from 'react-native';
import {Modal, Portal, Button, Text} from 'react-native-paper';
import {
  CommunityIntroPageIcon,
  CommunityIntroPageImage,
} from '../../../../images';
import NewTheme from '../../../../common/NewTheme';

const CommunityIntroPopup = ({visible, onClose}) => {

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={styles.modalContainer}>
        <View>
          {/* Image */}
          <View style={styles.image}>
            <Image
              source={{
                uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/countryCommunity.png',
              }}
              style={styles.image}
              resizeMode="contain"
            />
          </View>

          {/* Title */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 10,
              gap: 5,
            }}>
            <View>
              <CommunityIntroPageIcon />
            </View>
            <Text
              variant="bold"
              accessibilityLabel={'Welcome to Communities'}
              style={styles.title}>
              Welcome to Communities
            </Text>
          </View>

          {/* Description */}
          <Text style={styles.description}>
            Communities are spaces where you can connect and share with others
            who share your interests:
          </Text>

          <View style={styles.bulletContainer}>
            <Text style={styles.bulletSymbol}>•</Text>
            <Text style={styles.bulletText}>
              Join discussions and polls in various communities.
            </Text>
          </View>

          <View style={styles.bulletContainer}>
            <Text style={styles.bulletSymbol}>•</Text>
            <Text style={styles.bulletText}>
              Create and manage your own community tailored to your passions.
            </Text>
          </View>

          <View style={styles.bulletContainer}>
            <Text style={styles.bulletSymbol}>•</Text>
            <Text style={styles.bulletText}>
              Explore and engage with people who inspire you.
            </Text>
          </View>

          {/* Explore Text */}
          <Text variant="bold" style={styles.exploreText}>
            Explore, connect, and engage!
          </Text>

          {/* Button */}
          <Button
            mode="contained"
            onPress={onClose}
            style={styles.button}
            labelStyle={styles.buttonText}>
            Try it out!
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    padding: 10,
    borderRadius: 10,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: 251,
    paddingHorizontal: 0,
    marginBottom: 5,
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
    color: 'black',
  },
  description: {
    fontSize: 12,
    marginBottom: 10,
    paddingHorizontal: 10,
    color: 'black',
  },
  bulletContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Align bullet to the top of the text
    marginBottom: 8, // Space between list items
    paddingLeft: 15,
    paddingRight: 10,
  },
  bulletSymbol: {
    fontSize: 16, // Adjust bullet size
    lineHeight: 20, // Match text line height
    marginRight: 5, // Space between bullet and text
  },
  bulletText: {
    fontSize: 12, // Text size
    lineHeight: 18, // Maintain spacing between lines
    flexShrink: 1, // Allow text to wrap without breaking layout
    color: 'black', // Text color
  },
  list: {
    fontSize: 12,
    color: 'black',
    lineHeight: 15,
  },
  exploreText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
    color: 'black',
  },
  button: {
    backgroundColor: NewTheme.colors.primaryOrange,
    borderRadius: 9.33,
    paddingVertical: 2,
    marginHorizontal: 10,
    // marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  showButton: {
    marginTop: 20,
  },
});

export default CommunityIntroPopup;
