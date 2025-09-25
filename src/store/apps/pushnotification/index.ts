import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';

interface PushNotificationState {
  shouldRequestPush: boolean;
  requestedInCurrentSession: boolean;
  showedInHome: boolean;
  shownInReports: boolean;
  isGlobalPopUpOpen: boolean;
  popUpType: 'push' | 'mic';
}

const initialState: PushNotificationState = {
  shouldRequestPush: false,
  requestedInCurrentSession: false,
  showedInHome: false,
  shownInReports: false,
  isGlobalPopUpOpen: false,
  popUpType: 'push',
};

const pushNotificationSlice = createSlice({
  name: 'userLocation',
  initialState,
  reducers: {
    setRequestPermissionState(state, action: PayloadAction<boolean>) {
      state.shouldRequestPush = action.payload;
    },
    setRequestedInCurrentSession(state, action: PayloadAction<boolean>) {
      state.requestedInCurrentSession = action.payload;
    },
    setShowedInHome(state, action: PayloadAction<boolean>) {
      state.showedInHome = action.payload;
    },
    setShownInReports(state, action: PayloadAction<boolean>) {
      state.shownInReports = action.payload;
    },
    setShouldOpenGlobalPopUp(state, action: PayloadAction<boolean>) {
      state.isGlobalPopUpOpen = action.payload;
    },
    setGlobalPopUpType(state, action: PayloadAction<'push' | 'mic'>) {
      state.popUpType = action.payload;
    },
  },
  extraReducers: () => null,
});

export const {
  setRequestPermissionState,
  setRequestedInCurrentSession,
  setShowedInHome,
  setShownInReports,
  setShouldOpenGlobalPopUp,
  setGlobalPopUpType,
} = pushNotificationSlice.actions;
export default pushNotificationSlice.reducer;
