import Svg, { Path } from 'react-native-svg';
import PropTypes from 'prop-types';

function TickIcon({fill = '#2ED047', ...props}) {
  return (
    <Svg
      width={10}
      height={8}
      viewBox="0 0 10 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.813 7.123a.746.746 0 01-.53-.22L.91 4.53a.749.749 0 111.06-1.06l1.844 1.842L8.03 1.097a.749.749 0 111.06 1.06L4.343 6.903a.744.744 0 01-.53.22z"
        fill={fill}
      />
    </Svg>
  );
}

TickIcon.propTypes = {
  fill: PropTypes.string,
};

export default TickIcon;
