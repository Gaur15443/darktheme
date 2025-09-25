import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {findPropertyValueIgnoreCase} from '../../../utils';
import Axios from '../../../plugin/Axios';

// ** Fetch UserInfo
export const getNotify = createAsyncThunk('appNotify/getNotify', async () => {
  const response = await Axios.get('/notificationSetting/v1');
  return response.data;
});

// export const setNotify = createAsyncThunk(
//   'appNotify/setNotify',
//   async payload => {
//     const {indexes, settingName} = payload;
//     const {groupIndex, settingIndex} = indexes;
//     delete payload.indexes;
//     const {data} = await Axios.put('/notificationSettingUpdate/v1', payload);

//     return {data, settingName, groupIndex, settingIndex};
//   },
// );

export const markNotificationAsViewedApi = createAsyncThunk(
  'appNotify/markNotificationAsViewedApi',
  async payload => {
    const response = await Axios.put('/notificationRead', payload);
    return response.data;
  },
);

export const fetchCalendarData = createAsyncThunk(
  'appNotify/fetchingCalendarData',
  async ({groupId, calenderPage}) => {
    const response = await Axios.post(
      `/calender/getCalenderByGroupId/${calenderPage}`,
      {groupId},
    );
    return response.data;
  },
);

export const fetchUserNotification = createAsyncThunk(
  'appNotify/fetchUserNotification',
  async page => {
    const response = await Axios.get(`/getUserNotification/${page}`);
    return response.data;
  },
);

const initialState = {
  loading: 'idle',
  quotationName: null,
  notifications: [],
  isFetchData: false,
};

export const appNotifySlice = createSlice({
  name: 'appNotify',
  initialState,
  reducers: {
    markAsRead(state, {payload: id}) {
      state.notifications = state.notifications.map(notification => {
        if (notification._id === id) {
          notification.read_at = new Date().toISOString();
        }

        return notification;
      });
    },
    SetIsFetchData: (state, action) => {
      state.isFetchData = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase('LOGOUT', state => {
        Object.assign(state, initialState);
      })
      .addCase(getNotify.pending, state => {
        state.loading = 'loading';
      })
      .addCase(getNotify.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.data = action?.payload;
      })
      .addCase(getNotify.rejected, state => {
        state.loading = 'failed';
      })

      // .addCase(setNotify.fulfilled, (state, {payload}) => {
      //   try {
      //     const result = state.data ? state.data : {};
      //     const newVal = findPropertyValueIgnoreCase(
      //       payload.data,
      //       result.groups[payload.groupIndex].settings[payload.settingIndex]
      //         .settingName,
      //     );

      //     result.groups[payload.groupIndex].settings[
      //       payload.settingIndex
      //     ].value = newVal;

      //     state.data = result;
      //   } catch (_) {
      //     // eslint-disable-next-line no-empty
      //   }
      // })

      .addCase(fetchUserNotification.pending, state => {
        state.notifications = [];
      })
      .addCase(fetchUserNotification.fulfilled, (state, action) => {
        state.notifications = action.payload;
      })
      .addCase(fetchCalendarData.fulfilled, (state, action) => {
        state.isFetchData = action.payload.length === 0;
      });
  },
});

export const {markAsRead,SetIsFetchData} = appNotifySlice.actions;

export default appNotifySlice.reducer;
