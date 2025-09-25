import React from 'react';
import {ViewProps, ViewStyle} from 'react-native';

export interface gradientViewProps extends ViewProps {
  colors?: string[]|undefined;
  start?: {x: number; y: number};
  end?: {x: number; y: number};
  style?: ViewStyle;
  children?: React.ReactNode;
  contentStyle?: ViewStyle;
  variant?: "normal" | "highlight" | "modal"
}
