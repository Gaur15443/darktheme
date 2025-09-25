import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  ScrollView,
} from 'react-native';
import {ActivityIndicator, Text} from 'react-native-paper';
import React, {useState, useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {
  RenderSearchedCommunityList,
  CustomSearchBar,
  GlobalHeader,
} from '../../../../components';
import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import theme from '../../../../common/NewTheme';
import Spinner from '../../../../common/Spinner';
import {useGetFilteredCommunities} from '../../../../store/apps/communitiesApi';
import {useQueryClient} from '@tanstack/react-query';

const CommunitySearchScreen = ({route}) => {
  const [searchStr, setSearchStr] = useState('');
  const [filterOn, setFilterOn] = useState('explore');
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const {
    data,
    refetch,
    hasNextPage,
    isFetching,
    isLoading,
    fetchNextPage,
    isFetchingNextPage,
  } = useGetFilteredCommunities(filterOn, searchStr);
  const results = data?.pages?.flatMap(page => page.data) || [];

  const filters = {
    Recommended: 'explore',
    Trending: 'active',
    Popular: 'popular',
    'Newly Made': 'new',
  };

  useFocusEffect(
    React.useCallback(() => {
      refetch(); // Refetch when search text or filter changes
    }, [searchStr, filterOn]),
  );

  const handleTabPress = async tab => {
    setFilterOn(filters[tab]);
  };

  const handleSearchInput = text => {
    setSearchStr(text);
    if (text === '') {
      setSearchStr('');
    }
  };

  const goBack = () => {
    navigation.navigate('BottomTabs', {screen: 'CommunitiesScreenTab'});
  };

  const pageIsFocused = useIsFocused();

  const renderEmptyState = ({item, index}) => (
    <View
      style={{justifyContent: 'center', alignItems: 'center', height: 350}}
      accessibilityLabel="No communities found container">
      <Text
        accessibilityLabel={`No communities found for search query ${searchStr}`}>
        No communities found for "{searchStr}".
      </Text>
    </View>
  );
  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <ActivityIndicator
        style={styles.loadingIndicator}
        color={theme.colors.primaryOrange}
        accessibilityLabel="Loading more communities"
      />
    );
  };
  return (
    <>
      <GlobalHeader
        heading={'Search'}
        onBack={goBack}
        backgroundColor={theme.colors.backgroundCreamy}
      />

      <View style={{flex: 1, paddingTop: Platform.OS === 'ios' ? 10 : 10}}>
        <View
          style={styles.container}
          accessibilityLabel="Search and tab container">
          {/* SearchBar */}
          <CustomSearchBar
            label="Search"
            value={searchStr}
            onChangeText={handleSearchInput}
            marginHorizontal="0"
            clearable
          />
          <ScrollView
            horizontal={true} // Enable horizontal scrolling
            showsHorizontalScrollIndicator={false} // Hide scroll indicator if desired
            contentContainerStyle={styles.tabContainer}
            accessibilityLabel="Tab navigation scroll view">
            {Object.keys(filters).map(tab => (
              <View key={tab} style={{borderRadius: 8}}>
                <TouchableOpacity
                  onPress={() => handleTabPress(tab)}
                  style={[
                    styles.tabButton,
                    filterOn === filters[tab]
                      ? styles.activeTabButton
                      : styles.inactiveTabButton,
                  ]}
                  accessibilityLabel={`Tab button for filter ${tab}`}>
                  <Text
                    variant="bold"
                    accessibilityLabel={`Filter text for ${tab}`}
                    style={
                      filterOn === filters[tab]
                        ? styles.activeTabText
                        : styles.inactiveTabText
                    }>
                    {tab}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
        {isLoading ? ( // Only show loader while loading
          <View
            accessibilityLabel="Loading spinner container"
            style={{
              height: 350,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Spinner />
          </View>
        ) : (
          <View
            accessibilityLabel="Community search results container"
            style={{
              flex: 1,
              backgroundColor: theme.colors.backgroundCreamy,
            }}>
            <FlatList
              data={results}
              keyExtractor={item => item._id}
              contentContainerStyle={styles.FlatListContainerStyle}
              onEndReached={hasNextPage && !isFetchingNextPage && fetchNextPage}
              ListEmptyComponent={
                !isFetching && searchStr?.length > 0 && renderEmptyState
              }
              ListFooterComponent={renderFooter}
              onEndReachedThreshold={0.5}
              renderItem={item => (
                <RenderSearchedCommunityList item={item.item} />
              )}
              accessibilityLabel="Flat list of searched communities"
            />
          </View>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.backgroundCreamy,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  FlatListContainerStyle: {paddingBottom: 100, paddingHorizontal: 20},
  tabContainer: {
    flexDirection: 'row',
    paddingVertical: 20,
    justifyContent: 'space-between',
    gap: 5,
    flexWrap: 'wrap',
  },
  tabButton: {
    borderRadius: 8,
    marginVertical: 5,
    height: 31,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: theme.colors.primaryOrange,
  },
  inactiveTabButton: {
    backgroundColor: theme.colors.secondaryLightPeach,
  },
  activeTabText: {
    fontSize: 14,
    paddingHorizontal: 8,
    paddingVertical: 6,
    color: 'white',
  },
  inactiveTabText: {
    fontSize: 14,
    paddingHorizontal: 8,
    paddingVertical: 6,
    color: theme.colors.primaryOrange,
  },
  loadingIndicator: {
    marginVertical: 20,
  },
});

export default CommunitySearchScreen;
