import PropTypes from 'prop-types';
import Svg, {G, Path, Defs, ClipPath} from 'react-native-svg';

function HomeIcon({fill = '#fff', stroke = '#989898', ...props}) {
  return (
    <Svg
      width={21}
      height={20}
      viewBox="0 0 21 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}>
      <G clipPath="url(#clip0_8_52)" stroke={stroke} strokeWidth={2}>
        <Path d="M1.313 9.764c0-1.48 0-2.22.349-2.871.35-.65 1.005-1.133 2.317-2.096l1.273-.935C7.624 2.121 8.81 1.25 10.222 1.25c1.413 0 2.599.87 4.97 2.612l1.274.935c1.312.963 1.968 1.445 2.317 2.096.35.65.35 1.39.35 2.871v4.624c0 2.056 0 3.084-.746 3.723-.746.639-1.946.639-4.346.639H6.404c-2.4 0-3.6 0-4.346-.639-.745-.639-.745-1.667-.745-3.723V9.764z" />
        <Path
          d="M13.405 18.75v-5.452c0-.602-.57-1.09-1.273-1.09H8.313c-.703 0-1.273.488-1.273 1.09v5.452"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_8_52">
          <Path fill={fill} d="M0 0H21V20H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

HomeIcon.propTypes = {
  fill: PropTypes.string,
  stroke: PropTypes.string,
};

HomeIcon.displayName = 'HomeIcon';

export default HomeIcon;
