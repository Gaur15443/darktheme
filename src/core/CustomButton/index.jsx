import React from 'react';
import {TouchableOpacity, Text, StyleSheet, View} from 'react-native';
import ViewIcon from '../../images/Icons/ModalIcon';
// import {Ionicons} from '@expo/vector-icons';

const CustomButton = ({title, onPress, Icon, bgcolor, iconProps}) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <View style={[styles.logo, {backgroundColor: bgcolor}]}>
        <Icon {...iconProps} />
      </View>
      <Text style={[styles.title, {color: 'black'}]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
  },
  logo: {
    // width: 60,
    // height: 50,
    backgroundColor: '#3473DC',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 13,
    marginTop: 5,
  },
});

export default CustomButton;
