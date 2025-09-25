import React from 'react';
import {View} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import PropTypes from 'prop-types';

const StoriesIcon = ({stroke = '#989898'}) => {
  return (
    <View>
      <Svg
        width={22}
        height={19}
        viewBox="0 0 22 19"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <Path
          d="M3 15.625H7.625C7.97325 15.625 8.14738 15.625 8.29405 15.6394C9.71838 15.7797 10.8453 16.9066 10.9856 18.3309C11 18.4776 11 18.6517 11 19V7C11 4.17157 11 2.75736 10.1213 1.87868C9.24264 1 7.82843 1 5 1H3C2.05719 1 1.58579 1 1.29289 1.29289C1 1.58579 1 2.05719 1 3V13.625C1 14.5678 1 15.0392 1.29289 15.3321C1.58579 15.625 2.05719 15.625 3 15.625Z"
          stroke={stroke}
          strokeWidth={2}
        />
        <Path
          d="M19 15.625H14.375C14.0267 15.625 13.8526 15.625 13.7059 15.6394C12.2816 15.7797 11.1547 16.9066 11.0144 18.3309C11 18.4776 11 18.6517 11 19V7C11 4.17157 11 2.75736 11.8787 1.87868C12.7574 1 14.1716 1 17 1H19C19.9428 1 20.4142 1 20.7071 1.29289C21 1.58579 21 2.05719 21 3V13.625C21 14.5678 21 15.0392 20.7071 15.3321C20.4142 15.625 19.9428 15.625 19 15.625Z"
          stroke={stroke}
          strokeWidth={2}
        />
      </Svg>
    </View>
  );
};

StoriesIcon.propTypes = {
  stroke: PropTypes.string,
};

StoriesIcon.displayName = 'StoriesIcon';

export default StoriesIcon;
