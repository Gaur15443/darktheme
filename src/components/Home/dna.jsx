import React, { memo, useEffect } from 'react';
import { View, Image, Linking, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import NewTheme from '../../common/NewTheme';
import ErrorBoundary from '../../common/ErrorBoundary';
import Swiper from 'react-native-swiper';
import { getHomeMarketingBanners } from '../../store/apps/home';
import { useDispatch, useSelector } from 'react-redux';
import HTMLView from 'react-native-htmlview';
import FastImage from '@d11/react-native-fast-image';

const templateImages = ['https://testing-email-template.s3.ap-south-1.amazonaws.com/templ1.png', 'https://testing-email-template.s3.ap-south-1.amazonaws.com/templ2.png', 'https://testing-email-template.s3.ap-south-1.amazonaws.com/templ3.png', 'https://testing-email-template.s3.ap-south-1.amazonaws.com/templ4.png'];

const DNA = () => {
  const dispatch = useDispatch();
  const marketingBanners = useSelector(state => state?.home?.marketingBanner);
  const bannerList = marketingBanners?.filter(banner => banner?.isPublish);

  useEffect(() => {
    (async () => {
      await dispatch(getHomeMarketingBanners()).unwrap();
    })();
  }, []);

  return (
    <ErrorBoundary>
      <View style={{ flex: 1 }} accessibilityLabel="home-dna">
        {bannerList?.length > 0 ? (
          <Swiper
            loop={true}
            autoplay={true}
            autoplayTimeout={3}
            activeDotColor="#FF6347"
            style={{ height: 300 }}>
            {bannerList.map((banner, index) => (
              <View key={index} style={{ flex: 1 }}>
                <FastImage
                  source={{ uri: templateImages[banner?.position - 1] }}
                  style={styles.templateImage}
                  resizeMode="contain"
                />
                <View style={styles.slideContent}>
                  <View style={styles.leftContent}>
                    {banner?.mediaId?.[0]?.mediaUrl && (
                      <Image
                        source={{ uri: banner.mediaId[0].mediaUrl }}
                        style={styles.leftImage}
                      />
                    )}
                  </View>

                  <View style={styles.rightContent}>
                    <View
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingBottom: 13,
                      }}>
                      <Text style={styles.heading}>
                        {banner?.mobileHeading}
                      </Text>
                      <View style={styles.description}>
                        <HTMLView
                          value={banner?.mobileDescription}
                          stylesheet={htmlStyles}
                        />
                      </View>
                    </View>
                    <Button
                      mode="contained"
                      onPress={() =>
                        banner?.buttonLink && Linking.openURL(banner.buttonLink)
                      }
                      style={[
                        styles.button,
                        {
                          backgroundColor:
                            banner?.position === 1 || banner?.position === 3
                              ? NewTheme.colors.primaryOrange
                              : NewTheme.colors.whiteText,
                        },
                      ]}
                      accessibilityLabel={`btnTemp${index + 1}`}>
                      <Text
                        style={{
                          color:
                            banner?.position === 1 || banner?.position === 3
                              ? NewTheme.colors.whiteText
                              : NewTheme.colors.blackText,
                          fontWeight: '700',
                          fontSize: 14,
                          textAlign: 'center',
                          marginTop: 6,
                        }}>
                        {banner?.buttonText}
                      </Text>
                    </Button>
                  </View>
                </View>
              </View>
            ))}
          </Swiper>
        ) : null}
      </View>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  templateImage: {
    width: '100%',
    height: 250,
  },
  slideContent: {
    position: 'absolute',
    top: 27,
    left: 0,
    right: 0,
    bottom: 0,
    height: 190,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 15,
    paddingRight: 5,
    alignItems: 'center',
  },
  leftContent: {
    flex: 0.9,
  },
  leftImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
    marginVertical: 10,
  },
  rightContent: {
    flex: 1,
    height: '90%',
    marginLeft: 8,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    paddingVertical: 8,
  },
  heading: {
    fontWeight: '700',
    fontSize: 13,
    color: NewTheme.colors.blackText,
    textAlign: 'left',
    marginBottom: 4,
    marginTop: -13,
  },
  description: {
    // flex: 1,
    justifyContent: 'flex-start',
    alignSelf: 'center',
    fontWeight: '300',
    color: NewTheme.colors.blackText,
    textAlign: 'left',
    marginBottom: 5,
  },
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    height: 33,
    width: '98%',
  },
});
const htmlStyles = StyleSheet.create({
  p: {
    fontSize: 12,
    fontWeight: '400',
    color: 'black',
    marginBottom: -28,
  },
  h1: {
    color: 'black',
  },
  h2: {
    color: 'black',
  },
  h3: {
    color: 'black',
  },
  h4: {
    color: 'black',
  },
  h5: {
    color: 'black',
  },
  h6: {
    color: 'black',
  },
});

export default memo(DNA);
