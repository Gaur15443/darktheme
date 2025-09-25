import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {AstroAxios} from './../../../plugin/Axios';
import {setShouldReset} from '../astroKundali';
import {getTimezone} from '../../../utils';

interface HoroscopeState {
  horoscopeData: any | null;
  loaderActive: boolean;
  error: string | null;
  shouldResetHoroscope: boolean;
  shouldRefreshHoroscope: boolean;
}
const timezoneStringVal = getTimezone();
export const getPersonalHoroscope = createAsyncThunk<string | null, any>(
  'horoscope/getPersonalHoroscope',
  async () => {
    const result = await AstroAxios.get('/getPersonalHoroscope', {
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
    return result.data;
  },
);
export const getHoroscopeBirthDetails = createAsyncThunk<string | null, any>(
  'horoscope/getHoroscopeBirthDetails',
  async payload => {
    const response = await AstroAxios.post(
      '/getHoroscopeBirthDetails',
      payload,
      {
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          Expires: '0',
        },
      },
    );
    return response.data;
  },
);
export const shareHoroscopeMessage = createAsyncThunk<string | null, any>(
  'horoscope/shareHoroscope',
  async () => {
    const response = await AstroAxios.get('/shareHoroscope');
    return response.data;
  },
);
// Async functions to fetch horoscope data based on the selected tab
export const fetchDailyHoroscope = createAsyncThunk<
  string | null,
  any,
  {rejectValue: string | null}
>('horoscope/fetchDailyHoroscope', async payload => {
  payload.timezoneString = timezoneStringVal;
  const response = await AstroAxios.post('/getDailyHoroscope', payload);
  return response.data.data;
});
export const fetchTomorrowHoroscope = createAsyncThunk<
  string | null,
  any,
  {rejectValue: string | null}
>('horoscope/fetchTomorrowHoroscope', async payload => {
  try {
    payload.timezoneString = timezoneStringVal;
    const response = await AstroAxios.post('/getTomorrowHoroscope', payload);
    return response.data.data;
  } catch (error) {
    return error.response ? error.response.data : error.message;
  }
});
export const fetchWeeklyHoroscope = createAsyncThunk<
  string | null,
  any,
  {rejectValue: string | null}
>('horoscope/fetchWeeklyHoroscope', async payload => {
  payload.timezoneString = timezoneStringVal;
  const response = await AstroAxios.post('/getWeeklyHoroscope', payload);
  console.log('weekly', response.data.data);
  return response.data.data;
});

export const fetchMonthlyHoroscope = createAsyncThunk<
  string | null,
  any,
  {rejectValue: string | null}
>('horoscope/fetchMonthlyHoroscope', async payload => {
  payload.timezoneString = timezoneStringVal;
  const response = await AstroAxios.post('/getMonthlyHoroscope', payload);
  return response.data.data;
});

export const fetchYearlyHoroscope = createAsyncThunk<
  string | null,
  any,
  {rejectValue: string | null}
>('horoscope/fetchYearlyHoroscope', async payload => {
  payload.timezoneString = timezoneStringVal;
  const response = await AstroAxios.post('/getYearlyHoroscope', payload);
  return response.data.data;
});
export const fetchPersonalizedDailyHoroscope = createAsyncThunk<
  string | null,
  any,
  {rejectValue: string | null}
>('horoscope/fetchPersonalizedDailyHoroscope', async payload => {
  payload.timezoneString = timezoneStringVal;
  const response = await AstroAxios.post(
    '/getDailyHoroscope-personalised',
    payload,
  );
  return response.data.data;
});
export const fetchPersonalizedTomorrowHoroscope = createAsyncThunk<
  string | null,
  any,
  {rejectValue: string | null}
>('horoscope/fetchPersonalizedTomorrowHoroscope', async payload => {
  try {
    payload.timezoneString = timezoneStringVal;
    const response = await AstroAxios.post(
      '/getTomorrowHoroscope-personalised',
      payload,
    );
    // change url once ready
    return response.data.data;
  } catch (error) {
    return error.response ? error.response.data : error.message;
  }
});

export const fetchPersonalizedWeeklyHoroscope = createAsyncThunk<
  string | null,
  any,
  {rejectValue: string | null}
>('horoscope/fetchPersonalizedWeeklyHoroscope', async payload => {
  payload.timezoneString = timezoneStringVal;
  const response = await AstroAxios.post(
    '/getWeeklyHoroscope-personalised',
    payload,
  );
  return response.data.data;
});

export const fetchPersonalizedMonthlyHoroscope = createAsyncThunk<
  string | null,
  any,
  {rejectValue: string | null}
>('horoscope/fetchPersonalizedMonthlyHoroscope', async payload => {
  payload.timezoneString = timezoneStringVal;
  const response = await AstroAxios.post(
    '/getMonthlyHoroscope-personalised',
    payload,
  );
  return response.data.data;
});

export const fetchPersonalizedYearlyHoroscope = createAsyncThunk<
  string | null,
  any,
  {rejectValue: string | null}
>('horoscope/fetchPersonalizedYearlyHoroscope', async payload => {
  payload.timezoneString = timezoneStringVal;
  const response = await AstroAxios.post(
    '/getYearlyHoroscope-personalised',
    payload,
  );
  return response.data.data;
});
const initialState = {
  horoscopeData: {},
  loaderActive: false,
  personalHoroscope: null,
  horoscopeBirthDetails: null,
  error: null,
  shouldResetHoroscope: false,
  shouldRefreshHoroscope: false,
} as HoroscopeState;
const horoscopeSlice = createSlice({
  name: 'horoscope',
  initialState,
  reducers: {
    setShouldResetHoroscope(state, {payload}) {
      state.shouldResetHoroscope = payload;
    },
    resetHoroscopeBirthDetails(state) {
      state.horoscopeBirthDetails = null;
    },
    setShouldRefreshHoroscope(state, {payload}) {
      state.shouldRefreshHoroscope = payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase('LOGOUT', state => {
        Object.assign(state, initialState);
      })
      .addCase(fetchDailyHoroscope.pending, state => {
        state.loaderActive = true;
        state.error = null;
      })
      .addCase(fetchDailyHoroscope.fulfilled, (state, action) => {
        state.loaderActive = false;
        state.horoscopeData = action.payload;
      })
      .addCase(fetchDailyHoroscope.rejected, (state, action) => {
        state.loaderActive = false;
        state.error = action.payload ?? null;
      })
      .addCase(fetchTomorrowHoroscope.pending, state => {
        state.loaderActive = true;
        state.error = null; // Clear any previous errors
      })
      .addCase(fetchTomorrowHoroscope.fulfilled, (state, action) => {
        state.loaderActive = false;
        state.horoscopeData = action.payload;
      })
      .addCase(fetchTomorrowHoroscope.rejected, (state, action) => {
        state.loaderActive = false;
        state.error = action.payload ?? null;
      })

      .addCase(fetchWeeklyHoroscope.pending, state => {
        state.loaderActive = true;
        state.error = null;
      })
      .addCase(fetchWeeklyHoroscope.fulfilled, (state, action) => {
        state.loaderActive = false;
        state.horoscopeData = action.payload;
      })
      .addCase(fetchWeeklyHoroscope.rejected, (state, action) => {
        state.loaderActive = false;
        state.error = action.payload ?? null;
      })

      .addCase(fetchMonthlyHoroscope.pending, state => {
        state.loaderActive = true;
        state.error = null;
      })
      .addCase(fetchMonthlyHoroscope.fulfilled, (state, action) => {
        state.loaderActive = false;
        state.horoscopeData = action.payload;
      })
      .addCase(fetchMonthlyHoroscope.rejected, (state, action) => {
        state.loaderActive = false;
        state.error = action.payload ?? null;
      })

      .addCase(fetchYearlyHoroscope.pending, state => {
        state.loaderActive = true;
        state.error = null;
      })
      .addCase(fetchYearlyHoroscope.fulfilled, (state, action) => {
        state.loaderActive = false;
        state.horoscopeData = action.payload;
      })
      .addCase(fetchYearlyHoroscope.rejected, (state, action) => {
        state.loaderActive = false;
        state.error = action.payload ?? null;
      })
      .addCase(fetchPersonalizedDailyHoroscope.pending, state => {
        state.loaderActive = true;
        state.error = null;
      })
      .addCase(fetchPersonalizedDailyHoroscope.fulfilled, (state, action) => {
        state.loaderActive = false;
        state.horoscopeData = action.payload;
      })
      .addCase(fetchPersonalizedDailyHoroscope.rejected, (state, action) => {
        state.loaderActive = false;
        state.error = action.payload ?? null;
      })
      .addCase(fetchPersonalizedTomorrowHoroscope.pending, state => {
        state.loaderActive = true;
        state.error = null; // Clear any previous errors
      })
      .addCase(
        fetchPersonalizedTomorrowHoroscope.fulfilled,
        (state, action) => {
          state.loaderActive = false;
          state.horoscopeData = action.payload;
        },
      )
      .addCase(fetchPersonalizedTomorrowHoroscope.rejected, (state, action) => {
        state.loaderActive = false;
        state.error = action.payload ?? null;
      })

      .addCase(fetchPersonalizedWeeklyHoroscope.pending, state => {
        state.loaderActive = true;
        state.error = null;
      })
      .addCase(fetchPersonalizedWeeklyHoroscope.fulfilled, (state, action) => {
        state.loaderActive = false;
        state.horoscopeData = action.payload;
      })
      .addCase(fetchPersonalizedWeeklyHoroscope.rejected, (state, action) => {
        state.loaderActive = false;
        state.error = action.payload ?? null;
      })

      .addCase(fetchPersonalizedMonthlyHoroscope.pending, state => {
        state.loaderActive = true;
        state.error = null;
      })
      .addCase(fetchPersonalizedMonthlyHoroscope.fulfilled, (state, action) => {
        state.loaderActive = false;
        state.horoscopeData = action.payload;
      })
      .addCase(fetchPersonalizedMonthlyHoroscope.rejected, (state, action) => {
        state.loaderActive = false;
        state.error = action.payload ?? null;
      })

      .addCase(fetchPersonalizedYearlyHoroscope.pending, state => {
        state.loaderActive = true;
        state.error = null;
      })
      .addCase(fetchPersonalizedYearlyHoroscope.fulfilled, (state, action) => {
        state.loaderActive = false;
        state.horoscopeData = action.payload;
      })
      .addCase(fetchPersonalizedYearlyHoroscope.rejected, (state, action) => {
        state.loaderActive = false;
        state.error = action.payload ?? null;
      })
      .addCase(shareHoroscopeMessage.pending, state => {
        state.loaderActive = true;
        state.error = null;
      })
      .addCase(shareHoroscopeMessage.fulfilled, (state, action) => {
        state.loaderActive = false;
        state.horoscopeData = action.payload;
      })
      .addCase(shareHoroscopeMessage.rejected, (state, action) => {
        state.loaderActive = false;
        state.error =
          typeof action.payload === 'string' ? action.payload : null;
      })

      .addCase(getPersonalHoroscope.pending, state => {
        state.loaderActive = true;
        state.error = null;
      })
      .addCase(getPersonalHoroscope.fulfilled, (state, action) => {
        state.loaderActive = false;
        state.personalHoroscope = action.payload;
      })
      .addCase(getPersonalHoroscope.rejected, (state, action) => {
        state.loaderActive = false;
        state.error =
          typeof action.payload === 'string' ? action.payload : null;
      })
      .addCase(getHoroscopeBirthDetails.pending, state => {
        state.loaderActive = true;
        state.error = null;
      })
      .addCase(getHoroscopeBirthDetails.fulfilled, (state, action) => {
        state.loaderActive = false;
        state.horoscopeBirthDetails = action.payload;
      })
      .addCase(getHoroscopeBirthDetails.rejected, (state, action) => {
        state.loaderActive = false;
        state.error =
          typeof action.payload === 'string' ? action.payload : null;
      });
  },
});
export const {setShouldResetHoroscope, resetHoroscopeBirthDetails, setShouldRefreshHoroscope} =
  horoscopeSlice.actions;
export default horoscopeSlice.reducer;
