import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import Axios from '../../../plugin/Axios';
import axios, {AxiosError} from 'axios';
import authConfig from '../../../configs';
// ✅ Fetch transactions
export const fetchTransactions = createAsyncThunk(
  'wallet/fetchTransactions',
  async (
    {userId, page, pageSize}: {userId: string; page: number; pageSize: number},
    {rejectWithValue},
  ) => {
    try {
      const response = await Axios.get(
        `${authConfig.walletBaseUrl}/getTransactions/${userId}`,
        {params: {page, pageSize}},
      );
      return response.data;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data || e.message);
    }
  },
);

// ✅ Fetch cashback rules
export const fetchCashbackRules = createAsyncThunk(
  'wallet/fetchCashbackRules',
  async (_, {rejectWithValue}) => {
    try {
      const resp = await Axios.get(`${authConfig.walletBaseUrl}/cashback`);

      return resp.data; // [{baseAmount, cashbackAmount, ...}, ...]
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data || 'Error fetching cashback rules',
      );
    }
  },
);

// ✅ Fetch eligibility for all cashback rules
export const fetchCashbackEligibility = createAsyncThunk(
  'wallet/fetchCashbackEligibility',
  async (
    {userId, rules}: {userId: string; rules: any[]},
    {rejectWithValue},
  ) => {
    try {
      const eligibilityPromises = rules.map(async item => {
        try {
          const resp = await Axios.get(
            `${authConfig.walletBaseUrl}/cashback-eligibility`,
            {params: {userId, baseAmount: item.baseAmount}},
          );

          return {
            ...item,
            isCashbackEligible: resp.data.isCashbackEligible,
            cashbackAmount:
              resp.data.cashbackDetails?.cashbackAmount || item.cashbackAmount,
            cashbackPercentage:
              resp.data.cashbackDetails?.cashbackPercentage ||
              item.cashbackPercentage,
          };
        } catch {
          return item; // if one fails, keep the original
        }
      });

      return await Promise.all(eligibilityPromises);
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data || 'Error fetching cashback eligibility',
      );
    }
  },
);

// store/wallet.ts or store/gst.ts
export const fetchGstDetails = createAsyncThunk(
  'wallet/fetchGstDetails',
  async ({selectAmount, userId}: {selectAmount: number; userId: string}) => {
    const response = await axios.post(
      `${authConfig.walletBaseUrl}/calculateGst`,
      {selectAmount, userId},
    );
    return response.data; // { gstAmount, totalAmount }
  },
);

