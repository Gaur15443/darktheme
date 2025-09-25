import React, { useState, useEffect, useRef, memo, useCallback, } from 'react';
import {
  View,
  ScrollView,
  Pressable,
} from 'react-native';
import { useTheme, Text } from 'react-native-paper';
import CustomTextInput from '../../../components/CustomTextInput';
import { LocationIcon } from '../../../images';
import { useNavigation } from '@react-navigation/native';
import { LocationData, LocationProps } from '../../../components/Location/location';
import { useDispatch, useSelector } from 'react-redux';
import { setComponentData } from '../../../store/apps/locationSearch';
import ErrorBoundary from '../../../common/ErrorBoundary';
import { RootState } from '../../../store';
import { Track } from '../../../../App';
import SearchIcon from '../../../images/Icons/SearchIcon';
import AstroHeader from '../../../common/AstroHeader';
import timezoneList from '../../../utils/timezone_list';
import base64 from 'react-native-base64';
import allCountries from '../../../common/allCountries';
import Config from 'react-native-config';
import Toast from 'react-native-toast-message';

/**
 * Location component for selecting geographic locations
 */
const LocationScreen = ({
  getLocationInfo,
  label,
  testID,
  onChangeText,
  ...props
}: LocationProps) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.userInfo);
  const controllerRef = useRef<AbortController | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationData[]>([]);
  const [textValue, setTextValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const theme = useTheme();

  const fetchLocations = useCallback(async (searchQuery: string) => {
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      setIsLoading(true);

      // OLD API IF NEEDED:
      // const body = {
      //   place: searchQuery,
      //   maxRows: 100,
      // };


      // // const res = await fetch('https://json.astrologyapi.com/v1/geo_details', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': authHeader
      //   },
      //   body: JSON.stringify(body)
      // });

      const authHeader = 'Basic ' + base64.encode(`${Config.LOCATION_API_USER_ID}:${Config.LOCATION_API_KEY}`);
      const response = await fetch(`https://geo.astrologyapi.com/places?q=${searchQuery}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
      });


      const data = await response.json();

      if (!data?.length) return [];

      const formattedData: LocationData[] = data.map((_data: { place: any; country: string; latitude: any; longitude: any; }, _dataIndex: number) => {
        const country_name = allCountries.filter(country => `${country.name}`.split('(')[0].trim().toLowerCase() === data?.[_dataIndex]?.country?.trim().toLowerCase())?.[0]?.name?.toString?.()?.split('(')?.[0]?.trim?.() || '';

        return {
          name: _data?.place,
          country: allCountries.filter(country => `${country.name}`.split('(')[0].trim().toLowerCase() === _data?.country?.trim().toLowerCase())?.[0]?.iso,
          country_name,
          full_name: `${_data?.place}, ${country_name}`,
          coordinates: [_data?.latitude, _data?.longitude],
          timezone_id: '',
          tz: '',
          tz_dst: '',
        }
      });

      return formattedData;
    } catch (error) {
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [Config.LOCATION_API_KEY, Config.LOCATION_API_USER_ID]);

  const searchPlaces = useCallback(async () => {
    if (!(query?.trim?.()?.length > 2)) return;

    try {
      const apiResults = await fetchLocations(query);
      if (apiResults) {
        setResults(apiResults);
      } else {
        setResults([]);
      }
    } catch (error) {
      setResults([]);
    }
  }, [query, fetchLocations]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const handler = setTimeout(() => {
      controllerRef.current?.abort();
      searchPlaces();
    }, 1);

    return () => {
      clearTimeout(handler);
      controllerRef.current?.abort?.();
    };
  }, [query, searchPlaces]);

  const selectPlace = useCallback(
    async (data: LocationData) => {
      try {
        let updatedData = data;
        const res = await fetchSelectedPlaceTimezone({
          coordinates: data.coordinates,
        })
        updatedData = {
          ...updatedData,
          ...res,
        }
        dispatch(setComponentData(updatedData));
        setTextValue(updatedData.full_name || '');
        setQuery('');
        setResults([]);
        navigation.goBack();
      } catch (error) {
        Toast.show({
          text1: 'Error retrieving timezone',
          type: 'error',
        });
      }
    },
    [getLocationInfo],
  );

  async function fetchSelectedPlaceTimezone({
    coordinates,
  }: {
    coordinates: [string, string];
  }) {

    const authHeader = 'Basic ' + base64.encode(`${Config.LOCATION_API_USER_ID}:${Config.LOCATION_API_KEY}`);

    const res = await fetch('https://json.astrologyapi.com/v1/timezone_with_dst', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify({
        latitude: coordinates[0],
        longitude: coordinates[1]
      })
    });

    const {
      timezone: offset,
    } = await res.json();

    const timezone_id = timezoneList.find((timezone: any) => timezone?.offset === offset)?.utc?.[0] || '';

    return {
      tz: offset,
      tz_dst: offset,
      timezone_id,
    }
  }
  const handleInput = useCallback(
    (value: string) => {
      setQuery(value);
      setTextValue(value);
    },
    [],
  );

  const handleClose = useCallback(() => {
    navigation.goBack();
  }, []);

  const renderLocationItem = useCallback((locationObject: LocationData, index: number) => (
    <Pressable
      key={index}
      onPress={() => {
        selectPlace(locationObject);
        Track({
          cleverTapEvent: "Change_Location",
          mixpanelEvent: "Change_Location",
          userData,
          cleverTapProps: {
            updatedLocation: locationObject.full_name
          },
          mixpanelProps: {
            updatedLocation: locationObject.full_name
          }
        });
      }}
      style={{
        flexDirection: 'row',
        minHeight: 48,
        backgroundColor: '#FFFFFF1F',
        alignItems: 'center',
        borderRadius: 12,
        padding: 14,
        marginBottom: 4,
      }}>
      {/* @ts-ignore */}
      <LocationIcon stroke={theme.colors.text} size={18} />
      <Text style={{ fontSize: 14, marginLeft: 8, paddingHorizontal: 1 }}>
        {locationObject.full_name}
      </Text>
    </Pressable>
    // @ts-ignore
  ), [selectPlace, theme.colors.text]);

  return (
    <ErrorBoundary.Screen >
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background
        }}>
        <AstroHeader>
          <AstroHeader.BackAction onPress={handleClose} />
          <AstroHeader.Content title="Location" />
        </AstroHeader>
        <View
          style={{
            marginBottom: 0,
            paddingBottom: 0,
            marginInline: 10,
            flex: 1,
            paddingHorizontal: 2,
            height: '100%',
            backgroundColor: theme.colors.background,
          }}>
          <CustomTextInput
            label={label}
            {...props}
            onChangeText={handleInput}
            testID={testID}
            autoFocus={true}
            // @ts-ignore
            style={{ fontSize: 16, borderRadius: 4, }}
            placeholderTextColor="#ffffffAA"
            // @ts-ignore
            left={<SearchIcon color={theme.colors.text} />}
            contentStyle={{ paddingStart: 0 }}
            clearable
            error={query.trim?.()?.length < 3 && query.trim?.()?.length > 0}
            errorText={'Location must be at least 3 characters long'}
          />
          {isLoading && (
            // @ts-ignore
            <Text style={{ marginTop: 8, color: theme.colors.text }}>
              Searching locations...
            </Text>
          )}
          <ScrollView
            style={{
              width: '100%',
              flex: 1,
              backgroundColor: theme.colors.background,
            }}
            keyboardShouldPersistTaps="handled"
          >
            {!isLoading && results.length > 0 && query?.trim?.()?.length > 2 && typeof results?.[0] === 'object' && results.map(renderLocationItem)}
            {!isLoading && query?.trim?.()?.length > 2 && results.length === 0 && (
              <Text style={{ marginTop: 12, }}>
                Location not found
              </Text>
            )}
          </ScrollView>
        </View>
      </View>
    </ErrorBoundary.Screen >
  );
};

LocationScreen.displayName = 'LocationScreen';

export default memo(LocationScreen);