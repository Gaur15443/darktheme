import React, {useState} from 'react';
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  View,
  Dimensions,
  Pressable,
} from 'react-native';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

const ProfileImage = ({
  uri,
  size = 40,
  pressable = false,
  selectOption = () => {},
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);

  const fullScreenSize = Math.min(screenWidth, screenHeight) * 0.8;
  const Wrapper = pressable ? Pressable : TouchableOpacity;

  return (
    <>
      <Wrapper
        onPress={!pressable ? openModal : selectOption}
        onLongPress={pressable ? openModal : () => {}}>
        <Image
          style={[
            styles.image,
            {width: size, height: size, borderRadius: size / 2},
          ]}
          source={{uri: uri}}
          resizeMode="contain"
        />
      </Wrapper>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}>
        <TouchableOpacity
          style={styles.modalBackground}
          onPress={closeModal}
          activeOpacity={1}>
          <View
            style={styles.modalContainer}
            onStartShouldSetResponder={() => true}
            onTouchEnd={e => {
              e.stopPropagation();
            }}>
            <View
              style={[
                styles.circleContainer,
                {
                  width: fullScreenSize,
                  height: fullScreenSize,
                  borderRadius: fullScreenSize / 2,
                },
              ]}>
              <Image
                style={[
                  styles.fullScreenImage,
                  {borderRadius: fullScreenSize / 2},
                ]}
                source={{uri: uri}}
                resizeMode="contain"
              />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  image: {
    backgroundColor: '#E1E2E3',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleContainer: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
});

ProfileImage.defaultProps = {
  uri: 'https://example.com/default-profile-image.jpg',
};

export default ProfileImage;
