import { FlatList, StyleSheet, View } from 'react-native';
import AstroHeader from '../../../common/AstroHeader';
import {
  NavigationProp,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import {
  getAstroRatingReviews,
  shareAstrologerLink,
} from '../../../store/apps/astroProfile';
import { useCallback, useEffect, useState } from 'react';
import type {
  ReviewStats,
  Review,
} from '../../../store/apps/astroProfile/index.d';
import { AppDispatch } from '../../../store';
import { Button, Text, useTheme } from 'react-native-paper';
import { TouchableOpacity } from 'react-native';
import Share from 'react-native-share';
import { ReviewModal } from '../AstroProfile';
import { ConsultationAxios } from '../../../plugin/Axios';
import Wallet from '../../../components/Wallet';
import SearchIcon from '../../../images/Icons/SearchIcon';
import AstroShareIcon from '../../../images/Icons/AstroShareIcon';
import ButtonSpinner from '../../../common/ButtonSpinner';
import ReviewCard from '../../../components/AstroProfile/ReviewCard';
import ErrorBoundary from '../../../common/ErrorBoundary';
import OverallRating from '../../../components/AstroProfile/OverallRating';

const AstroProfileReviews = () => {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<any>>();
  const dispatch = useDispatch<AppDispatch>();
  const route = useRoute();
  const {
    astroId = '',
    name = '',
    profilePic = '',
    reviewStats = null,
  } = route.params as {
    astroId: string;
    name: string;
    profilePic: string;
    reviewStats: ReviewStats | null;
  };
  const [_reviewStats, _setReviewStats] = useState<ReviewStats | null>(null);
  const [ratingReviews, setRatingReviews] = useState<Review[]>([]);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const pageIsFocused = useIsFocused();
  const [rateStatus, setRateStatus] = useState<boolean>(true);
  const [loadedAll, setLoadedAll] = useState(false);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetchRatingReviews();
    checkRateStatus();

    return () => {
      setPage(1);
    };
  }, [pageIsFocused]);

  async function fetchRatingReviews() {
    try {
      const ratingReviews = await dispatch(
        getAstroRatingReviews({
          astrologerId: astroId,
        }),
      ).unwrap();
      _setReviewStats(ratingReviews.reviewStats[0]);
      setRatingReviews(ratingReviews.paginatedReviews);
    } catch (error) {
      /**
       * empty
       */
    }
  }
  function goBack() {
    navigation.goBack();
  }
  async function handleProfileShare() {
    try {
      const urlResponse = await dispatch(shareAstrologerLink(astroId)).unwrap();
      await Share.open({
        url: urlResponse?.data,
        message: `
Hey! I'm using iMeUsWe Astrology for predictions on job, marriage, career, and personal relationships.
I recommend you talk to Astrologer ${name} at iMeUsWe Astrology.
            `,
      }).catch(__error => {});
    } catch (error) {
      /**empty */
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
  async function getNextPage() {
    if (loadingMore || loadedAll) return;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const ratingReviews = await dispatch(
        getAstroRatingReviews({ astrologerId: astroId, page: nextPage }),
      ).unwrap();
      if (!ratingReviews.paginatedReviews?.length) {
        setLoadedAll(true);
      } else {
        setRatingReviews(prev => [...prev, ...ratingReviews.paginatedReviews]);
        setPage(nextPage);
      }
    } catch (error) {
      /** empty */
    } finally {
      setLoadingMore(false);
    }
  }

  const renderItem = useCallback(
    ({ item: review }: { item: Review }) => <ReviewCard review={review} />,
    [],
  );

  return (
    <ErrorBoundary.Screen>
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <AstroHeader>
          <AstroHeader.BackAction onPress={goBack} />
          <AstroHeader.Content
            title="All Reviews"
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingRight: 10,
            }}
          >
            <View style={{ flexDirection: 'row', gap: 23 }}>
              <Wallet
                cleverTapEvent="Wallet_CTA_Consultation"
                mixpanelEvent="Wallet_CTA_Consultation"
              />
              <TouchableOpacity onPress={handleProfileShare}>
                <AstroShareIcon />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('AstroConsultationSearch')}
              >
                <SearchIcon color="#fff" />
              </TouchableOpacity>
            </View>
          </AstroHeader.Content>
        </AstroHeader>

        <View style={styles.parent}>
          <OverallRating reviewStats={reviewStats} />
          {!rateStatus && (
            <Button
              mode="outlined"
              onPress={() => setIsReviewModalVisible(true)}
              style={{ borderRadius: 8, marginTop: 16 }}
            >
              <Text style={{ textAlign: 'center' }}>Rate Now</Text>
            </Button>
          )}
          {isReviewModalVisible && (
            <ReviewModal
              onSave={() => setRateStatus(true)}
              onClose={() => setIsReviewModalVisible(false)}
              astroId={astroId}
              name={name}
              profilePic={profilePic}
              onSubmit={fetchRatingReviews}
            />
          )}
          <View style={styles.bottomSection}>
            <FlatList
              data={ratingReviews}
              style={{
                flex: 1,
              }}
              contentContainerStyle={{
                gap: 8,
              }}
              onEndReached={getNextPage}
              onEndReachedThreshold={0.5}
              ListFooterComponent={() =>
                loadingMore && !loadedAll ? (
                  <View style={{ alignItems: 'center', padding: 16 }}>
                    <ButtonSpinner color="#fff" />
                    <Text>Loading more...</Text>
                  </View>
                ) : null
              }
              renderItem={renderItem}
              keyExtractor={item => item._id}
            />
          </View>
        </View>
      </View>
    </ErrorBoundary.Screen>
  );
};

const styles = StyleSheet.create({
  parent: { flex: 1, padding: 16 },
  bottomSection: {
    marginTop: 16,
    flex: 1,
  },
});

export default AstroProfileReviews;
