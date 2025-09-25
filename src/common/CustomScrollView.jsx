import React, {useState, useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';

export default function CustomScroll({
  children,
  indicatorHeight = 200,
  flexibleIndicator = true,
  style = {},
  scrollViewStyle = {},
  scrollIndicatorContainerStyle = {},
  scrollIndicatorStyle = {},
  ...props
}) {
  const {onScroll, ...propsToSpread} = props;
  const [fromTop, setFromTop] = useState(0);
  const [indicatorFlexibleHeight, setIndicatorFlexibleHeight] =
    useState(indicatorHeight);
  const [visibleScrollPartHeight, setVisibleScrollPartHeight] = useState(1);
  const [fullSizeContentHeight, setFullSizeContentHeight] = useState(1);
  const [scrollIndicatorContainerHeight, setScrollIndicatorContainerHeight] =
    useState(1);

  const handleScroll = value => {
    const {
      nativeEvent: {contentOffset},
    } = value;
    if (onScroll && typeof onScroll === 'function') {
      onScroll(value);
    }
    const movePercent =
      contentOffset.y /
      ((fullSizeContentHeight - visibleScrollPartHeight) / 100);
    const position =
      ((visibleScrollPartHeight -
        indicatorFlexibleHeight -
        (visibleScrollPartHeight - scrollIndicatorContainerHeight)) /
        100) *
      movePercent;
    setFromTop(position);
  };

  useEffect(() => {
    if (flexibleIndicator) {
      setIndicatorFlexibleHeight(
        visibleScrollPartHeight *
          (visibleScrollPartHeight / fullSizeContentHeight),
      );
    }
  }, [visibleScrollPartHeight, fullSizeContentHeight, flexibleIndicator]);

  const isContentSmallerThanScrollView =
    fullSizeContentHeight - visibleScrollPartHeight <= 0;

  return (
    <View style={[styles.container, style]}>
      <ScrollView
        style={[styles.scrollViewContainer, scrollViewStyle]}
        onContentSizeChange={(__width, height) => {
          setFullSizeContentHeight(height);
        }}
        onLayout={e => setVisibleScrollPartHeight(e.nativeEvent.layout.height)}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        {...propsToSpread}
        showsVerticalScrollIndicator={false}
        persistentScrollbar={false}>
        {children}
      </ScrollView>
      {!isContentSmallerThanScrollView && (
        <View
          style={[
            styles.scrollIndicatorContainer,
            scrollIndicatorContainerStyle,
          ]}
          onLayout={e =>
            setScrollIndicatorContainerHeight(e.nativeEvent.layout.height)
          }>
          <View
            style={[
              styles.scrollIndicator,
              {top: fromTop, height: indicatorFlexibleHeight},
              scrollIndicatorStyle,
            ]}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  scrollViewContainer: {
    flex: 1,
  },
  scrollIndicatorContainer: {
    position: 'absolute',
    top: 0,
    right: 2,
    bottom: 0,
    overflow: 'hidden',
    borderRadius: 10,
    width: 6,
    marginVertical: 3,
  },
  scrollIndicator: {
    position: 'absolute',
    right: 0,
    width: 6,
    borderRadius: 3,
    backgroundColor: 'grey',
  },
});
