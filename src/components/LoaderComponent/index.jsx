import {View, Text} from 'react-native';
import React from 'react';
import Spinner from '../../common/Spinner';
import {Modal} from 'react-native-paper';

const LoaderModal = () => {
  return (
    <Modal animationType="fade" visible={true}>
      <View style={{alignItems: 'center', justifyContent: 'center'}}>
        <Spinner />
      </View>
    </Modal>
  );
};

export default LoaderModal;
