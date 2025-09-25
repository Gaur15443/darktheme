import {FirebaseMessagingTypes} from '@react-native-firebase/messaging';
export interface ChatDetails {
  astrologerId?: string;
  userId?: string;
  channelName?: string;
  chatRoomId?: string;
  astrologerPersonalDetails?: AstrologerPersonalDetails;
  displayName: string;
  expiry: number;
  kundliId: string;
}

export interface AstrologerPersonalDetails {
  gender: string;
  relationStatus: string;
  profilepic: string;
  livingStatus: string;
  lastname: string;
  name: string;
}
export function formatChatDetails(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
): ChatDetails {
  let astrologerId = '';
  let userId = '';
  let channelName = '';
  let chatRoomId = '';
  let astrologerPersonalDetails = {
    gender: '',
    relationStatus: '',
    profilepic: '',
    livingStatus: '',
    lastname: '',
    name: '',
  };
  let displayName = '';
  let expiry = 0;
  let kundliId = '';
  if (
    remoteMessage?.data?.chatDetails &&
    typeof remoteMessage?.data?.chatDetails === 'string'
  ) {
    const extractedData = JSON.parse(remoteMessage?.data?.chatDetails);
    astrologerId = extractedData?.astrologerId ?? '';
    userId = extractedData?.userId ?? '';
    channelName = extractedData?.channelName ?? '';
    chatRoomId = extractedData?.chatRoomId ?? '';
    astrologerPersonalDetails = extractedData?.astrologerPersonalDetails ?? {
      gender: '',
      relationStatus: '',
      profilepic: '',
      livingStatus: '',
      lastname: '',
      name: '',
    };
    displayName = extractedData.displayName;
    expiry = extractedData.expiry;
    kundliId = extractedData.kundliId;
  }
  return {
    astrologerId,
    userId,
    channelName,
    chatRoomId,
    astrologerPersonalDetails,
    displayName,
    expiry,
    kundliId,
  };
}
