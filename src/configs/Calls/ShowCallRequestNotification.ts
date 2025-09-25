import {
  onDisplayCallNotification,
  playRingTone,
} from './CallNotificationConfig';
import {formatCallerDetails} from '../../components/AstroConsultation/Utils/FormatCallerDetails';
import {Platform} from 'react-native';
export interface CallerDetails {
  astrologer: {
    _token: string;
    astrologerId: string;
  };
  callId: string;
  channel: string;
  expiry: number;
  gender: string;
  lastname: string;
  livingStatus: string;
  name: string;
  profilepic: string | null;
  relationStatus: string;
  displayName: string;
  user: {
    _token: string;
    userId: string;
  };
}
export function showCallNotifiation(callerDetails: CallerDetails) {
  const extractedData = formatCallerDetails(callerDetails);
  if (Platform.OS === 'android') {
    onDisplayCallNotification(extractedData);
    playRingTone();
  }
}
