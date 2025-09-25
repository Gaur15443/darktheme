import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {TelephonyAxios} from '../../../plugin/Axios';
import axios, {AxiosError} from 'axios';
import authConfig from '../../../configs';
import {ChatDetails} from '../../../configs/Chats/FormatChatDetails';
import {
  AgoraCallState,
  CallAstrologerPayload,
  ChatInitDetails,
  ConsulationEndUserPayload,
  ConsultationEndResponse,
  ConsultationToasts,
  GenerateChatTokenPayload,
  GenerateChatTokenResponse,
  GenerateTokenPayload,
  GenerateTokenResponse,
  GetCallHistoryUserResponse,
  GetChatHistoryUserResponse,
  GetUserChatsResponse,
  InitChatReqToAstrologerPayload,
  InitChatReqToAstrologerResponse,
  IsCallActiveResponse,
  IsChatActiveResponse,
  KundliData,
  LogChatEndPayload,
  LogChatEndResponse,
  QuickReplies,
  RegisterVoipTokenPayload,
  RegisterVoipTokenResponse,
} from './types';
import {OnGetMedia} from '../../../components/AstroConsultation/AstroAgoraChat';
import {RootState} from '../..';

export const callAstrologer = createAsyncThunk<
  {initiate: string; astrologerId: string; callId: string},
  CallAstrologerPayload
>('agora/callAstrologer', async (payload, {rejectWithValue}) => {
  try {
    const response = await TelephonyAxios.post(`/call/callAstrologer`, payload);
    return response.data;
  } catch (error: AxiosError | any) {
    return rejectWithValue(error?.response?.data);
  }
});

export const generateAgoraToken = createAsyncThunk<
  GenerateTokenResponse,
  GenerateTokenPayload
>('agora/generateAgoraToken', async (payload, {rejectWithValue}) => {
  try {
    const response = await TelephonyAxios.post<GenerateTokenResponse>(
      `/call/generateCallToken`,
      payload,
    );
    return response.data;
  } catch (e: AxiosError | any) {
    if (e instanceof AxiosError) {
      console.log('TelephonyAxios error:', e.response?.data);
      return rejectWithValue(e.response?.data);
    }
    console.log('Unexpected error:', e);
    return rejectWithValue(`An unknown error occurred ${e}`);
  }
});

export const registerVoipToken = createAsyncThunk<
  RegisterVoipTokenResponse,
  RegisterVoipTokenPayload
>('agora/registerVoipToken', async (payload, {rejectWithValue}) => {
  try {
    const response = await TelephonyAxios.post<RegisterVoipTokenResponse>(
      `/call/registerVoipToken`,
      payload,
    );
    return response.data;
  } catch (e: AxiosError | any) {
    if (e instanceof AxiosError) {
      console.log('TelephonyAxios error:', e.response?.data);
      return rejectWithValue(e.response?.data);
    }
    console.log('Unexpected error:', e);
    return rejectWithValue(`An unknown error occurred ${e}`);
  }
});

export const getUserCallHistory = createAsyncThunk<
  GetCallHistoryUserResponse,
  {},
  {state: RootState; rejectValue: unknown}
>('agora/getUserCallHistory', async (pageNo, {getState, rejectWithValue}) => {
  try {
    const state = getState();
    const pageNumber = state.agoraCallSlice.callHistoryPageNumber;
    const response = await TelephonyAxios.get<GetCallHistoryUserResponse>(
      `/call/user/getCallHistory/${pageNumber}`,
    );
    return response.data;
  } catch (e: AxiosError | any) {
    if (e instanceof AxiosError) {
      console.log('TelephonyAxios error:', e.response?.data);
      return rejectWithValue(e.response?.data);
    }
    console.log('Unexpected error:', e);
    return rejectWithValue(`An unknown error occurred ${e}`);
  }
});

export const getUserChatHistory = createAsyncThunk<
  GetChatHistoryUserResponse,
  {},
  {state: RootState; rejectValue: unknown}
