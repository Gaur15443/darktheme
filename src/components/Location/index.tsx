import React, { useRef, memo, useCallback, useEffect, } from 'react';
import PropTypes from 'prop-types';
import {
  TextInput,
} from 'react-native';
import CustomTextInput from '../CustomTextInput';
import type { LocationProps } from './location';

import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { setComponentData, setComponentId } from '../../store/apps/locationSearch';
import { RootState } from '../../store';
import { forwardRef, useImperativeHandle } from 'react';

/**
 * Location component for selecting geographic locations
 */

const Location = forwardRef(({
  getLocationInfo,
  label,
  testID,
  onChangeText,
  ...props
}: LocationProps, ref) => {
  const dispatch = useDispatch();
  const navigator = useNavigation();
  const inputRef = useRef<TextInput>(null);

  const storedComponentId = useSelector((state: RootState) => state.locationSearch.componentId);
  const storedComponentData = useSelector((state: RootState) => state.locationSearch.data);

  useEffect(() => {
    if (storedComponentId === testID && storedComponentData?.full_name && typeof getLocationInfo === 'function') {
      getLocationInfo(storedComponentData);
      dispatch(setComponentId(null));
      dispatch(setComponentData(null));
    }
  }, [storedComponentId, storedComponentData]);

  const openLocationSearch = useCallback(() => {
    dispatch(setComponentId(testID));
    // @ts-ignore
    navigator.navigate('AstroLocation');
  }, [testID]);

  useImperativeHandle(ref, () => ({
    openLocationSearch: openLocationSearch
  }));

  return (
    <CustomTextInput
      label={label}
      ref={inputRef}
      {...props}
      testID={testID}
      style={{
        // @ts-ignore
        fontSize: 16,
        borderRadius: 4
      }}
      onMaskPress={openLocationSearch}
      placeholderTextColor="#ffffffAA"
      maskText
    />
  );
});

Location.propTypes = {
  getLocationInfo: PropTypes.func.isRequired,
  label: PropTypes.string,
};

Location.displayName = 'Location';

export default memo(Location);