import type { TextInputComponentProps } from "../CustomInputTypes";

export interface LocationData {
  name: string;
  country: string;
  country_name: string;
  full_name: string;
  coordinates: [string, string];
  tz: number;
  tz_dst: number;
  timezone_id: string;
}

export interface ApiResponse {
  status: number;
  response: LocationData[];
  result_length: number;
}

export interface LocationProps extends TextInputComponentProps {
  getLocationInfo: (data: LocationData) => void;
  testID: string;
  label?: string;
}