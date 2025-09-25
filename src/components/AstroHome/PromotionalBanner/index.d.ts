import { TextProps } from 'react-native';
import { LinearGradientProps } from 'react-native-linear-gradient';

export interface SliderProps {
    vedic: {
        banners: { url: string }[];
    };
}

export type GradientTextProps = {
  text: string;
  style?: object;
  angle?: number;
  colors?: string[];
  selectable?: boolean;
} & Omit<LinearGradientProps, 'colors'> & TextProps;
