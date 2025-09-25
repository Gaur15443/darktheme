import React, {memo, useCallback, useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import {Button, Text, useTheme, Modal, Portal} from 'react-native-paper';
import GradientView from '../../../common/gradient-view';
import AstroHeader from '../../../common/AstroHeader';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {
  getAstrologerProfile,
  getAstroRatingReviews,
  resetProfileData,
  saveAstroProfileRatingReview,
  shareAstrologerLink,
} from '../../../store/apps/astroProfile';
import {AppDispatch, RootState} from '../../../store';
import Spinner from '../../../common/Spinner';
import FastImage from '@d11/react-native-fast-image';
import StarIcon from '../../../images/Icons/StarIcon';
import SearchIcon from '../../../images/Icons/SearchIcon';
import type {
  Review,
  ReviewStats,
} from '../../../store/apps/astroProfile/index.d';
import Share from 'react-native-share';
import CustomTextInput from '../../../components/CustomTextInput';
import Toast from 'react-native-toast-message';

import {Track} from '../../../../App';
import AstrocallIcon from '../../../images/Icons/AstroCallIcon/AstrocallIcon';
import AstroChatIcon from '../../../images/Icons/AstroChatIcon/AstroChatIcon';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ErrorBoundary from '../../../common/ErrorBoundary';
import {ConsultationAxios} from '../../../plugin/Axios';
import {useWallet} from '../../../context/WalletContext';
import Wallet from '../../../components/Wallet';
import {navigatedStack} from '../../../../AppChild';
import AstroShareIcon from '../../../images/Icons/AstroShareIcon';
import ReviewCard from '../../../components/AstroProfile/ReviewCard';
import useLiveAstrologers from '../../../hooks/sockets/useLiveAstrologers';
import NotifyButton from '../../../components/AstroConsultation/AstrologerCard/NotifyButton';
import ProfileHeader from '../../../components/AstroProfile/ProfileHeader';
import OverallRating from '../../../components/AstroProfile/OverallRating';

interface Buttons {
  name: string;
  icon: React.ComponentType<{width?: string; height?: string}>;
  style: string;
  textStyle: string;
  onPress: () => void | undefined;
}

const AstroProfile = () => {
  useLiveAstrologers();
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<any>();
  const userData = useSelector((state: RootState) => state.userInfo);
  const {bottom} = useSafeAreaInsets();
  const route = useRoute();
  // @ts-ignore
  const astroId = route.params?.astroId || '';
  // @ts-ignore
  const showReview = route.params?.showReview || false;
  const {fetchWalletData} = useWallet();
  const [loading, setLoading] = useState(true);
  const [ratingReviews, setRatingReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [rateStatus, setRateStatus] = useState<boolean>(true);
  const profileData = useSelector(
    (state: RootState) => state.astroProfile.profile,
  );

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setLoading(true);
        dispatch(resetProfileData());
        setRatingReviews([]);
        setReviewStats(null);
        if (astroId?.length) {
          await checkRateStatus();
          await fetchRatingReviews();
          await fetchProfile();
        }
        setLoading(false);
      })();
    }, [astroId]),
  );

  useEffect(() => {
    setTimeout(() => {
      fetchWalletData();
    }, 1000);
  }, []);

  function goBack() {
    navigation.goBack();
  }
  async function fetchRatingReviews() {
    try {
      const ratingReviews = await dispatch(
        getAstroRatingReviews({
          astrologerId: astroId,
        }),
      ).unwrap();
      setReviewStats(ratingReviews.reviewStats[0]);
      setRatingReviews(ratingReviews.paginatedReviews);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  }
  async function fetchProfile() {
    try {
      const response = await dispatch(getAstrologerProfile(astroId)).unwrap();
      if (
        response &&
        showReview &&
        navigatedStack?.[navigatedStack?.length - 2] !== 'AstroProfileReviews'
      ) {
        setIsReviewModalVisible(true);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  }

  async function handleProfileShare() {
    try {
      const urlResponse = await dispatch(shareAstrologerLink(astroId)).unwrap();
      await Share.open({
        url: urlResponse?.data,
        message: `
Hey! I'm using iMeUsWe Astrology for predictions on job, marriage, career and personal relationships.
I recommend you talk to Astrologer ${profileData?.displayNameFinal} at iMeUsWe Astrology.
            `,
      }).catch(() => {
        /**
         * empty.
         */
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  }
  async function checkRateStatus() {
    try {
      const response = await ConsultationAxios.get(
        `/userReviewStatus/${astroId}`,
      );

      if ('isReviewAdded' in response.data) {
        setRateStatus(response.data.isReviewAdded);
      }
    } catch (error) {
      /**
       * empty
       */
    }
  }
  const buttons: Buttons[] = [
    {
      name: 'Chat',
      icon: AstroChatIcon,
      style: 'chatButton',
      textStyle: 'chatButtonText',
      onPress: () => {
        const props = {
          name: profileData?.displayNameFinal,
          'Astrologer ID': profileData?.userId,
        };
        Track({
          cleverTapEvent: 'Chat_CTA_AstrologerProfile',
          mixpanelEvent: 'Chat_CTA_AstrologerProfile',
          userData,
          cleverTapProps: props,
          mixpanelProps: props,
        });
        navigation.navigate('AstroBirthDetailsTabs', {
          type: 'Chat',
          astrologerId: profileData?.userId,
          rate: profileData?.displayActualRate,
          agreedRate: profileData?.agreedRate,
          offerId: profileData?.offerId,
        });
      },
    },
    {
      name: 'Call',
      icon: AstrocallIcon,
      style: 'callButton',
      textStyle: 'callButtonText',
      onPress: () => {
        const props = {
          name: profileData?.displayNameFinal,
          'Astrologer ID': profileData?.userId,
        };
        Track({
          cleverTapEvent: 'Call_CTA_AstrologerProfile',
          mixpanelEvent: 'Call_CTA_AstrologerProfile',
          userData,
          cleverTapProps: props,
          mixpanelProps: props,
        });
        navigation.navigate('AstroBirthDetailsTabs', {
          type: 'Call',
          astrologerId: profileData?.userId,
          rate: profileData?.displayActualRate,
          agreedRate: profileData?.agreedRate,
          offerId: profileData?.offerId,
        });
      },
    },
  ];
  return (
    <ErrorBoundary.Screen>
      <View style={{flex: 1, backgroundColor: theme.colors.background}}>
        <AstroHeader>
          <AstroHeader.BackAction onPress={goBack} />
          <AstroHeader.Content
            title="Profile"
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingRight: 10,
            }}>
            <View style={{flexDirection: 'row', gap: 23}}>
              {!loading && (
                <>
                  <Wallet
                    cleverTapEvent="Wallet_CTA_Profile"
                    mixpanelEvent="Wallet_CTA_Profile"
                  />
                  <TouchableOpacity onPress={handleProfileShare}>
                    <AstroShareIcon height={30} width={30} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('AstroConsultationSearch')
                    }>
                    <SearchIcon color="#fff" height={30} width={30} />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </AstroHeader.Content>
        </AstroHeader>
        {loading && (
          <View
            style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Spinner />
          </View>
        )}
        {!loading && (
          <ScrollView
            style={{
              flex: 1,
              paddingHorizontal: 10,
              paddingBottom: bottom || 36,
            }}>
            <View>
              {profileData && <ProfileHeader profileData={profileData} />}
            </View>
            {profileData?.bio?.length && (
              <View
                style={{
                  marginTop: 16,
                  borderBottomWidth: 0.2,
                  borderBottomColor: 'rgba(136, 136, 136, 1)',
                  paddingBottom: 24,
                }}>
                <Text
                  variant={'bold' as any}
                  style={{
                    fontSize: 14,
                  }}>
                  Bio
                </Text>
                <Text>{profileData?.bio}</Text>
              </View>
            )}
            <OverallRating reviewStats={reviewStats} />
            {!rateStatus && (
              <Button
                disabled={rateStatus}
                onPress={() => setIsReviewModalVisible(true)}
                mode="outlined"
                // @ts-ignore
                textColor={theme.colors.text}
                style={{borderRadius: 8, marginTop: 16}}>
                Rate Now
              </Button>
            )}
            {isReviewModalVisible && !rateStatus && profileData && (
              <ReviewModal
                onClose={() => {
                  setIsReviewModalVisible(false);
                }}
                onSave={() => setRateStatus(true)}
                astroId={astroId}
                name={profileData?.displayNameFinal}
                profilePic={profileData?.profilepic}
                onSubmit={fetchRatingReviews}
              />
            )}
            <View style={{marginTop: 16, gap: 8}}>
              {!loading && ratingReviews?.length < 1 && (
                <Text
                  style={{
                    fontSize: 14,
                    textAlign: 'center',
                    marginTop: 27,
                  }}>
                  No reviews yet
                </Text>
              )}
              {[...ratingReviews]
                ?.slice?.(0, 5)
                ?.map(review => <ReviewCard review={review as Review} />)}
            </View>
            {ratingReviews?.length > 5 ? (
              <Pressable
                onPress={() =>
                  navigation.navigate('AstroProfileReviews', {
                    astroId,
                    name: profileData?.displayNameFinal,
                    profilePic: profileData?.profilepic,
                    reviewStats,
                  })
                }
                style={{height: 36, padding: 10, marginBottom: 16}}>
                <Text style={{textAlign: 'center'}}>View all reviews</Text>
              </Pressable>
            ) : (
              <View style={{marginTop: 16}} />
            )}
          </ScrollView>
        )}
        <View
          style={[
            styles.buttonContainer,
            {
              paddingBottom: bottom || 10,
            },
          ]}>
          {!loading && profileData && (
            <>
              {profileData?.liveStatus === 'Online' ? (
                buttons.map(button => (
                  <TouchableOpacity
                    onPress={button.onPress}
                    activeOpacity={0.5}
                    key={button.name}
                    style={[
                      styles.button,
                      // @ts-expect-error due to styles having both ViewStyle and TextStyle
                      styles[button?.style as keyof typeof styles],
                    ]}>
                    <button.icon />
                    <Text
                      style={styles[button.textStyle as keyof typeof styles]}>
                      {button.name}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <NotifyButton
                  astrologerId={astroId}
                  astrologerName={profileData?.displayNameFinal}
                  userData={userData}
                />
              )}
            </>
          )}
        </View>
      </View>
    </ErrorBoundary.Screen>
  );
};

export const ReviewModal = memo(
  ({
    onClose,
    astroId,
    name,
    profilePic,
    onSubmit,
    onSave,
  }: {
    onClose: () => void;
    onSubmit: () => void;
    onSave: () => void;
    astroId: string;
    name: string;
    profilePic: string | null;
  }) => {
    const theme = useTheme();
    const userData = useSelector((state: RootState) => state.userInfo);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const dispatch = useDispatch<AppDispatch>();
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit() {
      if (rating === 0 || submitting) return;
      try {
        const props = {
          'Number of Stars': rating,
          'Added comment': comment,
        };
        Track({
          cleverTapEvent: 'Astrologer_Rated',
          mixpanelEvent: 'Astrologer_Rated',
          userData,
          cleverTapProps: props,
          mixpanelProps: props,
        });
        setSubmitting(true);
        const payload = {
          astrologerId: astroId,
          payload: {rating, review: comment},
        };
        await dispatch(saveAstroProfileRatingReview(payload)).unwrap();
        await onSubmit();
        onSave();
        onClose();
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Failed to submit review',
        });
      } finally {
        setSubmitting(false);
      }
    }

    return (
      <Portal>
        <Modal
          visible={true}
          onDismiss={onClose}
          contentContainerStyle={{
            marginHorizontal: 16,
          }}>
          <View>
            {profilePic && (
              <FastImage
                source={{uri: profilePic}}
                style={{
                  width: 90,
                  aspectRatio: 1,
                  borderRadius: 45,
                  position: 'absolute',
                  top: -45,
                  left: '50%',
                  transform: [{translateX: -45}],
                  zIndex: 1000,
                  backgroundColor: '#fff',
                }}
              />
            )}
          </View>
          <GradientView
            style={{borderRadius: 8, overflow: 'hidden'}}
            contentStyle={{
              padding: 16,
              flexWrap: 'wrap',
              paddingTop: 45,
              paddingHorizontal: 20,
              gap: 20,
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 20,
                width: '100%',
                justifyContent: 'center',
              }}>
              <Text
                variant={'bold' as any}
                style={{fontSize: 18, textAlign: 'center'}}>
                Rate your conversation with {name}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 20,
                width: '100%',
                justifyContent: 'center',
              }}>
              {Array.from({length: 5}).map((_, index) => (
                <Pressable
                  key={index}
                  style={{flexDirection: 'row', alignItems: 'center', gap: 4}}
                  onPress={() => setRating(index + 1)}>
                  <StarIcon
                    width={24}
                    height={24}
                    // @ts-ignore
                    fill={rating >= index + 1 ? theme.colors.text : 'none'}
                  />
                </Pressable>
              ))}
            </View>
            <CustomTextInput
              customLabelStyle={{
                opacity: 1,
              }}
              testID="comment-input"
              label="Add a comment"
              centerNumber={10}
              inputHeight={90}
              // @ts-ignore
              placeholderTextColor={theme.colors.text}
              multiline
              style={{maxHeight: 90}}
              textVerticalAlign="top"
              defaultValue={comment}
              onChangeText={setComment}
            />
            <View>
              <Button
                onPress={handleSubmit}
                mode="contained"
                textColor={theme.colors.primary}
                style={{
                  borderRadius: 8,
                  marginTop: 16,
                  // @ts-ignore
                  backgroundColor: theme.colors.text,
                  opacity: rating === 0 || submitting ? 0.5 : 1,
                }}
                loading={submitting}>
                Submit
              </Button>
              <Button
                mode="outlined"
                // @ts-ignore
                textColor={theme.colors.text}
                style={{borderRadius: 8, marginTop: 16}}
                onPress={onClose}>
                Close
              </Button>
            </View>
          </GradientView>
        </Modal>
      </Portal>
    );
  },
);

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 10,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    padding: 10,
    gap: 5,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatButton: {
    backgroundColor: 'white',
  },
  callButton: {
    backgroundColor: '#6944D3',
  },
  chatButtonText: {
    color: '#6944D3',
  },
  callButtonText: {
    color: 'white',
  },
});

export default AstroProfile;
