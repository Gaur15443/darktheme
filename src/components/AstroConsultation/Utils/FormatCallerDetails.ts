import moment from 'moment';
import {CallerDetails} from '../../../configs/Calls/ShowCallRequestNotification';
export interface FormattedCallerDetails {
  channelName: string;
  userId: string;
  expiry: number;
  gender: string;
  fullName: string;
  profilePic: string;
  astrologerId: string;
  callId: string;
  displayName: string;
}
export function formatCallerDetails(
  callerDetails: CallerDetails,
): FormattedCallerDetails {
  const channelName = callerDetails?.channel ?? '';
  const userId = callerDetails?.user?.userId ?? '';
  const expiry = callerDetails?.expiry ?? 0;
  const gender = callerDetails?.gender ?? '';
  const fullName = callerDetails?.name + ' ' + callerDetails?.lastname;
  const profilePic = callerDetails?.profilepic ?? '';
  const astrologerId = callerDetails?.astrologer.astrologerId ?? '';
  const callId = callerDetails?.callId ?? '';
  const displayName = callerDetails?.displayName ?? '';

  return {
    channelName,
    userId,
    expiry,
    gender,
    fullName,
    profilePic,
    astrologerId,
    callId,
    displayName,
  };
}
