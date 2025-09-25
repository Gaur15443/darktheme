import React from 'react';
import {Modal, View, TouchableOpacity, StyleSheet} from 'react-native';
import {useTheme, Text} from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';

const AccessRightsPopup = ({visible, onClose}) => {
  const theme = useTheme();
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={[styles.title, {color: theme.colors.outline}]}>
            Oops!
          </Text>
          <TouchableOpacity
            testID="close-popup"
            onPress={onClose}
            style={styles.closeButton}>
            <Icon name="times" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={[styles.subtitle, {color: theme.colors.outline}]}>
            It seems you don’t have permission to edit the tree. To request
            editing rights, please reach out to the owner and ask to be a
            contributor.
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 10,
    width: '80%',
  },
  title: {
    fontSize: 25,
    fontWeight: '800',
    marginBottom: 15,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});

export default AccessRightsPopup;
