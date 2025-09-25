interface MatchMakingPayload {
    male_name: string;
      male_birthDetails: {
          male_birthDateTime: string;
          male_birthPlace: {
              male_placeName: string;
              male_latitude: number;
              male_longitude: number;
          };
          male_timezone: string;
      };
      female_name: string;
      female_birthDetails: {
        female_birthDateTime: string;
        female_birthPlace: {
          female_placeName: string;
          female_latitude: number;
          female_longitude: number;
      };
      female_timezone: string;
    }
    maleKundliId?: string;
    femaleKundliId?: string;
  }

  export type { MatchMakingPayload };