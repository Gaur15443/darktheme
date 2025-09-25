import React from 'react';
import {Text, Portal, Button, Modal, useTheme} from 'react-native-paper';
import {Pressable, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {usePushNotification} from '../../../context/PushNotificationContext';
import {AppDispatch, RootState} from '../../../store';
import {setShouldOpenGlobalPopUp} from '../../../store/apps/pushnotification';
import GradientView from '../../../common/gradient-view';
import PushPopupIcon from '../../../images/Icons/PushPopupIcon';
import {CrossIcon} from '../../../images';
import Toast from 'react-native-toast-message';
import PushPopUpMicIcon from '../../../images/Icons/PushPopUpMicIcon';

export default function GlobalPermissionPopUp({
  children,
}: {
  children: React.ReactNode;
}) {
  const pushContext = usePushNotification();
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const isGlobalPopUpOpen = useSelector(
    (state: RootState) => state.pushNotificationSlice.isGlobalPopUpOpen,
  );
  const popUpType = useSelector(
    (state: RootState) => state.pushNotificationSlice.popUpType,
  );

  async function onConfirrmPress() {
    await pushContext.requestNotificationPermission();
  }

  function onDismiss(showToast: boolean = true) {
    if (showToast) {
      if (popUpType === 'push') {
        Toast.show({
          type: 'error',
          text1: 'Please enable notifications to receive call alerts.',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Please enable microphone access for calls.',
        });
      }
    }
    dispatch(setShouldOpenGlobalPopUp(false));
  }

  return (
    <>
      <Portal>
        <Modal
          onDismiss={() => onDismiss(true)}
          dismissable={true}
          visible={isGlobalPopUpOpen}
          theme={{
            colors: {
              backdrop: '#000000E5',
            },
          }}
          style={{
            paddingHorizontal: 15,
          }}
          contentContainerStyle={{
            backgroundColor: 'transparent',
          }}>
          <View>
            <Pressable
              onPress={() => onDismiss(true)}
              style={{
                position: 'absolute',
                zIndex: 1,
                right: -12,
                top: -12,
                backgroundColor: '#fff',
                borderRadius: 12,
                height: 24,
                width: 24,
                overflow: 'hidden',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              {/* @ts-ignore */}
              <CrossIcon fill="#000" width={8} height={8} />
            </Pressable>
            <View
              style={{
                borderRadius: 8,
                overflow: 'hidden',
              }}>
              <GradientView
                style={{}}
                variant="modal"
                contentStyle={{
                  padding: 16,
                  borderRadius: 8,
                  paddingBlock: 24,
                  justifyContent: 'center',
                }}>
                <View style={{justifyContent: 'center', alignItems: 'center'}}>
                  {popUpType === 'push' ? (
                    <PushPopupIcon />
                  ) : (
                    <PushPopUpMicIcon />
                  )}
                </View>
                <View style={{gap: 6, marginBottom: 10}}>
                  <Text
                    // @ts-ignore
                    variant="bold"
                    style={{
                      textAlign: 'center',
                      fontSize: 18,
                      fontWeight: '600',
                      color: 'white',
                    }}>
                    {popUpType === 'push'
                      ? 'Get Notified!'
                      : 'Turn On Microphone to Proceed!'}
                  </Text>
                  <Text
                    style={{
                      textAlign: 'center',
                      fontSize: 14,
                      color: 'rgba(255, 255, 255, 0.75)',
                    }}>
                    {popUpType === 'push'
                      ? 'Enable notifications for personalized astrology insights, reports and more.'
                      : 'Please enable your mic to proceed with a consultation'}
                  </Text>
                </View>
                <View
                  style={{gap: 13, justifyContent: 'center', marginTop: 24}}>
                  <Button
                    onPress={async () => {
                      onConfirrmPress();
                      onDismiss(false);
                    }}
                    mode="contained"
                    theme={{
                      colors: {
                        primary: '#fff',
                        onPrimary: 'rgba(105, 68, 211, 1)',
                      },
                    }}
                    style={{borderRadius: 8}}>
                    {popUpType === 'push'
                      ? 'Yes, enable notifications'
                      : 'Yes, enable mic'}
                  </Button>
                  <Button
                    onPress={() => onDismiss(true)}
                    mode="text"
                    theme={{
                      colors: {
                        primary: '#fff',
                      },
                    }}
                    style={{borderRadius: 8}}>
                    Not now
                  </Button>
                </View>
              </GradientView>
            </View>
          </View>
        </Modal>
      </Portal>
      {children}
    </>
  );
}
