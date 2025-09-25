import React, {useEffect, useState} from 'react';
import {Path, Svg, Defs, LinearGradient, Stop} from 'react-native-svg';

const SisterIcon = ({isDisabled}) => {
  const colors = {
    disabled: ['#FFFFFF', '#FFFFFF'],
    enabled: 'url(#sisterIconGradient)',
  };

  const [fillColor, setFillColor] = useState(colors.enabled);

  useEffect(() => {
    if (isDisabled) {
      setFillColor(colors.disabled);
    } else {
      setFillColor(colors.enabled);
    }
  }, [isDisabled]);

  return (
    <Svg width={62} height={86} viewBox="0 0 62 86">
      <Defs>
        <LinearGradient
          id="sisterIconGradient"
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%">
          <Stop offset="0%" stopColor="#FE3C76" />
          <Stop offset="95%" stopColor="#F7789E" />
        </LinearGradient>
      </Defs>
      <Path
        fill={isDisabled ? '#FFFFFF' : fillColor}
        d="m.969 75.882.03.023c.282-5.788 2.22-17.355 13.275-16.467 12.99 1.043 11.918-7.063 11.494-8.961a20.01 20.01 0 0 1-12.771 4.737c-2.654.021-5.452-.554-7.415-2.34-1.964-1.786-2.772-5.002-1.27-7.195-.563 1.9 1.045 3.987 3 4.338 1.956.351 3.953-.72 5.185-2.277 2.044-2.59 2.205-6.174 1.989-9.467-.142-2.416-.447-4.822-.75-7.227-.259-2.04-.517-4.079-.676-6.125-.347-4.46-.212-9.065 1.345-13.268 1.558-4.202 4.694-7.981 8.918-9.471 0 0 7.55-2.954 15.67 0 4.233 1.532 7.369 5.269 8.922 9.467 1.553 4.198 1.693 8.799 1.346 13.268-.165 2.122-.437 4.233-.708 6.343-.3 2.334-.6 4.667-.756 7.013-.216 3.293-.055 6.877 1.989 9.467 1.231 1.558 3.233 2.624 5.184 2.277s3.563-2.437 3-4.338c1.52 2.176.716 5.396-1.269 7.195-1.985 1.798-4.761 2.361-7.415 2.34a20.025 20.025 0 0 1-12.746-4.716c-.43 1.972-1.395 9.959 11.502 8.919 10.88-.878 12.92 10.326 13.246 16.205a49.781 49.781 0 0 1-30.331 10.247A49.778 49.778 0 0 1 .969 75.882Z"
      />
    </Svg>
  );
};

export default SisterIcon;
