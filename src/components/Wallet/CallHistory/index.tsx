import React, {memo, useEffect, useState, useRef} from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import CallHistoryCard from './CallHistoryCard';
import {useSelector, useDispatch} from 'react-redux';
import {AppDispatch, RootState} from '../../../store';
import {
  getUserCallHistory,
  setCallHistoryPageNumber,
} from '../../../store/apps/agora';
import {Text} from 'react-native';
import {ASTRO_DEFAULT_AVATAR} from '../../../configs/Calls/Constants';
import {SingleHistoryCard} from '../../../store/apps/agora/types';
import {FlashList} from '@shopify/flash-list';
import Confirm from '../../Confirm';
import M3U8Player from '../../AstroConsultation/General/M3U8Player/M3U8Player';
import ErrorBoundary from '../../../common/ErrorBoundary';

interface RenderEmptyComponent {
  isInitialLoading: boolean;
}

const RenderFooter = memo(({loadingMore = false}: {loadingMore: boolean}) => {
  if (!loadingMore) return null;
  return <ActivityIndicator size="large" color="white" style={{margin: 20}} />;
});

const RenderEmptyComponent = memo(
  ({isInitialLoading}: RenderEmptyComponent) => {
    return (
      <TouchableOpacity
        activeOpacity={1}
        style={{alignSelf: 'center', flex: 1}}>
        <View style={styles.emptyView}>
          {isInitialLoading ? (
            <ActivityIndicator color={'white'} size={'large'} />
          ) : (
            <Text style={styles.emptyMessage}>No Call History Found.</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  },
);

const Divider = memo(() => {
  return <View style={{height: 20}} />;
});

const CallHistory = () => {
  const ITEMS_PER_PAGE = 10;
  const dispatch = useDispatch<AppDispatch>();
  const callHistoryResponse =
    useSelector((state: RootState) => state.agoraCallSlice.userCallHistory) ||
    [];

  const hasMore = useRef<boolean>(true);
  const isMounted = useRef(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [selectedName, setSelectedName] = useState<string>('');
  const [recordingUrl, setRecordingUrl] = useState<string>('');

  async function fetchCallHistory(reset = false) {
    try {
      if (reset) {
        dispatch(setCallHistoryPageNumber(1));
        hasMore.current = true;
        if (isMounted) {
          setIsInitialLoading(true);
        } else {
          setRefreshing(true);
        }
      } else {
        setLoadingMore(true);
      }
      const response = await dispatch(getUserCallHistory({})).unwrap();
      if (response.history.length < ITEMS_PER_PAGE) {
        hasMore.current = false;
      } else {
        hasMore.current = true;
      }
    } catch (error) {
      console.log(error);
    } finally {
      if (isMounted) {
        setIsInitialLoading(false);
      }
      setLoadingMore(false);
      setRefreshing(false);
    }
  }

  async function loadMore() {
    if (!hasMore.current || loadingMore) return;
    setLoadingMore(true);
    await fetchCallHistory();
  }

  async function onRefresh() {
    setRefreshing(true);
    await fetchCallHistory(true);
  }

  useEffect(() => {
    if (callHistoryResponse?.length === 0) {
      fetchCallHistory(true);
    }
    isMounted.current = true;
    return;
  }, []);

  const renderItem = ({item}: {item: SingleHistoryCard}) => (
    <CallHistoryCard
      astrologerProfilePic={
        item?.astrologerData?.personalDetails?.profilepic &&
        item?.astrologerData?.personalDetails?.profilepic?.length > 0
          ? item?.astrologerData?.personalDetails?.profilepic
          : ASTRO_DEFAULT_AVATAR
      }
      astrologerName={item.displayName}
      duration={item.duration}
      total={526}
      callStartedAt={item.callStartedAt}
      currency="₹"
      callStatus={item.callStatus}
      userId={item.userId}
      astrologerId={item.astrologerId}
      amountType={item.amountType}
      deductedAmount={item.deductedAmount}
      ratePerMin={item.ratePerMin}
      transactionId={item.transactionId}
      onShowRecording={name => {
        setSelectedName(name);
        setRecordingUrl(item.recordingUrl);
      }}
    />
  );

  return (
    <ErrorBoundary.Screen>
      {selectedName?.length > 0 && (
        <Confirm
          crossFill="rgba(19, 16, 43, 1)"
          showCross={true}
          isAstrology
          crossStyle={{borderRadius: 50, backgroundColor: 'white'}}
          onBackgroundClick={() => setSelectedName('')}
          onDiscard={() => setSelectedName('')}
          onCrossClick={() => setSelectedName('')}
          discardCtaText={false}
          continueCtaText={false}
          components={<M3U8Player src={recordingUrl} />}
          subTitle={null}
          title={selectedName}
          titleStyle={{
            alignSelf: 'flex-start',
            alignItems: 'center',
            color: 'white',
            paddingBottom: 25,
            fontSize: 24,
            fontWeight: '500',
          }}
        />
      )}
      <FlashList
        showsVerticalScrollIndicator={false}
        style={{paddingTop: 10}}
        data={callHistoryResponse}
        keyExtractor={item => item._id}
        contentContainerStyle={{
          ...styles.flatListContainerStyle,
          ...(callHistoryResponse?.length > 0 ? {} : {flex: 1}),
        }}
        renderItem={renderItem}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={5}
        ItemSeparatorComponent={Divider}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6944D3']}
            tintColor="white"
          />
        }
        onEndReached={isMounted.current ? loadMore : null}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isInitialLoading ? null : <RenderFooter loadingMore={loadingMore} />
        }
        ListEmptyComponent={
          <RenderEmptyComponent isInitialLoading={isInitialLoading} />
        }
      />
    </ErrorBoundary.Screen>
  );
};

export default memo(CallHistory);

const styles = StyleSheet.create({
  emptyView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyMessage: {
    textAlign: 'center',
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flatListContainerStyle: {
    paddingBottom: 50,
    paddingTop: 20,
  },
});
