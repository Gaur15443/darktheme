import React from 'react';
import {View} from 'react-native';
import {Text, ProgressBar} from 'react-native-paper';
import StarIcon from '../../images/Icons/StarIcon';
import {pluralize} from '../../utils/format';
import type {
  ReviewStats,
  RatingKey,
} from '../../store/apps/astroProfile/index.d';

interface OverallRatingProps {
  reviewStats: ReviewStats | null;
}

const OverallRating: React.FC<OverallRatingProps> = ({reviewStats}) => {
  const defaultStats = {
    averageRating: 0,
    totalReviews: 0,
    ratingBreakdown: {
      '5': 0,
      '4': 0,
      '3': 0,
      '2': 0,
      '1': 0,
    } as Record<RatingKey, number>,
  };

  const stats = reviewStats || defaultStats;

  const ratingBreakdown = {
    '5': stats.ratingBreakdown?.['5'] || 0,
    '4': stats.ratingBreakdown?.['4'] || 0,
    '3': stats.ratingBreakdown?.['3'] || 0,
    '2': stats.ratingBreakdown?.['2'] || 0,
    '1': stats.ratingBreakdown?.['1'] || 0,
  };
  return (
    <View
      style={{
        marginTop: 16,
        flexDirection: 'row',
        paddingHorizontal: 26,
      }}>
      <View style={{flex: 1}}>
        <Text style={{fontSize: 12, textAlign: 'center'}}>Overall rating</Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            flexWrap: 'wrap',
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              justifyContent: 'center',
              width: '100%',
            }}>
            <StarIcon width={40} height={40} fill={'#fff'} />
            <Text variant={'bold' as any} style={{fontSize: 40}}>
              {stats.averageRating}
            </Text>
          </View>
          <Text style={{fontSize: 10, textAlign: 'center', width: '100%'}}>
            Based on {pluralize(stats.totalReviews, 'rating')}
          </Text>
        </View>
      </View>
      <View style={{flex: 1}}>
        {Object.keys(ratingBreakdown)
          .sort((a, b) => Number(b) - Number(a))
          .map(key => (
            <View
              key={key}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                justifyContent: 'space-between',
                flex: 1,
                padding: 0,
              }}>
              <Text>{key}</Text>
              <View style={{flex: 1}}>
                <ProgressBar
                  progress={
                    Math.round(
                      ((ratingBreakdown[key as RatingKey] || 0) /
                        (stats.totalReviews || 1)) *
                        100,
                    ) / 100
                  }
                  color="#fff"
                  style={{
                    height: 4,
                    borderRadius: 4,
                    backgroundColor: '#FFFFFF40',
                  }}
                />
              </View>
            </View>
          ))}
      </View>
    </View>
  );
};

export default OverallRating;
