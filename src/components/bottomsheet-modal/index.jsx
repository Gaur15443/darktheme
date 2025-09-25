import React, {useEffect, useState} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  FlatList,
  StyleSheet,
  Platform,
} from 'react-native';
import {List, Avatar} from 'react-native-paper';
import {SafeAreaView} from 'react-native';
import BackArrowIcon from '../../images/Icons/BackArrowIcon';
import CustomInput from '../CustomTextInput';

const BottomSheetModalAddMember = ({route, navigation}) => {
  const {data, label, placeholder, handleSelectReligion, field} = route.params;
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    if (Array.isArray(data)) {
      setFilteredData(data);
    } else {
      setFilteredData([]);
    }
  }, [data]);

  const handleSearch = query => {
    setSearchQuery(query);
    try {
      const filteredResults = Array.isArray(data)
        ? data.filter(item =>
            item?.name?.toLowerCase().includes(query.toLowerCase()),
          )
        : [];
      setFilteredData(filteredResults);
    } catch (error) {
      setFilteredData([]);
    }
  };

  const selectItem = item => {
    handleSelectReligion(item, field);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View
        style={[styles.header, {marginTop: Platform.OS === 'ios' ? 30 : 0}]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackArrowIcon />
        </TouchableOpacity>
      </View>
      <CustomInput
        autoCapitalize="none"
        autoCorrect={false}
        mode="outlined"
        style={styles.input}
        label={label}
        value={searchQuery}
        onChangeText={handleSearch}
        clearable
      />
      {filteredData?.length === 0 ? (
        <TouchableOpacity onPress={() => selectItem({name: searchQuery})}>
          <List.Item title={`Add ${searchQuery}`} />
        </TouchableOpacity>
      ) : (
        <FlatList
          data={filteredData}
          renderItem={({item}) => (
            <TouchableOpacity onPress={() => selectItem(item)}>
              <List.Item
                title={item?.name}
                left={props =>
                  field === 'religion' && (
                    <Avatar.Image
                      size={30}
                      {...props}
                      source={{uri: item?.imgurl}}
                    />
                  )
                }
              />
            </TouchableOpacity>
          )}
          keyExtractor={item => item?._id}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    marginVertical: 10,
    backgroundColor: 'white',
  },
});

export default BottomSheetModalAddMember;
