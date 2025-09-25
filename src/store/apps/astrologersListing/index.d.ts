export interface AstrologersListingState {
  astrologers: AstrologerDetails[];
  topAstrologers: AstrologerDetails[];
  page: number;
}

export interface AstrologerDetails {
    _id: string;
    userId: string;
    skills: string[];
    language: string[];
    astrologerSpecialty: string;
    yearsOfExp: number;
    liveStatus: string;
    astrologername: string;
    averageRating: number;
    statusOrder: number;
    displayStrikeRate: number;
    displayActualRate: number;
    profilepic: string | null;
    agreedRate: number | null;
    offerId: string | null;
}

export type AstrologersListingResponse = AstrologerDetails[];

export interface AstrologersListingPayload {
    page: number;
    skills: string[];
    language: string[];
    gender: string[];
    speciality: string;
    sortBy: string | null;
}