import {OnGetMedia} from '../../../components/AstroConsultation/AstroAgoraChat';
import {ChatDetails} from '../../../configs/Chats/FormatChatDetails';

interface CallAstrologerPayload {
  uid: number;
  channelName: string;
  expiry: number;
}

interface CallAstrologerResponse {
  uid: number;
  channel: string;
  token: string;
}

export interface BirthPlace {
  placeName: string;
  latitude: number;
  longitude: number;
}

export interface BirthDetails {
  birthDateTime: string;
  birthPlace: BirthPlace;
  timezone: string;
  timezoneString: string;
}

export interface HoroscopeReport {
  generatedStatus: boolean;
  isFormSubmitted: boolean;
}

export interface KundliData {
  _id: string;
  userId: string;
  name: string;
  gender: 'male' | 'female' | 'Unspecified';
  birthDetails: BirthDetails;
  isOwnersKundli: boolean;
  type_of_report: string;
  purpose: string;
  horoscopeReport: HoroscopeReport;
  purchasedReports: any[];
  createdAt: string;
  updatedAt: string;
}

interface GenerateTokenResponse {
  astrologerId: string;
  userId: string;
  channelName: string;
  expiry: string;
  userToken: string;
  astrologerToken: string;
}

interface GenerateTokenPayload {
  astrologerId: string;
  userId: string;
  expiry: number;
  callId: string;
}

interface GenerateChatTokenResponse {
  initiate: string;
  astrologerToken: string;
  userToken: string;
  agoraChatRoomId: string;
}

interface GenerateChatTokenPayload {
  astrologerId: string;
  userId: string;
  expiry: number;
  chatRoomId: string;
}

interface ChatInitDetails {
  chatRoomId: string;
  astrologerId: string;
  userId: string;
  channelName: string;
}

interface QuickReplies {
  chats: {
    quickReplies: Array<string>;
  };
}

interface AgoraCallState {
  loading: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  generatedTokenDetails: GenerateTokenResponse;
  userCallHistory: [] | SingleHistoryCard[];
  userChatHistory: [] | SingleHistoryChatCard[];
  callId: null | string;
  showCallDialogue: boolean;
  showUnavailableDialogue: booleanl;
  waitingCounter: number;
  chatReqDetails: ChatDetails;
  chatToken: string;
  agoraChatRoomId: string;
  uploadingMedia: OnGetMedia[];
  isUploadingMedia: boolean;
  chatInitDetails: ChatInitDetails;
  totalAvaiableConsultationTime: number;
  counter: number;
  usersChats: GetUserChatsResponse[];
  quickReplies: QuickReplies;
  readOnlyMode: boolean;
  readOnlyModeAstrologerName: string;
  readOnlyModeUserId: string;
  kundliData: KundliData;
  kundliId: string;
  chatHistoryPageNumber: number;
  callHistoryPageNumber: number;
  astrologerName: string;
  consultationToasts: ConsultationToasts;
  UUID: string;
}

interface RegisterVoipTokenPayload {
  token: string;
}

interface RegisterVoipTokenResponse {
  store: string;
}

interface AstrologerDataForHistory {
  _id: string;
  personalDetails: {
    gender: 'male' | 'female' | 'Unspecified';
    relationStatus: string;
    profilepic: null | string;
    livingStatus: string;
    lastname: string;
    name: string;
    deviceToken: string;
  };
}

interface SingleHistoryCard {
  _id: string;
  astrologerId: string;
  userId: string;
  duration: number;
  transactionId: string;
  astrologerData: AstrologerDataForHistory;
  callStartedAt: string;
  callStatus: 'CALL_COMPLETED' | 'CALL_MISSED';
  displayName: string;
  amountType: 'CASHBACK_REAL' | 'REAL' | 'CASHBACK' | 'FREE';
  deductedAmount: number;
  ratePerMin: number;
  recordingUrl: string;
  astrologerId: string;
}

interface SingleHistoryChatCard {
  _id: string;
  astrologerId: string;
  userId: string;
  duration: number;
  transactionId: string;
  astrologerData: AstrologerDataForHistory;
  sessionStartedAt: string;
  eventStatus: 'SESSION_ENDED' | 'REQ_MISSED';
  displayName: string;
  amountType: 'CASHBACK_REAL' | 'REAL' | 'CASHBACK' | 'FREE';
  deductedAmount: number;
  ratePerMin: number;
}

interface GetCallHistoryUserResponse {
  history: SingleHistoryCard[];
}

interface GetChatHistoryUserResponse {
  history: SingleHistoryChatCard[];
}

interface InitChatReqToAstrologerResponse {
  initiate: string;
  chatRoomId: string;
  channelName: string;
}
interface InitChatReqToAstrologerPayload {
  astrologerId: string;
  callerBirthDetails: string;
  callerPersonalDetails: {
    gender: string;
    lastname: string;
    livingStatus: string;
    middlename: string;
    name: string;
    nickname: null | string;
    profilepic: string;
    relationStatus: string;
    showNickname: boolean;
  };
  isIos: boolean;
  userToken: string;
  totalAvailableTalkTime: number;
  astrologerPrice: AstrologerPrices;
}

interface LogChatEndPayload {
  chatRoomId: string;
  endedBy: string;
  isExpired: boolean;
}

interface LogChatEndResponse {
  capture: string;
}

interface ChatMedia {
  mediaUrl: string;
  mediaType: string;
  _id: string;
}

interface GetUserChatsResponse {
  _id: string;
  messageId: string;
  chatRoomId: string;
  senderId: string;
  createdAt: Date;
  text: string;
  media: Array<ChatMedia>;
  user: {
    _id: string;
  };
}

interface ConsulationEndUserPayload {
  consultationType: string;
  astrologerId: string;
  astrologerName: string;
}

interface ConsultationEndResponse {
  messsge: string;
}

interface IsCallActiveResponse {
  isInCall: boolean;
}

interface IsChatActiveResponse {
  isInChatSession: boolean;
}

type TextPair = {
  text1: string;
  text2: string;
};

type ConsultationToasts = {
  consultation: {
    battery: TextPair;
    network: TextPair;
    permissions: TextPair;
    run_time_errors: {
      invalid_astrologer_cost: TextPair;
      invalid_consultation_time: TextPair;
      invalid_astrologer_token_calls: TextPair;
      invalid_astrologer_token_chats: TextPair;
      message_not_sent: TextPair;
      error_leaving_chat_room: TextPair;
    };
    download_error: {
      compatibility_error: TextPair;
      network: TextPair;
    };
    notify_me: {
      success: string;
    };
  };
};
