import React from 'react';
import {
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ErrorBoundary from '../../../common/ErrorBoundary';
import {CloseIcon} from '../../../images';
import {useNavigation} from '@react-navigation/native';
import {Shadow} from 'react-native-shadow-2';

function SelectedCategory({onClickTab = () => undefined}) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const {width, height} = Dimensions.get('window');

  function GoBack() {
    navigation.goBack();
  }

  function ShadowWrapper({children}) {
    return (
      <Shadow
        distance={6}
        startColor="rgba(0, 0, 0, 0.3)"
        offset={[1, 5.5]}
        // radius={10}
        style={{
          width: Platform.OS === 'ios' ? 170 : '100%',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        containerStyle={{
          width: '100%',
          // justifyContent: 'center',
          // alignItems: 'center',
          // borderWidth: 1
        }}>
        {children}
      </Shadow>
    );
  }

  const images = [
    'https://testing-email-template.s3.ap-south-1.amazonaws.com/icons/StoryIcon.png',
    'https://testing-email-template.s3.ap-south-1.amazonaws.com/icons/MomentsIcon.png',
    'https://testing-email-template.s3.ap-south-1.amazonaws.com/icons/AudioIcon.png',
    'https://testing-email-template.s3.ap-south-1.amazonaws.com/icons/QuotesIcon.png',
  ];

  const descriptionItems = [
    [
      {
        icon: (
          <ShadowWrapper>
            <FastImage
              source={{
                uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/icons/StoryIcon.png',
              }}
              style={{width: '100%', height: '100%'}}
              resizeMode={FastImage.resizeMode.cover}
            />
          </ShadowWrapper>
        ),
        image: images[0],
        titleText: 'Stories',
        text: 'Share your experiences & highlights, preserving you moments for all to see.',
        tabNumber: 0,
      },
      {
        icon: (
          <ShadowWrapper>
            <View
              style={{
                width: width / 2 - 12,
                height: width / 2 - 20,
                borderRadius: 14,
                overflow: 'hidden',
              }}>
              {/* <MomentsDescriptionIcon style={{flex: 1, borderWidth: 10}}/> */}
              <FastImage
                source={{
                  uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/icons/MomentsIcon.png',
                }}
                style={{
                  width: '100%',
                  height: '100%',
                }}
                resizeMode={FastImage.resizeMode.cover}
              />
            </View>
          </ShadowWrapper>
        ),
        image: images[1],
        titleText: 'Moments',
        text: 'Capture and cherish your most meaningful memories forever.',
        tabNumber: 1,
      },
    ],
    [
      {
        icon: (
          //  <AudiosDescriptionIcon />,
          <ShadowWrapper>
            <View
              style={{
                width: width / 2 - 12,
                height: width / 2 - 20,
                borderRadius: 14,
                overflow: 'hidden',
              }}>
              <FastImage
                source={{
                  uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/icons/AudioIcon.png',
                }}
                style={{width: '100%', height: '100%'}}
                resizeMode={FastImage.resizeMode.cover}
              />
            </View>
          </ShadowWrapper>
        ),
        image: images[2],
        titleText: 'Audios',
        text: 'Express yourself with voice notes, music, or sound clips.',
        tabNumber: 2,
      },
      {
        icon: (
          // <QuotesDescriptionIcon />,
          <ShadowWrapper>
            <View
              style={{
                width: width / 2 - 12,
                height: width / 2 - 20,
                borderRadius: 14,
                overflow: 'hidden',
              }}>
              <FastImage
                source={{
                  uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/icons/QuotesIcon.png',
                }}
                style={{width: '100%', height: '100%'}}
                resizeMode={FastImage.resizeMode.cover}
              />
            </View>
          </ShadowWrapper>
        ),
        image: images[3],
        titleText: 'Quotes',
        text: 'Inspire others with impactful words and memorable lines.',
        tabNumber: 3,
      },
    ],
  ];

  const handleTabClick = tabNumber => {
    // Call the onClickTab prop
    onClickTab(tabNumber);

    // Navigate to CreateStory screen with the current tab number
    navigation.navigate('CreateStory', {currentTabValue: tabNumber});
  };

  return (
    <ErrorBoundary.Screen>
      <View style={[styles.container, {paddingTop: insets.top}]}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Select Category</Text>
          <CloseIcon onPress={() => GoBack()} />
        </View>

        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          style={{display: 'flex', height: '100%', gap: 20, paddingTop: 50}}>
          <View
            style={{
              flexDirection: 'row',
              gap: 10,
              paddingHorizontal: 10,
              marginBottom: 20,
            }}>
            {descriptionItems[0].map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.gridItem}
                onPress={() => handleTabClick(item.tabNumber)}>
                {/* {item.icon} */}
                <View
                  style={{
                    height: width / 2 - 15,
                    borderRadius: 14,
                    overflow: 'hidden',
                    paddingBottom: 10,
                  }}>
                  <ShadowWrapper>
                    <FastImage
                      source={{
                        uri: item.image,
                      }}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 10,
                      }}
                      resizeMode={FastImage.resizeMode.cover}
                    />
                  </ShadowWrapper>
                </View>
                <Text style={styles.gridItemTitleText}>{item.titleText}</Text>
                <Text style={styles.gridItemText}>{item.text}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{flexDirection: 'row', gap: 10, paddingHorizontal: 10}}>
            {descriptionItems[1]?.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.gridItem}
                onPress={() => handleTabClick(item.tabNumber)}>
                {/* {item.icon} */}
                <View
                  style={{
                    height: width / 2 - 15,
                    borderRadius: 10,
                    overflow: 'hidden',
                    paddingBottom: 10,
                  }}>
                  <ShadowWrapper>
                    <FastImage
                      source={{
                        uri: item.image,
                      }}
                      style={{width: '100%', height: '100%', borderRadius: 10}}
                      resizeMode={FastImage.resizeMode.cover}
                    />
                  </ShadowWrapper>
                </View>
                <Text style={styles.gridItemTitleText}>{item.titleText}</Text>
                <Text style={styles.gridItemText}>{item.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </ErrorBoundary.Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    marginBottom: 20,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  containersWrapper: {
    flex: 1,
    flexDirection: 'column',
    borderWidth: 1,
  },
  // gridContainer: {
  //   flexDirection: 'row',
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   marginVertical: 15,
  //   overflow: 'hidden',
  //   width: '100%',
  // },
  gridItem: {
    flex: 1,
    // width: '45%',
    // margin: 8,
    // alignItems: 'center',
    // justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    // zIndex: 1,
    borderRadius: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    elevation: 5,
  },
  gridItemText: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingBottom: 15,
  },
  gridItemTitleText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#000000',
    fontWeight: '600',
    paddingHorizontal: 8,
    marginTop: 10,
  },
});

export default SelectedCategory;
