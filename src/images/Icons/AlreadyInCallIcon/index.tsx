import Svg, {Circle, ClipPath, Defs, G, Path, Rect} from 'react-native-svg';

export default function AlreadyInCallIcon() {
  return (
    <Svg width="49" height="48" viewBox="0 0 49 48" fill="none">
      <Circle cx="24.5" cy="24" r="24" fill="white" />
      <G clip-path="url(#clip0_27319_305723)">
        <Path
          d="M20.5 19C20.5 20.0609 20.9214 21.0783 21.6716 21.8284C22.4217 22.5786 23.4391 23 24.5 23C25.5609 23 26.5783 22.5786 27.3284 21.8284C28.0786 21.0783 28.5 20.0609 28.5 19C28.5 17.9391 28.0786 16.9217 27.3284 16.1716C26.5783 15.4214 25.5609 15 24.5 15C23.4391 15 22.4217 15.4214 21.6716 16.1716C20.9214 16.9217 20.5 17.9391 20.5 19Z"
          stroke="#6944D3"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M18.5 33V31C18.5 29.9391 18.9214 28.9217 19.6716 28.1716C20.4217 27.4214 21.4391 27 22.5 27H26"
          stroke="#6944D3"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M31.5 34V34.01"
          stroke="#6944D3"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M31.5 31C31.9483 30.9986 32.3832 30.8468 32.735 30.569C33.0868 30.2911 33.3352 29.9033 33.4406 29.4675C33.5459 29.0318 33.5019 28.5733 33.3158 28.1655C33.1297 27.7576 32.8122 27.424 32.414 27.218C32.0162 27.0142 31.5611 26.951 31.1228 27.0387C30.6845 27.1264 30.2888 27.3598 30 27.701"
          stroke="#6944D3"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_27319_305723">
          <Rect
            width="24"
            height="24"
            fill="white"
            transform="translate(12.5 12)"
          />
        </ClipPath>
      </Defs>
    </Svg>
  );
}
