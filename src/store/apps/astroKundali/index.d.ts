interface BirthPlace {
    city: string;
    state: string;
    country: string;
  }
  
  interface BirthDetails {
    birthDateTime: string;
    birthPlace: BirthPlace;
    timezone: string;
  }
interface SaveKundliData {
    _id: string;
    name: string;
    gender: string;
    birthDetails: {
        birthDateTime: string;
        birthPlace: {
            placeName: string;
            latitude: number;
            longitude: number;
        };
        timezone: string;
        timezoneString: string;
    };
    isOwnersKundli: boolean;
    purpose?: 'horoscope';
    reportId?: string;
}

interface Kundli {
    _id: string;
    name: string;
    gender: 'male' | 'female' | 'other';
    userId: string;
    isOwnersKundli: boolean;
    birthDetails: BirthDetails;
    purchasedReports: any[]; 
    createdAt: string;
    updatedAt: string;
    __v: number;
  }
interface Reports{
    _id: string;
    activeOfferId: [],
    description: string[],
    price_details: {
      inr: number,
      usd: number
    };
    typeOfReport: string;
  }

  interface KundaliById {
    _id: string;
    userId: string;
    name: string;
    gender: 'male' | 'female' | 'other';
    birthDetails: {
      birthDateTime: string;
      birthPlace: {
        placeName: string;
        latitude: number;
        longitude: number;
      };
      timezone: string;
    };
    isOwnersKundli: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
    purchasedReports: PurchasedReport[];
  }
  
  interface PurchasedReport {
    reportId: {
      _id: string;
      typeOfReport: 'Career' | 'Marriage' | string;
    };
    offerId: string | null;
    generatedStatus: boolean;
    generatedAt: string; 
    _id: string;
  }
  interface ReportAlert {
    success: boolean;
    isPurchasedAlert: boolean;
  }
  interface StoredKundliObject {
    _id: string;
    userId: string;
    name: string;
    gender: 'male' | 'female';
    birthDetails: {
      birthDateTime: string;
      birthPlace: {
        placeName: string;
        latitude: number;
        longitude: number;
      };
      timezone: string;
    };
    isOwnersKundli: boolean;
    type_of_report: 'Kundli' | string;
    purchasedReports: PurchasedReport[];
    createdAt: string;
    updatedAt: string;
    __v: number;
  }

  interface GetAstroPdfPayload {
    userId: string;
    reportId: string;
    kundliId: string;
  }

  interface GetAstroPdfResponse {
    success: boolean;
    message: string;
    data: {
      _id: string;
      pdfUrl: string;
      userId: string;
      reportId: string;
      kundliId: string;
      createdAt: string;
      updatedAt: string;
      __v: number;
    };
  }

  interface IsOwnerKundliResponse {
    success: boolean;
    isOwner: boolean;
    data: {
        birthDetails: {
            birthPlace: {
                placeName: string;
                latitude: number;
                longitude: number;
            };
            birthDateTime: string;
            timezone: string;
            timezoneString: string;
        };
        horoscopeReport: {
            generatedStatus: boolean;
            isFormSubmitted: boolean;
        };
        _id: string;
        userId: string;
        name: string;
        gender: 'male' | 'female' | 'other';
        isOwnersKundli: boolean;
        type_of_report: string;
        purpose: string;
        purchasedReports: PurchasedReport[];
        createdAt: string;
        updatedAt: string;
        __v: number;
    };
  }

  export {
    SaveKundliData,
    Kundli,
    Reports,
    KundaliById,
    StoredKundliObject,
    GetAstroPdfPayload,
    GetAstroPdfResponse,
    IsOwnerKundliResponse,
    ReportAlert,
  }