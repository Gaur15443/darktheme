/* eslint-disable no-bitwise */

import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  memo,
  forwardRef,
  useImperativeHandle,
} from 'react';
import PropTypes from 'prop-types';
import allCountries from '../../common/allCountries';
import getCountry from '../../common/defaultCountry';
import CountryFlag from 'react-native-country-flag';

import {
  Keyboard,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Modal as ModalPaper, Portal, Text, useTheme } from 'react-native-paper';

const CountryCode = forwardRef(
  (
    {
      searchPlaceholderText = 'Search country',
      enableSearchField = false,
      disabledFetchingCountry = false,
      disabled = false,
      defaultCountry = '',
      defaultCountryCode = '',
      enabledCountryCode = false,
      enabledFlags = true,
      preferredCountries = [],
      onlyCountries = [],
      ignoredCountries = [],
      allowDefault = true,
      customStyle = {},
      countryCodeTextColor,
      onSelect = () => undefined,
      flagSize = 16,
      ...props
    },
    ref,
  ) => {
    const theme = useTheme();
    const styles = createStyles();
    const activeCountry = useRef({ iso: 'IN' });
    const [, setUpdate] = useState();
    const [open, setOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [searchText] = useState('');

    const filteredCountries = useMemo(() => {
      // List countries after filtered
      if (searchText.length) {
        return allCountries.filter(country =>
          country.name.toLowerCase().includes(searchText.toLowerCase()),
        );
      }
      if (onlyCountries.length) {
        return getCountries(onlyCountries);
      }
      if (ignoredCountries.length) {
        return allCountries.filter(
          ({ iso }) =>
            !ignoredCountries.includes(iso.toUpperCase()) &&
            !ignoredCountries.includes(iso.toLowerCase()),
        );
      }
      return allCountries;
    }, [searchText, allCountries, onlyCountries, ignoredCountries]);

    const sortedCountries = useMemo(() => {
      //  Sort the list countries: from preferred countries to all countries
      const _preferredCountries = getCountries(preferredCountries).map(
        country => ({ ...country, preferred: true }),
      );
      return [..._preferredCountries, ...filteredCountries];
    }, [preferredCountries, filteredCountries]);

    useEffect(() => {
      initializeCountry();
    }, [defaultCountry, defaultCountryCode]);

    useEffect(() => {
      if (allowDefault || defaultCountry) {
        initializeCountry();
        onSelect(activeCountry.current);
      }
    }, []);

    function initializeCountry() {
      /**
       * 1. Use default country if passed from parent
       */
      if (defaultCountry && !defaultCountryCode) {
        const _defaultCountry = findCountry(defaultCountry);
        if (_defaultCountry) {
          activeCountry.current = _defaultCountry;
          setUpdate(Date.now());
          return;
        }
      } else if (defaultCountryCode) {
        const _defaultCountry = findCountryCode(defaultCountryCode);
        if (_defaultCountry) {
          activeCountry.current = _defaultCountry;
          setUpdate(Date.now());
          return;
        }
      }
      /**
       * 2. Use the first country from preferred list (if available) or all countries list
       */
      activeCountry.current =
        findCountry(preferredCountries[0]) || filteredCountries[0];
      /**
       * 3. Check if fetching country based on user's IP is allowed, set it as the default country
       */
      if (!disabledFetchingCountry) {
        getCountry().then(res => {
          choose(findCountry(res) || activeCountry.current);
        });
      }
    }

    /**
     * Get the list of countries from the list of iso code
     */
    function getCountries(list = []) {
      return list.map(countryCode => findCountry(countryCode)).filter(Boolean);
    }
    function findCountry(iso = '') {
      return allCountries.find(
        country => country?.iso?.toUpperCase?.() === iso?.toUpperCase?.(),
      );
    }
    function findCountryCode(dialCode) {
      return allCountries.find(country => country.dialCode === `${dialCode}`);
    }
    function getItemClass(index, iso) {
      const highlighted = selectedIndex === index;
      const lastPreferred = index === preferredCountries.length - 1;

      const preferred = !!~preferredCountries
        .map(c => c.toUpperCase())
        .indexOf(iso);

      return {
        highlighted,
        'last-preferred': lastPreferred,
        preferred,
      };
    }
    function choose(country) {
      activeCountry.current = country;

      onSelect(activeCountry.current);
    }
    function toggleDropdown() {
      if (disabled) {
        return;
      }
      Keyboard.dismiss();
      setOpen(prev => !prev);
    }

    useImperativeHandle(ref, () => ({
      choose,
    }));

    return (
      <View style={[styles.countrySelect, customStyle]}>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={toggleDropdown}
          disabled={disabled}>
          <View style={styles.current}>
            {enabledFlags && (
              <CountryFlag isoCode={activeCountry.current.iso} size={flagSize} />
            )}
            {enabledCountryCode && (
              <Text
                style={[
                  styles.countryCode,
                  countryCodeTextColor ? { color: countryCodeTextColor } : null,
                ]}>
                +{activeCountry.current.dialCode}
              </Text>
            )}
          </View>
          {open && (
            <View>
              <Portal>
                <ModalPaper
                  visible
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    //   paddingRight: 25,
                    //   paddingLeft: 25,
                    marginLeft: 18,
                    marginRight: 18,
                  }}
                  contentContainerStyle={{
                    backgroundColor: theme.colors.onWhite100,
                    height: '60%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 10,
                    overflow: 'hidden',
                  }}
                  onDismiss={() => setOpen(false)}>
                  {/* Render list items */}
                  <ScrollView
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                      paddingLeft: 20,
                      paddingRight: 40,
                      paddingTop: 10,
                      paddingBottom: 12,
                      width: 325,
                    }}>
                    <View>
                      {sortedCountries.map((item, index) => (
                        <TouchableOpacity
                          key={`${item.iso}-${index}`}
                          style={[
                            styles.dropdownItem,
                            getItemClass(index, item.iso),
                          ]}
                          onPress={() => {
                            choose(item);
                            setOpen(false);
                          }}
                          onLongPress={() => setSelectedIndex(index)}>
                          {enabledFlags && (
                            <View
                              style={{
                                display: 'flex',
                                flexDirection: 'row',
                                gap: 8,
                              }}>
                              <CountryFlag isoCode={item.iso} size={18} />
                              <Text>{item.name}</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </ModalPaper>
              </Portal>
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  },
);

function createStyles() {
  return StyleSheet.create({
    countrySelect: {
      borderRadius: 6,
      display: 'flex',
      borderWidth: 1,
      borderColor: '#bbb',
      alignItems: 'flex-start',
      minWidth: 70,
      height: 40,
      paddingHorizontal: 10,
      position: 'relative',
      //   zIndex: 9999,
      backgroundColor: '#ffffff',
    },
    current: {
      fontSize: '0.8em',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    dropdown: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      margin: 'auto',
      justifyContent: 'center',
      height: '100%',
      position: 'relative',
      borderRadius: 20,
      outline: 'none',
      //   zIndex: 9999,
    },
    dropdownList: {
      //   zIndex: 9999,
      padding: 0,
      margin: 0,
      textAlign: 'left',
      height: 200,
      overflowY: 'scroll',
      position: 'absolute',
      top: '100%',
      left: -1,
      backgroundColor: '#fff',
      borderWidth: 1,
      borderColor: '#ccc',
      width: 320,
      overflowX: 'hidden',
    },
    dropdownItem: {
      paddingVertical: 4,
      //   paddingHorizontal: 15,
    },
    highlighted: {
      backgroundColor: '#f3f3f3',
    },
    lastPreferred: {
      borderBottomWidth: 1,
      borderBottomColor: '#cacaca',
    },
  });
}

CountryCode.propTypes = {
  searchPlaceholderText: PropTypes.string,
  countryCodeTextColor: PropTypes.string,
  enableSearchField: PropTypes.bool,
  disabledFetchingCountry: PropTypes.bool,
  disabled: PropTypes.bool,
  defaultCountry: PropTypes.string,
  defaultCountryCode: PropTypes.string,
  enabledCountryCode: PropTypes.bool,
  enabledFlags: PropTypes.bool,
  preferredCountries: PropTypes.array,
  onlyCountries: PropTypes.array,
  ignoredCountries: PropTypes.array,
  allowDefault: PropTypes.bool,
  onSelect: PropTypes.func,
  flagSize: PropTypes.number,
};

CountryCode.displayName = 'CountryCode';

export default CountryCode;