>('agora/getUserChatHistory', async (_, {getState, rejectWithValue}) => {
  try {
    const state = getState();
    const pageNumber = state.agoraCallSlice.chatHistoryPageNumber;
    const response = await TelephonyAxios.get<GetChatHistoryUserResponse>(
      `/chat/user/getChatHistory/${pageNumber}`,
    );
    return response.data;
  } catch (e: AxiosError | any) {
    if (e instanceof AxiosError) {
      console.log('TelephonyAxios error:', e.response?.data);
      return rejectWithValue(e.response?.data);
    }
    console.log('Unexpected error:', e);
    return rejectWithValue(`An unknown error occurred ${e}`);
  }
});

export const generateAgoraChatToken = createAsyncThunk<
  GenerateChatTokenResponse,
  GenerateChatTokenPayload
>('agora/generateAgoraChatToken', async (payload, {rejectWithValue}) => {
  try {
    const response = await TelephonyAxios.post<GenerateChatTokenResponse>(
      `/chat/generateAgoraToken`,
      payload,
    );
    return response.data;
  } catch (e: AxiosError | any) {
    if (e instanceof AxiosError) {
      console.log('TelephonyAxios error:', e.response?.data);
      return rejectWithValue(e.response?.data);
    }
    console.log('Unexpected error:', e);
    return rejectWithValue(`An unknown error occurred ${e}`);
  }
});

export const initChatReqToAstrologer = createAsyncThunk<
  InitChatReqToAstrologerResponse,
  InitChatReqToAstrologerPayload
>('agora/initChatReqToAstrologer', async (payload, {rejectWithValue}) => {
  try {
    const response = await TelephonyAxios.post<InitChatReqToAstrologerResponse>(
      `/chat/chatInitiateImeusweUser`,
      payload,
    );
    return response.data;
  } catch (e: AxiosError | any) {
    if (e instanceof AxiosError) {
      console.log('TelephonyAxios error:', e.response?.data);
      return rejectWithValue(e.response?.data);
    }
    console.log('Unexpected error:', e);
    return rejectWithValue(`An unknown error occurred ${e}`);
  }
});

export const logUserUnavailableForChat = createAsyncThunk<
  {capture: string},
  {chatRoomId: string; userId: string}
>('agora/logUserUnavailable', async (payload, {rejectWithValue}) => {
  try {
    console.log('user unavailable called');
    const response = await TelephonyAxios.post<{capture: string}>(
      `/chat/missedChatUser`,
      payload,
    );
    return response.data;
  } catch (e: AxiosError | any) {
    if (e instanceof AxiosError) {
      console.log('TelephonyAxios error:', e.response?.data);
      return rejectWithValue(e.response?.data);
    }
    console.log('Unexpected error:', e);
    return rejectWithValue(`An unknown error occurred ${e}`);
  }
});

export const logAstrologerUnavailableForChat = createAsyncThunk<
  {capture: string},
  {chatRoomId: string; astrologerId: string}
>(
  'agora/logAstrologerUnavailableForChat',
  async (payload, {rejectWithValue}) => {
    try {
      const response = await TelephonyAxios.post<{capture: string}>(
        `/chat/missedChatAstrologer`,
        payload,
      );
      return response.data;
    } catch (e: AxiosError | any) {
      if (e instanceof AxiosError) {
        console.log('TelephonyAxios error:', e.response?.data);
        return rejectWithValue(e.response?.data);
      }
      console.log('Unexpected error:', e);
      return rejectWithValue(`An unknown error occurred ${e}`);
    }
  },
);

export const logChatEnd = createAsyncThunk<
  LogChatEndResponse,
  LogChatEndPayload
>('agora/logChatEnd', async (payload, {rejectWithValue}) => {
  try {
    const response = await TelephonyAxios.post<LogChatEndResponse>(
      `/chat/chatEnd`,
      payload,
    );
    return response.data;
  } catch (e) {
    if (e instanceof AxiosError) {
      console.log('TelephonyAxios error:', e.response?.data);
      return rejectWithValue(e.response?.data);
    }
    console.log('Unexpected error:', e);
    return rejectWithValue(`An unknown error occurred ${e}`);
  }
});

