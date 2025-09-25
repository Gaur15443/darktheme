import React, {useEffect, useState, useRef, memo} from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import {Text, Appbar, useTheme, Button} from 'react-native-paper';
import {useNavigation, useRoute} from '@react-navigation/native';
import GradientView from '../../../common/gradient-view';
import Share from 'react-native-share';
import Spinner from '../../../common/Spinner';
// import Axios from './../../../plugin/Axios';
import {useDispatch, useSelector} from 'react-redux';
import {
  shareHoroscopeMessage,
  fetchPersonalizedTomorrowHoroscope,
  fetchPersonalizedDailyHoroscope,
  fetchPersonalizedWeeklyHoroscope,
  fetchPersonalizedMonthlyHoroscope,
  fetchPersonalizedYearlyHoroscope,
} from '../../../store/apps/astroHoroscope';
import {Track} from '../../../../App';
import {RootState} from '../../../store';
import AstroHeader from '../../../common/AstroHeader';
function formatDate(isoString: string) {
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}
function formatTime(isoString: string) {
  const date = new Date(isoString);
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}
export default function HoroscopePersonalized() {
  const dispatch = useDispatch();
  const theme = useTheme();
  const navigator = useNavigation();
  const userData = useSelector((state: RootState) => state.userInfo);
  const route = useRoute();
  const {birthData, result} = route.params;
  const [selectedTab, setSelectedTab] = useState('Today');
  const tabs = ['Today', 'Tomorrow', 'Weekly', 'Monthly', 'Yearly'];
  const [responseJson, setResponseJson] = useState();
  const [loaderActiveKey, setLoaderActiveKey] = useState(true);
  const userId = useSelector((state: RootState) => state?.userInfo?._id);
  const birthDateTime = birthData.birthDetails.birthDateTime;
  useEffect(() => {
    handleTabSelection(selectedTab);
  }, [selectedTab]);
  const personalizedTabResponseCache = useRef({});

  const handleTabSelection = async tabNameProp => {
    setSelectedTab(tabNameProp);

    if (personalizedTabResponseCache.current[tabNameProp]) {
      setResponseJson(personalizedTabResponseCache.current[tabNameProp]);
      return;
    }

    try {
      setLoaderActiveKey(true);

      const payload = {
        date: new Date().toISOString(), // Use the current date dynamically
        userId: userId,
      };

      let action;
      switch (tabNameProp) {
        case 'Today':
          action = fetchPersonalizedDailyHoroscope(payload);
          break;
        case 'Tomorrow':
          action = fetchPersonalizedTomorrowHoroscope(payload);
          break;
        case 'Weekly':
          action = fetchPersonalizedWeeklyHoroscope(payload);
          break;
        case 'Monthly':
          action = fetchPersonalizedMonthlyHoroscope(payload);
          break;
        case 'Yearly':
          action = fetchPersonalizedYearlyHoroscope(payload);
          break;
        default:
          throw new Error('Invalid selection');
      }

      const result = await dispatch(action).unwrap();

      // Cache the result for this tab
      personalizedTabResponseCache.current[tabNameProp] = result;

      setResponseJson(result);
    } catch (error) {
      // Optionally log or display error
    } finally {
      setLoaderActiveKey(false);
    }
  };
  const formatTitleCase = text => {
    const lowerCaseWords = [
      'and',
      'or',
      'the',
      'in',
      'on',
      'at',
      'for',
      'with',
      'by',
      'of',
    ];

    return text
      .replace(/_/g, ' ') // Replace underscores with spaces
      .split(' ') // Split into words
      .map((word, index) => {
        const lower = word.toLowerCase();

        // Leave lowercase if it's a common word and not the first
        if (index !== 0 && lowerCaseWords.includes(lower)) {
          return lower;
        }

        // Capitalize first letter, preserving rest (handles apostrophes)
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  };

  const horoscopeData =
    Array.isArray(responseJson) && responseJson.length > 0
      ? responseJson[0]?.data
      : null;

  const dateKey = responseJson?.[0]?.data
    ? Object.keys(responseJson[0].data)[0]
    : 'Fetching date...';

  const HoroscopeContent = memo(({horoscopeData, styles}) => {
    const renderContent = (content, section) => {
      const isArray = Array.isArray;
      const isObject = obj =>
        obj && typeof obj === 'object' && !Array.isArray(obj);

      if (isArray(content)) {
        return (
          content.length > 0 &&
          content.map((item, index) => (
            <Text key={index} style={styles.horoscopeText}>
              {'\u2022'} {item}
            </Text>
          ))
        );
      } else if (isObject(content)) {
        return Object.keys(content).map((subSection, index) => (
          <View key={index}>
            <Text style={[styles.sectionTitle, {fontSize: 16, marginTop: 10}]}>
              {formatTitleCase(subSection)}
            </Text>
            {content[subSection].map((item, subIndex) => (
              <Text key={subIndex} style={styles.horoscopeText}>
                {'\u2022'} {item}
              </Text>
            ))}
          </View>
        ));
      } else {
        return <Text style={styles.horoscopeText}>{content}</Text>;
      }
    };

    const renderHoroscope = () => {
      let arr = [];

      if (horoscopeData !== null) {
        const sortedDates = Object.keys(horoscopeData).sort((a, b) => {
          return new Date(a) - new Date(b);
        });

        for (let dynamicDate of sortedDates) {
          const sections = horoscopeData[dynamicDate];

          for (let section in sections) {
            const content = sections[section][section];

            if (section === 'general_overview') {
              arr.push(
                <Text
                  key={`date-${dynamicDate}`}
                  style={[styles.sectionTitle, {fontSize: 16, left: 20}]}>
                  {dynamicDate}
                </Text>,
              );
            }

            arr.push(
              <View
                key={`${dynamicDate}-${section}`}
                style={styles.horoscopeDetails}>
                <Text style={styles.sectionTitle}>
                  {formatTitleCase(section)}
                </Text>
                {renderContent(content, section)}
              </View>,
            );
          }
        }
      } else {
        arr.push(
          <View key="no-data" style={{alignItems: 'center'}}>
            <Text>No post available.</Text>
          </View>,
        );
      }

      return arr;
    };

    return <>{renderHoroscope()}</>;
  });
  const shareHoroscope = async () => {
    const messageContent = await dispatch(shareHoroscopeMessage()).unwrap();
    const options = {
      title: messageContent.message.title,
      message: messageContent.message.message,
    };

    try {
      Track({
        cleverTapEvent: 'Personalised_Horoscope_Shared',
        mixpanelEvent: 'Personalised_Horoscope_Shared',
        userData,
      });
      await Share.open(options);
    } catch (error) {
      console.error('Error sharing horoscope:', error);
    }
  };

  return (
    <View style={{flex: 1, backgroundColor: theme.colors.background}}>
      {/* Header */}
      <AstroHeader>
        <AstroHeader.BackAction onPress={() => navigator.goBack()} />
        <AstroHeader.Content title="Personalized Horoscope" />
      </AstroHeader>

      {/* Horoscope Info */}
      <View
        style={{
          position: 'relative',
          height: 190,
          width: '100%',
          alignSelf: 'center',
          overflow: 'hidden',
          marginBottom: 10,
        }}>
        {/* Gradient Border Wrapper using GradientView */}
        <GradientView
          variant="modal"
          style={{
            flex: 1,
            padding: 0.5,
          }}
          contentStyle={{
            flex: 1,
            overflow: 'hidden',
          }}>
          {/* Inner content container */}
          <View style={{flex: 1, backgroundColor: 'transparent'}}>
            {/* Background Gradient */}
            <GradientView
              variant="modal"
              style={{
                height: 190,
                width: '100%',
                position: 'absolute',
                paddingHorizontal: 24,
                paddingBlock: 10,
                overflow: 'hidden',
              }}
              contentStyle={{
                flex: 1,
                justifyContent: 'space-evenly',
              }}
            />

            {/* Horoscope Content */}
            <View
              style={{
                flex: 1,
                padding: 16,
                justifyContent: 'space-between',
                marginBottom: 4,
                width: '100%',
              }}>
              <View style={{position: 'absolute', top: 0, left: '78%'}}>
                <View
                  style={{
                    width: '270%',
                    height: '270%',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    transform: [{rotate: '45deg'}],
                    position: 'absolute',
                  }}
                />

                {/* Horoscope Image */}
                <Image
                  source={{uri: result?.[0]?.zodiacUrl}}
                  style={{
                    borderRadius: 100,
                    width: 73,
                    height: 73,
                    top: 54,
                    left: 4,
                  }}
                />
              </View>

              <View
                style={{
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  marginTop: 4,
                }}>
                <Text style={{fontSize: 12, fontWeight: '500', color: 'white'}}>
                  {birthData.gender?.charAt(0).toUpperCase() +
                    birthData.gender?.slice(1)}
                </Text>
                <Text style={{fontSize: 30, fontWeight: 700, color: 'white'}}>
                  {birthData.name}
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    marginTop: 4,
                  }}>
                  <Text style={{fontSize: 14, fontWeight: 500, color: 'white'}}>
                    Moon Sign{' '}
                  </Text>
                  <View
                    style={{
                      height: 14,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{fontSize: 10, fontWeight: '500', color: 'white'}}>
                      .
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: 400,
                      color: 'rgba(255, 255, 255, 0.75)',
                    }}>
                    {' '}
                    {result?.[0]?.zodiac}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    marginTop: 4,
                  }}>
                  <Text style={{fontSize: 14, fontWeight: 500, color: 'white'}}>
                    Date of Birth{' '}
                  </Text>
                  <View
                    style={{
                      height: 14,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{fontSize: 10, fontWeight: '500', color: 'white'}}>
                      .
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: 400,
                      color: 'rgba(255, 255, 255, 0.75)',
                    }}>
                    {' '}
                    {formatDate(birthDateTime)}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    marginTop: 4,
                  }}>
                  <Text style={{fontSize: 14, fontWeight: 500, color: 'white'}}>
                    Time of Birth{' '}
                  </Text>
                  <View
                    style={{
                      height: 14,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{fontSize: 10, fontWeight: '500', color: 'white'}}>
                      .
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: 400,
                      color: 'rgba(255, 255, 255, 0.75)',
                    }}>
                    {' '}
                    {formatTime(birthDateTime)}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    marginTop: 4,
                  }}>
                  <Text style={{fontSize: 14, fontWeight: 500, color: 'white'}}>
                    Place of Birth{' '}
                  </Text>
                  <View
                    style={{
                      height: 14,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{fontSize: 10, fontWeight: '500', color: 'white'}}>
                      .
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: 400,
                      color: 'rgba(255, 255, 255, 0.75)',
                    }}>
                    {' '}
                    {birthData.birthDetails.birthPlace.placeName}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </GradientView>
      </View>

      {/* Tab Selection */}
      <View style={styles.detailsContainer}>
        <ScrollView horizontal style={styles.tabScrollView}>
          <View style={styles.tabContainer}>
            {tabs.map(tab => {
              const isActive = selectedTab === tab;
              const tabContent = (
                <TouchableOpacity
                  onPress={() => handleTabSelection(tab)}
                  style={[styles.tabButton, isActive && styles.activeTab]}>
                  <Text style={styles.tabText}>{tab}</Text>
                </TouchableOpacity>
              );

              return (
                <GradientView
                  key={tab}
                  colors={
                    isActive
                      ? ['#6944D3', '#6944D3']
                      : ['rgba(255, 255, 255, 0.1)', '#6944D3']
                  }
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={styles.gradientBorder}>
                  {tabContent}
                </GradientView>
              );
            })}
          </View>
        </ScrollView>
        <ScrollView style={{height: '62%'}}>
          <View style={{height: '100%', paddingBottom: '25%'}}>
            {loaderActiveKey ? (
              <View
                style={{
                  width: '100%',
                  height: '100%',
                  marginTop: 80,
                  alignSelf: 'center',
                  justifyContent: 'center',
                }}>
                <Spinner />
              </View>
            ) : (
              <HoroscopeContent
                horoscopeData={horoscopeData}
                styles={styles} // Your styles object
              />
            )}
          </View>
        </ScrollView>
        {/* Share Horoscope Button */}
        <Button
          mode="contained"
          style={styles.shareButton}
          textColor="#6944D3"
          onPress={shareHoroscope}>
          Share Horoscope
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },

  horoscopeContainer: {
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },

  dateRange: {
    fontSize: 14,
    color: '#FFFFFFBF',
    left: 20,
  },

  gradientBorder: {
    borderRadius: 10,
    padding: 1,
  },
  tabScrollView: {
    flexGrow: 0,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#2B2941',
    paddingVertical: 8,
    borderRadius: 10,
    marginHorizontal: 12,
    gap: 6,
  },
  tabButton: {
    backgroundColor: '#2B2941',
    borderWidth: 0,
    marginLeft: Platform.OS === 'ios' ? 1.4 : 0.5,
    marginTop: Platform.OS === 'ios' ? 1.4 : 0.5,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: Platform.OS === 'ios' ? 3.5 : 0.8,
    marginRight: Platform.OS === 'ios' ? 3.5 : 0.8,
  },
  tabText: {
    fontSize: 14,
    color: '#FFF',
  },
  activeTab: {
    backgroundColor: '#6944D3',
    borderColor: '#1A0E30 ',
    borderRadius: 8,
  },
  detailsContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: '#2B2941',
    paddingVertical: 10,
    borderRadius: 10,
  },
  horoscopeDetails: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  horoscopeText: {
    fontSize: 16,
    color: '#FFFFFFBF',
    lineHeight: 22,
    letterSpacing: 0,
  },
  attributeText: {
    fontSize: 16,
    marginTop: 5,
  },
  bold: {
    fontWeight: 'bold',
  },
  shareButton: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: '16%',
    backgroundColor: '#fff',
    borderRadius: 6,
    elevation: 5,
    alignSelf: 'center',
    borderWidth: 0.5,
  },
});
