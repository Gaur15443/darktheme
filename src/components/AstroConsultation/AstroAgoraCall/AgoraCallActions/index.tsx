import React, {useMemo, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  resetShowUnavailableDialogue,
  setShowCallDialogue,
} from '../../../../store/apps/agora';
import {useNavigation} from '@react-navigation/native';
import {AppDispatch, RootState} from '../../../../store';
import Confirm from '../../../Confirm';
import BackgroundTimer from '../../../../common/BackgroundCounter/BackgroundCounterConfig';
import ErrorBoundary from '../../../../common/ErrorBoundary';

export default function CallDeclinePopUp({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const astrologerDidNotPickup = useSelector((state: RootState) => {
    return state.agoraCallSlice.showUnavailableDialogue;
  });
  const astrologerName = useSelector(
    (state: RootState) => state.agoraCallSlice.astrologerName,
  );

  function _reset() {
    dispatch(resetShowUnavailableDialogue());
    //@ts-ignore
    navigation.navigate('AstroBottomTabs', {
      screen: 'Consultation',
    });
  }

  const showAstrologerUnavailableDialogue = useMemo(() => {
    if (astrologerDidNotPickup === true) {
      dispatch(setShowCallDialogue(false));
      BackgroundTimer.clearInterval();
    }
    return astrologerDidNotPickup === true;
  }, [astrologerDidNotPickup]);

  return (
    <ErrorBoundary>
      {showAstrologerUnavailableDialogue && (
        <Confirm
          showCross={false}
          isAstrology
          onContinue={() => {
            _reset();
          }}
          discardCtaText={false}
          continueCtaText={'Explore more'}
          confirmButtonStyle={{backgroundColor: 'rgba(255, 79, 79, 1)'}}
          subTitle={null}
          title={`${astrologerName} is currently busy. Please try again later or click "Explore More" to connect with another astrologer.`}
          backgroundColor={'rgba(42, 32, 83, 0.9)'}
          titleStyle={{
            color: 'white',
            paddingTop: 25,
          }}
        />
      )}
      {children}
    </ErrorBoundary>
  );
}
