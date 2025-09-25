import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect} from 'react';
import moment from 'moment';
import {useNavigation} from '@react-navigation/native';
import {getDifferenceInTime} from '../../src/utils/format';

export default function CheckForActiveConsultations({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigation = useNavigation();
  async function checkForActiveConsultations() {
    const consultationStartTime = await AsyncStorage.getItem(
      'consultationInitTime',
    );

    if (consultationStartTime) {
      const data = JSON.parse(consultationStartTime);
      const diffInSeconds = getDifferenceInTime(
        moment(data.consultationInitTime),
        moment(),
      );
      if (diffInSeconds > 50) {
        return;
      } else {
        setTimeout(() => {
          //@ts-ignore
          navigation.navigate('AstroBirthDetailsTabs', {
            astrologerId: data.astrologerId,
            type: data.type,
            rate: data.rate,
            agreedRate: data.agreedRate,
            offerId: data.offerId,
            consultationInitTime: 60 - diffInSeconds,
          });
        }, 3000);
      }
      return diffInSeconds;
    }
    return null;
  }

  useEffect(() => {
    checkForActiveConsultations();
  }, []);
  return <>{children}</>;
}
