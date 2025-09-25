export interface SearchAstrologersPayload {
    nameStr: string;
    skills: string[];
    language: string[];
    gender: string[];
    costRange: string;
    expRange: string;
    sortBy: string | null;
  }
  
  export interface DisplayRates {
    India: number;
    OutSideIndia: number;
  }
  
  export interface AstrologerResponse {
    _id: string;
    userId: string;
    skills: string[];
    language: string[];
    liveStatus: 'Online' | 'Offline';
    yearsOfExp?: number;
    averageRating: number;
    astrologername: string;
    displayStrikeRate: number;
    displayActualRate: number;
    profilepic: string | null;
  }
  
  export interface Astrologer {
    _id: string;
    name: string;
    skills: string[];
    languages: string[];
    gender: string;
    costPerMinute: number;
    experience: number;
    profilePic: string;
    status: 'Available' | 'Busy';
  }
  
  export interface AstrologersSearchState {
    astrologers: AstrologerResponse[];
  }
  