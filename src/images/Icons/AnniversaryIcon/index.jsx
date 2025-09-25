import {Circle, Rect, Svg} from 'react-native-svg';

const AnniversaryIcon = props => (
  <Svg
    accessibilityLabel={props.accessibilityLabel}
    width={36}
    height={36}
    fill="none">
    <Rect width={36} height={36} fill="#83BA00" rx={8} />
    <Circle cx={15} cy={15} r={6.1} stroke="#F1F1F1" strokeWidth={1.8} />
    <Circle cx={21} cy={21} r={6.1} stroke="#F1F1F1" strokeWidth={1.8} />
  </Svg>
);
export default AnniversaryIcon;
