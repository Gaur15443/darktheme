import React, { memo, useCallback } from 'react';
import {
  Image,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import AstroChatIcon from '../../../images/Icons/AstroChatIcon/AstroChatIcon';
import AstrocallIcon from '../../../images/Icons/AstroCallIcon/AstrocallIcon';
import { pluralize } from '../../../utils/format';
import StarIcon from '../../../images/Icons/StarIcon';
import { RootState } from '../../../store';
import { Track } from '../../../../App';
import { useWallet } from '../../../context/WalletContext';
import NotifyButton from './NotifyButton';
import { statusColors } from '../../../constants/astroStatus';
import TwoSparkle from '../../../images/Icons/TwoSparkle';
import AchievementIcon from '../../../images/Icons/AchievementIcon';
import LanguageIcon from '../../../images/Icons/LanguageIcon';

const bg = require('./bg.png');
interface AstrologerCardProps {
  astrologerName: string;
  astrologerId: string;
  status: 'Busy' | 'Online' | 'Offline';
  language: string;
  skill: string;
  yearsOfExperience: number;
  imageUrl: string;
  rating: number;
  strikeRate: number;
  actualRate: number;
  agreedRate: number;
  offerId?: string | null;
  _id?: string;
  userData: RootState['userInfo'];
}

const freeGif = require('../../../images/free.gif');

const AstrologerCard = memo(
  ({
    astrologerName,
    status,
    language,
    skill,
    yearsOfExperience,
    imageUrl,
    rating,
    strikeRate,
    actualRate,
    agreedRate,
    offerId,
    astrologerId,
    userData,
  }: AstrologerCardProps) => {
    const { freeCallAvailable } = useWallet();
    const navigation = useNavigation<NavigationProp<any>>();

    const handleChatButton = useCallback(() => {
      const props = {
        name: astrologerName,
        'Astrologer ID': astrologerId,
      };
      Track({
        cleverTapEvent: 'Chat_CTA_Consultation',
        mixpanelEvent: 'Chat_CTA_Consultation',
        userData,
        cleverTapProps: props,
        mixpanelProps: props,
      });
      navigation.navigate('AstroBirthDetailsTabs', {
        type: 'Chat',
        astrologerId: astrologerId,
        rate: actualRate,
        agreedRate,
        offerId,
      });
    }, [
      astrologerName,
      astrologerId,
      actualRate,
      userData,
      agreedRate,
      offerId,
    ]);

    const handleCallButton = useCallback(() => {
      const props = {
        name: astrologerName,
        'Astrologer ID': astrologerId,
      };
      Track({
        cleverTapEvent: 'Call_CTA_Consultation',
        mixpanelEvent: 'Call_CTA_Consultation',
        userData,
        cleverTapProps: props,
        mixpanelProps: props,
      });
      navigation.navigate('AstroBirthDetailsTabs', {
        type: 'Call',
        astrologerId: astrologerId,
        rate: actualRate,
        agreedRate,
        offerId,
      });
    }, [
      astrologerName,
      astrologerId,
      actualRate,
      userData,
      agreedRate,
      offerId,
    ]);

    const isOnline = status === 'Online';

    return (
      <ImageBackground
        style={styles.gradientContent}
        source={bg}
        resizeMode="cover"
      >
        <View style={styles.container}>
          <View style={styles.mainContent}>
            <View style={styles.profileSection}>
              <View style={styles.imageContainer}>
                {imageUrl?.length > 0 && (
                  <Image
                    style={styles.profile}
                    resizeMode="cover"
                    source={{
                      uri: imageUrl,
                    }}
                  />
                )}
                <View style={styles.statusWrapper}>
                  <View
                    style={[
                      styles.redDot,
                      { backgroundColor: statusColors?.[status] },
                    ]}
                  />
                </View>
              </View>
              {/* Price Section */}
              <View style={styles.priceContainer}>
                <Text style={styles.scratchText}>₹{strikeRate}/min</Text>
                {freeCallAvailable ? (
                  <Image source={freeGif} style={styles.freeCall} />
                ) : (
                  <Text variant={'bold' as any} style={styles.realRate}>
                    ₹{actualRate}/min
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.detailsSection}>
              <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
                {astrologerName}
              </Text>

              {/* Rating Section */}
              <View style={styles.rateContainer}>
                <Text style={styles.ratingText}>{rating}</Text>
                <StarIcon
                  fill="rgba(255, 209, 70, 1)"
                  stroke="rgba(255, 209, 70, 1)"
                  width={11}
                  height={11}
                />
              </View>
              {/* Info Section */}
              <View style={styles.infoContainer}>
                <View style={styles.textContainer}>
                  <AchievementIcon />
                  <Text style={styles.textAnswer} numberOfLines={1}>
                    {pluralize(yearsOfExperience, 'year')} of experience
                  </Text>
                </View>
                <View style={styles.textContainer}>
                  <TwoSparkle />
                  <Text numberOfLines={1} style={styles.textAnswer}>
                    {skill}
                  </Text>
                </View>
                <View style={styles.textContainer}>
                  <LanguageIcon />
                  <Text numberOfLines={1} style={styles.textAnswer}>
                    {language}
                  </Text>
                </View>
              </View>

              {/* Button Section */}
              <View style={styles.buttonContainer}>
                {isOnline ? (
                  <>
                    <TouchableOpacity
                      onPress={handleChatButton}
                      activeOpacity={0.5}
                      style={[styles.button, styles.chatButton]}
                    >
                      <AstroChatIcon />
                      <Text style={styles.chatButtonText}>Chat</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleCallButton}
                      activeOpacity={0.5}
                      style={[styles.button, styles.callButton]}
                    >
                      <AstrocallIcon />
                      <Text style={styles.callButtonText}>Call</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <NotifyButton
                    astrologerId={astrologerId}
                    astrologerName={astrologerName}
                    userData={userData}
                  />
                )}
              </View>
            </View>
          </View>
        </View>
      </ImageBackground>
    );
  },
);
const styles = StyleSheet.create({
  gradientContent: {
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  container: { padding: 10 },
  mainContent: {
    flexDirection: 'row',
    gap: 12,
  },
  imageContainer: {
    flex: 1,
    width: 102,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: { alignItems: 'center', justifyContent: 'center', gap: 10 },
  profile: { borderRadius: 8, width: 102, aspectRatio: 1 },
  infoContainer: {
    gap: 6,
    paddingVertical: 9,
    paddingLeft: 6.3,
  },
  textContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    alignItems: 'center',
  },
  textHeading: {
    color: 'white',
    fontSize: 12,
  },
  textAnswer: {
    color: 'white',
    opacity: 0.6,
    fontSize: 12,
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    height: 38,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 5,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatButton: {
    color: '#6944D3',
    backgroundColor: 'white',
  },
  callButton: {
    color: 'white',
    backgroundColor: '#6944D3',
  },
  chatButtonText: {
    color: '#6944D3',
  },
  callButtonText: {
    color: 'white',
  },
  statusWrapper: {
    position: 'absolute',
    top: 0,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    gap: 5,
    height: 20,
    overflow: 'hidden',
    borderRadius: 4,
  },
  redDot: {
    backgroundColor: '#FF4F4F',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  scratchText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 10,
    marginVertical: 10,
    textAlign: 'center',
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  realRate: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
    marginVertical: 10,
    textAlign: 'center',
  },
  statusText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
    textAlign: 'center',
  },
  rateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 2,
    marginTop: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notify: {
    paddingVertical: 2,
    height: 38,
    gap: 1,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'white',
    flexDirection: 'column',
  },
  freeCall: { width: 88, height: 30, marginLeft: -20 },
  ratingContainer: {
    flexDirection: 'row',
    gap: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  ratingText: { flexShrink: 1, fontSize: 10, color: 'rgba(255, 209, 70, 1)' },
  detailsSection: { flex: 1 },
  nameRatingRow: { flexDirection: 'row', gap: 1, alignItems: 'center' },
});

AstrologerCard.displayName = 'AstrologerCard';
export default AstrologerCard;
