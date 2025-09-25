import {ScrollView, View} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {useTheme, Text} from 'react-native-paper';
import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import CustomTextInput from '../../../components/CustomTextInput';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ErrorBoundary from '../../../common/ErrorBoundary';
import {useDispatch, useSelector} from 'react-redux';
import {
  clearAstrologers,
  searchAstrologers,
} from '../../../store/apps/astrologersSearch';
import {AppDispatch, RootState} from '../../../store';
import Toast from 'react-native-toast-message';
import AstroHeader from '../../../common/AstroHeader';
import {RootStackParamList} from '../../../configs/DeepLinks/DeepLinkingConfig';
import useLiveAstrologers from '../../../hooks/sockets/useLiveAstrologers';
import type {AstrologerDetails} from '../../../store/apps/astrologersListing/index.d';
import ItemCard from '../../../components/AstroConsultation/ItemCard';
import Spinner from '../../../common/Spinner';
export default function ConsultationSearch() {
  useLiveAstrologers();
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const astrologers = useSelector(
    (state: RootState) => state.astrologersSearch.astrologers,
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setLoading(false);
      setSearchQuery('');
      dispatch(clearAstrologers());
      return () => {};
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      if (searchQuery?.length) {
        searchAstrologer();
      }
    }, [searchQuery]),
  );

  const searchAstrologer = useCallback(async () => {
    try {
      setLoading(true);
      await dispatch(
        searchAstrologers({
          nameStr: searchQuery,
          skills: [],
          language: [],
          gender: [],
          costRange: '',
          expRange: '',
          sortBy: null,
        }),
      ).unwrap();
      setLoading(false);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
      setLoading(false);
    }
  }, [dispatch, searchQuery]);

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const handleCardPress = useCallback((astrologer: AstrologerDetails) => {
    navigation.navigate('AstroProfile', {astroId: astrologer.userId});
  }, []);

  return (
    <ErrorBoundary.Screen>
      <View style={{flex: 1, backgroundColor: theme.colors.background}}>
        <AstroHeader
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            padding: 0,
          }}>
          {/* Search bar */}
          <AstroHeader.Content
            style={{
              justifyContent: 'space-between',
              flexDirection: 'row',
              gap: 4,
              paddingRight: 4,
            }}>
            <AstroHeader.BackAction
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                paddingLeft: 0,
              }}
              onPress={() => navigation.goBack()}
            />
            <CustomTextInput
              testID="searchAstrologer"
              style={{flex: 1}}
              left={<Icon name="magnify" size={20} color="#fff" />}
              value={searchQuery}
              placeholder="Search for astrologer"
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              onChangeText={handleSearch}
              innerContainerStyle={{
                height: 40,
                borderRadius: 100,
                paddingStart: 0,
              }}
              clearable
              contentStyle={{
                paddingStart: 0,
              }}
            />
          </AstroHeader.Content>
        </AstroHeader>
        <View
          style={{
            flex: 1,
            paddingHorizontal: 16,
            justifyContent: 'center',
            gap: 16,
          }}>
          {searchQuery?.length > 0 && astrologers.length > 0 && !loading ? (
            <Text>
              Search results for{' '}
              <Text style={{fontWeight: 'bold'}}>{`"${searchQuery}"`}</Text>
            </Text>
          ) : null}
          <View style={{flex: 1}}>
            {loading && (
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Spinner />
              </View>
            )}
            {!loading && (
              <ScrollView style={{flex: 1}}>
                <View style={{flex: 1, gap: 16}}>
                  {searchQuery?.length > 0 &&
                    astrologers.length === 0 &&
                    !loading && <Text>No results found</Text>}

                  {astrologers?.length > 0 &&
                    searchQuery?.length > 0 &&
                    astrologers.map(astrologer => (
                      <ItemCard
                        key={astrologer.userId}
                        astrologer={astrologer as AstrologerDetails}
                        onPress={handleCardPress}
                      />
                    ))}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </View>
    </ErrorBoundary.Screen>
  );
}
