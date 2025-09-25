import React, {useState, useEffect} from 'react';
import {
  View,
  ActivityIndicator,
  Linking,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import NewTheme from '../../../common/NewTheme';
import {Text} from 'react-native-paper';
import GlobalHeader from '../../../components/ProfileTab/GlobalHeader';
import BackArrowIcon from '../../../images/Icons/BackArrowIcon';
import {Image} from 'react-native';
import Theme from '../../../common/Theme';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {BlurView} from '@react-native-community/blur';
import {useSelector, useDispatch} from 'react-redux';

import Toast from 'react-native-toast-message';
import ErrorBoundary from '../../../common/ErrorBoundary';

const ImuwSingularSearch = ({route}) => {
  const {allSingularData, propCategoryName, categoryForOthers} = route.params;
  const ios = Platform.OS == 'ios';
  const navigation = useNavigation();
  const {top} = useSafeAreaInsets();
  const [singularAddress, setSingularAddress] = useState('');
  const [isValidDate, setIsValidDate] = useState(true);
  const [singularSearch, setSingularSearch] = useState(true);
  const [isSingularLoader, setIsSingularLoader] = useState(false);
  const navigator = useNavigation();
  const keysToExclude = [
    'dateOfDeath',
    'dateOfBirth',
    '_id',
    'pincode',
    'fileType',
    'createdAt',
    'updatedAt',
    'fileId',
    'spouseType',
    'DD_Flag',
    'BD_Flag',
    'filesData',
    'fileData',
    'originName',
    'name',
    'middleName',
    'lastName',
    'address',
    'sex',
    'place',
    'spouse',
    'relation',
    'age',
    'remarks',
    'website',
    'imageUrl',
    'fcatg',
    'weekOfYear',
    'stateCode',
  ];

  const keysToBlur = [
    'caste',
    'contactNo',
    'contactEmail',
    'adharCardNo',
    'passnum',
    'ship',
    'contactNO',
  ];

  const formatDate = (inputDate, flag) => {
    if (/^\d{2}-\d{2}-\d{4}$/.test(inputDate)) {
      inputDate = inputDate.replace(/-/g, '/');
    }

    const dateFormats = [
      /^\d{2}\/\d{2}\/\d{4}$/, // e.g., 10/09/1980
      /^\d{2}-\d{2}-\d{4}$/, // e.g., 17-01-1982
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/, // e.g., 1980-09-10T00:00:00.000Z
    ];

    let matchedFormat = null;
    for (const format of dateFormats) {
      if (format.test(inputDate)) {
        matchedFormat = format;
        break;
      }
    }

    if (!matchedFormat) {
      return 'Invalid date format';
    }

    if (/^\d{2}[\/-]\d{2}[\/-]\d{4}$/.test(inputDate)) {
      const [day, month, year] = inputDate.split(/[\/-]/);
      const formattedDate = `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
      if (flag === 4 || flag === 3) {
        return year;
      }
      return formattedDate;
    }

    const date = new Date(inputDate);
    if (Number.isNaN(date.getTime())) {
      return 'Invalid date';
    }

    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getUTCFullYear();

    let formattedDate;
    switch (flag) {
      case 4:
      case 3:
        formattedDate = `${year}`;
        break;
      case 2:
        formattedDate = `${month}/${year}`;
        break;
      case 1:
        formattedDate = `${day}/${month}/${year}`;
        break;
      case undefined:
      default:
        formattedDate = `${day}/${month}/${year}`; // Default to DD/MM/YYYY
    }

    return formattedDate;
  };
  const textCapitalize = str => {
    if (!str) {
      return str;
    }
    const words = str.split(' ');
    const capitalizedWords = words.map(word => {
      if (word.length === 0) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
    return capitalizedWords.join(' ');
  };

  const otherRecordIdentifier = categoryCode => {
    switch (categoryCode) {
      case 'DN':
        return 'Death news';
      case 'CO-SD':
        return 'Sindhi Community';
      case 'IOD':
        return 'Indian Other Directory';
      case 'ITD':
        return 'Indian Telephone Directory';
      case 'GDP':
        return 'Govt departments';
      case 'DF':
        return 'Defence forces';
      case 'IT':
        return 'Investors and Taxpayers';
      case 'JR':
        return 'Judicial Records';
      case 'PSE':
        return 'Public/Pvt Sector enterprise';
      case 'EEX':
        return 'Elected Executive';
      case 'CCM':
        return 'Community and Club membership';
      case 'FAS':
        return 'Faculty and Students';
      case 'AW':
        return 'Awardees';
      case 'DIV':
        return 'Dividend';
      case 'PMD':
        return 'Passenger Manifest Data';
      case 'BIB':
        return 'Bibliography Data';
      case 'SP':
        return 'Sports Persons';
      case 'BLD':
        return 'Blood Donors';
      default:
        return 'Other';
    }
  };

  const feedback = () => {
    navigation.navigate('Feedback');
  };

  const goBack = () => {
    navigation.goBack();
  };
  const camelCaseToTitleCase = input => {
    return input
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
      .replace(/^./, str => {
        return str.toUpperCase();
      });
  };

  const convertInputToTitleCase = input => {
    if (typeof input !== 'string') {
      return input;
    }
    return camelCaseToTitleCase(input);
  };
  useEffect(() => {
    try {
      if (allSingularData.length > 0) {
        const placeAddress = allSingularData?.[0]?.place?.address;
        const cityAddress = allSingularData?.[0]?.address;

        if (placeAddress && cityAddress) {
          setSingularAddress(
            placeAddress.length > cityAddress.length
              ? placeAddress
              : cityAddress,
          );
        } else if (placeAddress) {
          setSingularAddress(placeAddress);
        } else if (cityAddress) {
          setSingularAddress(cityAddress);
        }
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  }, [allSingularData]);
  const [combinedData, setCombinedData] = useState([]);

  const isIsoDateString = dateString => {
    const isoDatePattern =
      /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z|\d{4}-\d{2}-\d{2}|\d{2}-\d{2}-\d{4})$/;
    return isoDatePattern.test(dateString);
  };
  useEffect(() => {
    try {
      const combinedData = [];
      for (const key in allSingularData[0]) {
        if (Object.prototype.hasOwnProperty.call(allSingularData[0], key)) {
          if (!keysToExclude.includes(key)) {
            if (keysToBlur.includes(key)) {
              combinedData.push({
                key: key,
                value: allSingularData[0][key],
              });
            } else {
              combinedData.unshift({
                key: key,
                value: allSingularData[0][key],
              });
            }
          }
        }
      }
      setCombinedData(combinedData);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  }, [allSingularData]);

  const getFullName = () => {
    const firstName = allSingularData[0]?.name || '';
    const middleName = allSingularData[0]?.middleName || '';
    let lastName = allSingularData[0]?.lastName || '';
    if (lastName === '$LASTNAME' || lastName === 'UNKNOWN') {
      lastName = '';
    }
    return `${textCapitalize(firstName)} ${textCapitalize(middleName)} ${textCapitalize(lastName)}`.trim();
  };

  const formattedRefNo = () => {
    if (propCategoryName === 'Ration Card') {
      return 'SRC No';
    }
    if (propCategoryName === 'Voter List') {
      return 'EPIC No';
    } else {
      return 'Ref No';
    }
  };

  return (
    <ErrorBoundary.Screen>
      <GlobalHeader
        onBack={goBack}
        marginTop={35}
        heading={'Search iMeUsWe Records'}
        backgroundColor={NewTheme.colors.backgroundCreamy}
      />
      <View style={{marginTop: 10}}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {singularSearch && (
            <View style={{paddingBottom: 100}}>
              {isSingularLoader ? (
                <ActivityIndicator size="large" color="#0000ff" />
              ) : (
                <View style={{paddingBottom: 20}}>
                  <Text style={styles.header}>
                    {propCategoryName === 'Others'
                      ? otherRecordIdentifier(categoryForOthers)
                      : propCategoryName.replace(/Records/gi, '').trim()}{' '}
                    Record Details
                  </Text>
                  <View>
                    {Array.isArray(allSingularData) &&
                      allSingularData.length > 0 &&
                      allSingularData.map((item, index) => (
                        <View key={index} style={{marginHorizontal: 35}}>
                          {allSingularData.length > 0 && (
                            <View>
                              <Text style={styles.headingtext}>Full Name</Text>
                              <Text
                                style={styles.headingValue}
                                accessibilityLabel="Full Name">
                                {getFullName()}
                              </Text>
                            </View>
                          )}
                          {item?.name && (
                            <View>
                              <Text style={styles.headingtext}>First Name</Text>
                              <Text
                                style={styles.headingValue}
                                accessibilityLabel="First Name">
                                {item?.name}
                              </Text>
                            </View>
                          )}
                          {item?.middleName && (
                            <View>
                              <Text style={styles.headingtext}>
                                Middle Name
                              </Text>
                              <Text
                                style={styles.headingValue}
                                accessibilityLabel="Middle Name">
                                {item?.middleName}
                              </Text>
                            </View>
                          )}
                          {item?.lastName && item?.lastName !== '$LASTNAME' && (
                            <View>
                              <Text style={styles.headingtext}>Last Name</Text>
                              <Text
                                style={styles.headingValue}
                                accessibilityLabel="Last Name">
                                {item?.lastName}
                              </Text>
                            </View>
                          )}

                          {item?.sex && (
                            <View>
                              <Text style={styles.headingtext}>Gender</Text>
                              <Text
                                style={styles.headingValue}
                                accessibilityLabel="Gender">
                                {item?.sex.toLowerCase() === 'f' ||
                                item?.sex.toLowerCase() === 'female'
                                  ? 'Female'
                                  : item?.sex.toLowerCase() === 'm' ||
                                      item?.sex.toLowerCase() === 'male'
                                    ? 'Male'
                                    : item?.sex}
                              </Text>
                            </View>
                          )}
                          {item?.dateOfBirth &&
                            isValidDate &&
                            isIsoDateString(item?.dateOfBirth) && (
                              <View style={{marginBottom: 10}}>
                                <Text style={styles.headingtext}>
                                  Date of Birth
                                </Text>
                                <Text
                                  style={styles.headingValue}
                                  accessibilityLabel="DateOfBirth">
                                  {formatDate(item?.dateOfBirth, item?.BD_Flag)}
                                </Text>
                              </View>
                            )}
                          {item?.dateOfDeath &&
                            isValidDate &&
                            isIsoDateString(item?.dateOfDeath) && (
                              <View style={{marginBottom: 10}}>
                                <Text style={styles.headingtext}>
                                  Date of Death
                                </Text>
                                <Text
                                  style={styles.headingValue}
                                  accessibilityLabel="DateOfDeath">
                                  {formatDate(item?.dateOfDeath)}
                                </Text>
                              </View>
                            )}

                          {item?.spouse || item?.fatherName ? (
                            <View style={{marginBottom: 10}}>
                              <Text style={styles.headingtext}>
                                Family Member
                              </Text>
                              <Text
                                style={styles.headingValue}
                                accessibilityLabel="Family Members">
                                {item?.fatherName
                                  ? item?.fatherName
                                  : item?.spouse}
                              </Text>
                            </View>
                          ) : null}

                          {item?.filesData?.Assembly && (
                            <View>
                              <Text style={styles.headingtext}>Assembly</Text>
                              <Text
                                style={styles.headingValue}
                                accessibilityLabel="Assembly">
                                {item?.filesData?.Assembly}
                              </Text>
                            </View>
                          )}

                          {item?.filesData?.fileName && (
                            <View>
                              <Text style={styles.headingtext}>File Name</Text>
                              <Text
                                style={styles.headingValue}
                                accessibilityLabel="Assembly">
                                {item?.filesData?.fileName}
                              </Text>
                            </View>
                          )}
                        </View>
                      ))}
                    {combinedData
                      ?.filter(item => item.value)
                      ?.map((item, index) => (
                        <View style={styles.detailsContainer} key={index}>
                          <View style={styles.detailsRow}>
                            <View style={styles.detailsColumn}>
                              <Text
                                style={styles.headingtext}
                                accessibilityLabel="categories">
                                {item.key === 'refno'
                                  ? formattedRefNo()
                                  : item.key === 'contactNO'
                                    ? 'Contact No'
                                    : item.key === 'countryOfService'
                                      ? 'Country'
                                      : item.key === 'designation'
                                        ? 'Designation'
                                        : item.key.trim() === 'sub-district'
                                          ? 'Sub-District'
                                          : item.key === 'fpsId'
                                            ? 'FPS ID'
                                            : item.key ===
                                                ('spouseName' ||
                                                  'spouse' ||
                                                  'fatherName')
                                              ? 'Father/Husband Name'
                                              : convertInputToTitleCase(
                                                  item.key,
                                                )}
                              </Text>
                              {item?.key === 'website' ? (
                                <Text style={styles.detailsText}>
                                  <Text
                                    testID="openUrl"
                                    onPress={() =>
                                      Linking.openURL(item?.value?.toString())
                                    }
                                    style={styles.link}>
                                    {item?.value?.toString()}
                                  </Text>
                                </Text>
                              ) : (
                                <Text style={styles.headingValue}>
                                  {item?.value?.toString()}
                                </Text>
                              )}
                            </View>
                          </View>
                        </View>
                      ))}

                    <View style={{position: 'relative'}}>
                      {ios && (
                        <BlurView
                          blurType="light"
                          blurAmount={4}
                          reducedTransparencyFallbackColor="white"
                          style={{
                            zIndex: 10,
                            width: '100%',
                            height: '120%',
                            borderColor: 'black',
                            position: 'absolute',
                            opacity: 1.5,
                            bottom: 0,
                            left: 0,
                            top: Platform.OS === 'ios' ? 28 : 0,
                          }}
                        />
                      )}
                      {(allSingularData?.[0]?.place ||
                        allSingularData?.[0]?.address) && (
                        <>
                          <View
                            style={{
                              justifyContent: 'center',
                            }}>
                            <Text
                              style={[styles.headingtext, {marginLeft: 35}]}>
                              Address
                            </Text>
                            <View style={[styles.blurredTextContainer]}>
                              <Text
                                style={[
                                  styles.subHeadingText,
                                  !ios ? styles.addBlur : {},
                                ]}>
                                {typeof singularAddress === 'object' ? (
                                  <View className={styles.addBlur}>
                                    {singularAddress.district && (
                                      <Text
                                        style={[
                                          styles.subHeadingText,
                                          !ios ? styles.addBlur : {},
                                        ]}>
                                        {singularAddress.district},
                                      </Text>
                                    )}
                                    {singularAddress.state && (
                                      <Text
                                        style={[
                                          styles.subHeadingText,
                                          !ios ? styles.addBlur : {},
                                        ]}>
                                        {singularAddress.state},
                                      </Text>
                                    )}
                                    {/* {singularAddress?.country && (
                                      <Text
                                        style={[
                                          styles.subHeadingText,
                                          !ios ? styles.addBlur : {},
                                        ]}>
                                        {singularAddress?.country}
                                      </Text>
                                    )} */}
                                    {singularAddress.pincode && (
                                      <Text
                                        style={[
                                          styles.subHeadingText,
                                          !ios ? styles.addBlur : {},
                                        ]}>
                                        {' '}
                                        {singularAddress.pincode}
                                      </Text>
                                    )}
                                  </View>
                                ) : (
                                  <Text
                                    style={[
                                      styles.subHeadingText,
                                      !ios ? styles.addBlur : {},
                                    ]}>
                                    {singularAddress}
                                  </Text>
                                )}
                              </Text>
                            </View>
                            <View style={styles.overlapContainer} />
                          </View>
                          <View style={styles.footerContainer}>
                            <Text style={styles.overlapLabel}>
                              Viewing Restricted
                            </Text>
                          </View>
                        </>
                      )}
                    </View>
                    <View
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: '#EEE8DD',
                        marginTop: 50,
                        marginBottom: 60,
                      }}>
                      <Text
                        style={[
                          styles.footer,
                          {
                            textAlign: 'center',
                            marginBottom: 10,
                            marginTop: 10,
                          },
                        ]}>
                        To inquire further, feel free to reach us at{'\n'}
                        <TouchableOpacity onPress={feedback}>
                          <Text
                            style={{
                              color: '#3473DC',
                              paddingHorizontal:
                                Platform.OS === 'ios' ? 100 : 0,
                              textAlign: 'center',
                              fontWeight: 500,
                              fontSize: 16,
                            }}>
                            support@imeuswe.in
                          </Text>
                        </TouchableOpacity>
                      </Text>
                      <Text
                        style={[
                          styles.footer,
                          {
                            textAlign: 'center',
                            marginTop: -10,
                            marginBottom: 10,
                          },
                        ]}>
                        Please note, detailed information may not be available
                        for all records.
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </ErrorBoundary.Screen>
  );
};

export default ImuwSingularSearch;

const styles = StyleSheet.create({
  image: {
    width: 100,
    height: 41,
  },
  footer: {
    marginTop: 35,
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    fontWeight: 500,
  },
  link: {
    color: '#3473DC',
    textDecorationLine: 'underline',
    paddingHorizontal: 10,
  },
  header: {
    fontSize: 18,
    paddingRight: 50,
    paddingLeft: 50,
    fontWeight: Theme.fonts.weight.bold,
    color: 'black',
    textAlign: 'center',
    marginBottom: 20,
  },
  headingtext: {
    color: '#B2B2B2',
    fontSize: 18,
    fontWeight: 600,
  },
  headingValue: {
    color: 'black',
    fontSize: 16,
    fontWeight: '500',
    textTransform: 'capitalize',
    marginBottom: 30,
  },
  subHeadingText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'capitalize',
    marginBottom: -10,
    marginTop: 10,
    marginLeft: 5,
    marginRight: 50,
    textAlign: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  detailsColumn: {
    flex: 1,
  },
  detailsLabel: {
    fontWeight: '600',
    fontSize: 18,
    marginBottom: 5,
  },
  detailsContainer: {
    marginLeft: 35,
  },
  restricted: {
    zIndex: 11,
  },
  footerContainer: {
    zIndex: 11,
    marginTop: 5,
    alignItems: 'center',
  },
  footerBold: {
    fontWeight: '700',
    fontSize: 18,
    color: 'black',
    // marginBottom: 1,
    marginTop: 30,
  },
  footerPlain: {
    fontWeight: '700',
    fontSize: 16,
    color: 'grey',
  },

  detailsRow: {
    flexDirection: 'row',
  },
  detailsText: {
    fontSize: 16,
  },
  overlapContainer: {
    zIndex: 11,
    marginTop: 14,
  },
  overlapLabel: {
    marginTop: Platform.OS === 'ios' ? -18 : -20,
    fontWeight: '500',
    fontSize: 18,
    marginBottom: -15,
    color: 'black',
    textAlign: 'center',
  },
  blurText: {
    fontSize: 16,
    color: 'gray',
  },
  blurredTextContainer: {
    position: 'absolute',
    left: 35,
    right: 0,
    top: 0,
    bottom: 0,
    marginTop: 20,
    justifyContent: 'center',
  },
  addBlur: {
    color: 'transparent',
    textShadowColor: 'rgba(0, 0, 0, 1)', // semi-transparent black
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 20,
  },

  blur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurredText: {
    fontSize: 24,
    color: 'white', // Adjust text color
  },
});
