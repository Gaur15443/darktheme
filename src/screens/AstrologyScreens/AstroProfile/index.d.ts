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