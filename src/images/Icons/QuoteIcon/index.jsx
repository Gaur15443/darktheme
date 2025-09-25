import Svg, {Path} from 'react-native-svg';

function QuoteIcon({stroke = '#fff', strokeWidth = 2, ...props}) {
  return (
    <Svg
      width={20}
      height={20}
      viewBox="0 0 15 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}>
      <Path
        d="M1.65 12c1.95 0 4.55-.611 4.55-4.889V2.222C6.2 1.458 5.709.99 4.9 1H2.3C1.488 1 1 1.458 1 2.205V5.89c0 .764.488 1.222 1.3 1.222.65 0 .65 0 .65.611v.611c0 .611-.65 1.223-1.3 1.223s-.65.004-.65.63v1.203C1 12 1 12 1.65 12zm7.8 0C11.4 12 14 11.389 14 7.111V2.222C14 1.458 13.508.99 12.7 1h-2.6c-.813 0-1.3.458-1.3 1.205V5.89c0 .764.487 1.222 1.3 1.222h.488c0 1.375.162 2.445-1.788 2.445v1.833c0 .611 0 .611.65.611z"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default QuoteIcon;
