import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import React, { memo, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSavedKundli, resetSavedKundlis, setShouldReset } from '../../../../store/apps/astroKundali';
import { AppDispatch, RootState } from '../../../../store';
import { capitalize, formatTimeto12Hour, formatToDayMonthYear } from '../../../../utils/format';
import Spinner from '../../../../common/Spinner';
import Icon from 'react-native-vector-icons/MaterialIcons';
import type { SaveKundliData } from '../../../../store/apps/astroKundali/index.d';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, Text } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import ButtonSpinner from '../../../../common/ButtonSpinner';
import { useIsFocused } from '@react-navigation/native';

function formatDate(isoString: string) {
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatTime(isoString: string) {
  const date = new Date(isoString);
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}


const SavedKundlis = ({ onArrowClick }: { onArrowClick: (data: SaveKundliData) => void }) => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const pageIsFocused = useIsFocused();
  const savedKundlis = useSelector(
    (state: RootState) => state.astroKundaliSlice.savedKundlis,
  );

  const shouldReset = useSelector((state: RootState) => state.astroKundaliSlice.shouldReset);
  const loadedAll = useSelector((state: RootState) => state.astroKundaliSlice.loadedAll);

  const { bottom } = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (shouldReset && !loading && !refreshing) {
      setLoading(true);
      dispatch(resetSavedKundlis());
      dispatch(setShouldReset(false));
      fetchSavedKundalis(1);
    }
    else if (pageIsFocused && !savedKundlis?.length && !loadedAll && !loading && !refreshing) {
      setLoading(true);
      fetchSavedKundalis(undefined);
    }
    setLoading(false);
  }, [pageIsFocused, shouldReset, onArrowClick, dispatch]);

  async function fetchSavedKundalis(page: undefined | number) {
    try {
      await dispatch(getSavedKundli(page)).unwrap();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: error.message
      });
    }
    finally {
      setLoading(false)
    }
  }

  async function onRefresh() {
    if (refreshing) return;
    setRefreshing(true);
    dispatch(resetSavedKundlis());
    await fetchSavedKundalis(undefined);
    setRefreshing(false);
  }
  async function getNextPage() {
    try {
      if (loadingMore || savedKundlis?.length < 10 || loadedAll) return;
      setLoadingMore(true);
      await dispatch(getSavedKundli()).unwrap();
      setLoadingMore(false);
    } catch (error) {
      setLoadingMore(false);
    }
  }
  return (
    <View style={{ flex: 1, paddingBottom: bottom + 60 }}>
      <FlatList
        style={{ flex: 1, }}
        contentContainerStyle={{ paddingTop: 15 }}
        data={savedKundlis}
        keyExtractor={(item) => item._id}
        onEndReached={getNextPage}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => onRefresh()}
            tintColor={"#fff"}
            colors={[theme.colors.primary]}
          />
        }
        renderItem={({ item: kundli }) => (<>
          {kundli?._id ? <Pressable
            style={styles.card}
            onPress={() => {
              onArrowClick(kundli)
            }}
          >
            <View style={{ flexShrink: 1, gap: 8 }}>
              <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
                <Text style={styles.name}>{kundli.name}</Text>
                {kundli?.isOwnersKundli && <View style={[styles.selfContainer, {
                  backgroundColor: theme.colors.primary,
                }]}>
                  <Text style={styles.selfText}>Self</Text>
                </View>}
              </View>
              {kundli?.birthDetails?.birthDateTime && <Text style={styles.subDetails}>
                {capitalize(kundli.gender)} · {formatToDayMonthYear(kundli?.birthDetails?.birthDateTime, kundli?.birthDetails?.timezoneString)} · {formatTimeto12Hour(kundli?.birthDetails?.birthDateTime, kundli?.birthDetails?.timezoneString)}
              </Text>}
              <Text style={styles.subDetails}>{kundli?.birthDetails?.birthPlace?.placeName}</Text>
            </View>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {/* @ts-ignore */}
              <Icon name="arrow-forward" size={22} color="#fff" />
            </View>
          </Pressable> : null}
        </>
        )}
        ListFooterComponent={
          <>
            {loadingMore && !loadedAll && !loading && !refreshing && <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                paddingBottom: 20,
              }}>
              <ButtonSpinner color='#fff' />
              <Text style={{ textAlign: 'center' }}>Loading...</Text>
            </View>}
          </>
        }
        ListEmptyComponent={
          loading && !refreshing && !loadingMore && !loadedAll && !savedKundlis?.length ? (
            <View
              style={{
                width: '100%',
                height: '100%',
                alignSelf: 'center',
                justifyContent: 'center',
                backgroundColor: theme.colors.background,
                paddingTop: 250
              }}>
              <Spinner />
            </View>
          ) : null
        }
      />
    </View>
  );
}

export default memo(SavedKundlis)

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    gap: 8,
    padding: 8,
    borderRadius: 8,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  name: {
    fontWeight: '600',
    fontSize: 18,
    color: 'white',
  },
  subDetails: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  selfContainer: {
    paddingVertical: 3,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    borderRadius: 12,
  },
  selfText: {
    fontStyle: 'italic',
    fontWeight: 'bold',
    textAlign: 'center',
  }
});
