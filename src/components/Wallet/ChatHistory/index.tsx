import React, {memo, useEffect, useState, useRef} from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import ChatHistoryCard from './ChatHistoryCard';
import {useSelector, useDispatch} from 'react-redux';
import {AppDispatch, RootState} from '../../../store';
import {
  getUserChatHistory,
  setChatHistoryPageNumber,
} from '../../../store/apps/agora';
import {Text} from 'react-native';
import {ASTRO_DEFAULT_AVATAR} from '../../../configs/Calls/Constants';
import {SingleHistoryChatCard} from '../../../store/apps/agora/types';
import {FlashList} from '@shopify/flash-list';
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
            <Text style={styles.emptyMessage}>No Chat History Found.</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  },
);

const Divider = memo(() => {
  return <View style={{height: 20}} />;
});

const ChatHistory = () => {
  const ITEMS_PER_PAGE = 10;
  const dispatch = useDispatch<AppDispatch>();
  const chatHistoryResponse = useSelector(
    (state: RootState) => state.agoraCallSlice.userChatHistory,
  );
  const hasMore = useRef<boolean>(true);
  const isMounted = useRef(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);

  async function fetchChatHistory(reset = false, isMounted = false) {
    try {
      if (reset) {
        dispatch(setChatHistoryPageNumber(1));
        hasMore.current = true;
        if (isMounted) {
          setIsInitialLoading(true);
        } else {
          setRefreshing(true);
        }
      } else {
        setLoadingMore(true);
      }
      const response = await dispatch(getUserChatHistory({})).unwrap();
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
    await fetchChatHistory();
  }

  async function onRefresh() {
    setRefreshing(true);
    await fetchChatHistory(true);
  }

  useEffect(() => {
    if (chatHistoryResponse?.length === 0) {
      fetchChatHistory(true, true);
    }
    isMounted.current = true;
    return;
  }, []);

  const renderItem = ({item}: {item: SingleHistoryChatCard}) => (
    <ChatHistoryCard
      astrologerProfilePic={
        item?.astrologerData?.personalDetails?.profilepic &&
        item?.astrologerData?.personalDetails?.profilepic?.length > 0
          ? item?.astrologerData?.personalDetails?.profilepic
          : ASTRO_DEFAULT_AVATAR
      }
      astrologerName={item.displayName}
      duration={item.duration}
      total={526}
      sessionStartedAt={item.sessionStartedAt}
      currency="₹"
      chatRoomId={item._id}
      userId={item.userId}
      astrologerId={item.astrologerId}
      eventStatus={item.eventStatus}
      amountType={item.amountType}
      deductedAmount={item.deductedAmount}
      ratePerMin={item.ratePerMin}
      transactionId={item.transactionId}
    />
  );

  return (
    <ErrorBoundary.Screen>
      <FlashList
        showsVerticalScrollIndicator={false}
        style={{paddingTop: 10}}
        data={chatHistoryResponse}
        keyExtractor={item => item._id}
        contentContainerStyle={{
          ...styles.flatListContainerStyle,
          ...(chatHistoryResponse?.length > 0 ? {} : {flex: 1}),
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

export default memo(ChatHistory);

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
