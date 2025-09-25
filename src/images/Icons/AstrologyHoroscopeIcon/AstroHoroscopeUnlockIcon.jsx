import Svg, { Path, ClipPath, Defs, Rect, G } from 'react-native-svg';
import PropTypes from 'prop-types';

function HoroscopeUnlockIcon({ fill = '#2ED047', stroke = '#6944D3', ...props }) {
  return (
    <Svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <Defs>
        <ClipPath id="clip0">
          <Rect width="24" height="24" fill="white" transform="translate(0.5)" />
        </ClipPath>
      </Defs>

      <G clipPath="url(#clip0)">
        <Path
          d="M12 21H7.5C6.96957 21 6.46086 20.7893 6.08579 20.4142C5.71071 20.0391 5.5 19.5304 5.5 19V13C5.5 12.4696 5.71071 11.9609 6.08579 11.5858C6.46086 11.2107 6.96957 11 7.5 11H17.5C17.88 11 18.234 11.106 18.537 11.29"
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M8.5 11V7C8.5 5.93913 8.92143 4.92172 9.67157 4.17157C10.4217 3.42143 11.4391 3 12.5 3C13.5609 3 14.5783 3.42143 15.3284 4.17157C16.0786 4.92172 16.5 5.93913 16.5 7V11"
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M18.5001 22.0001L21.8501 18.7161C22.0556 18.5168 22.219 18.2783 22.3307 18.0147C22.4425 17.7512 22.5003 17.4679 22.5007 17.1817C22.5012 16.8954 22.4443 16.612 22.3334 16.3481C22.2225 16.0841 22.0599 15.8451 21.8551 15.6451C21.4373 15.2365 20.8763 15.0071 20.2918 15.006C19.7074 15.0049 19.1455 15.2321 18.7261 15.6391L18.5021 15.8591L18.2791 15.6391C17.8613 15.2307 17.3006 15.0016 16.7163 15.0005C16.1321 14.9994 15.5705 15.2264 15.1511 15.6331C14.9456 15.8324 14.7821 16.0708 14.6703 16.3343C14.5585 16.5978 14.5006 16.8811 14.5 17.1673C14.4994 17.4536 14.5562 17.7371 14.667 18.001C14.7778 18.265 14.9404 18.504 15.1451 18.7041L18.5001 22.0001Z"
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
    </Svg>
  );
}

// Define prop types for validation
HoroscopeUnlockIcon.propTypes = {
  fill: PropTypes.string,
  stroke: PropTypes.string,
};

export default HoroscopeUnlockIcon;