export const getUserChats = createAsyncThunk<
  Array<GetUserChatsResponse>,
  {chatRoomId: string; pageNumber: number}
>('agora/getUserChats', async (payload, {rejectWithValue}) => {
  try {
    const response = await TelephonyAxios.get<Array<GetUserChatsResponse>>(
      `/chat/getChatsUser/${payload.chatRoomId}/${payload.pageNumber}`,
    );
    return response.data;
  } catch (e) {
    if (e instanceof AxiosError) {
      console.log('TelephonyAxios error:', e.response?.data);
      return rejectWithValue(e.response?.data);
    }
    console.log('Unexpected error:', e);
    return rejectWithValue(`An unknown error occurred ${e}`);
  }
});

export const getKundliData = createAsyncThunk<KundliData, {kundliId: string}>(
  'agora/getKundliData',
  async (payload, {rejectWithValue}) => {
    try {
      const response = await TelephonyAxios.get<KundliData>(
        `${authConfig.astroBaseUrl}/getSavedKundliById/${payload.kundliId}`,
      );
      return response.data;
    } catch (e) {
      if (e instanceof AxiosError) {
        console.log('TelephonyAxios error:', e.response?.data);
        return rejectWithValue(e.response?.data);
      }
      console.log('Unexpected error:', e);
      return rejectWithValue(`An unknown error occurred ${e}`);
    }
  },
);

export const consultationEndUser = createAsyncThunk<
  ConsultationEndResponse,
  ConsulationEndUserPayload
>('agora/consultationEndUser', async (payload, {rejectWithValue}) => {
  try {
    const response = await TelephonyAxios.post<ConsultationEndResponse>(
      `/user/consultationEnd`,
      payload,
    );
    return response.data;
  } catch (e) {
    if (e instanceof AxiosError) {
      console.log('TelephonyAxios error:', e.response?.data);
      return rejectWithValue(e.response?.data);
    }
    console.log('Unexpected error:', e);
    return rejectWithValue(`An unknown error occurred ${e}`);
  }
});

export const getIsCallActive = createAsyncThunk<
  IsCallActiveResponse,
  undefined
>('agora/checkForActiveCalls', async (_, {rejectWithValue}) => {
  try {
    const response = await TelephonyAxios.get<IsCallActiveResponse>(
      `/user/checkForActiveCalls`,
    );
    return response.data;
  } catch (e) {
    if (e instanceof AxiosError) {
      console.log('TelephonyAxios error:', e.response?.data);
      return rejectWithValue(e.response?.data);
    }
    console.log('Unexpected error:', e);
    return rejectWithValue(`An unknown error occurred ${e}`);
  }
});

export const getIsChatActive = createAsyncThunk<
  IsChatActiveResponse,
  undefined
>('agora/checkForActiveCalls', async (_, {rejectWithValue}) => {
  try {
    const response = await TelephonyAxios.get<IsChatActiveResponse>(
      `/user/checkForActiveChats`,
    );
    return response.data;
  } catch (e) {
    if (e instanceof AxiosError) {
      console.log('TelephonyAxios error:', e.response?.data);
      return rejectWithValue(e.response?.data);
    }
    console.log('Unexpected error:', e);
    return rejectWithValue(`An unknown error occurred ${e}`);
  }
});

export const getConsultationToasts = createAsyncThunk<
  ConsultationToasts,
  undefined
>('agora/getConsultationToasts', async (_, {rejectWithValue}) => {
  try {
    const response = await axios.get<ConsultationToasts>(
      `${authConfig.toastMessagesConsultation}`,
    );
    return response.data;
  } catch (e) {
    if (e instanceof AxiosError) {
      console.log('TelephonyAxios error:', e.response?.data);
      return rejectWithValue(e.response?.data);
    }
    console.log('Unexpected error:', e);
    return rejectWithValue(`An unknown error occurred ${e}`);
  }
});

export const getTotalTalkTimeCall = createAsyncThunk<
  {totalAvailableTalkTime: number},
  {callId: string}
