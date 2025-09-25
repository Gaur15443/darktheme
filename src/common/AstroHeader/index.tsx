import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {astroTheme} from '../../../App';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Text} from 'react-native-paper';

type ThemeColors = {
  primary: string;
  background: string;
  text: string;
  [key: string]: any;
};

interface AstroTheme {
  colors: ThemeColors;
}

interface AstroHeaderProps {
  children?: React.ReactNode;
  theme?: AstroTheme;
  style?: ViewStyle;
}

interface BackActionProps {
  onPress?: () => void;
  color?: string;
  theme?: AstroTheme;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

interface ContentProps {
  title?: string;
  style?: ViewStyle;
  theme?: AstroTheme;
  children?: React.ReactNode;
  titleProps?: TextStyle;
}

interface AstroHeaderComponent extends React.FC<AstroHeaderProps> {
  BackAction: React.FC<BackActionProps>;
  Content: React.FC<ContentProps>;
}

const AstroHeader: AstroHeaderComponent = ({children, theme, style = {}}) => {
  const defaultTheme = useTheme();
  const headerTheme = astroTheme as unknown as AstroTheme;
  const {top} = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.header,
        {backgroundColor: headerTheme.colors.background, paddingTop: top},
        style,
      ]}>
      {React.Children.map(children, child => {
        if (React.isValidElement<BackActionProps | ContentProps>(child)) {
          return React.cloneElement(child, {theme: headerTheme});
        }
        return child;
      })}
    </View>
  );
};

const BackAction: React.FC<BackActionProps> = ({
  onPress,
  theme,
  style,
  icon,
  ...props
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.backAction, style]}
    accessibilityRole="button">
    <Text style={[styles.backIcon, {color: theme?.colors.text || '#fff'}]}>
      {icon || (
        <MaterialIcons name="arrow-back" size={24} color="#fff" {...props} />
      )}
    </Text>
  </TouchableOpacity>
);

const Content: React.FC<ContentProps> = ({
  title,
  style,
  theme,
  children,
  titleProps,
  ...props
}) => (
  <View style={[styles.content, style]} {...props}>
    {title && (
      <Text
        // @ts-ignore
        variant="bold"
        style={[
          styles.title,
          {color: theme?.colors.text || '#fff'},
          titleProps,
        ]}>
        {title}
      </Text>
    )}
    {children}
  </View>
);

AstroHeader.BackAction = BackAction;
AstroHeader.Content = Content;

const styles = StyleSheet.create({
  header: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 20,
  },
  backAction: {
    paddingLeft: 8,
    paddingTop: 8,
    paddingBottom: 8,
  },
  backIcon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 8,
    paddingTop: 8,
    paddingBottom: 8,
  },
  title: {
    fontSize: 16,
  },
});

export default AstroHeader;
