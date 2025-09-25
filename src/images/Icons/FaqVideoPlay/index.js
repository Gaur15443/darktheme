import * as React from "react";
import Svg, { Ellipse, G, Path, Defs } from "react-native-svg";
/* SVGR has dropped some elements not supported by react-native-svg: filter */
const FaqVideoPlay = (props) => (
  <Svg
    width={45}
    height={44}
    viewBox="0 0 45 44"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Ellipse
      cx={22.707}
      cy={22.1523}
      rx={21.75}
      ry={21.75}
      fill="black"
      fillOpacity={0.2}
    />
    <G filter="url(#filter0_d_24878_4414)">
      <Path
        d="M33.2179 21.4358C33.7695 21.7543 33.7695 22.5504 33.2179 22.8689L18.075 31.6116C17.5235 31.9301 16.834 31.532 16.834 30.8951L16.834 13.4096C16.834 12.7727 17.5235 12.3746 18.075 12.6931L33.2179 21.4358Z"
        fill="#E77237"
      />
    </G>
    <Defs></Defs>
  </Svg>
);
export default FaqVideoPlay;
