import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Toast from 'react-native-toast-message';
import moment from 'moment';
import {useNavigation} from '@react-navigation/native';
import NewsSpeakerIcon from '../../../images/Icons/New-speaker-icon/index';
import {useTheme} from 'react-native-paper';
import Spinner from '../../../common/Spinner';
import Axios from '../../../plugin/Axios';
import newTheme from '../../../common/NewTheme';
import ErrorBoundary from '../../../common/ErrorBoundary';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNews } from '../../../store/apps/news';

const ListofNews = () => {
  const [latestDate, setLatestDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const theme = useTheme();
  const dispatch = useDispatch();
  const newsList = useSelector((state) => state?.news?.newsList?.data);
  const [newsData, setNewsData] = useState(newsList);

  useEffect(() => {
    if (!newsList || newsList.length === 0) {
      setLoading(true);
      fetchData();
    } else {
      fetchData();
    }
  }, [newsList]);

    const fetchData = async () => {
    if (!newsList || newsList.length === 0) {
      try {
        await dispatch(fetchNews());
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Error fetching data',
          text2: error.message,
        });
      }
    }
  
    const fetchedData = newsList;
    if (fetchedData.length > 0) {
      setLoading(true);
      try {
          const mostRecentDate = fetchedData.reduce((latest, current) => {
            const currentDate = moment(current?.createdAt);
            return currentDate?.isAfter(latest) ? currentDate : latest;
          }, moment(fetchedData[0]?.createdAt));

          setLatestDate(mostRecentDate);
        setNewsData(fetchedData);
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Error fetching data',
          text2: error.message,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const isNewBadge = date => {
    if (!latestDate) return false;

    const itemDate = moment(date);
    return itemDate.isSame(latestDate, 'day');
  };

  if (loading) {
    return (
      <View>
        <Spinner size="large" style={styles.loader} />
      </View>
    );
  }

  const renderItem = ({item}) => {
    const cleanHeading =
      item?.title?.replace(/<[^>]*>/g, '') || 'No Title Available';

    const formattedDate = item.createdAt
      ? moment(item?.createdAt).format('Do MMMM YYYY')
      : 'DD MMMM YYYY';

    return (
      <ErrorBoundary>
        <TouchableOpacity
          style={styles.itemContainer}
          onPress={() => navigation.navigate('NewsDetail', {newsItem: item})}>
          <View>
            <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
              {cleanHeading}
            </Text>
            <Text style={styles.date}>{formattedDate}</Text>
          </View>
          {isNewBadge(item?.createdAt) && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>New</Text>
            </View>
          )}
          <Icon name="chevron-right" style={styles.iconStyle} />
        </TouchableOpacity>
      </ErrorBoundary>
    );
  };

  const renderHeader = () => {
    return (
      <ErrorBoundary>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>What's new</Text>
          <NewsSpeakerIcon style={styles.icon} />
        </View>
      </ErrorBoundary>
    );
  };

  return (
    <ErrorBoundary>
        <FlatList
          data={newsData}
          renderItem={renderItem}
          keyExtractor={item => item?._id}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        />
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    padding: 16,
    backgroundColor: newTheme.colors.backgroundCreamy,
    paddingBottom: 100,
  },
  safeArea: {
    paddingBottom: Platform.OS === 'ios' ? 0 : 90,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  header: {
    fontSize: 16,
    fontWeight: Platform.OS === 'ios' ? '800' : '800',
    color: newTheme.colors.darkText,
    paddingLeft: 4,
  },
  icon: {
    marginLeft: 2,
    marginTop: -3,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: newTheme.colors.darkText,
  },
  date: {
    fontSize: 10,
    color: '#2892FF',
    fontWeight: '500',
    marginTop: 4,
  },
  badgeContainer: {
    backgroundColor: newTheme.colors.primaryOrange,
    paddingVertical: 2.5,
    paddingHorizontal: 6,
    borderRadius: 4,
    textAlign: 'center',
    position: 'absolute',
    top: -8,
    right: 8,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  iconStyle: {
    position: 'absolute',
    bottom: 12,
    right: 10,
    color: 'black',
    fontSize: 10,
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{translateX: -50}, {translateY: -50}],
    width: 100,
    height: 100,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
});

export default ListofNews;
