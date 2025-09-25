import React, {useState, memo} from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import {Text} from 'react-native-paper';
import {useDispatch} from 'react-redux';
import {markReviewHelpful} from '../../store/apps/astroProfile';
import {AppDispatch} from '../../store';
import Toast from 'react-native-toast-message';
import LongUpvoteIcon from '../../images/Icons/LongUpvoteIcon';
interface HelpfulVoteProps {
  reviewId: string;
  helpfulCount?: number;
  isUpvoted?: boolean;
}

const HelpfulVote = ({
  reviewId,
  helpfulCount = 0,
  isUpvoted = false,
}: HelpfulVoteProps) => {
  const [count, setCount] = useState(helpfulCount);
  const [hasVoted, setHasVoted] = useState(isUpvoted);
  const [isInProgress, setIsInProgress] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  const handleVote = async () => {
    if (isInProgress) return;
    setIsInProgress(true);
    const action = hasVoted ? 'decrement' : 'increment';
    const newVoteState = !hasVoted;
    try {
      // For quick feedback
      setHasVoted(newVoteState);
      setCount(Math.max(count + (action === 'increment' ? 1 : -1), 0));

      await dispatch(markReviewHelpful({reviewId, action})).unwrap();
    } catch (error: any) {
      setHasVoted(!newVoteState);
      setCount(Math.max(count - (action === 'increment' ? 1 : -1), 0));

      Toast.show({
        type: 'error',
        text1: error.message,
      });
    } finally {
      setIsInProgress(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        disabled={isInProgress}
        onPress={handleVote}
        style={[
          styles.button,
          {
            backgroundColor: hasVoted
              ? 'rgba(19, 16, 43, 1)'
              : 'rgba(255, 255, 255, 0.1)',
          },
        ]}>
        <LongUpvoteIcon
          fill={hasVoted ? 'white' : 'none'}
          strokeWidth={!hasVoted ? 1 : 0}
        />
        <Text variant={'bold' as any} style={styles.text}>
          Helpful <Text style={styles.textSeparator}>{'\u007C'}</Text> {count}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 26,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 4,
  },
  text: {
    fontSize: 12,
  },
  textSeparator: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
  },
});

export default memo(HelpfulVote);
