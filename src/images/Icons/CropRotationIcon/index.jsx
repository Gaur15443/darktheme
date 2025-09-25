import {memo} from 'react';
import {useTheme} from 'react-native-paper';
import Svg, {Path} from 'react-native-svg';

function CropRotationIcon(props) {
  const theme = useTheme();
  return (
    <Svg
      width={25}
      height={24}
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}>
      <Path
        d="M2.4 6.609h4.472m0 0V2.4m0 4.209v8.942c0 .581.47 1.052 1.052 1.052h9.731M6.872 6.61l9.731-.062c.581 0 1.052.471 1.052 1.052v9.004m0 0H21.6m-3.945 0v5.26"
        stroke={props?.color ?? theme.colors.primary}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5 19l-2-2-2 2m6 4H5.667A2.667 2.667 0 013 20.333v-2M20 5l2 2 2-2m-6-4h1.333A2.667 2.667 0 0122 3.667v2"
        stroke={props?.color ?? theme.colors.primary}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

CropRotationIcon.displayName = 'CropRotationIcon';

export default memo(CropRotationIcon);
