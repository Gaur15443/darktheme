import React, {memo} from 'react';
import {View} from 'react-native';
import LinearGradient, {
  LinearGradientProps,
} from 'react-native-linear-gradient';
import type {gradientViewProps} from './gradient-view.types';
/**
 * A reusable component that applies a linear gradient background with configurable colors and direction.
 *
 * @param {Object} props - The props for the GradientView component.
 * @param {Array<string>} [props.colors=['rgba(105, 68, 211, 0.5)', '#0E0E10']] - The colors to be used in the gradient.
 * @param {Object} [props.start={x: 1, y: 0}] - The starting point of the gradient, defined by x and y values.
 * @param {Object} [props.end={x: 0, y: 1}] - The ending point of the gradient, defined by x and y values.
 * @param {Object} [props.style={}] - Custom styles to be applied to the LinearGradient component.
 * @param {React.ReactNode} [props.children] - The content to be displayed inside the gradient.
 * @param {Object} [props.contentStyle={}] - Custom styles to be applied to the content inside the gradient.
 *
 */

const GradientView = ({
  variant = 'normal',
  colors = undefined,
  start = {x: 1, y: 0},
  end = {x: 0, y: 1},
  style,
  children,
  contentStyle = {},
  ...props
}: gradientViewProps & Partial<LinearGradientProps>): React.ReactElement => {
  const _colors = colors
    ? colors
    : variant === 'normal'
      ? ['rgba(105, 68, 211, 1)', 'rgba(14, 14, 16, 1)']
      : // ['rgb(75, 52, 139)', 'rgba(14, 14, 16, 1)']
        variant === 'highlight'
        ? ['rgb(101, 52, 52)', 'rgba(88, 22, 22, 0.1)']
        : ['rgba(105, 68, 211, 0.5)', 'rgba(14, 14, 16, 1)'];
  return (
    <LinearGradient
      colors={_colors}
      start={start}
      end={end}
      style={[style]}
      useAngle={true}
      angle={variant === 'normal' ? 240 : 190}
      angleCenter={{x: 0.5, y: 0.5}}
      {...props}>
      <View style={[contentStyle]}>{children}</View>
    </LinearGradient>
  );
};

export default memo(GradientView);
