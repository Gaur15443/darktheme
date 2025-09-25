import React, { memo } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Card, Text } from 'react-native-paper';
import Swiper from 'react-native-swiper';
import { useSelector } from 'react-redux';
import NewTheme from '../../common/NewTheme';
import ErrorBoundary from '../../common/ErrorBoundary';
import { useIsFocused } from '@react-navigation/native';

const MyCarousel = () => {
  const pageIsFocused = useIsFocused();
  const itsTestimonial = useSelector(state => state?.home?.latestTestimonial);

  const shuffleArray = array => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const shuffledTestimonials = shuffleArray([...itsTestimonial]).slice(0, 5);

  return (
    <ErrorBoundary>
      <View accessibilityLabel="home-carousel-page">
        {shuffledTestimonials.length > 0 && (
          <ScrollView>
            <Swiper
              horizontal
              height={280}
              showsPagination={true}
              autoplay={pageIsFocused}
              autoplayTimeout={3}
              activeDot={<View style={styles.activeDotStyle} />}
              autoplayDirection>
              {shuffledTestimonials.map((item, index) => (
                <View key={index} style={{ marginTop: 2, marginHorizontal: 3 }}>
                  <Card style={[styles.slide]} elevation={0.7}>
                      <View
                        style={{
                          paddingHorizontal: 15,
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '71%',
                        }}>
                        <Text
                          style={{
                            color: NewTheme.colors.blackText,
                            fontWeight: '600',
                            fontSize: 18,
                            textAlign: 'center',
                          }}>
                          {item.content}
                        </Text>
                      </View>
                      <View>
                        <View style={{ flexDirection: 'row' }}>
                          <View style={{ flex: 4 }}>
                            <View
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'space-around',
                              }}>
                              <Image
                                source={{ uri: item.personalDetails.profilePic }}
                                style={{
                                  width: 50,
                                  height: 50,
                                  borderRadius: 25,
                                }}
                                resizeMode="cover"
                              />
                            </View>
                          </View>
                          <View style={{ flex: 8, paddingLeft: 0 }}>
                            <Text
                              style={{
                                color: NewTheme.colors.blackText,
                                fontWeight: '600',
                                fontSize: 18,
                              }}>
                              {`${item.personalDetails.firstName} ${item.personalDetails.lastName}`}
                            </Text>
                            <Text
                              style={{
                                color: NewTheme.colors.blackText,
                                fontSize: 15,
                                fontWeight: '500',
                              }}>
                              {item.personalDetails.location}
                            </Text>
                          </View>
                        </View>
                      </View>
                  </Card>
                </View>
              ))}
            </Swiper>
          </ScrollView>
        )}
      </View>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  slide: {
    justifyContent: 'center',
    backgroundColor: NewTheme.colors.whiteText,
    height: 260,
  },
  activeDotStyle: {
    backgroundColor: NewTheme.colors.primaryOrange,
    width: 8,
    height: 8,
    borderRadius: 4,
    margin: 3,
  },
});

export default memo(MyCarousel);
