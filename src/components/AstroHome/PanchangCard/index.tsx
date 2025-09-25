import React from "react";
import { memo } from "react"
import { View } from "react-native";
import MoonIcon from "../../../images/Icons/MoonIcon";
import SunIcon from "../../../images/Icons/SunIcon";
import { Text, Button } from "react-native-paper";
import { PanchangDataProps } from "./index.d";
import { useNavigation } from "@react-navigation/native";
import ErrorBoundary from "../../../common/ErrorBoundary";
import { Track } from "../../../../App";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import PanchangIcon from "../../../images/Icons/PanchangIcon";

function formatDateWithDayName(dateString: string) {
    if (!dateString) return '';

    const date = new Date(dateString);

    const day = new Intl.DateTimeFormat('en-GB', { day: '2-digit' }).format(date);
    const month = new Intl.DateTimeFormat('en-GB', { month: 'long' }).format(date);
    const weekday = new Intl.DateTimeFormat('en-GB', { weekday: 'long' }).format(
        date,
    );

    return `${day} ${month} (${weekday})`;
}
function formatTimeWithoutSeconds(timeString) {
    // Regular expression to match the time format (HH:MM:SS AM/PM or HH:MM:SS)
    const timeRegex = /(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)?/;
    const match = timeString?.match?.(timeRegex);

    if (match) {
        let hours = parseInt(match[1]);
        const minutes = match[2];
        const amPm = match[4];

        if (amPm) {
            if (amPm.toUpperCase() === "PM" && hours < 12) {
                hours += 12;
            } else if (amPm.toUpperCase() === "AM" && hours === 12) {
                hours = 0;
            }
        }

        const formattedHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;

        return `${formattedHours}:${minutes} ${amPm || ''}`.trim();
    } else {
        return "Invalid time format";
    }
}

const PanchangCard = memo(({ data }: { data: PanchangDataProps }) => {
    const navigator = useNavigation();
    const userData = useSelector((state: RootState) => state.userInfo);

    return <ErrorBoundary>
        <View
            style={{
                backgroundColor: '#2B2941',
                padding: 10,
                borderRadius: 8,
                marginBottom: 20,
                borderColor: '#FFFFFF1A',
                borderWidth: 1,
            }}>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 14,
                    marginBottom: 16,
                }}>
                <View
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: '#FFFFFF1A',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                    <PanchangIcon width={24} height={24} />
                </View>
                <Text variant="bold" style={{ fontSize: 18 }}>Panchang</Text>
            </View>
            <View>
                <Text
                    //  @ts-ignore
                    variant="bold"
                    style={{
                        fontSize: 20,
                        textAlign: 'center',
                        paddingBottom: 8,
                    }}>
                    {formatDateWithDayName(data?.date as string)}
                </Text>
                <View
                    style={{ flexDirection: 'row', justifyContent: 'center' }}>
                    <Text
                        style={{
                            fontSize: 12,
                        }}>
                        <Text
                            // @ts-ignore
                            variant="bold"
                            style={{
                                color: '#FFFFFFBF',
                            }}>
                            {data?.tithi?.name} -
                        </Text>
                        {/* TODO: time format */}
                        <Text
                            style={{
                                fontSize: 12,
                                color: '#FFFFFFBF',
                            }}>
                            {' '}
                            {data?.tithi?.start}{' '}
                        </Text>
                    </Text>
                </View>
                <View
                    style={{ flexDirection: 'row', justifyContent: 'center' }}>
                    <Text
                        // @ts-ignore
                        variant="bold"
                        style={{
                            fontSize: 12,
                            color: '#FFFFFFBF',
                        }}>
                        {data?.tithi?.next_tithi} -{' '}
                    </Text>
                    <Text
                        style={{
                            fontSize: 12,
                            color: '#FFFFFFBF',
                        }}>
                        {data?.tithi?.end}
                    </Text>
                </View>
                <View
                    style={{
                        flexDirection: 'row',
                        width: '100%',
                        gap: 16,
                        marginBottom: 10,
                        marginTop: 20,
                    }}>
                    <View
                        style={{
                            flexDirection: 'row',
                            gap: 8,
                            backgroundColor: '#FEF9F133',
                            paddingBlock: 6,
                            paddingHorizontal: 12,
                            borderRadius: 4,
                            height: 36,
                            alignItems: 'center',
                            flex: 1,
                        }}>
                        <SunIcon />
                        <Text
                            style={{
                                fontSize: 10,
                            }}>
                            {formatTimeWithoutSeconds(
                                data?.advanced_details?.sun_rise as string,
                            )}{' '}
                            -{' '}
                            {formatTimeWithoutSeconds(
                                data?.advanced_details?.sun_set as string,
                            )}
                        </Text>
                    </View>
                    <View
                        style={{
                            flex: 1,
                            flexDirection: 'row',
                            gap: 8,
                            backgroundColor: '#FEF9F133',
                            paddingBlock: 6,
                            paddingHorizontal: 12,
                            borderRadius: 4,
                            height: 36,
                            alignItems: 'center',
                        }}>
                        <MoonIcon />
                        <Text
                            style={{
                                fontSize: 10,
                            }}>
                            {formatTimeWithoutSeconds(
                                data?.advanced_details?.moon_rise as string,
                            )}{' '}
                            -{' '}
                            {formatTimeWithoutSeconds(
                                data?.advanced_details?.moon_set as string,
                            )}
                        </Text>
                    </View>
                </View>
                <View>
                    <Button
                        onPress={() => {
                            Track({
                                cleverTapEvent: "Panchang_CTA_Homepage",
                                mixpanelEvent: "Panchang_CTA_Homepage",
                                userData
                            });
                            // @ts-ignore
                            navigator.navigate('Panchang');
                        }}
                        style={{
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: '#ffffff',
                            marginTop: 16,
                        }}
                        mode="outlined">
                        <Text>Check Detailed View</Text>
                    </Button>
                </View>
            </View>
        </View>
    </ErrorBoundary>
});

export default PanchangCard;