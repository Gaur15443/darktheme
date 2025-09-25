import { StyleSheet, View } from 'react-native';
import React, { memo } from 'react';
import { Text } from 'react-native-paper';
import DefaultImage from '../stories/DefaultImage';
import FastImage from '@d11/react-native-fast-image';
import StarIcon from '../../images/Icons/StarIcon';
import { Review } from '../../store/apps/astroProfile/index.d';
import HelpfulVote from './HelpfulVote';

const ReviewCard = ({ review }: { review: Review }) => {
  const { reviewer, isHelpful, helpfulCount } = review;
  return (
    <View key={review._id} style={styles.reviewContainer}>
      <View style={styles.headerRow}>
        <View style={styles.profileRow}>
          {reviewer?.personalDetails?.profilepic ? (
            <FastImage
              source={{ uri: reviewer?.personalDetails?.profilepic }}
              style={styles.profileImage}
            />
          ) : (
            <DefaultImage
              firstName={
                reviewer?.personalDetails?.name ||
                review?.reviewerDisplayName?.split?.(' ')?.[0]
              }
              lastName={
                reviewer?.personalDetails?.lastname ||
                review?.reviewerDisplayName?.split?.(' ')?.[1]
              }
              gender={reviewer?.personalDetails?.gender}
              width={42}
              height={42}
            />
          )}
          <Text variant={'bold' as any}>{review.reviewerDisplayName}</Text>
        </View>
        <View style={styles.ratingBox}>
          <Text>{review.rating}</Text>
          <StarIcon width={16} height={16} fill={'#fff'} />
        </View>
      </View>
      {review.review?.length > 0 && <Text>{review.review}</Text>}
      <HelpfulVote
        reviewId={review._id}
        helpfulCount={helpfulCount || 0}
        isUpvoted={isHelpful}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  reviewContainer: {
    backgroundColor: '#FFFFFF1A',
    padding: 16,
    borderRadius: 8,
    // marginBottom: 8,
    gap: 8,
  },
  ratingBox: {
    backgroundColor: '#FFFFFF1A',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 24,
    borderRadius: 4,
    paddingHorizontal: 6,
  },
  profileImage: {
    width: 42,
    height: 42,
    borderRadius: 42,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default memo(ReviewCard);
