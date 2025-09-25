import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import Svg, {ClipPath, Defs, G, Path, Rect} from 'react-native-svg';

export default function AstroChatIconForDialogue() {
  return (
    <Svg width="35" height="35" viewBox="0 0 35 35" fill="none">
      <Rect
        x="0.421875"
        y="0.0771484"
        width="34.1538"
        height="34.1538"
        rx="17.0769"
        fill="white"
      />
      <G clip-path="url(#clip0_27319_290970)">
        <Path
          d="M13.7031 14.3081H21.2929"
          stroke="#6944D3"
          strokeWidth="2.13462"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M13.7031 18.103H19.3954"
          stroke="#6944D3"
          strokeWidth="2.13462"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M23.1917 9.56445C23.9466 9.56445 24.6705 9.86432 25.2042 10.3981C25.738 10.9318 26.0379 11.6558 26.0379 12.4106V20.0004C26.0379 20.7552 25.738 21.4791 25.2042 22.0129C24.6705 22.5466 23.9466 22.8465 23.1917 22.8465H18.4481L13.7045 25.6927V22.8465H11.8071C11.0522 22.8465 10.3283 22.5466 9.79456 22.0129C9.2608 21.4791 8.96094 20.7552 8.96094 20.0004V12.4106C8.96094 11.6558 9.2608 10.9318 9.79456 10.3981C10.3283 9.86432 11.0522 9.56445 11.8071 9.56445H23.1917Z"
          stroke="#6944D3"
          strokeWidth="2.13462"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_27319_290970">
          <Rect
            width="22.7692"
            height="22.7692"
            fill="white"
            transform="translate(6.11328 5.76953)"
          />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

const styles = StyleSheet.create({});