export const verifyMobileWallet = createAsyncThunk(
  'wallet/verifyMobileWallet',
  async (userId: string, {rejectWithValue}) => {
    try {
      const response = await axios.get(
        `${authConfig.walletBaseUrl}/mobileVerificationWallet/${userId}`,
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  },
);

export const getWalletToasts = createAsyncThunk<any, void>(
  'wallet/getWalletToasts',
  async (_, {rejectWithValue}) => {
    try {
      const response = await axios.get(`${authConfig.toastMessagesWallet}`);
      return response.data;
    } catch (e) {
      if (e instanceof AxiosError) {
        return rejectWithValue(e.response?.data);
      }
      return rejectWithValue(`Unknown error occurred: ${e}`);
    }
  },
);

// Save a failed/success transaction
export const saveTransaction = createAsyncThunk(
  'wallet/saveTransaction',
  async (
    data: {
      userId: string;
      amount: number;
      baseAmount: number;
      status: 'success' | 'failed';
      reason: string;
      createdAt: string;
      type: string;
      productinfo: string;
      firstname: string;
      email: string;
      phone: string;
      lastName: string;
      mobileNumber: Number;
    },
    {rejectWithValue},
  ) => {
    try {
      const response = await Axios.post(
        `${authConfig.walletBaseUrl}/saveTransaction`,
        data,
      );
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data || 'Failed to save transaction',
      );
    }
  },
);
export const storeLocation = createAsyncThunk(
  'wallet/storeLocation',
  async (
    {
      userId,
      state,
      country,
      countryCode,
      regionCode,
      city,
      postal,
      ip,
    }: {
      userId: string;
      state: string;
      country: string;
      countryCode: string;
      regionCode?: string;
      city?: string;
      postal?: string;
      ip?: string;
    },
    {rejectWithValue},
  ) => {
    try {
      const response = await axios.post(
        `${authConfig.walletBaseUrl}/location`,
        {
          userId,
          state,
          country,
          countryCode,
          regionCode,
          city,
          postal,
          ip,
        },
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  },
);

const initialState = {
  transactions: [] as any[],
  page: 1,
  hasMore: true,
  loading: false,
  pageSize: 10,
  totalPages: 1,
  totalRecords: 0,
  error: null as string | null,
  cashbackRules: [] as any[],
  needsRefresh: false,
  gstLoading: false,
  gstData: null as null | {gstAmount: number; totalAmount: number},
  gstError: null as string | null,
  lastSavedTransaction: null,
  verificationStatus: 'idle',
  verificationData: null,
  verificationError: null,
  locationStatus: 'idle',
  locationData: null as any,
  locationError: null as string | null,
  toastConfig: {},
  WalletToasts: {},
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    resetTransactions: state => {
      state.transactions = [];
      state.page = 1;
      state.hasMore = true;
      state.error = null;
    },
    markCashbackForRefresh: state => {
      state.needsRefresh = true;
    },
    clearCashback: state => {
      state.cashbackRules = [];
      state.needsRefresh = true;
    },
  },
  extraReducers: builder => {
    builder
      // 📄 Fetch transactions
      .addCase(fetchTransactions.pending, state => {
        state.loading = true;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        const {transactions, currentPage, pageSize, totalPages, totalRecords} =
          action.payload;

        state.loading = false;
        state.transactions =
          currentPage === 1
            ? transactions
            : [...state.transactions, ...transactions];

        state.page = currentPage;
        state.pageSize = pageSize;
        state.totalPages = totalPages;
        state.totalRecords = totalRecords;
        state.hasMore = currentPage < totalPages;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // 🧮 Fetch cashback rules
      .addCase(fetchCashbackRules.pending, state => {
        state.loading = true;
      })
      .addCase(fetchCashbackRules.fulfilled, (state, action) => {
        state.loading = false;
        state.cashbackRules = action.payload;
        state.needsRefresh = false;
      })
      .addCase(fetchCashbackRules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // ✅ Fetch cashback eligibility
      .addCase(fetchCashbackEligibility.pending, state => {
        state.loading = true;
      })
      .addCase(fetchCashbackEligibility.fulfilled, (state, action) => {
        state.loading = false;
        state.cashbackRules = action.payload;
        state.needsRefresh = false;
      })
      .addCase(fetchCashbackEligibility.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // 📈 Fetch gst details
      .addCase(fetchGstDetails.pending, state => {
        state.gstLoading = true;
      })
      .addCase(fetchGstDetails.fulfilled, (state, action) => {
        state.gstLoading = false;
        state.gstData = action.payload; // Save gstAmount & totalAmount here
      })
      .addCase(fetchGstDetails.rejected, (state, action) => {
        state.gstLoading = false;
        state.gstError = action.error.message;
      })

      .addCase(saveTransaction.pending, state => {
        state.loading = true;
      })
      .addCase(saveTransaction.fulfilled, (state, action) => {
        state.loading = false;
        // optionally store last saved transaction response
        state.lastSavedTransaction = action.payload;
      })
      .addCase(saveTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(verifyMobileWallet.pending, state => {
        state.verificationStatus = 'loading';
      })
      .addCase(verifyMobileWallet.fulfilled, (state, action) => {
        state.verificationStatus = 'succeeded';
        state.verificationData = action.payload;
      })
      .addCase(verifyMobileWallet.rejected, (state, action) => {
        state.verificationStatus = 'failed';
        state.verificationError = action.payload;
      })
      .addCase(storeLocation.pending, state => {
        state.locationStatus = 'loading';
        state.locationError = null;
      })
      .addCase(storeLocation.fulfilled, (state, action) => {
        state.locationStatus = 'succeeded';
        state.locationData = action.payload;
      })
      .addCase(storeLocation.rejected, (state, action) => {
        state.locationStatus = 'failed';
        state.locationError = action.payload as string;
      })
      .addCase(getWalletToasts.pending, state => {
        state.loading = true;
      })
      .addCase(getWalletToasts.fulfilled, (state, action) => {
        state.loading = false;
        state.toastConfig = action.payload;
      })
      .addCase(getWalletToasts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase('LOGOUT', () => initialState);
  },
});

export const {resetTransactions, markCashbackForRefresh, clearCashback} =
  walletSlice.actions;
export default walletSlice.reducer;
