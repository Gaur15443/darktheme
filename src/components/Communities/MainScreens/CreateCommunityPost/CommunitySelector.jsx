import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Text} from 'react-native-paper';
import NewTheme from '../../../../common/NewTheme';
import {CommunitySelectorEmptyState, CrossIcon} from '../../../../images';

import CustomSearchBar from '../../CommunityComponents/CustomSearchBar';
import RenderAllCommunities from '../../CommunityComponents/RenderAllCommunities';

import {useNavigation} from '@react-navigation/core';
import Spinner from '../../../../common/Spinner';
import {useGetAllUserCommunities} from '../../../../store/apps/communitiesApi';

const CommunitySelector = ({route}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();
  const {
    data: allUserCommunities,
    isLoading,
    error,
  } = useGetAllUserCommunities();

  // Filter communities based on search query
  const filteredCommunities = Array.isArray(allUserCommunities)
    ? allUserCommunities.filter(community =>
        community?.communityName
          ?.toLowerCase()
          ?.includes(searchQuery.toLowerCase()),
      )
    : [];

  const onCommunitySelect = item => {
    route?.params?.onGoBack(item);
    navigation.goBack();
  };
  const goBackToCreatePost = () => {
    navigation.goBack();
  };

  const renderEmptyState = () => {
    return (
      <>
        <View
          style={{
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
            marginTop: 30,
          }}>
          <CommunitySelectorEmptyState />
        </View>
        <View
          style={{
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text
            style={{
              fontSize: 18,
              marginHorizontal: -10,
              textAlign: 'center',
            }}>
            You haven’t joined any communities yet. Start exploring and discover
            your Favorites!
          </Text>
        </View>
      </>
    );
  };

  return (
    <>
      <View style={{flex: 1}}>
        <View style={styles.modalContainer}>
          <View
            style={{
              paddingHorizontal: 20,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: 10,
            }}>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                variant="bold"
                style={{
                  fontSize: 18,
                  lineHeight: 18,
                  color: 'black',

                  textAlign: 'center',
                }}>
                Select Community
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                goBackToCreatePost();
              }}>
              <CrossIcon fill={'black'} width={18} height={18} />
            </TouchableOpacity>
          </View>

          <View style={{paddingTop: 20}}>
            {/* Main Content */}
            <CustomSearchBar
              label="Search"
              value={searchQuery}
              onChangeText={setSearchQuery}
              marginHorizontal={'5%'}
              clearable
            />
            {isLoading ? (
              <View>
                <Spinner />
              </View>
            ) : (
              <FlatList
                data={filteredCommunities}
                style={{marginTop: 20}}
                keyExtractor={item => item?._id + item?.communityName}
                contentContainerStyle={styles.FlatListContainerStyle}
                ListEmptyComponent={
                  !isLoading &&
                  (searchQuery === '' ||
                    (allUserCommunities?.length === 0 && searchQuery !== '')) &&
                  renderEmptyState
                }
                onEndReachedThreshold={0.5}
                renderItem={item => (
                  <RenderAllCommunities
                    item={item.item}
                    selectedCommunity={onCommunitySelect}
                    screen="communitySelector"
                  />
                )}
                accessibilityLabel="Flat list of searched communities"
              />
            )}
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    paddingTop: 50,
    height: Dimensions.get('screen').height,
    justifyContent: 'flex-start',
    backgroundColor: NewTheme.colors.backgroundCreamy,
  },
  FlatListContainerStyle: {paddingBottom: 150, paddingHorizontal: 20},
});

export default CommunitySelector;
