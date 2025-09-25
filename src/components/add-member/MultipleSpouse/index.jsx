import React, {useState, useEffect} from 'react';
import {View, Text, Picker, Modal, FlatList, Platform} from 'react-native';
import _ from 'lodash';
import {useSelector, useDispatch} from 'react-redux';
import {getSelectdSpouseId} from '../../../store/apps/MultipalSpouses';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {Dropdown} from 'react-native-element-dropdown';

const MultipleSpouse = ({mSpouseData, setSelectedSpouse}) => {
  const [personSelected, setPersonSelected] = useState(null);
  const [spouses, setSpouses] = useState(null);
  const [relation, setRelation] = useState(null);
  const dispatch = useDispatch();
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (mSpouseData && mSpouseData?.length >= 2) {
      const formattedSpouses = mSpouseData.map(spouse => ({
        id: spouse.id,
        name: spouse.name,
        lastname: spouse.lastname,
        displayName: `${_.capitalize(spouse.name)} ${_.capitalize(
          spouse.lastname,
        )}`,
        relation: spouse.gender === 'female' ? 'Mother' : 'Father',
      }));
      setSpouses(formattedSpouses);
      setRelation(`Select ${formattedSpouses[0].relation}`);
    } else {
      setSpouses(null);
    }
  }, [mSpouseData]);

  useEffect(() => {
    setSelectedSpouse(personSelected);
  }, [personSelected]);

  const handleSelectChange = itemValue => {
    setPersonSelected(itemValue);
    setModalVisible(false);
  };
  return (
    <View style={{paddingTop: 10, paddingBottom: 10}}>
      {spouses && (
        <Dropdown
          testID="spouse-selection"
          style={{
            height: 40,
            borderColor: 'gray',
            borderWidth: 0.5,
            borderRadius: 4,
            paddingHorizontal: Platform.OS === 'ios' ? 10 : 8,
            backgroundColor: 'white',
            color: 'black',
          }}
          data={spouses}
          maxHeight={300}
          labelField="displayName"
          valueField="id"
          placeholder={
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Text style={{color: 'rgba(51, 48, 60, 0.5)'}}>{relation}</Text>
              <Text style={{color: 'red', opacity: 0.5}}>*</Text>
            </View>
          }
          placeholderStyle={{
            paddingLeft: Platform.OS === 'ios' ? 0 : 4,
            paddingTop: Platform.OS === 'ios' ? 0 : 0,
          }}
          itemTextStyle={{color: 'black'}}
          selectedTextStyle={{color: 'black', paddingLeft: 6}}
          value={personSelected}
          onChange={item => {
            handleSelectChange(item.id);
          }}
        />
      )}
    </View>
  );
};

export default MultipleSpouse;
