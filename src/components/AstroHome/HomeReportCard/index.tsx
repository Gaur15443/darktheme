import React, { memo } from 'react';
import GradientView from '../../../common/gradient-view';
import { View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import type { HomeReportCardProps } from './index.d';
import { useNavigation } from '@react-navigation/native';
import ErrorBoundary from '../../../common/ErrorBoundary';

const HomeReportCard: React.FC<HomeReportCardProps> = ({
  data,
  Icon,
  gradient = ['#FFE03D', '#0E0E10'],
  navigationScreen = 'MatchMaking',
}) => {
  const navigator = useNavigation();

  return (
    <ErrorBoundary>
      <GradientView
        style={{
          height: 223,
          marginBottom: 20,
          borderRadius: 8,
        }}
        colors={gradient}
        contentStyle={{
          flex: 1,
          height: 223,
          justifyContent: 'center',
          // gap: 6,
          alignItems: 'center',
          paddingHorizontal: 24,
        }}>
        <View
          style={{
            height: 48,
            width: 48,
            backgroundColor: '#fff',
            borderRadius: 24,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 15
          }}>
          <Icon />
        </View>
        <Text
          // @ts-ignore
          variant="bold"
          style={{
            fontSize: 18,
            textAlign: 'center',
            marginBottom: 11
          }}>
          {data?.header}
        </Text>
        <Text
          style={{
            fontSize: 14,
            textAlign: 'center',
            marginBottom: 20
          }}>
          {data?.subHeader}
        </Text>
        <Button
          // @ts-ignore
          onPress={() => navigator.navigate(navigationScreen)}
          mode="contained"
          theme={{ colors: { primary: '#fff', onPrimary: '#000' } }}
          style={{
            borderRadius: 8,
            width: '100%',
          }}>
          {data?.btn}
        </Button>
      </GradientView>
    </ErrorBoundary>
  );
};

export default memo(HomeReportCard);
