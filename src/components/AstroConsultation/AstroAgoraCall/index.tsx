import React, {
  memo,
  forwardRef,
  useImperativeHandle,
  useEffect,
  useMemo,
} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import Confirm from '../../Confirm';

import {callAstrologer, setChatReqDetails} from '../../../store/apps/agora';
import {AppDispatch, RootState} from '../../../store';
import DialogContents from './DialogContents';

import {
  AstrologerPrices,
  CallAstrologerFunctions,
  CallReqDetails,
  ChatReqInitDetails,
} from '../AstroBirthDetailsTabs/AstroBirthDetailsTabs';
import {AstroBirthDetaisFormValues} from '../AstroBirthDetailsTabs/AstroBirthDetailsForm';
import {Platform} from 'react-native';
import ErrorBoundary from '../../../common/ErrorBoundary';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AstroAgoraCallInitiateProps {
  children: React.ReactNode;
  astrologerId: string;
  selectedFeature: 'Call' | 'Chat';
  chatReqInitDetails?: ChatReqInitDetails;
  callReqDetails?: CallReqDetails;
}

const AstroAgoraCallInitiate = forwardRef<
  CallAstrologerFunctions,
  AstroAgoraCallInitiateProps
>(
  (
    {
      children,
      astrologerId,
      selectedFeature = 'Call',
      chatReqInitDetails,
      callReqDetails,
    }: AstroAgoraCallInitiateProps,
    ref,
  ) => {
    const isDialogueOpen = useSelector(
      (state: RootState) => state.agoraCallSlice.showCallDialogue,
    );
    const loggedInUserPersonalDetails = useSelector<RootState>(
      state => state?.userInfo?.personalDetails,
    );
    const dispatch = useDispatch<AppDispatch>();

    const initiateCallToAstrologer = async (
      kundliId: string,
      totalAvailableTalkTime: number,
      astrologerPrice: AstrologerPrices,
    ): Promise<{
      callId: string;
      astrologerId: string;
      initiate: string;
    }> => {
      try {
        const payload: any = {
          astrologerId: astrologerId,
          callerPersonalDetails: loggedInUserPersonalDetails,
          callerBirthDetails: kundliId,
          isIos: Platform.OS === 'ios',
          totalAvailableTalkTime: totalAvailableTalkTime,
          userToken:
            Platform.OS === 'ios'
              ? await AsyncStorage.getItem('voipToken')
              : '',
          astrologerPrice,
        };
        console.log('payload', payload);
        const data = await dispatch(callAstrologer(payload)).unwrap();
        return data;
      } catch (error) {
        console.error('Error:', error);
        throw new Error((error as Error).message);
      }
    };

    useImperativeHandle(ref, () => ({
      callAstrologer: initiateCallToAstrologer,
    }));

    return (
      <ErrorBoundary>
        {isDialogueOpen && (
          <Confirm
            isAstrology
            showCross={false}
            discardCtaText={false}
            continueCtaText={false}
            subTitle={null}
            title={
              selectedFeature === 'Call' ? 'Call Initiated!' : 'Chat Initiated!'
            }
            components={
              <DialogContents
                chatReqInitDetails={chatReqInitDetails}
                selectedFeature={selectedFeature}
                callReqDetails={callReqDetails}
              />
            }
            backgroundColor={'rgba(42, 32, 83, 0.9)'}
            titleStyle={{
              color: 'white',
            }}
          />
        )}
        {children}
      </ErrorBoundary>
    );
  },
);

export default memo(AstroAgoraCallInitiate);
