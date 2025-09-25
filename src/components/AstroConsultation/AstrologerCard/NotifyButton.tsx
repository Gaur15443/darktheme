import React, {Fragment, memo, useCallback, useState} from 'react';
import {StyleSheet, TouchableOpacity, Pressable, View} from 'react-native';

import {Track} from '../../../../App';
import {RootState} from '../../../store';
import {useSelector} from 'react-redux';
import {ConsultationAxios, TelephonyAxios} from '../../../plugin/Axios';
import {Button, Modal, Portal, useTheme, Text} from 'react-native-paper';
import {CrossIcon} from '../../../images';
import GradientView from '../../../common/gradient-view';
import messaging from '@react-native-firebase/messaging';
import Toast from 'react-native-toast-message';
import type {RecommendedAstrologer} from './types.d';
import RecommendedAstrologers from './RecommendedAstrologers';

function NotifyButton({
  astrologerId,
  astrologerName,
  userData,
}: {
  astrologerId: string;
  astrologerName: string;
  userData: RootState['userInfo'];
}) {
  const theme = useTheme();
  const [recommendedAstrologers, setRecommendedAstrologers] = useState<
    RecommendedAstrologer[]
  >([]);
  const [showAcceptanceLoader, setShowAcceptanceLoader] =
    useState<boolean>(false);

  const [showModal, setShowModal] = useState(false);
  const consultationToasts = useSelector(
    (state: RootState) => state.agoraCallSlice.consultationToasts.consultation,
  );

  const handleNotify = useCallback(async () => {
    try {
      await fetchRecommendedAstrologers();
      setShowModal(true);
      Track({
        cleverTapEvent: 'Notify_CTA_Consultation',
        mixpanelEvent: 'Notify_CTA_Consultation',
        userData,
      });
    } catch (error) {
      /**
       * empty
       */
    }
  }, [userData]);

  const fetchRecommendedAstrologers = useCallback(async () => {
    try {
      const response = await ConsultationAxios.get(
        `/getRecommendedAstrologers/${astrologerId}`,
      );
      setRecommendedAstrologers(response.data);
    } catch (error) {
      /**
       * empty
       */
    }
  }, [astrologerId]);

  const handleNotifyAcceptance = useCallback(async () => {
    try {
      setShowAcceptanceLoader(true);
      Track({
        cleverTapEvent: 'Accept_Notify_popup',
        mixpanelEvent: 'Accept_Notify_popup',
        userData,
      });
      await messaging().subscribeToTopic(astrologerId);
      const payload = {
        userId: userData._id,
        astrologerId: astrologerId,
      };
      await TelephonyAxios.post('/notify/queueUsers', payload);
      Toast.show({
        type: 'success',
        text1:
          consultationToasts?.notify_me?.success ??
          "You'll be notified once the astrologer is available",
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error?.response?.data?.message,
      });
    } finally {
      setShowAcceptanceLoader(false);
      setShowModal(false);
    }
  }, [userData, astrologerId]);

  const handleDismiss = useCallback(() => {
    setShowAcceptanceLoader(false);
    setShowModal(false);
  }, []);
  return (
    <Fragment>
      <TouchableOpacity
        activeOpacity={0.5}
        style={styles.notify}
        onPress={handleNotify}>
        <Text style={{color: 'white', fontSize: 14}}>Notify</Text>
        <Text style={{color: '#FF4F4F', fontSize: 8}}>(Wait ~ 5m)</Text>
      </TouchableOpacity>
      {showModal && (
        <Portal>
          <Modal
            visible={showModal}
            onDismiss={handleDismiss}
            contentContainerStyle={{
              backgroundColor: 'transparent',
              padding: 0,
              marginHorizontal: 16,
            }}>
            <Pressable
              onPress={handleDismiss}
              style={{
                position: 'absolute',
                top: -13,
                right: -8,
                zIndex: 1,
                backgroundColor: '#fff',
                borderRadius: 100,
                justifyContent: 'center',
                alignItems: 'center',
                width: 24,
                height: 24,
              }}
              testID={'cross icon button for recommended'}>
              <CrossIcon
                testID={'cross icon for recommended'}
                fill="#000"
                width={'8'}
                height={'8'}
              />
            </Pressable>
            <GradientView
              style={{borderRadius: 8, overflow: 'hidden'}}
              contentStyle={{
                minHeight: 200,
                width: '100%',
                padding: 19,
                paddingTop: 30,
              }}
              // // background: linear-gradient(257.16deg, rgba(105, 68, 211, 0.1) 2.4%, #0E0E10 98.87%);
              // colors={[]}
              variant="modal">
              <Text
                variant={'bold' as any}
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                  textAlign: 'center',
                  paddingBottom: 10,
                }}>
                {astrologerName} is busy right now
              </Text>
              <Text
                style={{fontSize: 12, textAlign: 'center', paddingBottom: 10}}>
                We'll notify you when the astrologer {'\n'} gets free
              </Text>
              <View style={{gap: 10, marginTop: 10}}>
                <Button
                  disabled={showAcceptanceLoader}
                  loading={showAcceptanceLoader}
                  theme={{
                    colors: {
                      primary: '#fff',
                      onPrimary: theme.colors.primary,
                    },
                  }}
                  style={{borderRadius: 8, overflow: 'hidden'}}
                  mode="contained"
                  onPress={handleNotifyAcceptance}>
                  Yes, notify me
                </Button>
                <Button
                  theme={{
                    colors: {
                      primary: '#fff',
                      onPrimary: '#000',
                    },
                  }}
                  style={{borderRadius: 8}}
                  mode="outlined"
                  onPress={() => setShowModal(false)}>
                  No, it's okay
                </Button>

                <RecommendedAstrologers
                  recommendedAstrologers={recommendedAstrologers}
                />
              </View>
            </GradientView>
          </Modal>
        </Portal>
      )}
    </Fragment>
  );
}

const styles = StyleSheet.create({
  notify: {
    paddingVertical: 2,
    height: 38,
    gap: 1,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'white',
    flexDirection: 'column',
  },
});

export default memo(NotifyButton);
