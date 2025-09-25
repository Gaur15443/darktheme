import {StyleSheet, TouchableWithoutFeedback} from 'react-native';
import React from 'react';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {useNavigation} from '@react-navigation/native';

const CustomButton = ({flatListRef, flatListIndex, dataLength}) => { 
  const navigation = useNavigation();

  const buttonAnimationStyle = useAnimatedStyle(() => { 
    return {
      width:withSpring(180), 
      height: 40, 
    }; 
  }); 

  return ( 
    <TouchableWithoutFeedback 
      onPress={() => { 
          navigation.navigate('PreSignup'); 
      }}
    > 
      <Animated.View style={[styles.container, buttonAnimationStyle]}> 
        <Animated.Text style={styles.textButton}> 
          Get Started 
        </Animated.Text>
      </Animated.View> 
    </TouchableWithoutFeedback> 
  ); 
}; 
 
export default CustomButton; 
 
const styles = StyleSheet.create({ 
  container: { 
    backgroundColor: '#E77237', 
    padding: 10, 
    borderRadius: 100, 
    justifyContent: 'center', 
    alignItems: 'center', 
    overflow: 'hidden', 
  }, 
  textButton: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: '600', 
  }, 
});