import {useEffect} from 'react';
import {Text, TextInput} from 'react-native';
import {
  Text as PaperText,
  TextInput as PaperTextInput,
} from 'react-native-paper';

export default function FontSizeConfig({children}) {
  function resetTextProps() {
    if (Text.defaultProps == null) {
      Text.defaultProps = {};
    }
    Text.defaultProps.allowFontScaling = false;

    if (TextInput.defaultProps == null) {
      TextInput.defaultProps = {};
    }
    TextInput.defaultProps.allowFontScaling = false;

    if (PaperText.defaultProps == null) {
      PaperText.defaultProps = {};
    }
    PaperText.defaultProps.allowFontScaling = false;

    if (PaperTextInput.defaultProps == null) {
      PaperTextInput.defaultProps = {};
    }
    PaperTextInput.defaultProps.allowFontScaling = false;
  }

  useEffect(() => {
    resetTextProps();
  }, []);

  return <>{children}</>;
}
