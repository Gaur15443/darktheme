import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import {FlatList, ScrollView} from 'react-native-gesture-handler';
import {Text} from 'react-native-paper';
import {useSelector, useDispatch} from 'react-redux';
import {getPublicDataSingular} from '../../../store/apps/listPublicData';
import {useNavigation} from '@react-navigation/native';
import {getPublicDataPlural} from '../../../store/apps/listPublicData';
import NewTheme from '../../../common/NewTheme';
import Theme from '../../../common/Theme';
import FilterIcon from '../../../components/ImeusweSearch/FilterIcon';
import SearchFilter from './SearchFilter';
import Spinner from '../../../common/Spinner';
import GlobalHeader from '../../../components/ProfileTab/GlobalHeader';
import categoryViewIcon from '../../../../src/assets/images/categoryViewIcon.png';
import ErrorBoundary from '../../../common/ErrorBoundary';
import LottieView from 'lottie-react-native';

const PaginationComponent = ({
  recordsPerPage,
  currentPage,
  handlePageChange,
  totalResults,
}) => {
  const totalPages = Math.ceil(totalResults / recordsPerPage);

  const getPageNumbers = () => {
    const pageNumbers = [];

    if (totalPages <= 5) {
      pageNumbers.push(
        ...Array.from({length: totalPages}, (_, index) => index + 1),
      );
    } else {
      if (currentPage <= 3) {
        pageNumbers.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage > totalPages - 3) {
        pageNumbers.push(
          1,
          '...',
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        );
      } else {
        pageNumbers.push(
          1,
          '...',
          currentPage - 1,
          currentPage,
          currentPage + 1,
          '...',
          totalPages,
        );
      }
    }

    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  return (
    <ErrorBoundary.Screen>
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
        <View style={styles.container}>
          <TouchableOpacity
            onPress={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={[
              styles.button,
              currentPage === 1 && styles.disabledButton,
              styles.buttonBorder,
            ]}>
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
          <View style={styles.pageNumbersContainer}>
            {pageNumbers.map((page, index) =>
              page === '...' ? (
                <Text key={index} style={styles.pageEllipsis}>
                  {page}
                </Text>
              ) : (
                <TouchableOpacity
                  key={page}
                  onPress={() => handlePageChange(page)}
                  style={[
                    styles.pageNumber,
                    currentPage === page && styles.selectedPage,
                  ]}>
                  <Text
                    style={[
                      styles.pageText,
                      currentPage === page && styles.selectedPageText,
                    ]}>
                    {page}
                  </Text>
                </TouchableOpacity>
              ),
            )}
          </View>

          <TouchableOpacity
            onPress={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={[
              styles.button,
              currentPage === totalPages && styles.disabledButton,
              styles.buttonBorder,
            ]}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ErrorBoundary.Screen>
  );
};

const ImuwTailorSearch = ({route}) => {
  const navigator = useNavigation();
  const getAllPluralData = useSelector(state => state.getListPublicData);
  const getAllPluralDataList = getAllPluralData?.getAllPluralData?.[0]?.data;
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [filters, setFilters] = useState(route?.params?.formData || {});
  const [loader, setLoader] = useState(false);
  const dispatch = useDispatch();
  const [paginationCount, setPaginationCount] = useState(
    route?.params?.formData,
  );
  const records = getAllPluralData.getAllPluralData || [];
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = records.slice(indexOfFirstRecord, indexOfLastRecord);
  const [totalCount, settotalCount] = useState(1);
  const totalResults = totalCount;
  const startRecord = indexOfFirstRecord + 1;
  const endRecord = Math.min(indexOfLastRecord, totalResults);
  const [count, setCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const navigation = useNavigation();
  const inviteContent = "You're invited to our event!";
  const handleShowModal = () => {
    setShowModal(true);
  };

  const handleInputChange = (field, value) => {
    setFilters({
      ...filters,
      [field]: value,
    });
  };

  const goBack = () => {
    navigation.goBack();
  };

  const handleCloseModal = () => setShowModal(false);

  const handleDataSubmit = data => {
    setPaginationCount(data);
    setCurrentPage(1);
  };
  const handleSingularRecord = async item => {
    const categoryArray = [];
    categoryArray.push(item?.filesData?.category);
    const data = {
      catagory: ['default'],
      personId: item._id,
    };
    const response = await dispatch(getPublicDataSingular({payload: data}));
    navigator.navigate('ImeusweSingularSearch', {
      propCategoryName: item.categoryData.categoryName,
      allSingularData: response.payload,
    });
  };

  useEffect(() => {
    settotalCount(getAllPluralData?.getAllPluralData?.[0]?.total[0]?.count);
  }, [getAllPluralData?.getAllPluralData]);

  const animationRef = useRef();
  const playAnimation = () => {
    if (animationRef.current) {
      animationRef.current.play(0, 237);
    }
  };
  useEffect(() => {
    playAnimation();
  }, []);

  const formatDate = (isoDate, BD_Flag) => {
    let date;
    if (typeof isoDate === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(isoDate)) {
      const [day, month, year] = isoDate.split('/').map(Number);
      date = new Date(year, month - 1, day);
    } else if (
      typeof isoDate === 'string' &&
      /^\d{2}-\d{2}-\d{4}$/.test(isoDate)
    ) {
      const [day, month, year] = isoDate.split('-').map(Number);
      date = new Date(year, month - 1, day);
    } else {
      date = new Date(isoDate);
    }
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      return isoDate;
    }
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    if (BD_Flag === 4) {
      return year.toString();
    }
    return `${day}/${month}/${year}`;
  };

  const normalizeGender = gender => {
    const genderMap = {
      m: 'Male',
      male: 'Male',
      M: 'Male',
      MALE: 'Male',
      f: 'Female',
      female: 'Female',
      F: 'Female',
      FEMALE: 'Female',
    };
    return genderMap[gender?.toLowerCase()] || 'Unknown';
  };

  const handleSearch = async (pageNum = currentPage) => {
    try {
      setLoader(true);

      const capitalizeEachWord = str => {
        if (!str) return str;
        return str
          .split(' ')
          .map(
            word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
          )
          .join(' ');
      };
      const capitalize = str => str?.toUpperCase();
      const capitalizeFirstLetter = str =>
        str?.charAt(0).toUpperCase() + str?.slice(1).toLowerCase();
      const capitalizedFormData = {
        ...paginationCount,
        name: paginationCount.name
          ? capitalize(paginationCount.name)
          : paginationCount.name,
        middleName: paginationCount.middleName
          ? capitalize(paginationCount.middleName)
          : paginationCount.middleName,
        lastName: paginationCount.lastName
          ? capitalize(paginationCount.lastName)
          : paginationCount.lastName,
        location: paginationCount.location
          ? capitalizeEachWord(paginationCount.location)
          : paginationCount.location,
        spouse: paginationCount.spouse
          ? capitalizeFirstLetter(paginationCount.spouse)
          : paginationCount.spouse,
        district: paginationCount.district
          ? capitalize(paginationCount.district)
          : paginationCount.district,
        state: paginationCount.state
          ? capitalize(paginationCount.state)
          : paginationCount.state,
      };

      // Filter out empty or null values from the formData
      const filteredFormData = Object.fromEntries(
        Object.entries(capitalizedFormData).filter(
          ([key, value]) =>
            value !== '' && value !== null && value !== undefined,
        ),
      );
      const data = {
        ...filteredFormData,
        pageNum: pageNum,
        pageSize: recordsPerPage,
      };
      const response = await dispatch(getPublicDataPlural({payload: data}));
      setLoader(false);
      if (response.payload?.length === 0) {
        return;
      }
      setCount(pageNum);
    } catch (error) {
      setLoader(false);
    }
  };

  const handlePageChange = value => {
    setCurrentPage(value);
    setCount(value);
    handleSearch(value);
  };

  return (
    <ErrorBoundary.Screen>
      <GlobalHeader
        onBack={goBack}
        marginTop={35}
        heading={'Search iMeUsWe Records'}
        backgroundColor={NewTheme.colors.backgroundCreamy}
      />

      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 10,
        }}>
        <Text style={{fontWeight: 'bold', fontSize: 18}}>Search Results</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          testID="view"
          style={[styles.buttonOne]}
          onPress={handleShowModal}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'space-between',
              justifyContent: 'space-between',
            }}>
            <FilterIcon size={10} style={{marginRight: 6}} />
            <Text style={styles.buttonTextFilter}>Filters</Text>
          </View>
        </TouchableOpacity>
      </View>
      {getAllPluralDataList?.length === 0 && (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: '30%',
          }}>
          <LottieView
            ref={animationRef}
            source={require('../../../animation/lottie/search.json')}
            loop={false}
            autoPlay={false}
            style={{width: 350, height: 350}}
          />
          <Text
            style={[styles.errorText, {marginHorizontal: 10, marginTop: -60}]}>
            Oops! Sorry but we didn’t find anything relevant to your search.
          </Text>
        </View>
      )}
      <ScrollView>
        <View style={{flex: 1, padding: 10}}>
          {loader ? <Spinner /> : null}
          {getAllPluralDataList?.length > 0 &&
            getAllPluralDataList?.map((record, index) => {
              const globalIndex =
                (currentPage - 1) * recordsPerPage + index + 1;
              const formattedIndex = `#${globalIndex}`;

              return (
                <View key={formattedIndex} style={styles.cardContainer}>
                  <View style={styles.topHalf}>
                    <Text style={styles.indexText}>{formattedIndex}</Text>

                    <View style={styles.nameContainer}>
                      <Text style={styles.nameText}>{record.name}</Text>
                      {record.middleName && (
                        <Text style={styles.nameText}>{record.middleName}</Text>
                      )}
                      {record.lastName !== '$LASTNAME' && (
                        <Text style={[styles.nameText]}>{record.lastName}</Text>
                      )}
                    </View>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Image
                        source={categoryViewIcon}
                        style={{width: 15, height: 15}}
                        resizeMode="contain"
                      />
                      {record?.categoryData?.categoryName && (
                        <View style={[styles.categoryContainer]}>
                          <Text
                            style={{color: '#888888'}}
                            numberOfLines={
                              record?.categoryData?.categoryName.length
                            }
                            ellipsizeMode="tail">
                            {record?.categoryData?.categoryName.length
                              ? `(${record?.categoryData?.categoryName})`
                              : `(${record?.categoryData?.categoryName})`}
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text
                      style={[
                        styles.placeText,
                        {
                          marginBottom:
                            record?.place?.district || record?.place?.state
                              ? 0
                              : -20,
                        },
                      ]}>
                      {[record?.place?.district, record?.place?.state]
                        .filter(Boolean)
                        .join(', ')}
                    </Text>
                  </View>

                  <View style={styles.bottomHalf}>
                    <View style={styles.detailContainer}>
                      <Text
                        style={{
                          color: '#444444',
                          fontSize: 14,
                          paddingRight: 76,
                        }}>
                        Gender
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          paddingRight: ['M', 'MALE'].includes(
                            String(record.sex || '')
                              .trim()
                              .toUpperCase(),
                          )
                            ? 195
                            : 175,
                        }}>
                        {normalizeGender(record.sex)}
                      </Text>
                    </View>
                    <View style={styles.detailContainerRow}>
                      {record?.dateOfBirth && record?.dateOfBirth !== '-' ? (
                        <>
                          <Text style={{color: '#444444', fontSize: 14}}>
                            Date of Birth
                          </Text>
                          <Text
                            style={[styles.detailValue, {paddingLeft: '1%'}]}>
                            {formatDate(record.dateOfBirth, record.BD_Flag)}
                          </Text>
                        </>
                      ) : (
                        <View
                          style={{flexDirection: 'row', alignItems: 'center'}}
                        />
                      )}

                      <TouchableOpacity
                        style={styles.searchButton}
                        onPress={() => handleSingularRecord(record)}>
                        {loader ? (
                          <ActivityIndicator
                            size="small"
                            color="orange"
                            style={{paddingHorizontal: 12}}
                          />
                        ) : (
                          <Text style={styles.searchButtonText}>
                            View Details
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
        </View>
      </ScrollView>
      <View>
        <View>
          {totalResults > 0 && (
            <>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  marginBottom: 2,
                }}>
                <Text style={styles.resultsTitle}>Results</Text>
                <Text style={{paddingLeft: 10}}>
                  {startRecord}–{endRecord} of {totalResults}
                </Text>
              </View>
              <View style={{flexDirection: 'row'}}>
                <FlatList
                  data={currentRecords}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({item}) => (
                    <Text style={styles.recordItem}>{item.name}</Text>
                  )}
                />

                <PaginationComponent
                  records={records}
                  recordsPerPage={recordsPerPage}
                  currentPage={currentPage}
                  handlePageChange={handlePageChange}
                  totalResults={totalResults}
                  startRecord={startRecord}
                  endRecord={endRecord}
                />
              </View>
            </>
          )}
        </View>

        <SearchFilter
          visible={showModal}
          onClose={handleCloseModal}
          content={inviteContent}
          onDataSubmit={handleDataSubmit}
          initialFilters={filters}
          playAnimation={playAnimation()}
        />
      </View>
    </ErrorBoundary.Screen>
  );
};

const styles = StyleSheet.create({
  centerText: {
    textAlign: 'center',
    fontSize: 18,
    color: 'gray',
  },
  cardContainer: {
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  buttonActive: {
    backgroundColor: 'white',
  },
  detailContainerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  detailValue: {
    fontSize: 14,
    color: 'black',
  },
  searchButton: {
    backgroundColor: '#ff7f50',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  searchButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  ordContainer: {
    marginLeft: 10,
    marginRight: 10,
    flexDirection: 'column',
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
  },
  topHalf: {
    backgroundColor: '#EEE8DD',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderStartStartRadius: 10,
    borderStartEndRadius: 10,
  },
  bottomHalf: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderEndEndRadius: 10,
    borderEndStartRadius: 10,
  },
  indexText: {
    fontWeight: '300',
    fontSize: 14,
    color: 'black',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  nameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  placeText: {
    fontSize: 14,
    color: 'black',
    fontWeight: '500',
  },
  detailContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  viewDetailsButton: {
    alignSelf: 'flex-end',
    marginRight: '5%',
    paddingVertical: 10,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    paddingLeft: 10,
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    marginHorizontal: 1,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 14,
    color: 'black',
    backgroundColor: '#FFFFFF',
    padding: 4,
  },
  buttonTextFilter: {
    color: Theme.light.onWhite100,
    fontSize: 14,
    fontWeight: 'bold',
    justifyContent: 'flex-end',
    alignContent: 'flex-end',
    flexDirection: 'row',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'self-start',
    paddingHorizontal: 15,
  },
  buttonOne: {
    padding: 4,
    borderRadius: 5,
    minWidth: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: NewTheme.colors.primaryOrange,
  },
  pageNumber: {
    padding: 3,
    borderRadius: 2,
    marginHorizontal: 3,
    paddingHorizontal: 6,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E9E9E9',
  },
  selectedPage: {
    backgroundColor: 'rgba(231, 114, 55, 1)',
  },
  pageText: {
    color: 'black',
    fontSize: 16,
    paddingHorizontal: 3,
  },
  selectedPageText: {
    color: 'white',
  },

  pageNumbersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pageEllipsis: {
    padding: 10,
    marginHorizontal: 5,
    fontSize: 16,
    color: '#999999',
  },
  buttonBorder: {
    borderWidth: 1,
    borderColor: '#E9E9E9',
    borderRadius: 5,
    padding: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyImages: {
    width: 250,
    height: 200,
  },
  errorText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
    textAlign: 'center',
    color: Theme.light.shadow,
  },
});

export default ImuwTailorSearch;
