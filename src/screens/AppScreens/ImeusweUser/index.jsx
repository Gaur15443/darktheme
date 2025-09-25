import React, {useState,useEffect} from 'react';
import {
  View,
} from 'react-native';
import Theme from '../../../common/Theme';
import {
  Button,
  Text,
} from 'react-native-paper';
import authConfig from '../../../configs';
import {useDispatch, useSelector} from 'react-redux';
import {getListPublicData} from '../../../store/apps/listPublicData';
import ImeusweSearch from '../../../components/ImeusweSearch/index';
import EmptyStats from '../../../components/ImeusweSearch/EmptyStats';
import {getDeepSearch} from '../../../store/apps/deepSearch';
import Axios from '../../../plugin/Axios';

const ImeusweUser = () => {
  const dispatch = useDispatch();
  const [isSearchData, setSearchData] = useState([]);
  const publicDataResults = useSelector(
    state => state.getListPublicData?.getListPublicData,
  );
  const handleSearch = async () => {
    const getSearch = await dispatch(
      getDeepSearch({
        name: 'sumaiya',
      })
      ,)
      setSearchData(getSearch?.payload);

  }
  


  return (
    <View style={{ flex: 1, marginTop: 20 }}>
      <ImeusweSearch
        style={{ marginBottom: 10 }}
        onSearchData={(data) => {
        }}
      />
    </View>
  );
};


export default ImeusweUser;