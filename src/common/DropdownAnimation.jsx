import React, {useRef, useEffect, useState} from 'react';
import LottieView from 'lottie-react-native';

export default function DropdownAnimation({style, play, ...props}) {
  const animationRef = useRef(null);

  useEffect(() => {
    if (play) {
      animationRef.current?.play(0, 30);
    } else if (!play) {
      animationRef.current?.play(30, 0);
    }
  }, [play]);

  return (
    <LottieView
      ref={animationRef}
      source={require('../animation/lottie/dropdownAnimation.json')}
      style={{
        width: 20,
        height: 20,
        ...style,
      }}
      autoPlay={false}
      loop={false}
      speed={3}
      {...props}
    />
  );
}
