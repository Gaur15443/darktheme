import React, {useState, useEffect} from 'react';
import {View, FlatList, Text, TouchableOpacity, Keyboard} from 'react-native';
import {Avatar, useTheme} from 'react-native-paper';
import {useNavigation, useRoute} from '@react-navigation/native';
import {GlobalHeader, CustomInput} from '../../../components';
import {useSelector} from 'react-redux';

const GothraList = () => {
  const [communitySearchQuery, setCommunitySearchQuery] = useState('');
  const [searchCommunityResults, setSearchCommunityResults] = useState([]);
  const navigation = useNavigation();
  const route = useRoute();
  const Gothras = useSelector(state => state?.community?.gothra?.data);

  const theme = useTheme();
  // Handle search community (dummy implementation for now)
  const handleCommunitySearch = text => {
    setCommunitySearchQuery(text);
    const results = Gothras.filter(item =>
      item.name.toLowerCase().includes(text.toLowerCase()),
    );
    setSearchCommunityResults(results);
  };

  useEffect(() => {
    if (Gothras) {
      const results = Gothras.filter(item => item.name.toLowerCase());
      setSearchCommunityResults(results);
    }
  }, []);

  const handleSelectCommunityItem = item => {
    route.params.onSelectGothra(item); // Pass the selected community back
    navigation.goBack(); // Go back to the previous screen
  };

  const handleAddCustomCommunity = () => {
    const customItem = {id: Date.now(), name: communitySearchQuery, imgurl: ''}; // Add custom item
    route.params.onSelectGothra(customItem);
    navigation.goBack();
  };

  // Pre-populate search query if it was passed from the previous screen
  useEffect(() => {
    if (route.params?.communitySearchQuery) {
      setCommunitySearchQuery(route.params.communitySearchQuery);
      handleCommunitySearch(route.params.communitySearchQuery);
    }
  }, [route.params?.communitySearchQuery]);

  return (
    <View style={{flex: 1}}>
      <GlobalHeader
        onBack={() => {
          Keyboard.dismiss();
          navigation.goBack();
        }}
        heading={''}
        accessibilityLabel="global-header-community"
        backgroundColor={theme.colors.background}
      />

      <View style={{flex: 1, marginHorizontal: 10, marginTop: 0}}>
        <CustomInput
          onChangeText={text => {
            setCommunitySearchQuery(text);
            handleCommunitySearch(text);
          }}
          accessibilityLabel="communitySearchQuery"
          testID="communitySearchQuery"
          label="Search..."
          clearable
          value={communitySearchQuery}
          mode="outlined"
          style={{backgroundColor: 'white', marginTop: 10}}
          outlineColor="gray"
        />

        <FlatList
          accessibilityLabel="flatlist-communityItems"
          data={searchCommunityResults}
          keyExtractor={item => item?.id?.toString()}
          renderItem={({item}) => (
            <TouchableOpacity
              testID="communityItems"
              onPress={() => handleSelectCommunityItem(item)}
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'center',
                padding: 10,
              }}>
              {item.imgurl && (
                <Avatar.Image
                  accessibilityLabel="imgurl-communityItems"
                  size={40}
                  source={{uri: item.imgurl}}
                />
              )}
              <Text
                style={{
                  fontSize: 16,
                  paddingLeft: 12,
                  color: 'black',
                }}
                accessibilityLabel={item.name}>
                {item.name.charAt(0).toUpperCase() +
                  item.name.slice(1).toLowerCase()}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            communitySearchQuery.trim() ? (
              <TouchableOpacity
                onPress={handleAddCustomCommunity}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  padding: 10,
                }}>
                <Text
                  style={{
                    fontSize: 16,
                    paddingLeft: 12,
                    color: 'black',
                  }}>
                  {communitySearchQuery}
                </Text>
              </TouchableOpacity>
            ) : null
          }
        />
      </View>
    </View>
  );
};

export default GothraList;
