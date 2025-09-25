import { Text, useTheme } from 'react-native-paper';
import { Image, View, StyleSheet, useWindowDimensions } from 'react-native';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { fetchFunFact } from '../../store/apps/funFactCard';
import CustomButton from '../../core/UICompoonent/CustomButton';
import NewTheme from '../../common/NewTheme';
import FastImage from '@d11/react-native-fast-image';

export default function FunFactCard() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const funFact = useSelector(state => state.funFact);
  const { width: deviceWidth } = useWindowDimensions();
  const PADDING_H = 12;
  const cardWidth = deviceWidth - PADDING_H * 2;
  const cardHeight = cardWidth * 0.56;

  useEffect(() => {
    dispatch(fetchFunFact());
  }, [dispatch]);

  const baseURL = "https://www.imeuswe.in/famous-families";
  const handleLearnMoreClick = () => {
    if (funFact?.name) {
      const formattedName = encodeURIComponent(funFact?.name.trim().replace(/\s+/g, "-"));
      const finalURL = `${baseURL}/${formattedName}`;
      navigation.navigate('funFactWebView', { url: finalURL }
      );
    }
  };

  return (
    <View
      style={[
        styles.container,
        { width: cardWidth, height: cardHeight, marginHorizontal: PADDING_H }
      ]}
    >
      <FastImage
        source={{
          uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/funfactBackground.png',
        }}
        style={styles.backgroundImage}
        resizeMode='contain'
      />

      <View style={styles.textContainer}>
        <Text style={styles.funFactText}>{funFact?.message}</Text>
      </View>

      <CustomButton
        accessibilityLabel="LearnMore"
        label="Learn More"
        style={styles.buttonOne}
        onPress={handleLearnMoreClick}
        labelStyle={{ fontWeight: 600, fontSize: 14, }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  textContainer: {
    flex: 1,
    marginLeft: 140,
    // marginTop: 12,
    position: 'absolute',
    top: 45,
  },
  funFactText: {
    fontWeight: 'bold',
    color: NewTheme.colors.secondaryDarkBlue,
    fontSize: 14,
  },
  buttonOne: {
    backgroundColor: NewTheme.colors.primaryOrange,
    position: 'absolute',
    bottom: 15,
    right: 15,
    width: 100,
    height: 30,
    borderRadius: 4,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "14px",
    lineHeight: "normal",
    padding: "4px",
  },
});
