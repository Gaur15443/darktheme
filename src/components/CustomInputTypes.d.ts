import { 
    TextInputProps, 
    StyleProp, 
    ViewStyle, 
    TextStyle 
} from 'react-native';
import { ReactNode } from 'react';

interface CustomTheme {
    [key: string]: any;
}

export interface TextInputComponentProps extends Omit<TextInputProps, 'textContentType'> {
    clearable?: boolean;
    maskText?: boolean;
    style?: StyleProp<ViewStyle>;
    contentStyle?: StyleProp<TextStyle>;
    leftContentStyles?: StyleProp<ViewStyle>;
    error?: boolean;
    errorText?: string;
    keyboardType?: 
        | 'default'
        | 'number-pad'
        | 'decimal-pad'
        | 'numeric'
        | 'email-address'
        | 'phone-pad'
        | 'url';
    label?: string | ReactNode;
    onChangeText?: (text: string) => void;
    onFocus?: (e: any) => void;
    onBlur?: (e: any) => void;
    onMaskPress?: () => void;
    placeholder?: string;
    placeholderTextColor?: string;
    rotatingPlaceholders?: string[];
    required?: boolean;
    left?: ReactNode;
    right?: ReactNode;
    secureTextEntry?: boolean;
    testID: string;
    textContentType?: TextInputProps['textContentType'];
    value?: string;
    customLabelStyle?: StyleProp<TextStyle>;
    restingLabelStyle?: StyleProp<TextStyle>;
    customTheme?: CustomTheme;
    animateLabel?: boolean;
    rotatingLabels?: string[];
    disabled?: boolean; 
    relationField?: boolean;
    inputHeight?: number | null;
    centerNumber?: number;
    //@ts-expect-error
    textVerticalAlign?: TextInputComponentProps['textVerticalAlign'];
    rightContentStyles?: StyleProp<ViewStyle>;
    crossIconPosition?: string;
    customBorderColor?: null | string;
    customBorderWidth?: null | number;
    innerContainerStyle?: StyleProp<ViewStyle>;
    crossIconBackground?: null | string;
}
