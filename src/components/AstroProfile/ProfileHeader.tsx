import {StyleSheet, View} from 'react-native';
import React, {Fragment, memo} from 'react';
import GradientView from '../../common/gradient-view';
import FastImage from '@d11/react-native-fast-image';
import {BlurView} from '@react-native-community/blur';
import {statusColors} from '../../constants/astroStatus';
import type {StatusColors} from '../../constants/astroStatus';
import {pluralize, transformStatus} from '../../utils/format';
import {Text} from 'react-native-paper';
import StarIcon from '../../images/Icons/StarIcon';
import type {AstrologerProfile} from '../../screens/AstrologyScreens/AstroProfile/index.d';
import {useWallet} from '../../context/WalletContext';

function ProfileHeader({profileData}: {profileData: AstrologerProfile}) {
  const {freeCallAvailable} = useWallet();

  return (
    <GradientView
      variant="modal"
      style={{borderRadius: 8, overflow: 'hidden'}}
      contentStyle={{
        padding: 16,
        flexWrap: 'wrap',
      }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 16,
          position: 'relative',
        }}>
        {profileData?.profilepic ? (
          <FastImage
            source={{uri: profileData?.profilepic}}
            style={{width: 130, height: 106, borderRadius: 4}}
          />
        ) : (
          <View style={{width: 130, height: 106, borderRadius: 4}} />
        )}
        <View style={styles.absoluteBlurContainer}>
          <BlurView
            style={{
              height: 20,
              width: '100%',
              position: 'absolute',
              bottom: 0,
            }}
            blurType="light"
            blurAmount={1}
          />
          <View
            style={[
              styles.redDot,
              {
                backgroundColor:
                  statusColors?.[profileData?.liveStatus as keyof StatusColors],
              },
            ]}
          />
          <Text variant={'bold' as any} style={styles.statusText}>
            {transformStatus(profileData?.liveStatus)}
          </Text>
        </View>
        <View style={{paddingRight: 140, gap: 8}}>
          <Text variant={'bold' as any}>{profileData?.displayNameFinal}</Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              flexWrap: 'wrap',
            }}>
            <StarIcon width={16} height={16} fill={'#fff'} />
            <Text style={{fontSize: 12}}>
              {profileData?.averageRating}/5 Stars{' '}
              {profileData?.orderCount &&
                profileData.orderCount >= 0 &&
                `. ${pluralize(profileData?.orderCount, 'Order')}`}
            </Text>
          </View>
          <Text style={{fontSize: 12}}>
            <Text variant={'bold' as any}>Exp: </Text>
            <Text>{pluralize(profileData?.yearsOfExp || 0, 'year')}</Text>
          </Text>
          <Text style={{fontSize: 12}}>
            <Text variant={'bold' as any}>Skills: </Text>
            <Text>{profileData?.skills?.join?.(', ')}</Text>
          </Text>
          <Text style={{fontSize: 12}}>
            <Text variant={'bold' as any}>Languages: </Text>
            <Text>{profileData?.language?.join?.(', ')}</Text>
          </Text>
        </View>
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          flexWrap: 'wrap',
          paddingTop: 8,
        }}>
        {profileData?.displayStrikeRate &&
          profileData?.displayStrikeRate >= 0 && (
            <Text style={styles.scratchText}>
              ₹{profileData?.displayStrikeRate}/min
            </Text>
          )}
        {freeCallAvailable ? (
          <FastImage
            source={require('../../images/free.gif')}
            style={{width: 88, height: 30, marginLeft: -20}}
          />
        ) : (
          <Fragment>
            {profileData?.displayActualRate &&
              profileData?.displayActualRate >= 0 && (
                <Text variant={'bold' as any}>
                  ₹{profileData?.displayActualRate}/min
                </Text>
              )}{' '}
          </Fragment>
        )}
        {profileData?.displayStrikeRate &&
          profileData?.displayStrikeRate >= 0 &&
          profileData?.isOffer && (
            <Text
              style={{
                backgroundColor: '#27C39426',
                color: '#27C394',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 47,
                borderWidth: 1,
                borderColor: '#27C394',
              }}>
              Offer
            </Text>
          )}
      </View>
    </GradientView>
  );
}

const styles = StyleSheet.create({
  absoluteBlurContainer: {
    position: 'absolute',
    bottom: 0,
    width: 130,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    height: 20,
    overflow: 'hidden',
    borderRadius: 4,
  },
  scratchText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
    marginVertical: 10,
    textAlign: 'center',
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  statusText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 10,
    textAlign: 'center',
  },
  redDot: {
    backgroundColor: '#FF4F4F',
    width: 6,
    height: 6,
    borderRadius: 5,
  },
});

export default memo(ProfileHeader);
