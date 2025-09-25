import React from 'react';
import PropTypes from 'prop-types';
import {CircularProgress} from 'react-native-circular-progress';
import NewTheme from '../../../common/NewTheme';
const ProgressBar = ({children, propercentage}) => {
  return (
    <CircularProgress
      size={55}
      width={5}
      fill={propercentage}
      rotation={0}
      tintColor={NewTheme.colors.secondaryLightBlue}
      backgroundColor={NewTheme.colors.backgroundWhite}
      accessibilityLabel={`${propercentage}`}>
      {() => children}
    </CircularProgress>
  );
};

ProgressBar.propTypes = {
  propercentage: PropTypes.number.isRequired,
  children: PropTypes.element.isRequired,
};

export default ProgressBar;