>('agora/getTotalTalkTimeCall', async (payload, {rejectWithValue}) => {
  try {
    const response = await TelephonyAxios.get<{totalAvailableTalkTime: number}>(
      `/call/getCallTalkTime/${payload.callId}`,
    );
    return response.data;
  } catch (e) {
    if (e instanceof AxiosError) {
      console.log('TelephonyAxios error:', e.response?.data);
      return rejectWithValue(e.response?.data);
    }
    console.log('Unexpected error:', e);
    return rejectWithValue(`An unknown error occurred ${e}`);
  }
});

const initialState: AgoraCallState = {
  loading: 'idle',
  error: null,
  generatedTokenDetails: {
    astrologerId: '',
    userId: '',
    channelName: '',
    expiry: '',
    userToken: '',
    astrologerToken: '',
  },
  userCallHistory: [],
  userChatHistory: [],
  callId: null,
  showCallDialogue: false,
  showUnavailableDialogue: false,
  waitingCounter: 0,
  chatReqDetails: {
    astrologerId: '',
    kundliId: '',
    userId: '',
    channelName: '',
    chatRoomId: '',
    expiry: 0,
    astrologerPersonalDetails: {
      name: '',
      profilepic: '',
      gender: '',
      relationStatus: '',
      livingStatus: '',
      lastname: '',
    },
    displayName: '',
  },
  chatToken: '',
  agoraChatRoomId: '',
  uploadingMedia: [],
  isUploadingMedia: false,
  chatInitDetails: {
    chatRoomId: '',
    astrologerId: '',
    userId: '',
    channelName: '',
  },
  totalAvaiableConsultationTime: 0,
  counter: 0,
  usersChats: [],
  quickReplies: {
    chats: {
      quickReplies: [],
    },
  },
  readOnlyMode: false,
  readOnlyModeAstrologerName: '',
  readOnlyModeUserId: '',
  kundliData: {
    _id: '',
    userId: '',
    name: '',
    gender: 'male',
    birthDetails: {
      birthDateTime: '',
      birthPlace: {
        placeName: '',
        latitude: 0,
        longitude: 0,
      },
      timezone: '',
      timezoneString: '',
    },
    isOwnersKundli: false,
    type_of_report: '',
    purpose: '',
    horoscopeReport: {
      generatedStatus: false,
      isFormSubmitted: false,
    },
    purchasedReports: [],
    createdAt: '',
    updatedAt: '',
  },
  kundliId: '',
  chatHistoryPageNumber: 1,
  callHistoryPageNumber: 1,
  astrologerName: '',
  consultationToasts: {
    consultation: {
      battery: {
        text1: '',
        text2: '',
      },
      network: {
        text1: '',
        text2: '',
      },
      permissions: {
        text1: '',
        text2: '',
      },
      run_time_errors: {
        invalid_astrologer_cost: {
          text1: '',
          text2: '',
        },
        invalid_consultation_time: {
          text1: '',
          text2: '',
        },
        invalid_astrologer_token_calls: {
          text1: '',
          text2: '',
        },
        invalid_astrologer_token_chats: {
          text1: '',
          text2: '',
        },
        message_not_sent: {
          text1: '',
          text2: '',
        },
        error_leaving_chat_room: {
          text1: '',
          text2: '',
        },
      },
      download_error: {
        compatibility_error: {
          text1: '',
          text2: '',
        },
        network: {
          text1: '',
          text2: '',
        },
      },
      notify_me: {
        success: '',
      },
    },
  },
  UUID: '',
};

