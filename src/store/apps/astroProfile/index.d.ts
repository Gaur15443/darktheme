export interface RatingBreakdown {
  '1': number;
  '2': number;
  '3': number;
  '4': number;
  '5': number;
}
export type RatingKey = keyof RatingBreakdown;
export interface ReviewStats {
  totalReviews: number;
  ratingBreakdown: RatingBreakdown;
  averageRating: number;
}

export interface PersonalDetails {
  name: string;
  middlename?: string;
  lastname: string;
  profilepic: string | null;
  relationStatus: string | null;
  gender: 'male' | 'female';
  livingStatus: 'yes' | 'no';
  showNickname?: boolean;
}

export interface Reviewer {
  _id: string;
  personalDetails: PersonalDetails;
}

export interface Review {
  _id: string;
  userId: string;
  astrologerId: string;
  reviewerDisplayName: string;
  review: string;
  rating: number;
  isVisible: boolean;
  isDeleted: boolean;
  isHelpful: boolean;
  reviewType: 'UG' | 'AG';
  callId: string | null;
  chatId: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
  helpfulCount?: number;
  reviewer: Reviewer;
}

export interface AstroRatingReviewsResponse {
  reviewStats: ReviewStats[];
  paginatedReviews: Review[];
}

export interface RatingReview {
  _id: string;
  rating: number;
  review: string;
  userId: string;
  astrologerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaveRatingReviewPayload {
  rating: number;
  review: string;
}

export interface AstroProfileState {
  ratingReviews: Review[];
  shareLink: string | null;
  profile: AstrologerProfile | null;
}
export interface AstrologerProfile {
  _id: string;
  userId: string;
  skills: string[];
  language: string[];
  liveStatus: string;
  bio: string;
  yearsOfExp: number;
  averageRating: number;
  displayNameFinal: string;
  displayStrikeRate: number;
  displayActualRate: number;
  profilepic: string | null;
  isOffer: boolean;
  orderCount?: number;
  agreedRate: number;
  offerId?: string | null;
}
