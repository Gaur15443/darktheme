import React from 'react';
import {View} from 'react-native';
import {Svg, Path} from 'react-native-svg';

const EmailIcon = () => (
  <View style={{marginRight: 8}}>
    <Svg width={20} height={19.93} viewBox="0 0 18 14" fill="none">
      <Path
        d="M2.90625 2.60438L8.46637 6.58168C8.78741 6.81133 9.21259 6.81133 9.53364 6.58168L15.0938 2.60438M3.375 12.7754H14.625C15.6605 12.7754 16.5 11.9081 16.5 10.8381V3.08871C16.5 2.01875 15.6605 1.15137 14.625 1.15137H3.375C2.33947 1.15137 1.5 2.01875 1.5 3.08871V10.8381C1.5 11.9081 2.33947 12.7754 3.375 12.7754Z"
        stroke="rgba(3, 89, 151, 1)" // Default color
        strokeWidth={1.67442}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  </View>
);

export default EmailIcon;
