import React, {
  useCallback,
  useState,
  useRef,
  useEffect,
  useMemo,
  memo,
} from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Dimensions,
  Pressable,
  RefreshControl,
} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import {Text, useTheme, Portal} from 'react-native-paper';
import ErrorBoundary from '../../../common/ErrorBoundary';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import MobileVerificationGuard from '../../../components/Wallet/MobileVerificationGuard';
import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDispatch, useSelector} from 'react-redux';
import Toast from 'react-native-toast-message';
import {getFilterOptions} from '../../../store/apps/astroFilters';
import Spinner from '../../../common/Spinner';
import ButtonSpinner from '../../../common/ButtonSpinner';
import {
  getAllAstrologers,
  resetAstrologers,
} from '../../../store/apps/astrologersListing';
import {Track} from '../../../../App';

import Wallet from '../../../components/Wallet';
import AstroHeader from '../../../common/AstroHeader';
import {useWallet} from '../../../context/WalletContext';
import SearchIcon from '../../../images/Icons/SearchIcon';
import {AppDispatch, RootState} from '../../../store';
import type {AstrologerDetails} from '../../../store/apps/astrologersListing/index.d';
import useLiveAstrologers from '../../../hooks/sockets/useLiveAstrologers';
import FilterSort from '../../../components/AstroConsultation/FilterSort';
import ItemCard from '../../../components/AstroConsultation/ItemCard';

const {height} = Dimensions.get('window');

const INITIAL_NUM_TO_RENDER = 6;
const MAX_TO_RENDER_PER_BATCH = 4;
const UPDATE_CELLS_BATCHING_PERIOD = 50;

const MainContent = memo(
  ({
    freeCallText,
    renderAstrologerItem,
    keyExtractor,
    flatListExtraData,
    onEndReachedThrottled,
    ListFooterComponent,
    ListEmptyComponent,
    refreshing,
    handleRefresh,
  }: {
    freeCallText: React.ReactNode;
    renderAstrologerItem: ({
      item,
    }: {
      item: AstrologerDetails;
    }) => React.ReactElement;
    keyExtractor: (item: AstrologerDetails) => string;
    flatListExtraData: any;
    onEndReachedThrottled: () => void;
    ListFooterComponent: React.ComponentType<any> | React.ReactElement | null;
    ListEmptyComponent: React.ComponentType<any> | React.ReactElement | null;
    refreshing: boolean;
    handleRefresh: () => Promise<void>;
  }) => {
    const astrologers = useSelector(
      (state: RootState) => state.astrologersListing.astrologers,
    );

    const getItemLayout = useCallback(
      (_: ArrayLike<AstrologerDetails> | null | undefined, index: number) => ({
        // height 186 plus gap of 5
        length: 191,
        offset: 191 * index,
        index,
      }),
      [],
    );

    return (
      <View style={styles.mainContentContainer}>
        {freeCallText}
        <View style={styles.flatListContainer}>
          <FlatList
            data={astrologers}
            renderItem={renderAstrologerItem}
            refreshing={refreshing}
            keyExtractor={keyExtractor}
            extraData={flatListExtraData}
            style={styles.flatListStyle}
            contentContainerStyle={styles.flatListContent}
            onEndReached={onEndReachedThrottled}
            onEndReachedThreshold={0.2}
            maxToRenderPerBatch={MAX_TO_RENDER_PER_BATCH}
            updateCellsBatchingPeriod={UPDATE_CELLS_BATCHING_PERIOD}
            initialNumToRender={INITIAL_NUM_TO_RENDER}
            ListFooterComponent={ListFooterComponent}
            ListEmptyComponent={ListEmptyComponent}
            scrollEventThrottle={32}
            windowSize={5}
            keyboardShouldPersistTaps="handled"
            onRefresh={handleRefresh}
            getItemLayout={getItemLayout}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={['#6944D3']}
                tintColor="white"
              />
            }
          />
        </View>
      </View>
    );
  },
);

