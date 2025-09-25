import React, {
  memo,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  useState,
} from 'react';
import {
  View,
  StyleSheet,
  ScrollView as RNScrollView,
  Platform,
  Pressable as RNPressable,
} from 'react-native';
import GradientView from '../../../common/gradient-view';
import { Text } from 'react-native-paper';
import ErrorBoundary from '../../../common/ErrorBoundary';
import {
  ScrollView as GestureScrollView,
  Pressable as GesturePressable,
} from 'react-native-gesture-handler';
import { setSelectedDate } from '../../../store/apps/astroPanchang';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';

interface DatesScrollProps {
  formattedDateObject: string;
  setDefaultSelectedDate: (date: number) => void;
}

interface DateItem {
  day: string;
  date: string;
}

function getDatesWithDayNames(year: number, month: number): DateItem[] {
  const totalDays = new Date(year, month, 0).getDate();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dates: DateItem[] = [];

  for (let i = 1; i <= totalDays; i++) {
    const date = new Date(year, month - 1, i);
    dates.push({
      day: dayNames[date.getDay()],
      date: i.toString().padStart(2, '0'),
    });
  }
  return dates;
}

function isDateActive(currentDate: string, targetDate: string): boolean {
  return currentDate === targetDate;
}

const ScrollView = Platform.OS === 'ios' ? RNScrollView : GestureScrollView;
const Pressable = Platform.OS === 'ios' ? RNPressable : GesturePressable;

const DatesScroll = memo(({ formattedDateObject }: DatesScrollProps) => {
  const scrollRef = useRef<RNScrollView | GestureScrollView>(null);
  const dispatch = useDispatch();
  const savedDateObject = useSelector(
    (state: RootState) => state.astroPanchang.selectedDateObject,
  );
  const [tempSelectedIndex, setTempSelectedIndex] = useState<number | null>(
    null,
  );

  const parsedDate = useMemo(() => {
    try {
      if (
        !savedDateObject?.year ||
        !savedDateObject?.month ||
        !savedDateObject?.date
      ) {
        return new Date();
      }
      return new Date(
        savedDateObject.year,
        savedDateObject.month - 1,
        savedDateObject.date,
      );
    } catch (error) {
      return new Date();
    }
  }, [savedDateObject]);

  const dates = useMemo(() => {
    const year = parsedDate.getFullYear();
    const month = parsedDate.getMonth() + 1;
    return getDatesWithDayNames(year, month);
  }, [parsedDate]);

  const activeDateIndex = useMemo(() => {
    const currentDate = parsedDate.getDate().toString().padStart(2, '0');
    return (
      dates.findIndex((dateItem: DateItem) =>
        isDateActive(currentDate, dateItem.date),
      ) || 0
    );
  }, [parsedDate, dates]);

  const handleDatePress = useCallback(
    (date: string) => {
      dispatch(
        setSelectedDate({
          date: Number(date),
          month: savedDateObject.month,
          year: savedDateObject.year,
        }),
      );
    },
    [savedDateObject],
  );

  useEffect(() => {
    if (scrollRef.current && activeDateIndex !== -1) {
      scrollRef.current.scrollTo({
        x: activeDateIndex * 56,
        animated: true,
      });
    }
    if (tempSelectedIndex !== null) {
      setTempSelectedIndex(null);
    }
  }, [activeDateIndex]);

  const currentDateStr = parsedDate.getDate().toString().padStart(2, '0');

  return (
    <ErrorBoundary>
      <ScrollView
        horizontal
        ref={scrollRef}
        style={{ marginTop: 20 }}
        showsHorizontalScrollIndicator={false}
        accessibilityRole="list">
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {dates.map((dateItem: DateItem, index: number) => (
            <Pressable
              key={dateItem.date}
              onPress={() => {
                setTempSelectedIndex(index);
                handleDatePress(dateItem.date);
              }}
              accessibilityRole="button"
              accessibilityLabel={`${dateItem.day}, ${dateItem.date}`}>
              <GradientView
                colors={
                  // If temp exists, only return undefined for temp index
                  tempSelectedIndex === index
                    ? undefined
                    : !isDateActive(currentDateStr, dateItem.date)
                      ? ['#FFFFFF1A', '#FFFFFF1A']
                      : undefined
                }
                style={styles.gradientStyle}
                contentStyle={styles.gradientContentStyle}>
                <Text style={styles.day}>{dateItem.day}</Text>
                <Text style={styles.date} variant="titleMedium">
                  {dateItem.date}
                </Text>
                <View
                  style={[
                    styles.indicatorParent,
                    {
                      display: isDateActive(currentDateStr, dateItem.date)
                        ? 'flex'
                        : 'none',
                    },
                  ]}>
                  <View
                    style={[
                      styles.indicator,
                      {
                        backgroundColor: isDateActive(
                          currentDateStr,
                          dateItem.date,
                        )
                          ? '#fff'
                          : 'transparent',
                      },
                    ]}
                  />
                </View>
              </GradientView>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </ErrorBoundary>
  );
});

const styles = StyleSheet.create({
  gradientStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    height: 54,
    width: 56,
    overflow: 'hidden',
  },
  gradientContentStyle: {
    height: 54,
    width: 56,
    gap: 4,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#FFFFFF1A',
    borderRadius: 8,
    overflow: 'hidden',
  },
  day: {
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 14,
    paddingTop: 2,
  },
  date: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 18,
  },
  indicatorParent: {
    width: 48,
    justifyContent: 'center',
    height: 3,
    alignContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    width: 6,
    aspectRatio: 1,
    borderRadius: 8,
  },
});

export default DatesScroll;
