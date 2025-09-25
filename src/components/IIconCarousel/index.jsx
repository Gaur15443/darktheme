import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import Swiper from 'react-native-swiper';
import {CheckMarkIcon} from '../../images';
import {Dialog, Portal, useTheme, Text, Modal} from 'react-native-paper';
import {CloseIcon} from '../../images/Icons/ModalIcon';
import newTheme from '../../common/NewTheme';
const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

const IIconCarousel = ({isVisible, onClose}) => {
  const theme = useTheme();
  const carouselItems = [
    {
      heading: 'Member',
      titles: ['View tree', 'View details of all relatives', 'Add stories'],
      color: theme.colors.faintGreen,
    },
    {
      heading: 'Contributor',
      titles: [
        'View tree',
        'View details of all relatives',
        'Add stories',
        'Add, delete & edit relatives',
      ],
      color: theme.colors.darkOrange,
    },
    {
      heading: 'Tree Owner',
      titles: [
        'View tree',
        'View details of all relatives',
        'Add stories',
        'Add, delete & edit relatives',
        'Invite members',
        'Personalise tree name',
      ],
      color: theme.colors.onFaintBlue,
    },
  ];

  const renderItem = (item, index) => (
    <View key={index} style={styles.carouselItem}>
      <View style={styles.headingContainer}>
        <Text style={[styles.heading, {color: item.color}]}>
          {item.heading}
        </Text>
      </View>
      <View style={styles.textColumn}>
        {item.titles.map((title, subIndex) => (
          <View key={subIndex} style={styles.titleContainer}>
            <Text style={[styles.itemText, {color: theme.colors.text}]}>
              {title}
            </Text>
            <Text style={styles.iconText}>
              <CheckMarkIcon />
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <Portal>
      <Modal
        visible={isVisible}
        transparent={true}
        onRequestClose={onClose}
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onDismiss={onClose}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title} />
            <TouchableOpacity
              testID="close-iicon-carousel"
              style={{
                backgroundColor: 'lightgray',
                marginRight: -5,
                borderRadius: 5,
                position: 'absolute',
                top: -30,
                right: -22,
              }}
              onPress={onClose}>
              <CloseIcon />
            </TouchableOpacity>
          </View>
          <Swiper
            loop={true}
            showsPagination={true}
            springConfig={{tension: 100, friction: 15, mass: 0.6}}
            paginationStyle={styles.pagination}
            activeDotStyle={{
              backgroundColor: newTheme.colors.primaryOrange,
            }}>
            {carouselItems.map((item, index) => renderItem(item, index))}
          </Swiper>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  modalContent: {
    width: screenWidth - 50,
    minHeight: screenHeight / 2 - 20,
    height: 'auto',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headingContainer: {
    marginBottom: 10,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    color: '#000000',
  },
  closeIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
  carouselItem: {
    width: screenWidth - 50,
    height: screenHeight / 2 - 100,
    flexDirection: 'column',
    alignItems: 'center',
    margin: -18,
    marginTop: 2,
  },
  textColumn: {
    width: screenWidth / 2 + 80,
  },
  iconText: {
    textAlign: 'center',
    fontSize: 25,
    fontWeight: 'bold',
    color: 'green', // Customize the color of the correct icon
  },
  itemText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  pagination: {
    bottom: 10,
  },
});

// Prop validation
IIconCarousel.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default IIconCarousel;
