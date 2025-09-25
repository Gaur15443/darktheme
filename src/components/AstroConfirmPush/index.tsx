import React from 'react';
import { Text, Portal, Button, Modal, useTheme } from 'react-native-paper'
import GradientView from '../../common/gradient-view';
import { Pressable, View } from 'react-native';
import { CrossIcon } from '../../images';
import PushPopupIcon from '../../images/Icons/PushPopupIcon';
import { usePushNotification } from '../../context/PushNotificationContext';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setRequestedInCurrentSession, setRequestPermissionState } from '../../store/apps/pushnotification';

export default function AstroConfirmPush({ onClose }: { onClose?: () => void }) {
    const dispatch = useDispatch();
    const theme = useTheme();
    const pushContext = usePushNotification();
    const shouldRequestPush = useSelector((state: RootState) => state.pushNotificationSlice.shouldRequestPush);
    const requestedInCurrentSession = useSelector((state: RootState) => state.pushNotificationSlice.requestedInCurrentSession);

    async function requestNotification() {
        await pushContext.requestNotificationPermission();
        dispatch(setRequestedInCurrentSession(true));
    }
    function togglePopUp() {
        if (shouldRequestPush && typeof onClose === 'function') {
            onClose();
        }
        dispatch(setRequestPermissionState(!shouldRequestPush));
    }

    return <Portal>
        <Modal
            onDismiss={togglePopUp}
            dismissable={true}
            visible={shouldRequestPush && !requestedInCurrentSession}
            theme={{
                colors: {
                    backdrop: '#000000E5'
                }
            }}
            style={{
                paddingHorizontal: 15,
            }}
            contentContainerStyle={{
                backgroundColor: 'transparent',
            }}>
            <View>
                <Pressable
                    onPress={togglePopUp}
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
                        alignItems: 'center'
                    }}>
                    <CrossIcon fill='#000' width={8} height={8} />
                </Pressable>
                <View
                    style={{
                        borderRadius: 8,
                        overflow: 'hidden',
                    }}>
                    <GradientView
                        style={{}}
                        variant='modal'
                        contentStyle={{
                            padding: 16,
                            borderRadius: 8,
                            paddingBlock: 24,
                            justifyContent: 'center',
                        }}>
                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <PushPopupIcon />
                        </View>
                        <View style={{ gap: 6, marginBottom: 10 }}>
                            <Text
                                // @ts-ignore
                                variant='bold'
                                style={{
                                    textAlign: 'center',
                                    fontSize: 18,
                                    fontWeight: '600'
                                }}>
                                Get Notified!
                            </Text>
                            <Text
                                style={{
                                    textAlign: 'center',
                                    fontSize: 14,
                                }}>
                                Enable notifications for personalized astrology insights, reports and more.
                            </Text>
                        </View>
                        <View style={{ gap: 13, justifyContent: 'center', marginTop: 24 }}>
                            <Button
                                onPress={async () => {
                                    await requestNotification();
                                    togglePopUp();
                                }}
                                mode="contained"
                                theme={{
                                    colors: {
                                        primary: '#fff',
                                        onPrimary: theme.colors.primary,
                                    },
                                }}
                                style={{ borderRadius: 8, }}>
                                Yes, enable notifications
                            </Button>
                            <Button
                                onPress={togglePopUp}
                                mode="text"
                                theme={{
                                    colors: {
                                        primary: '#fff',
                                    },
                                }}
                                style={{ borderRadius: 8, }}>
                                Not now
                            </Button>
                        </View>
                    </GradientView>
                </View>
            </View>
        </Modal>
    </Portal>
}