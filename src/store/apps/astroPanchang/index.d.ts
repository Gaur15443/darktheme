interface Location {
  place: string;
  latitude: number;
  longitude: number;
}

interface PanchangPayload {
  /**
   * Format: `DD/MM/YYYY`
   */  
  date: string;
  userId: string;
  location: Location;
  timezone: string;
}

interface PanchangResponseData {
  _id: string;
  userId: string;
  __v: number;
  createdAt: string;
  date: string;
  location: Location;
  timezone: string;
  updatedAt: string;
}

interface PanchangResponse {
  success: boolean;
  data: PanchangResponseData;
}


export {
    PanchangPayload,
    PanchangResponse,
    PanchangResponseData
}