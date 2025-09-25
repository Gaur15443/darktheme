import * as React from 'react';
import Svg, {G, Path} from 'react-native-svg';
import NewTheme from '../../../common/NewTheme';

function CalendarPinkIcon(props) {
  return (
    <Svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke={NewTheme.colors.primaryOrange}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      {...props}>
      <Path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7zM16 3v4M8 3v4M4 11h16M7 14h.013M10.01 14h.005M13.01 14h.005M16.015 14h.005M13.015 17h.005M7.01 17h.005M10.01 17h.005" />
    </Svg>
  );
}

export default CalendarPinkIcon;
