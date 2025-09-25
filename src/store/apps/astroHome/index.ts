import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {AstroAxios} from '../../../plugin/Axios';

interface Banner {
  url: string;
  _id: string;
}

interface AstrologySection {
  header: string;
  subHeader: string[];
}

interface CardSection extends AstrologySection {
  btn: string;
}

interface AstroDataGeneral {
  _id: string;
  description: string;
  vedicAstrology: AstrologySection;
  matchMakingCard: CardSection;
  careerReportCard: CardSection;
  __v: number;
  banners: Banner[];
  isUnlockNow: boolean;
}

interface AstroDataDetails {
  date: string;
  tithi: {
    name: string;
    number: number;
    next_tithi: string;
    type: string;
    diety: string;
    start: string;
    end: string;
    meaning: string;
    special: string;
  };
  advanced_details: {
    sun_rise: string;
    sun_set: string;
    moon_rise: string;
    moon_set: string;
  };
}
type BannerLine = {
  line1: string;
  line2: string;
  line3: string;
  line4: string;
};

type HomePageBanner = {
  _id: string;
  imageUrl: string[];
  bannerlines: BannerLine[];
  ctaText: string;
  isHomePageBannerForReports: boolean;
  couponCode: string;
  __v: number;
};


export type AstroData = [AstroDataGeneral, AstroDataDetails];

export const getAstroHomeData = createAsyncThunk<any, AstroData[]>(
  'astroHome/getAstroHomeData',
  async data => {
    const response = await AstroAxios.post('/gethomePageAstro', data);
    if (!Array.isArray(response?.data?.data)) {
      return [null, null];
    }
    return response.data.data;
  },
);
export const getAstroBannerDetails = createAsyncThunk<HomePageBanner>(
  'astroHome/getBannerReports',
  async () => {
    const response = await AstroAxios.get('/get-home-page-banner-reports');
    return response.data as HomePageBanner;
  },
);


const initialState: {data: AstroData | [], bannerDetails: HomePageBanner | null, showedBanner: boolean} = {
  data: [],
  bannerDetails: null,
  showedBanner: false,
};

const astroHome = createSlice({
  name: 'astroHome',
  initialState,
  reducers: {
    setShowedBanner: (state, action) => {
      state.showedBanner = action.payload;
    }
  },
  extraReducers: builder => {
    builder
      .addCase('LOGOUT', state => {
        Object.assign(state, initialState);
      })
      .addCase(getAstroHomeData.fulfilled, (state, {payload}) => {
        state.data = payload;
      })
      .addCase(getAstroBannerDetails.fulfilled, (state, {payload}) => {
        state.bannerDetails = payload;
      });
  },
});

export const {setShowedBanner} = astroHome.actions;
export default astroHome.reducer;
