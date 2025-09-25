import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import PropTypes from 'prop-types';

const Milestone = ({ strokeColor, ...props }) => (
	<View {...props}>
		<Svg
			width={22}
			height={22}
			viewBox="0 0 29 30" // Adjusted viewBox
			fill="none"
		>
			<Path
				stroke={strokeColor}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2.5}
				d="M13.873 4.755H6.765A4.265 4.265 0 0 0 2.5 9.019v14.216A4.265 4.265 0 0 0 6.765 27.5H20.98a4.265 4.265 0 0 0 4.265-4.265v-7.108M9.608 20.392l5.172-1.042c.275-.056.527-.19.725-.389L27.084 7.376a1.422 1.422 0 0 0-.001-2.01l-2.453-2.45a1.422 1.422 0 0 0-2.01 0L11.04 14.504c-.197.197-.332.449-.388.723l-1.044 5.166Z"
			/>
		</Svg>
	</View>
);

Milestone.propTypes = {
	strokeColor: PropTypes.string.isRequired,
};

export default Milestone;
