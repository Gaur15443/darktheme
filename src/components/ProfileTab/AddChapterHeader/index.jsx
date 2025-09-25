import React from 'react';
import {View, TouchableOpacity, Platform} from 'react-native';
import {Text} from 'react-native-paper';

import {CrossIcon} from '../../../images';

import {SCREEN_WIDTH} from '../../../constants/Screens';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
export default function AddChapterHeader({onBack,heading,backgroundColor}) {
  const ios = Platform.OS == 'ios';
  const {top} = useSafeAreaInsets();
  return (
    <View
      style={{
        paddingTop: ios ? top : top + 10,
        backgroundColor:backgroundColor || 'white',

        zIndex:1,

      }}>
      <View
        style={{
          width: SCREEN_WIDTH,
          backgroundColor:backgroundColor || 'white',
          height: 100,
        }}>
        <View
          testID="GlobalBackButton"


          >
          <TouchableOpacity  style={{padding: 0, marginRight: 20, marginBottom: 20,flexDirection:'row',justifyContent:'flex-end'}}  accessibilityLabel="chapter-header-CrossIcon"   onPress={() => {
            onBack();
          }}>
            <CrossIcon />
          </TouchableOpacity>
          <View style={{width:'100%', flexDirection:'row',justifyContent:'center'}}><Text style={{color:'white',fontSize:22, fontWeight:'bold'}} accessibilityLabel={`heading-${heading}`}>{heading}</Text></View>
        </View>
      </View>
    </View>
  );
}
