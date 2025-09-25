import React, {
    useCallback,
    useRef,
    forwardRef,
    useImperativeHandle,
    useMemo,
} from 'react';
import {
    TouchableOpacity,
    View,
    StyleSheet,
    Dimensions,
    TouchableWithoutFeedback,
    Platform,
} from 'react-native';

import BottomSheet, {
    BottomSheetView,
    WINDOW_HEIGHT,
} from '@gorhom/bottom-sheet';
import { CloseIcon } from '../../../../images/Icons/ModalIcon';
import { Portal, Modal, Text, Divider, RadioButton, Button } from 'react-native-paper';
import Axios from '../../../../plugin/Axios';
import { SettingIcon } from '../../../../images';
import Toast from 'react-native-toast-message';
import CommunityCustomRadio from './CommunityCustomRadio';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';


const NotificationBottomSheet = forwardRef(
    (
        {
            enableCrossIcon,
            options = [
                { value: 'ALL', label: 'Allow notifications', description: 'Turn on all notifications' },
                { value: 'MUTE', label: 'Mute all notifications', description: 'Turn off all notifications from this community' },
                { value: 'ONLYUSER', label: 'Notify only for interactions involving me', description: 'Get notifications only for comments, replies or reactions on posts you create or engage with' },
            ],
            snapPoints: propSnapPoints,
            contentHeight,
            titleFontWeight,
            customTitleStyle = {},
            titleVariant,
            enableDynamicSizingProp,
            disableSnapPoint,
            hideIndicator = false,
            communityId,
            preferenceValue
        },
        ref,
    ) => {
        const bottomSheetRef = useRef(null);
        const [isVisible, setIsVisible] = React.useState(false);
        const [selectedOption, setSelectedOption] = React.useState(preferenceValue);
        const insets = useSafeAreaInsets();
        const toastMessages = useSelector(
            state => state?.getToastMessages?.toastMessages?.Communities,
        );

        React.useEffect(() => {
            setSelectedOption(preferenceValue);
        }, [preferenceValue]);

        const snapPoints = useMemo(() => {
            if (propSnapPoints) {
                return propSnapPoints;
            } else if (contentHeight) {
                const screenHeight = Dimensions.get('window').height;
                const percentage = Math.min((contentHeight / screenHeight) * 100, 90); // Cap at 90%
                return [`${percentage}%`];
            } else {
                return ['25%']; // Default fallback - higher by default
            }
        }, [propSnapPoints, contentHeight]);

        const handleOpenPress = useCallback(() => {
            setIsVisible(true);
        }, []);

        const handleClosePress = useCallback(() => {
            bottomSheetRef.current?.close();
            setIsVisible(false);
        }, []);

        useImperativeHandle(ref, () => ({
            open: handleOpenPress,
            close: handleClosePress,
        }));

        const handleBackgroundPress = useCallback(() => {
            handleClosePress();
        }, [handleClosePress]);

        const updateNotificationSetting = async (communityId, selectedOption) => {
            try {
                const response = await Axios.put(`/notification-preference`, {
                    communityId: communityId,
                    preference: selectedOption
                });
                if (response.status === 200) {
                    Toast.show({
                        type: 'success',
                        text1:
                            toastMessages?.['5014'],
                    });
                }
            } catch (error) {
                throw error;
            }
        };

        return (
            <Portal>
                <Modal
                    transparent={true}
                    visible={isVisible}
                    style={{ marginBottom: 0, marginTop: 0 }}
                    contentContainerStyle={{
                        flex: 1,
                        height: '100%',
                        marginTop: 0,
                        justifyContent: 'flex-end',
                    }}
                    onRequestClose={handleClosePress}
                    animationType="fade">
                    <View style={styles.overlay}>
                        <BottomSheet
                            ref={bottomSheetRef}
                            index={0}
                            enableDynamicSizing={enableDynamicSizingProp || true}
                            snapPoints={disableSnapPoint ? snapPoints : null}
                            enablePanDownToClose={true}
                            onClose={handleClosePress}
                            backgroundStyle={styles.bottomSheet}
                            handleIndicatorStyle={[
                                styles.indicator,
                                hideIndicator ? { height: 0 } : {},
                            ]}>
                            <BottomSheetView
                                style={[styles.bottomDialogContainer]}>
                                <View style={{ flexDirection: 'row', marginLeft: -5, }}>
                                    <SettingIcon />
                                    <Text
                                        variant={titleVariant || 'titleLarge'}
                                        style={{
                                            fontWeight: titleFontWeight || '700',
                                            fontSize: 18,
                                            marginBottom: 10,
                                            marginLeft: 5,
                                            ...customTitleStyle,
                                        }}>
                                        Notification Settings
                                    </Text>
                                </View>

                                <RadioButton.Group
                                    onValueChange={value => {
                                        setSelectedOption(value);
                                        const selected = options.find(opt => opt.value === value);
                                        // if (selected?.onPress) selected.onPress();
                                    }}
                                    value={selectedOption}
                                >
                                    {options.map(({ value, label, description }, index) => (
                                        <View
                                            key={value}
                                            style={styles.radioOptionContainer}
                                        >
                                            {/* <RadioButton value={value} /> */}
                                            <CommunityCustomRadio value={value} onPress={() => setSelectedOption(value)} checked={selectedOption === value} accessibilityLabel="Muting-Notification-Radio" />
                                            <View style={{ flex: 1, flexDirection: 'column' }}>
                                                <Text
                                                    style={{
                                                        color: '#444444',
                                                        fontFamily: 'PublicSans Bold',
                                                        fontSize: 16,
                                                        marginTop: 5,
                                                        fontWeight: 600,
                                                        flexShrink: 1, // allows wrapping if necessary
                                                    }}
                                                    numberOfLines={0} // allows unlimited lines
                                                >
                                                    {label}
                                                </Text>
                                                <Text
                                                    style={{
                                                        color: '#888888',
                                                        fontSize: 14,
                                                        flexShrink: 1,
                                                        fontFamily: 'PublicSans Bold',
                                                        fontWeight: 600,
                                                    }}
                                                    numberOfLines={0}
                                                >
                                                    {description}
                                                </Text>
                                            </View>
                                        </View>
                                    ))}
                                </RadioButton.Group>
                                <Button
                                    textColor='#fff'
                                    mode="contained"
                                    labelStyle={{ fontSize: 18 }}
                                    accessibilityLabel="Muting-Notification-Confirm"
                                    onPress={async () => {
                                        const selected = options.find(opt => opt.value === selectedOption);
                                        if (selected?.onPress) {
                                            selected.onPress(); // optional local behavior
                                        }

                                        try {
                                            await updateNotificationSetting(communityId, selectedOption);
                                            // Optional: show a success message or toast
                                        } catch (error) {
                                            // Optional: show an error message or toast/snackbar
                                        }

                                        handleClosePress();
                                    }}
                                    style={[styles.confirmButton, { marginBottom: insets.bottom }]}>
                                    Confirm
                                </Button>
                            </BottomSheetView>
                        </BottomSheet>
                    </View>
                    {/* Overlay to close the bottom sheet */}
                    <TouchableWithoutFeedback onPress={handleClosePress}>
                        <View
                            style={{
                                flex: 1,
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: WINDOW_HEIGHT / 2.3,
                            }}
                        />
                    </TouchableWithoutFeedback>
                </Modal>
            </Portal>
        );
    },
);

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        position: 'relative',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    bottomSheet: {
        backgroundColor: 'white',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    indicator: {
        backgroundColor: 'gray',
        width: 40,
    },
    bottomDialogContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        maxHeight: Dimensions.get('window').height * 0.5,
        paddingVertical: 23,
        paddingHorizontal: 25,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    headerText: {
        fontSize: 20,
        color: 'black',
    },
    buttonStyle: {
        alignItems: 'center',
        width: '100%',
        flexDirection: 'row',
        paddingLeft: 30,
        paddingTop: 10,
        paddingBottom: 10,
    },

    icon: {
        width: 24,
        height: 24,
    },
    radioOptionContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start', // align top when height increases
        padding: 3,
        // borderWidth: 1,
        paddingVertical: 10
    },

    confirmButton: {
        marginTop: 10,
        marginHorizontal: 15,
        borderRadius: 8,
        paddingVertical: 5,
    }
});

export default NotificationBottomSheet;
