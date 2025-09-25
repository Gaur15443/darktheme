import React from 'react';
import {SvgXml} from 'react-native-svg';

const BackArrowIcon = ({fill = 'black'}) => {
  const svgMarkup = `
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" role="button" width="24" height="24" viewBox="0 0 24 24">
      <path fill="${fill}" d="M20 11v2H8l5.5 5.5l-1.42 1.42L4.16 12l7.92-7.92L13.5 5.5L8 11z"></path>
    </svg>
  `;

  return <SvgXml xml={svgMarkup} width="24" height="24" />;
};

export default BackArrowIcon;
