import React, {memo, useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {getCount} from '../../store/apps/home';
import NewTheme from '../../common/NewTheme';
import ErrorBoundary from '../../common/ErrorBoundary';
import Toast from 'react-native-toast-message';
import AnimatedNumbers from 'react-native-animated-numbers';

const Count = () => {
  const dispatch = useDispatch();
  const dynamicCount = useSelector(state => state?.home?.counts?.count);


  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(getCount()).unwrap();
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: error.message,
        });
      }
    };
    fetchData();
  }, [dispatch]);

  return (
    <ErrorBoundary>
      <View style={styles.container} accessibilityLabel="home-count">
        <AnimatedNumbers
          includeComma
          animateToNumber={dynamicCount || 0}
          fontStyle={{
            color: NewTheme.colors.blackText,
            fontWeight: '700',
            fontSize: 40,
          }}
          animationDuration={7000}
        />
      </View>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
});

export default memo(Count);
