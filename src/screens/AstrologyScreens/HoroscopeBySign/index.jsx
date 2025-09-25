import React, { useEffect, useState, useRef, memo } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Text, Appbar, useTheme, Button } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import GradientView from '../../../common/gradient-view';
import Spinner from '../../../common/Spinner';
// import Axios from './../../../plugin/Axios';
import { useDispatch, useSelector } from 'react-redux';
import {
  shareHoroscopeMessage,
  fetchTomorrowHoroscope,
  fetchDailyHoroscope,
  fetchWeeklyHoroscope,
  fetchMonthlyHoroscope,
  fetchYearlyHoroscope,
} from '../../../store/apps/astroHoroscope';
import Share from 'react-native-share';
import { Track } from '../../../../App';
import AstroHeader from '../../../common/AstroHeader';
export default function HoroscopeBySign() {
  const dispatch = useDispatch();
  const theme = useTheme();
  const navigator = useNavigation();
  const userData = useSelector(state => state.userInfo);
  const route = useRoute();
  const { zodiacSign, image } = route.params || { zodiacSign: sign, image: image };
  const [selectedTab, setSelectedTab] = useState('Today');
  const tabs = ['Today', 'Tomorrow', 'Weekly', 'Monthly', 'Yearly'];
  const [responseJson, setResponseJson] = useState();
  const [loaderActiveKey, setLoaderActiveKey] = useState(true);
  // Initialize this at the top of your component
  const tabResponseCache = useRef({});

  useEffect(() => {
    handleTabSelection(selectedTab);
  }, [selectedTab]);

  const handleTabSelection = async tabNameProp => {
    setSelectedTab(tabNameProp);

    // If data for this tab is already cached, use it
    if (tabResponseCache.current[tabNameProp]) {
      setResponseJson(tabResponseCache.current[tabNameProp]);
      return;
    }

    try {
      setLoaderActiveKey(true);
      const payload = {
        date: new Date().toISOString(),
        zodiac: zodiacSign,
      };

      let action;
      switch (tabNameProp) {
        case 'Today':
          action = fetchDailyHoroscope(payload);
          break;
        case 'Tomorrow':
          action = fetchTomorrowHoroscope(payload);
          break;
        case 'Weekly':
          action = fetchWeeklyHoroscope(payload);
          break;
        case 'Monthly':
          action = fetchMonthlyHoroscope(payload);
          break;
        case 'Yearly':
          action = fetchYearlyHoroscope(payload);
          break;
        default:
          throw new Error('Invalid selection');
      }

      const result = await dispatch(action).unwrap();

      // Cache the result for this tab
      tabResponseCache.current[tabNameProp] = result;

      setResponseJson(result);
    } catch (error) {
      // handle error gracefully
    } finally {
      setLoaderActiveKey(false);
    }
  };

  const horoscopeData =
    Array.isArray(responseJson) && responseJson.length > 0
      ? responseJson[0]?.data
      : null;

  const dateKey = responseJson?.[0]?.data
    ? Object.keys(responseJson[0].data)[0]
    : 'Fetching date...';

  // Helper function to format text with proper title case (keeping words like 'and' lowercase)
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

  // Test:
  console.log(formatTitleCase("do's_and_don'ts")); // Output: "Do's and Don'ts"

  const HoroscopeContent = memo(({ horoscopeData, styles }) => {
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
        return Object.keys(content).map((subSection, index) => {
          const subContent = content[subSection];

          return (
            <View key={index}>
              <Text
                style={[styles.sectionTitle, { fontSize: 16, marginTop: 10 }]}>
                {formatTitleCase(subSection)}
              </Text>
              {Array.isArray(subContent) ? (
                subContent.map((item, subIndex) => (
                  <Text key={subIndex} style={styles.horoscopeText}>
                    {'\u2022'} {item}
                  </Text>
                ))
              ) : (
                <Text style={styles.horoscopeText}>{subContent}</Text>
              )}
            </View>
          );
        });
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

            // Display raw dynamicDate before general_overview
            if (section === 'general_overview') {
              arr.push(
                <Text
                  key={`date-${dynamicDate}`}
                  style={[styles.sectionTitle, { fontSize: 16, left: 20 }]}>
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
          <View key="no-data" style={{ alignItems: 'center' }}>
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
      const props = {
        Rashi: zodiacSign,
      };
      Track({
        cleverTapEvent: 'Horoscope_Rashi_Shared',
        mixpanelEvent: 'Horoscope_Rashi_Shared',
        userData,
        cleverTapProps: props,
        mixpanelProps: props,
      });
      await Share.open(options);
    } catch (error) {
      console.error('Error sharing horoscope:', error);
    }
  };
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <AstroHeader>
        <AstroHeader.BackAction onPress={() => navigator.goBack()} />
        <AstroHeader.Content title="Horoscope" />
      </AstroHeader>

      {/* Horoscope Info */}
      <View style={styles.horoscopeContainer}>
        <Image source={{ uri: image }} style={styles.image} />
        <Text style={styles.signName}>{zodiacSign}</Text>
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
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientBorder}>
                  {tabContent}
                </GradientView>
              );
            })}
          </View>
        </ScrollView>
        <ScrollView style={{ height: '62%' }}>
          <View style={{ height: '100%', paddingBottom: '25%' }}>
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
              <HoroscopeContent horoscopeData={horoscopeData} styles={styles} />
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
  signName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  dateRange: {
    fontSize: 14,
    color: '#FFFFFFBF',
    left: 20,
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
  detailsContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: '#2B2941',
    paddingVertical: 10,
    borderRadius: 10,
  },
  gradientBorder: {
    borderRadius: 10,
    padding: 1,
  },
  tabScrollView: {
    flexGrow: 0,
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
    bottom: '13%',
    backgroundColor: '#fff',
    borderRadius: 6,
    elevation: 5,
    alignSelf: 'center',
    borderWidth: 0.5,
  },
});