function Consultation() {
  useLiveAstrologers();
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const scrollRef = useRef<ScrollView>(null);
  const pillRefs = useRef<{[key: string]: any}>({});
  const navigation = useNavigation<NavigationProp<any>>();
  const {freeCallAvailable, fetchWalletData} = useWallet();

  const {userData, filterOptions, astrologers} = useSelector(
    (state: RootState) => ({
      userData: state.userInfo,
      filterOptions: state.astroFilters.filterOptions,
      astrologers: state.astrologersListing.astrologers,
    }),
  );

  const {bottom} = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activePill, setActivePill] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string[]>([]);
  const [selectedGender, setSelectedGender] = useState<string[]>([]);
  const [selectedSortBy, setSelectedSortBy] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [applyingFilter, setApplyingFilter] = useState(false);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadedAll, setLoadedAll] = useState(false);

  const flatListExtraData = useMemo(
    () => ({
      astrologersLength: astrologers.length,
      loadingMore,
      loadedAll,
    }),
    [astrologers.length, loadingMore, loadedAll],
  );

  const pillOpacityStyle = useMemo(
    () => ({
      opacity: loading ? 0.5 : 1,
    }),
    [loading],
  );

  const modalOverlayStyle = useMemo(
    () => ({
      bottom: bottom + 60,
    }),
    [bottom],
  );

  const modalBackdropStyle = useMemo(
    () => ({
      backgroundColor: theme.colors.backdrop,
    }),
    [theme.colors.backdrop],
  );

  const filterModalStyle = useMemo(
    () => ({
      bottom: 0,
    }),
    [],
  );

  // TODO: FIX SCROLLING ISSUE
  // useEffect(() => {
  //   if (activePill && pillRefs.current?.[activePill]) {
  //     pillRefs.current[activePill]?.measure?.(
  //       (__x: any, __y: any, __width: any, __height: any, pageX: number) => {
  //         if (scrollRef.current) {
  //           scrollRef.current?.scrollTo?.({
  //             x: Math.max(0, pageX - 50),
  //             animated: true,
  //           });
  //         }
  //       },
  //     );
  //   }
  // }, [activePill]);

  useFocusEffect(
    useCallback(() => {
      Track({
        cleverTapEvent: 'Consultation_Visited',
        mixpanelEvent: 'Consultation_Visited',
        userData,
      });
      if (userData?._id) {
        fetchWalletData(userData?._id);
      }
      return () => {
        setShowFilter(false);
      };
    }, [userData]),
  );

  useFocusEffect(
    useCallback(() => {
      async function fetchActivePillAstrologers() {
        try {
          setLoading(true);
          dispatch(resetAstrologers());
          setPage(1);
          setLoadedAll(false);
          console.log(filterOptions, 'filterOptions');
          if (!filterOptions?.skills || !filterOptions?.languages) {
            await dispatch(getFilterOptions()).unwrap();
          }
          await dispatch(
            getAllAstrologers({
              page: 1,
              skills: selectedSkills,
              language: selectedLanguage,
              gender: selectedGender,
              speciality: activePill,
              sortBy: selectedSortBy,
            }),
          ).unwrap();
        } catch (error) {
          Toast.show({
            text1: (error as any)?.message as string,
            type: 'error',
          });
        } finally {
          setTimeout(() => {
            setLoading(false);
          }, 0);
        }
      }
      // if (astrologers?.length) {
      fetchActivePillAstrologers();
      // }
    }, [activePill]),
  );

  const handleSkillCheck = useCallback((skill: string) => {
    setSelectedSkills(prev =>
      prev?.includes?.(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill],
    );
  }, []);

  const handleLanguageSelect = useCallback((lang: string) => {
    setSelectedLanguage(prev =>
      prev?.includes?.(lang) ? prev.filter(l => l !== lang) : [...prev, lang],
    );
  }, []);

  const handleGenderSelect = useCallback((gender: string) => {
    setSelectedGender(prev =>
      prev?.includes?.(gender)
        ? prev.filter(g => g !== gender)
        : [...prev, gender],
    );
  }, []);

  const handleSortBySelect = useCallback((sortBy: string | null) => {
    setSelectedSortBy(prev => (sortBy === prev ? null : sortBy));
  }, []);

  const handleClear = useCallback(() => {
    setSelectedSkills([]);
    setSelectedLanguage([]);
    setSelectedGender([]);
    setSelectedSortBy(null);
  }, []);

  const getNextPage = useCallback(async () => {
    try {
      if (loadingMore || astrologers.length < 10 || loadedAll) return;
      const prev = page + 1;
      setLoadingMore(true);
      setPage(prev);
      const nextPage = await dispatch(
        getAllAstrologers({
          page: prev,
          skills: selectedSkills,
          language: selectedLanguage,
          gender: selectedGender,
          speciality: activePill,
          sortBy: selectedSortBy,
        }),
      ).unwrap();

      if (!nextPage?.length) {
        setLoadedAll(true);
      }
    } catch (error) {
      Toast.show({
        text1: (error as any)?.message,
        type: 'error',
      });
    } finally {
      setLoadingMore(false);
    }
  }, [
    selectedGender,
    selectedLanguage,
    selectedSkills,
    selectedSortBy,
    activePill,
    page,
    loadingMore,
    astrologers.length,
    loadedAll,
    dispatch,
  ]);

  const handleCardPress = useCallback(
    (astrologer: AstrologerDetails) => {
      const props = {
        name: astrologer.astrologername,
        'Astrologer ID': astrologer.userId,
      };
      Track({
        cleverTapEvent: 'View_Astrologer_Profile',
        mixpanelEvent: 'View_Astrologer_Profile',
        userData,
        cleverTapProps: props,
        mixpanelProps: props,
      });
      navigation.navigate('AstroProfile', {astroId: astrologer.userId});
    },
    [userData],
  );

  const handleApplyFilter = useCallback(
    async (data: {skills: any; language: any; gender: any; sortBy: any}) => {
      try {
        const props = {
          'Filter Name': 'skills, language, gender, sortBy, speciality',
          'Filter Attributes': `${data?.skills}, ${data?.language}, ${data?.gender}, ${data?.sortBy}`,
        };
        Track({
          cleverTapEvent: 'Filter_Applied_Consultation',
          mixpanelEvent: 'Filter_Applied_Consultation',
          userData,
          cleverTapProps: props,
          mixpanelProps: props,
        });

        dispatch(resetAstrologers());
        setPage(1);
        setLoadedAll(false);
        setApplyingFilter(true);
        const payload = {
          page: 1,
          skills: data?.skills || [],
          language: data?.language || [],
          gender: data?.gender || [],
          sortBy: data?.sortBy || null,
          speciality: activePill,
        };
        await dispatch(getAllAstrologers(payload)).unwrap();
        setShowFilter(false);
      } catch (error) {
        Toast.show({
          text1: (error as any)?.message,
          type: 'error',
        });
      } finally {
        setApplyingFilter(false);
      }
    },
    [activePill, userData],
  );

  const keyExtractor = useCallback(
    (item: AstrologerDetails) => item.userId.toString(),
    [],
  );

  const renderAstrologerItem = useCallback(
    ({item}: {item: AstrologerDetails}) => (
      <ItemCard
        astrologer={item}
        onPress={handleCardPress}
        userData={userData}
      />
    ),
    [handleCardPress],
  );

  const ListFooterComponent = useMemo(() => {
    if (!loadingMore && !loadedAll)
      return <View style={styles.loadingSpacer} />;

    return (
      <>
        {loadingMore && !loadedAll && (
          <View style={styles.loadingFooter}>
            <ButtonSpinner color={'#fff'} />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}
        <View style={styles.loadingSpacer} />
      </>
    );
  }, [loadingMore, loadedAll]);

  const ListEmptyComponent = useMemo(() => {
    if (loading || refreshing) return null;

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No results found</Text>
      </View>
    );
  }, [loading, refreshing]);

  const onEndReachedThrottled = useCallback(() => {
    if (!loadingMore && !loadedAll) {
      getNextPage();
    }
  }, [loadingMore, loadedAll, getNextPage]);

  const handleSearch = useCallback(() => {
    Track({
      cleverTapEvent: 'Search_Astrologer',
      mixpanelEvent: 'Search_Astrologer',
      userData,
    });
    navigation.navigate('AstroConsultationSearch');
  }, [navigation, userData]);

  const handleFilterPress = useCallback(() => {
    if (loading) return;
    Track({
      cleverTapEvent: 'Filter_Accessed_Consultation',
      mixpanelEvent: 'Filter_Accessed_Consultation',
      userData,
    });
    setShowFilter(true);
  }, [userData, loading]);

  const renderPills = useMemo(() => {
    if (!filterOptions?.['speciality']?.data?.length) return null;

    return (
      <View style={styles.pillsRow}>
        {filterOptions['speciality'].data.map(tag => (
          <TouchableOpacity
            disabled={loading}
            key={typeof tag === 'string' ? tag : String(tag)}
            ref={el => (pillRefs.current[String(tag)] = el)}
            style={[
              styles.pill,
              activePill === tag ? styles.activePill : styles.inactivePill,
              pillOpacityStyle,
            ]}
            onPress={() => {
              if (loading) return;
              setActivePill(prev =>
                String(prev) === String(tag) ? '' : String(tag),
              );
            }}>
            <Text>{String(tag)}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }, [
    filterOptions?.['speciality']?.data,
    activePill,
    loading,
    pillOpacityStyle,
  ]);

  const pillsScrollView = useMemo(
    () => (
      <ScrollView
        ref={scrollRef}
        horizontal
        contentContainerStyle={styles.scrollViewContent}>
        {renderPills}
      </ScrollView>
    ),
    [renderPills],
  );

  const headerContent = useMemo(
    () => (
      <AstroHeader.Content
        title="Talk with an Astrologer"
        style={styles.headerContentStyle}>
        <View style={styles.headerContentContainer}>
          <View>
            <Wallet
              cleverTapEvent="Wallet_CTA_Consultation"
              mixpanelEvent="Wallet_CTA_Consultation"
            />
          </View>
          <TouchableOpacity onPress={handleSearch}>
            <SearchIcon color="#fff" width={30} height={30} />
          </TouchableOpacity>
        </View>
      </AstroHeader.Content>
    ),
    [handleSearch],
  );

  const filterButton = useMemo(() => {
    if (Object.keys(filterOptions || {}).length === 0) return null;

    return (
      <View style={styles.filterButtonContainer}>
        <Icon
          name="filter-outline"
          size={30}
          color="#fff"
          onPress={handleFilterPress}
        />
      </View>
    );
  }, [filterOptions, handleFilterPress]);

  const freeCallText = useMemo(() => {
    if (!freeCallAvailable || astrologers.length === 0) return null;

    return (
      <Text variant={'bold' as any} style={styles.freeCallText}>
        Try us out for free, your first consultation is on us!
      </Text>
    );
  }, [freeCallAvailable, astrologers.length]);

  const loadingSpinner = useMemo(
    () => (
      <View style={styles.loadingContainer}>
        <Spinner />
      </View>
    ),
    [],
  );

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      dispatch(resetAstrologers());
      setPage(1);
      setLoadedAll(false);
      await dispatch(
        getAllAstrologers({
          page: 1,
          skills: selectedSkills,
          language: selectedLanguage,
          gender: selectedGender,
          speciality: activePill,
          sortBy: selectedSortBy,
        }),
      ).unwrap();
    } catch (error: any) {
      Toast.show({
        text1: error?.message,
        type: 'error',
      });
    } finally {
      setRefreshing(false);
    }
  }, [
    dispatch,
    selectedSkills,
    selectedLanguage,
    selectedGender,
    activePill,
    selectedSortBy,
  ]);

  const filterModal = useMemo(() => {
    if (!showFilter) return null;

    return (
      <Portal>
        <View style={[styles.modalOverlay, modalOverlayStyle]}>
          <Pressable
            onPress={() => setShowFilter(false)}
            style={[styles.modalBackdrop, modalBackdropStyle]}
          />
          <View style={[styles.filterModal, filterModalStyle]}>
            <FilterSort
              onApply={handleApplyFilter}
              onClose={() => setShowFilter(false)}
              onClear={handleClear}
              selectedSkills={selectedSkills}
              selectedLanguage={selectedLanguage}
              selectedGender={selectedGender}
              selectedSortBy={selectedSortBy}
              handleSkillCheck={handleSkillCheck}
              handleLanguageSelect={handleLanguageSelect}
              handleGenderSelect={handleGenderSelect}
              handleSortBySelect={handleSortBySelect}
              applyingFilter={applyingFilter}
            />
          </View>
        </View>
      </Portal>
    );
  }, [
    showFilter,
    bottom,
    theme.colors.backdrop,
    handleApplyFilter,
    handleClear,
    selectedSkills,
    selectedLanguage,
    selectedGender,
    selectedSortBy,
    handleSkillCheck,
    handleLanguageSelect,
    handleGenderSelect,
    handleSortBySelect,
    applyingFilter,
    modalOverlayStyle,
    modalBackdropStyle,
    filterModalStyle,
  ]);

  return (
    <ErrorBoundary.Screen>
      <MobileVerificationGuard
        navigationTarget="Consultation"
        redirectTo="Consultation">
        <View
          style={[
            styles.container,
            {backgroundColor: theme.colors.background},
          ]}>
          <AstroHeader>{headerContent}</AstroHeader>
          <View style={styles.contentContainer}>
            <View style={styles.headerRow}>
              {pillsScrollView}
              {filterButton}
            </View>

            {loading ? (
              loadingSpinner
            ) : (
              <MainContent
                ListEmptyComponent={ListEmptyComponent}
                ListFooterComponent={ListFooterComponent}
                refreshing={refreshing}
                handleRefresh={handleRefresh}
                keyExtractor={keyExtractor}
                renderAstrologerItem={renderAstrologerItem}
                freeCallText={freeCallText}
                flatListExtraData={flatListExtraData}
                onEndReachedThrottled={onEndReachedThrottled}
              />
            )}
          </View>

          {filterModal}
        </View>
      </MobileVerificationGuard>
    </ErrorBoundary.Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },

  pill: {
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginRight: 10,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePill: {
    backgroundColor: '#6944D3',
  },
  inactivePill: {
    backgroundColor: '#FFFFFF0D',
    borderWidth: 1,
    borderColor: '#FFFFFF1A',
  },
  pillsRow: {
    flexDirection: 'row',
    marginBottom: 20,
    width: '90%',
  },

  filterButtonContainer: {
    backgroundColor: '#6944D31A',
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerContentContainer: {
    paddingHorizontal: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    flex: 1,
  },
  headerContentStyle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContentWrapperStyle: {
    paddingHorizontal: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingFooter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#fff',
  },
  loadingSpacer: {
    height: 100,
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },

  mainContentContainer: {
    flex: 1,
  },
  flatListContainer: {
    flex: 1,
  },
  flatListContent: {
    paddingBottom: 20,
    gap: 10,
  },
  flatListStyle: {
    flex: 1,
  },

  freeCallText: {
    fontSize: 12,
    paddingBottom: 12,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  modalBackdrop: {
    flex: 1,
  },
  filterModal: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#2A2740',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    height: height * 0.8,
  },
  scrollViewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

export default memo(Consultation);
