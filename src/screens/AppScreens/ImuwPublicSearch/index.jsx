import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Platform,
} from 'react-native';
import {Text} from 'react-native-paper';

import BackArrowIcon from '../../../images/Icons/BackArrowIcon';
import {Image} from 'react-native';
import ViewIcon from '../../../core/icon/view-icon';
import {useNavigation} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import Theme from '../../../common/Theme';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  getPublicDataPlural,
  getPublicDataSingular,
} from '../../../store/apps/listPublicData';
import Toast from 'react-native-toast-message';
import ButtonSpinner from '../../../common/ButtonSpinner';

import ErrorBoundary from '../../../common/ErrorBoundary';
const ImuwPublicSearch = ({route}) => {
  const {propCategoryName, fname, lname, isCategoryArray} = route.params;
  const ios = Platform.OS === 'ios';
  const {top} = useSafeAreaInsets();
  const dispatch = useDispatch();
  // const count = useRef(0);
  const [count, setCount] = useState(1);
  const [pluralData, setAllPluralData] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const navigator = useNavigation();

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = {
        firstname: fname?.toUpperCase?.() || '',
        lastname: lname?.toUpperCase?.() || '',
        catagory: isCategoryArray,
        pageNum: count,
        pageSize: 20,
      };
      const response = await dispatch(getPublicDataPlural({payload: data}));
      if (Array.isArray(response?.payload)) {
        setAllPluralData(response.payload);
      } else {
        setAllPluralData([]);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSingularRecord = async item => {
    try {
      const categoryArray = [];
      categoryArray.push(item?.filesData?.category);
      const data = {
        catagory: categoryArray,
        personId: item._id,
      };
      const response = await dispatch(getPublicDataSingular({payload: data}));
      navigator.navigate('ImeusweSingularSearch', {
        propCategoryName: propCategoryName,
        allSingularData: response.payload,
        categoryForOthers: categoryArray[0],
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  };

  const renderPluralData = ({item: item, index}) => {
    const isLastItem = index === pluralData?.length - 1;
    return (
      <ErrorBoundary>
        <View
          key={`${item?.name}_${item?._id}_${index}`}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: isLastItem ? 60 : 10,
            paddingRight: 10,
          }}>
          <View style={styles.itemContent}>
            <Text style={{fontSize: 16, fontWeight: 500, color: 'black'}}>
              #{index + 1}
            </Text>
            <Text style={styles.recordTitleList}>
              {item?.name} {item?.lastName}
            </Text>

            {item.dateOfBirth &&
              !isNaN(new Date(item?.dateOfBirth).getTime()) && (
                <Text style={styles.recordStateList}>
                  {/^\d{2}-\d{2}-\d{4}$/.test(item?.dateOfBirth)
                    ? item?.dateOfBirth.split('-')[2]
                    : new Date(item?.dateOfBirth).getFullYear()}
                </Text>
              )}
            {item?.place?.state && item.place?.country && (
              <Text style={styles.recordStateList}>
                {item?.place?.state ? `${item?.place?.state},` : ''}
                {item?.place?.country ? ` ${item?.place?.country}` : ''}
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={{alignSelf: 'center'}}
            accessibilityLabel="View Icon"
            activeOpacity={1}
            key={item._id}
            onPress={() => handleSingularRecord(item)}>
            <ViewIcon />
          </TouchableOpacity>
        </View>
      </ErrorBoundary>
    );
  };

  useEffect(() => {
    try {
      fetchData();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
    return () => {
      setAllPluralData([]);
    };
  }, []);

  const handleGetNextPage = async () => {
    try {
      const nextPageCount = count + 1;
      const data = {
        firstname: fname?.toUpperCase?.() || '',
        lastname: lname?.toUpperCase?.() || '',
        catagory: isCategoryArray,
        pageNum: nextPageCount,
        pageSize: 20,
      };

      const nextresponse = await dispatch(
        getPublicDataPlural({
          payload: data,
        }),
      );

      if (Array.isArray(nextresponse?.payload)) {
        if (nextresponse.payload.length > 0) {
          setCount(nextPageCount);
          setAllPluralData([...pluralData, ...nextresponse.payload]);
        }
        return;
      } else {
        return;
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
      // Handle error
    }
  };
  return (
    <ErrorBoundary.Screen>
      <View
        style={{
          paddingTop: ios ? top : top + 10,
        }}>
        {/* header items parent */}
        <View
          style={{
            height: 70,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}>
          {/* backbuton */}
          <TouchableOpacity
            style={{position: 'absolute', left: 10}}
            testID="search-close"
            accessibilityLabel="backArrow"
            activeOpacity={1}
            onPress={() => {
              setAllPluralData([]);
              navigator.goBack();
            }}>
            <BackArrowIcon />
          </TouchableOpacity>
          {/* backbuton */}

          {/* imuw image */}
          <View>
            <Image
              source={require('../../../assets/images/OnlyLogo.png')}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
          {/* imuw image */}
        </View>
        {/* header items parent */}
      </View>
      <View>
        <Text style={styles.totalCount}>
          {pluralData?.length === 1
            ? `${
                propCategoryName === 'Others' ? 'Other' : propCategoryName
              } Record`
            : `${
                propCategoryName === 'Others' ? 'Other' : propCategoryName
              } Records`}
        </Text>
        <View
          style={{
            marginHorizontal: 20,
            marginTop: 10,
            paddingBottom: Platform.OS === 'android' ? 170 : 225,
          }}>
          <FlatList
            data={pluralData}
            renderItem={renderPluralData}
            keyExtractor={(item, index) => `${item._id}${index}`}
            onEndReached={handleGetNextPage}
            scrollEnabled={pluralData.length > 8}
            showsVerticalScrollIndicator={false}
          />
          {isLoading && (
            <View style={styles.horizontalCenter}>
              <ButtonSpinner />
            </View>
          )}
        </View>
      </View>
    </ErrorBoundary.Screen>
  );
};

const styles = StyleSheet.create({
  image: {
    width: 100,
    height: 41,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  totalCount: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
    color: Theme.light.shadow,
  },
  itemContainer: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recordTitleList: {
    textTransform: 'capitalize',
    fontSize: 16,
    fontWeight: 'bold',
    color: Theme.light.shadow,
  },
  recordStateList: {
    fontSize: 14,
    color: '#888',
  },
  horizontalCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
});

export default ImuwPublicSearch;
