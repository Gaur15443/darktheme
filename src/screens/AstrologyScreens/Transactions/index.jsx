import { Pressable, View } from 'react-native'
import React, { memo, useCallback } from 'react'
import { Appbar, Text, useTheme } from 'react-native-paper'
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import GradientView from '../../../common/gradient-view';

function Transactions() {
    const theme = useTheme();
    const navigator = useNavigation();
    const personalDetails = useSelector(state => state.userInfo.personalDetails);

    const goBack = useCallback(() => {
        navigator.goBack();
    }, []);
    return (
        <View style={{
            flex: 1,
            backgroundColor: theme.colors.background,
        }}>
            <Appbar.Header
                theme={{
                    colors: {
                        surface: theme.colors.background,
                    },
                }}
            >
                <Appbar.BackAction color="#FFF" onPress={goBack} />
                <Appbar.Content title="Transaction History" />
            </Appbar.Header>

            <View style={{
                paddingHorizontal: 16
            }}>
                <GradientView style={{
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    padding: 12,
                    height: 200,
                }}
                    contentStyle={{
                        gap: 10,
                        justifyContent: 'center',
                    }}
                >
                    <Pressable style={{
                        backgroundColor: "#27C394",
                        padding: 4,
                        borderRadius: 4,
                        width: 67
                    }}>
                        <Text style={{ fontSize: 10 }}>Completed</Text>
                    </Pressable>
                    <Text variant='bold' style={{ fontSize: 16 }}>Career report</Text>
                    <Text style={{ fontSize: 12 }}>Transaction ID: 52631489  ·  Order ID: 52631489</Text>
                    <Text variant='bold' style={{ fontSize: 12 }}>22 December, 2024  ·  09:52 PM</Text>
                    <Pressable style={{
                        backgroundColor: "#FFFFFF33",
                        paddingBlock: 6,
                        paddingHorizontal: 12,
                        borderRadius: 4,
                        width: 88,
                        height: 46,
                        justifyContent: 'center',
                        alignContent: 'center',
                    }}>
                        <Text variant='bold' style={{ fontSize: 11 }}>Credit Card</Text>
                    </Pressable>
                </GradientView>

                <GradientView variant='modal' colors={['#FF4F4F1A', '#0E0E10']} style={{
                    marginTop: 10,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    padding: 12,
                }}
                    contentStyle={{
                        gap: 10,
                        justifyContent: 'center',
                    }}
                >
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <Pressable style={{
                            backgroundColor: "#FF4F4F",
                            padding: 4,
                            borderRadius: 4,
                            width: 67,
                            height: 24
                        }}>
                            <Text style={{ fontSize: 10, textAlign: 'center' }}>Failed</Text>
                        </Pressable>
                        <Pressable style={{
                            padding: 4,
                            borderRadius: 4,
                            width: 67,
                            borderWidth: 1,
                            borderColor: '#FFFFFF',
                            padding: 10
                        }}>
                            <Text style={{ fontSize: 10, textAlign: 'center' }}>Retry</Text>
                        </Pressable>
                    </View>
                    <Text variant='bold' style={{ fontSize: 16 }}>Career report</Text>
                    <Text style={{ fontSize: 12 }}>Transaction ID: 52631489  ·  Order ID: 52631489</Text>
                    <Text variant='bold' style={{ fontSize: 12 }}>22 December, 2024  ·  09:52 PM</Text>
                    <Pressable style={{
                        backgroundColor: "#FFFFFF33",
                        paddingBlock: 6,
                        paddingHorizontal: 12,
                        borderRadius: 4,
                        width: 46,
                        justifyContent: 'center',
                        alignContent: 'center',
                    }}>
                        <Text variant='bold' style={{ fontSize: 11 }}>UPI</Text>
                    </Pressable>
                </GradientView>
            </View>
        </View>
    )
}

Transactions.displayName = 'Transactions';

export default memo(Transactions)