import {TouchableOpacity} from 'react-native';
import React, {memo, useCallback} from 'react';
import type {AstrologerDetails} from '../../../store/apps/astrologersListing/index.d';
import AstrologerCard from '../AstrologerCard/AstrologerCard';
import {RootState} from '../../../store';

const ItemCard = memo(
  ({
    astrologer,
    userData,
    onPress = () => {},
  }: {
    astrologer: AstrologerDetails;
    userData: RootState['userInfo'];
    onPress?: (astrologer: AstrologerDetails) => void;
  }) => {
    const processedData = {
      language: astrologer.language?.join?.(', ') || '',
      skill: astrologer.skills?.join?.(', ') || '',
      strikeRate: Number(`${astrologer.displayStrikeRate}`) || 0,
      actualRate: Number(`${astrologer.displayActualRate}`) || 0,
    };

    const handlePress = useCallback(() => {
      onPress(astrologer);
    }, [onPress, astrologer]);

    return (
      <TouchableOpacity activeOpacity={0.7} onPress={handlePress}>
        <AstrologerCard
          astrologerId={astrologer.userId}
          imageUrl={astrologer.profilepic || ''}
          astrologerName={astrologer.astrologername || ''}
          status={astrologer.liveStatus as any}
          language={processedData.language}
          skill={processedData.skill}
          yearsOfExperience={astrologer.yearsOfExp || 0}
          rating={astrologer.averageRating || 0}
          strikeRate={processedData.strikeRate}
          actualRate={processedData.actualRate}
          agreedRate={astrologer?.agreedRate || 0}
          offerId={astrologer?.offerId || null}
          userData={userData}
        />
      </TouchableOpacity>
    );
  },
);

ItemCard.displayName = 'ItemCard';
export default ItemCard;
