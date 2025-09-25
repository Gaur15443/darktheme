import React, {Fragment, memo, useCallback} from 'react';
import {ScrollView, Pressable, StyleSheet} from 'react-native';

import {Track} from '../../../../App';
import {RootState} from '../../../store';
import {useSelector} from 'react-redux';
import {Text} from 'react-native-paper';
import FastImage from '@d11/react-native-fast-image';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import type {RecommendedAstrologer} from './types.d';

const RecommendedCard = memo(
  ({astrologer}: {astrologer: RecommendedAstrologer}) => {
    const navigation = useNavigation<NavigationProp<any>>();
    const userData = useSelector((state: RootState) => state.userInfo);

    const handleRedirect = useCallback(() => {
      Track({
        userData,
        cleverTapEvent: 'AstrologerCard_Notify_popup',
        mixpanelEvent: 'AstrologerCard_Notify_popup',
      });
      navigation.navigate('AstroProfile', {
        astroId: astrologer.userId,
      });
    }, [astrologer]);

    return (
      <Pressable onPress={handleRedirect} style={styles.cardContainer}>
        <FastImage
          source={{uri: astrologer.profilepic}}
          style={styles.profilePic}
        />
        <Text
          variant={'bold' as any}
          style={styles.astrologerName}
          numberOfLines={1}>
          {astrologer.astrologername}
        </Text>
        <Text style={styles.actualRate}>₹{astrologer.displayActualRate}</Text>
      </Pressable>
    );
  },
);

function RecommendedAstrologers({
  recommendedAstrologers,
}: {
  recommendedAstrologers: RecommendedAstrologer[];
}) {
  return (
    <Fragment>
      {recommendedAstrologers?.length > 0 ? (
        <Fragment>
          <Text variant={'bold' as any} style={styles.title}>
            Recommended for you
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{gap: 10}}>
            {recommendedAstrologers.map(astro => (
              <RecommendedCard key={astro.userId} astrologer={astro} />
            ))}
          </ScrollView>
        </Fragment>
      ) : null}
    </Fragment>
  );
}

const styles = StyleSheet.create({
  title: {fontSize: 16, textAlign: 'center', marginTop: 10},
  actualRate: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  cardContainer: {
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    height: 143,
    width: 100,
  },
  profilePic: {width: 75, height: 75, borderRadius: 75 / 2},
  astrologerName: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default memo(RecommendedAstrologers);
