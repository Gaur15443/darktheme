import React from 'react';
import {View} from 'react-native';
import Svg, {G, Path, Rect, Defs, ClipPath} from 'react-native-svg';
import PropTypes from 'prop-types';

const AccountsIcon = ({stroke = '#989898'}) => {
  return (
    <View>
      <Svg
        width={20}
        height={20}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <G clipPath="url(#clip0_1291_1268)">
          <Path
            d="M10 11C11.6569 11 13 9.65685 13 8C13 6.34315 11.6569 5 10 5C8.34315 5 7 6.34315 7 8C7 9.65685 8.34315 11 10 11Z"
            fill="none"
            stroke={stroke}
            strokeWidth={1.8}
            strokeLinecap="round"
          />
          <Path
            d="M10 19C14.9706 19 19 14.9706 19 10C19 5.02944 14.9706 1 10 1C5.02944 1 1 5.02944 1 10C1 14.9706 5.02944 19 10 19Z"
            stroke={stroke}
            strokeWidth={1.8}
          />
          <Path
            d="M15.8723 16.8083C15.9493 16.7468 15.9803 16.6436 15.9456 16.5513C15.5697 15.5518 14.8138 14.6706 13.7818 14.0332C12.697 13.3632 11.3678 13 10.0004 13C8.63295 13 7.30376 13.3632 6.21893 14.0332C5.18698 14.6706 4.43101 15.5518 4.05512 16.5513C4.02044 16.6436 4.0515 16.7468 4.12848 16.8083C7.56231 19.552 12.4384 19.552 15.8723 16.8083Z"
            fill="none"
            stroke={stroke}
            strokeWidth={1.8}
            strokeLinecap="round"
          />
        </G>
        <Defs>
          <ClipPath id="clip0_1291_1268">
            <Rect width={20} height={20} fill="white" />
          </ClipPath>
        </Defs>
      </Svg>
    </View>
  );
};

AccountsIcon.propTypes = {
  stroke: PropTypes.string,
};

AccountsIcon.displayName = 'AccountsIcon';

export default AccountsIcon;
