import {Linking, Pressable, StyleSheet, View} from 'react-native';
import NewTheme from '../../../common/NewTheme';
import {Text} from 'react-native-paper';

export default function TermsAndPolicy({
  style = {},
  screenType = 'default',
  linkStyle,
  textStyle,
}) {
  const styles = createStyles(screenType);
  async function handleExternalLink(url) {
    await Linking.openURL(url);
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 30,
        ...style,
      }}>
      <Text
        suppressHighlighting
        variant="bodyMedium"
        style={[styles.termsText, textStyle]}>
        By signing up you're agreeing to accept our
      </Text>
      <Pressable
        accessibilityLabel="terms"
        onPress={() =>
          handleExternalLink('https://imeuswe.in/terms-conditions/')
        }
        style={{alignSelf: 'center'}}>
        <Text style={[styles.link, linkStyle]}> T&Cs </Text>
      </Pressable>
      <Text
        suppressHighlighting
        variant="bodyMedium"
        style={[styles.termsText, textStyle]}>
        and
      </Text>
      <Pressable
        accessibilityLabel="privacyPolicy"
        onPress={() =>
          handleExternalLink('https://www.imeuswe.in/privacy-policy/')
        }
        style={{alignSelf: 'center'}}>
        <Text style={[styles.link, linkStyle]}> Privacy Policy </Text>
      </Pressable>
    </View>
  );
}

function createStyles(screenType) {
  const baseStyles = {
    link: {
      color: NewTheme.colors.linkLightBlue,
    },
    termsText: {
      textAlign: 'center',
      color: NewTheme.colors.lighterGrayText,
    },
  };

  if (screenType === 'LoginWithMobile') {
    return StyleSheet.create({
      ...baseStyles,
      termsText: {
        ...baseStyles.termsText,
        fontSize: 8,
      },
      link: {
        ...baseStyles.link,
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.5,
      },
    });
  }

  return StyleSheet.create(baseStyles);
}
