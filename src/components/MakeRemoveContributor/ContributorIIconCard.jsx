import React from 'react';
import PropTypes from 'prop-types';
import {Button, Dialog, Portal, Text} from 'react-native-paper';
import {View, TouchableOpacity, Dimensions} from 'react-native';
import {CheckMarkIcon} from '../../images';
import Icon from 'react-native-vector-icons/FontAwesome';
import {CloseIcon} from '../../images/Icons/ModalIcon';

const ContributorIIconCard = ({open, onClose}) => {
  const screenWidth = Dimensions.get('window').width;

  return (
    <Portal>
      <Dialog
        visible={open}
        onDismiss={onClose}
        style={{
          backgroundColor: 'white',
          marginHorizontal: 25, // Adjust margin horizontally
          borderRadius: 8,
        }}>
        {/* Button */}
        <TouchableOpacity
          onPress={onClose}
          style={{
            position: 'absolute',
            top: -35,
            right: -6,
            backgroundColor: 'lightgray',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 5,
            elevation: 9,
          }}>
          <CloseIcon />
        </TouchableOpacity>
        <View style={{marginHorizontal: 10}}>
          <Dialog.Title
            style={{
              fontSize: 22,
              textAlign: 'center',
              paddingHorizontal: 15,
              fontWeight: '700',
              color: 'black',
            }}>
            Contributor
          </Dialog.Title>
          <Dialog.Content>
            <View
              style={{
                flexWrap: 'wrap',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingBottom: 10,
              }}>
              <Text
                style={{
                  fontSize: 17,
                  textAlign: 'center',
                  color: 'black',
                }}>
                Contributors will be able to perform these actions on your
                behalf:
              </Text>
            </View>
            <View
              style={{
                flexWrap: 'wrap',
                flexDirection: 'column',
                justifyContent: 'center',
                marginHorizontal: 15, // Adjust margin horizontally
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                }}>
                <CheckMarkIcon />
                <Text style={{fontSize: 17, paddingLeft: 10, color: 'black'}}>
                  Add, delete and edit relatives
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                }}>
                <CheckMarkIcon />
                <Text style={{fontSize: 17, paddingLeft: 10, color: 'black'}}>
                  Assign other contributors
                </Text>
              </View>
            </View>
          </Dialog.Content>
        </View>
      </Dialog>
    </Portal>
  );
};

// Prop validation
ContributorIIconCard.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ContributorIIconCard;
