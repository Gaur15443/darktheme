import {View, Text, Platform, FlatList, TouchableOpacity} from 'react-native';
import React, {memo, useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {AutocompleteDropdown} from 'react-native-autocomplete-dropdown';
import {fetchUserDetailsForClink} from '../../../store/apps/tree';
import {Avatar, List, TextInput} from 'react-native-paper';
import CustomInput from '../../CustomTextInput';
import DefaultImage from '../../stories/DefaultImage';
import GreenTickIcon from '../../../images/Icons/GreenTickIon';

const SearchFamilyMembers = ({
  handleSelectedFamilyMember,
  onTyping,
  relation,
  userId,
}) => {
  const dispatch = useDispatch();
  const addMemberClinkList = useSelector(
    state => state.Tree.addMemberClinkListVal.payload,
  );
  const {allNode, rootUser} = addMemberClinkList;

  const modifiedDataSet = allNode.filter(item => {
    if (['mother', 'wife', 'sister', 'daughter'].includes(relation)) {
      return item.gender === 'female' && userId !== item.id && !item.isClone;
    } else {
      return item.gender === 'male' && userId !== item.id && !item.isClone;
    }
  });

  const [selectedItem, setSelectedItem] = useState(null);
  const [showDropDown, setShowDropDown] = useState(false);
  const [dataSetValue, setDataSetValues] = useState(modifiedDataSet);
  const [zIndex, setZIndex] = useState(9);
  const [showIcon, setShowIcon] = useState(false);

  const handleSelectedItem = async item => {
    try {
      setSelectedItem(item.name);
      setZIndex(9);
      setShowDropDown(false);
      onTyping(false);
      setShowIcon(true);
      const userValue = await dispatch(
        fetchUserDetailsForClink(item.id),
      ).unwrap();
      const userValueCopy = {...userValue};

      userValueCopy.myProfile = {
        ...userValue.myProfile,
        isClink: true,
        cLinkId: userValueCopy.myProfile._id,
      };
      delete userValueCopy?.myProfile?._id;
      handleSelectedFamilyMember({
        selectedValue: item,
        selectedUserId: userValueCopy,
      });
    } catch (error) {
    } finally {
      setShowDropDown(false);
    }
  };
  const handleChangeText = event => {
    setShowDropDown(true);
    setSelectedItem(event);
    setZIndex(10);
    setShowIcon(false);
    onTyping(event);
    setDataSetValues(
      modifiedDataSet.filter(item => {
        const finalName = item?.name?.replace(' ', '');
        return finalName.toLowerCase().includes(event.toLowerCase());
      }),
    );
  };

  function normalizeSpaces(str) {
    return str.replace(/\s{2,}/g, ' ');
  }

  return (
    <View
      style={{
        paddingHorizontal: 20,
        marginTop: 10,
        position: 'relative',
        height: '100%',
        zIndex: zIndex,
      }}>
      <CustomInput
        label="Name"
        value={selectedItem?.replace('  ', ' ')}
        onChangeText={handleChangeText}
        right={showIcon ? <GreenTickIcon /> : null}
        onFocus={() => {
          setShowDropDown(true);
          setZIndex(10);
        }}
        onBlur={() => {
          setShowDropDown(false);
          setZIndex(9);
        }}
      />
      {showDropDown && dataSetValue?.length > 0 && (
        <FlatList
          data={dataSetValue}
          keyboardShouldPersistTaps="always"
          style={{
            backgroundColor: 'white',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: 'lightgrey',
            maxHeight: '70%',
            position: 'absolute',
            top: 40,
            width: '100%',
            left: 20,
            zIndex: 10,
          }}
          renderItem={({item}) => (
            <TouchableOpacity
              testID="select-item"
              onPress={() => handleSelectedItem(item)}>
              <List.Item
                title={normalizeSpaces(item.name)}
                titleStyle={{fontWeight: '500', color: 'black'}}
                left={props => (
                  <>
                    {item?.photo ? (
                      <Avatar.Image
                        size={35}
                        {...props}
                        source={{uri: item.photo}}
                      />
                    ) : (
                      <DefaultImage
                        gender={item?.personalDetails?.gender}
                        firstName={item?.personalDetails?.name}
                        lastName={item?.personalDetails?.lastname}
                        width={35}
                        height={35}
                        style={{marginLeft: 15}}
                      />
                    )}
                  </>
                )}
              />
            </TouchableOpacity>
          )}
          keyExtractor={item => item.id}
        />
      )}
    </View>
  );
};

export default SearchFamilyMembers;
