// HorizontalCommunityList.js
import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import ErrorBoundary from '../../../../common/ErrorBoundary';
import ButtonSpinner from '../../../../common/ButtonSpinner';
import NewTheme from '../../../../common/NewTheme';
import FastImage from '@d11/react-native-fast-image';

const HorizontalCardList = ({
  initialData,
  fetchMoreData,
  paginationLimit,
  filterType = 'popular',
}) => {
  const navigation = useNavigation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [lastFetchedDataLength, setLastFetchedDataLength] = useState(null);

  const loadMoreData = async () => {
    if (!loading && lastFetchedDataLength === paginationLimit) {
      setLoading(true);
      const newData = await fetchMoreData(filterType, page + 1, false);
      if (newData) {
        setData([...data, ...newData]);
        setPage(page + 1);
        setLastFetchedDataLength(newData?.length);
      }
      setLoading(false);
    } else {
      return;
    }
  };
  useFocusEffect(
    React.useCallback(() => {
      setData(initialData);
      setLastFetchedDataLength(initialData?.length);
      return () => {
        setData([]);
        setPage(1);
        setLastFetchedDataLength(null);
      };
    }, [initialData]),
  );

  const gotoCommunity = item => {
    navigation.navigate('CommunityDetails', { item: item });
  };

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
        }}>
        <ButtonSpinner />
      </View>
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.cardContainer} key={item?._id}>
      <TouchableOpacity
        onPress={() => gotoCommunity(item)}
        accessibilityLabel={`Go to ${item?.communityName}`}
        style={[styles.cardContainer, { padding: 10 }]}>
        {item?.logoUrl ? (
          <Image
            source={{ uri: item?.logoUrl }}
            style={styles.image}
            accessibilityLabel={`Logo of ${item?.communityName}`}
          />
        ) : (
          <FastImage
            source={{ uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/CommunityDefaultImage.png' }}
            style={styles.image}
            accessibilityLabel="Default community logo"
          />
        )}
        <View style={styles.textContainer}>
          <Text
            style={styles.memberCount}
            accessibilityLabel={`This community has ${item?.membersCount} members`}>
            {item?.membersCount} Members
          </Text>
          <Text
            variant="bold"
            style={styles.title}
            accessibilityLabel={`${item?.communityName} community`}>
            {item?.communityName}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  // Dynamically set the header text based on the filterType prop
  const getHeaderText = () => {
    switch (filterType) {
      case 'new':
        return 'Newly Made';
      case 'active':
        return 'Trending';
      case 'explore':
        return 'Recommended';
      default:
        return 'Popular';
    }
  };

  return (
    <ErrorBoundary>
      {data?.length > 0 && (
        <Text
          variant="bold"
          style={styles.header}
          accessibilityLabel={getHeaderText()}>
          {getHeaderText()}
        </Text>
      )}
      <FlatList
        data={data}
        keyExtractor={item => item._id}
        horizontal
        renderItem={renderItem}
        onEndReached={loadMoreData}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContainer}
        showsHorizontalScrollIndicator={false}
        accessibilityLabel="List of communities"
      />
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  header: {
    fontSize: 22,
    marginTop: 10,
    paddingHorizontal: 20,
  },
  listContainer: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    gap: 10,
  },
  loadingIndicator: {
    marginVertical: 70,
  },
  cardContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    width: 130,
    height: 170,
    overflow: 'hidden',
    borderRadius: 8,
    borderWidth: 0.8,
    borderColor: '#dbdbdb',
    // elevation: 4,
    // shadowColor: '#000',
    // shadowOffset: {width: 0, height: 2},
    // shadowOpacity: 0.22,
    // shadowRadius: 2.22,
  },
  image: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
  },
  textContainer: {
    flex: 1,
    padding: 5,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 19.6,
  },
  memberCount: {
    fontSize: 10,
    color: NewTheme.colors.secondaryLightBlue,
    textAlign: 'center',
  },
});

export default HorizontalCardList;
