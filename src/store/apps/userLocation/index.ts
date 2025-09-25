import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';

export const defaultLocation = {
  "name": "New Delhi",
  "alternate_name": "New Delhi, IN",
  "country": "IN",
  "country_name": "India",
  "full_name": "New Delhi, Delhi, IN",
  "coordinates": [
      "28.63576000",
      "77.22445000"
  ],
  "tz": 5.5,
  "tz_dst": 5.5,
  "current_dst": false,
  "tzone": [
      "Asia/Kolkata"
  ]
}

interface IpInfo {
  ip: string;
  network: string;
  version: string;
  city: string;
  region: string;
  region_code: string;
  country: string;
  country_name: string;
  country_code: string;
  country_code_iso3: string;
  country_capital: string;
  country_tld: string;
  continent_code: string;
  in_eu: boolean;
  postal: string | null;
  latitude: number;
  longitude: number;
  timezone: string;
  utc_offset: string;
  country_calling_code: string;
  currency: string;
  currency_name: string;
  languages: string;
  country_area: number;
  country_population: number;
  asn: string;
  org: string;
}

export const fetchUserLocation = createAsyncThunk(
  'userLocation/fetchUserLocation',
  async () => {
    const response = await axios.get<IpInfo>(
      'https://ipapi.co/json/?key=BQ0nhGJE4X77WZev1ZSEArBqswArU3KRo7nXyT4QtEvfEZiqv8',
    );

    return response.data;
  },
);

const initialState: {data: IpInfo | null} = {
  data: null,
};

const userLocationSlice = createSlice({
  name: 'userLocation',
  initialState,
  reducers: {},
  extraReducers: builder =>
    builder.addCase(fetchUserLocation.fulfilled, (state, {payload}) => {
      state.data = payload;
    }),
});

export default userLocationSlice.reducer;
