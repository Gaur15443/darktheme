import {FirebaseMessagingTypes} from '@react-native-firebase/messaging';
import {showCallNotifiation} from './ShowCallRequestNotification';

export default function incommingCallNotificationHandler(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
) {
  if (
    remoteMessage?.data?.callDetails &&
    typeof remoteMessage?.data?.callDetails === 'string'
  ) {
    const callerDetails = JSON.parse(remoteMessage?.data?.callDetails);
    showCallNotifiation(callerDetails);
  }
  return;
}
