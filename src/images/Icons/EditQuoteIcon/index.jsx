import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function EditQuoteIcon({ color = '#000', ...props }) {
  return (
    <Svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M11.098 3.804H5.412A3.412 3.412 0 002 7.215v11.373A3.412 3.412 0 005.412 22h11.373a3.412 3.412 0 003.412-3.412v-5.686m-12.51 3.412l4.137-.834c.22-.044.422-.153.58-.311L21.667 5.9a1.137 1.137 0 000-1.608l-1.963-1.96a1.137 1.137 0 00-1.608 0l-9.264 9.27c-.158.157-.266.358-.31.578l-.836 4.133z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default EditQuoteIcon;
