import React from 'react';
import {Svg, Path} from 'react-native-svg';
import NewTheme from '../../../common/NewTheme';

export default function TickMarkIcon() {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={40}
      height={35}
      fill="none"
      viewBox="0 0 300 300">
      <Path
        fill={NewTheme.colors.primaryOrange}
        fillRule="evenodd"
        d="M150 43.75C91.412 43.75 43.75 91.412 43.75 150c0 58.587 47.662 106.25 106.25 106.25 58.587 0 106.25-47.663 106.25-106.25 0-58.588-47.663-106.25-106.25-106.25M150 275c-68.925 0-125-56.075-125-125S81.075 25 150 25s125 56.075 125 125-56.075 125-125 125"
        clipRule="evenodd"
      />
      <Path
        fill={NewTheme.colors.primaryOrange}
        fillRule="evenodd"
        d="M135.047 189.072c-2.388 0-4.8-.913-6.625-2.75l-29.675-29.663a9.363 9.363 0 0 1 0-13.25 9.364 9.364 0 0 1 13.25 0l23.05 23.025 52.7-52.687a9.362 9.362 0 0 1 13.25 0 9.364 9.364 0 0 1 0 13.25l-59.325 59.325a9.303 9.303 0 0 1-6.625 2.75"
        clipRule="evenodd"
      />
    </Svg>
  );
}