export const agoraCallSlice = createSlice({
  name: 'agoraCall',
  initialState,
  reducers: {
    resetGeneratedToken: state => {
      state.generatedTokenDetails = {
        astrologerId: '',
        userId: '',
        channelName: '',
        expiry: '',
        userToken: '',
        astrologerToken: '',
      };
    },
    setCallId: (state, action: PayloadAction<string>) => {
      state.callId = action.payload;
    },
    setShowCallDialogue: (state, action: PayloadAction<boolean>) => {
      state.showCallDialogue = action.payload;
    },
    setShowUnavailableDialogue: (state, action: PayloadAction<boolean>) => {
      state.showUnavailableDialogue = action.payload;
    },

    setChatReqDetails: (state, action: PayloadAction<ChatDetails>) => {
      state.chatReqDetails = action.payload;
    },

    setChatToken: (state, action: PayloadAction<string>) => {
      state.chatToken = action.payload;
    },

    setChatInitDetails: (state, action: PayloadAction<ChatInitDetails>) => {
      console.log('setChatInitDetails', action.payload);
      state.chatInitDetails = action.payload;
    },

    setTotalAvaiableConsultationTime: (
      state,
      action: PayloadAction<number>,
    ) => {
      state.totalAvaiableConsultationTime = action.payload;
    },

    setCounter: (state, action: PayloadAction<number>) => {
      state.counter = action.payload;
    },

    setKundliId: (state, action: PayloadAction<string>) => {
      state.kundliId = action.payload;
    },

    setAstrologerName: (state, action: PayloadAction<string>) => {
      state.astrologerName = action.payload;
    },

    setChatTokenDetails: (
      state,
      action: PayloadAction<{userToken: string; agoraChatRoomId: string}>,
    ) => {
      state.chatToken = action.payload.userToken;
      state.agoraChatRoomId = action.payload.agoraChatRoomId;
    },

    setUUID: (state, action: PayloadAction<string>) => {
      state.UUID = action.payload;
    },

    resetChatReqDetails: state => {
      state.chatReqDetails = {
        astrologerId: '',
        expiry: 0,
        userId: '',
        channelName: '',
        chatRoomId: '',
        astrologerPersonalDetails: {
          name: '',
          profilepic: '',
          gender: '',
          relationStatus: '',
          livingStatus: '',
          lastname: '',
        },
        displayName: '',
        kundliId: '',
      };
    },

    resetChatInitDetails: state => {
      state.chatInitDetails = {
        chatRoomId: '',
        astrologerId: '',
        userId: '',
        channelName: '',
      };
    },

    resetCallId: state => {
      state.callId = null;
    },
    resetShowCallDialogue: state => {
      state.showCallDialogue = false;
    },
    resetShowUnavailableDialogue: state => {
      state.showUnavailableDialogue = false;
    },

    resetTotalAvaiableConsultationTime: state => {
      state.totalAvaiableConsultationTime = 0;
    },

    setWaitingCounter: (state, action: PayloadAction<number>) => {
      state.waitingCounter = action.payload;
    },
    setUploadingMedia: (state, action: PayloadAction<OnGetMedia[]>) => {
      state.uploadingMedia = action.payload;
    },
    setIsUploadingMedia: (state, action: PayloadAction<boolean>) => {
      state.isUploadingMedia = action.payload;
    },
    setIsChatScreenInReadOnlyMode: (state, action: PayloadAction<boolean>) => {
      state.readOnlyMode = action.payload;
    },
    setReadOnlyModeAstrologerName: (state, action: PayloadAction<string>) => {
      state.readOnlyModeAstrologerName = action.payload;
    },
    setReadOnlyModeUserId: (state, action: PayloadAction<string>) => {
      state.readOnlyModeUserId = action.payload;
    },
    setChatHistoryPageNumber: (state, action: PayloadAction<number>) => {
      state.chatHistoryPageNumber = action.payload;
    },
    setCallHistoryPageNumber: (state, action: PayloadAction<number>) => {
      state.callHistoryPageNumber = action.payload;
    },
    resetAgoraChatRoomId: state => {
      state.agoraChatRoomId = '';
    },
  },
  extraReducers: builder => {
    // callAstrologer
    builder
      .addCase('LOGOUT', state => {
        Object.assign(state, initialState);
      })
      .addCase(callAstrologer.pending, state => {
        state.loading = 'loading';
      })
      .addCase(callAstrologer.fulfilled, (state, action) => {
        state.loading = 'succeeded';
      })
      .addCase(callAstrologer.rejected, state => {
        state.loading = 'failed';
      });

    // generate token
    builder
      .addCase(generateAgoraToken.pending, state => {})
      .addCase(generateAgoraToken.fulfilled, (state, action) => {
        state.generatedTokenDetails.astrologerId =
          action?.payload?.astrologerId;
        state.generatedTokenDetails.userId = action?.payload?.userId;
        state.generatedTokenDetails.channelName = action?.payload?.channelName;
        state.generatedTokenDetails.expiry = action?.payload?.expiry;
        state.generatedTokenDetails.userToken = action?.payload?.userToken;
        state.generatedTokenDetails.astrologerToken =
          action?.payload?.astrologerToken;
      })
      .addCase(generateAgoraToken.rejected, state => {});

    // generate chat token
    // builder
    //   .addCase(generateAgoraChatToken.pending, state => {})
    //   .addCase(generateAgoraChatToken.fulfilled, (state, action) => {
    //     state.chatToken = action?.payload?.userToken;
    //     state.agoraChatRoomId = action?.payload?.agoraChatRoomId;
    //   })
    //   .addCase(generateAgoraChatToken.rejected, state => {});

    //call history
    builder
      .addCase(getUserCallHistory.pending, _ => {})
      .addCase(getUserCallHistory.fulfilled, (state, action) => {
        const currentPage = state.callHistoryPageNumber;
        if (currentPage === 1) {
          state.userCallHistory = action?.payload?.history;
        } else {
          state.userCallHistory = [
            ...state.userCallHistory,
            ...action?.payload?.history,
          ];
        }
        state.callHistoryPageNumber += 1;
      })
      .addCase(getUserCallHistory.rejected, _ => {});

    //chat history
    builder
      .addCase(getUserChatHistory.pending, _ => {})
      .addCase(getUserChatHistory.fulfilled, (state, action) => {
        const currentPage = state.chatHistoryPageNumber;
        if (currentPage === 1) {
          state.userChatHistory = action?.payload?.history;
        } else {
          state.userChatHistory = [
            ...state.userChatHistory,
            ...action?.payload?.history,
          ];
        }
        state.chatHistoryPageNumber += 1;
      })
      .addCase(getUserChatHistory.rejected, _ => {});

    //user chats
    builder
      .addCase(getUserChats.pending, _ => {})
      .addCase(getUserChats.fulfilled, (state, action) => {
        state.usersChats = action?.payload;
      })
      .addCase(getUserChats.rejected, _ => {});

    //get kundliId
    builder
      .addCase(getKundliData.pending, _ => {})
      .addCase(getKundliData.fulfilled, (state, action) => {
        state.kundliData = action?.payload;
      })
      .addCase(getKundliData.rejected, _ => {});

    //consultation toasts
    builder
      .addCase(getConsultationToasts.pending, _ => {})
      .addCase(getConsultationToasts.fulfilled, (state, action) => {
        state.consultationToasts = action?.payload;
      })
      .addCase(getConsultationToasts.rejected, _ => {});
  },
});
export const {
  resetGeneratedToken,
  setCallId,
  resetCallId,
  setShowCallDialogue,
  resetShowCallDialogue,
  setWaitingCounter,
  setShowUnavailableDialogue,
  resetShowUnavailableDialogue,
  setChatToken,
  setChatReqDetails,
  resetChatReqDetails,
  setUploadingMedia,
  setIsUploadingMedia,
  resetChatInitDetails,
  setChatInitDetails,
  setTotalAvaiableConsultationTime,
  resetTotalAvaiableConsultationTime,
  setCounter,
  setIsChatScreenInReadOnlyMode,
  setReadOnlyModeAstrologerName,
  setReadOnlyModeUserId,
  setKundliId,
  setChatHistoryPageNumber,
  setCallHistoryPageNumber,
  setAstrologerName,
  resetAgoraChatRoomId,
  setChatTokenDetails,
  setUUID,
} = agoraCallSlice.actions;
export default agoraCallSlice.reducer;
