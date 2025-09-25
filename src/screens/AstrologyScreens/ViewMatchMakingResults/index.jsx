import { Image, StyleSheet, View, Pressable as RNPressable, ScrollView as RNScrollView, Platform } from 'react-native'
import React, { useCallback, useState } from 'react'
import { Text, useTheme, Icon } from 'react-native-paper'
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import SegmentedCircularProgress from '../../../common/SegmentedCircularProgress';

import { Pressable as GesturePressable, ScrollView as GestureScrollView } from 'react-native-gesture-handler';
import SunIcon from '../../../images/Icons/SunIcon';
import MoonIcon from '../../../images/Icons/MoonIcon';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { capitalize } from '../../../utils/format.js';
import GradientView from '../../../common/gradient-view';
import { useSelector } from 'react-redux';
import { Track } from '../../../../App.js';
import ErrorBoundary from '../../../common/ErrorBoundary/index.jsx';
import AstroHeader from '../../../common/AstroHeader';

const titleWithDescription = new Map([
    ['Varna', 'Compatibility'],
    ['Vasya', 'Dominance'],
    ['Tara', 'Destiny'],
    ['Yoni', 'Physical Compatibility'],
    ['grahamaitri', 'Mental Compatibility'],
    ['Gana', 'Temperament'],
    ['Bhakoot', 'Love'],
    ['Nadi', 'Health']
]);

const titles = Array.from(titleWithDescription.keys());
const subTitles = Array.from(titleWithDescription.values());

function formatTimeWithoutSeconds(timeString) {
    if (!timeString?.length) return '';
    // Regex matches both 12h (HH:MM:SS AM/PM) and 24h (HH:MM:SS or HH:MM)
    const timeRegex = /(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?/i;
    const match = timeString.match(timeRegex);

    if (match) {
        let hours = parseInt(match[1], 10);
        const minutes = match[2];
        let amPm = match[3];

        if (!amPm) {
            amPm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;
        } else {
            if (amPm.toUpperCase() === "PM" && hours < 12) {
                hours += 12;
            } else if (amPm.toUpperCase() === "AM" && hours === 12) {
                hours = 0;
            }
            amPm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;
        }

        return `${hours}:${minutes} ${amPm}`;
    } else {
        return "Invalid time format";
    }
}


function formatToAmPm(time) {
    if (!time?.length) return '';
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'pm' : 'am';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}
function getUTCFromOffset(offset) {
    let sign = offset >= 0 ? "+" : "-";
    let absoluteOffset = Math.abs(offset);
    let hours = Math.floor(absoluteOffset);
    let minutes = (absoluteOffset - hours) * 60;

    return "UTC" + sign + hours.toString().padStart(2, '0') + ":" + minutes.toString().padStart(2, '0');
}

const Pressable = Platform.OS === 'ios' ? RNPressable : GesturePressable;
const ScrollView = Platform.OS === 'ios' ? RNScrollView : GestureScrollView;

function MatchCard({
    dob,
    tob,
    sun_rise,
    sun_set,
    moon_rise,
    moon_set,
    name = '',
    identity = 'Boy',
    lat,
    long,
    timeZone = '',
    ayanamsa,
    location = '',
    profile = ''
}) {
    const styles = StyleSheet.create({
        bottomPill: {
            gap: 8,
            backgroundColor: "#FEF9F133",
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 4,
            height: 62,
            alignItems: 'center',
            justifyContent: 'center',
            flexBasis: '48%',
            flexGrow: 1
        },
        bottomPillValue: {
            fontSize: 14
        },
        bottomPillLabel: {
            fontSize: 12
        }
    });

    return <View style={{
        backgroundColor: '#FFFFFF1A',
        alignItems: 'center',
        borderRadius: 8,
        marginBottom: 10
    }}>
        <Image
            source={{ uri: profile }}
            style={{ aspectRatio: 1, width: 60, borderRadius: 30, marginBlock: 8 }}
        />
        <View style={{ paddingHorizontal: 15 }}>
            <View style={{ alignItems: "center", flexDirection: 'row', justifyContent: 'center' }}>
                <Text style={{ padding: 1, fontSize: 20 }}>{name}</Text>
                <View style={{ width: 4, aspectRatio: 1, backgroundColor: "#fff", marginHorizontal: 4 }} />
                <Text style={{ padding: 1, color: '#6944D3' }}>{identity}</Text>
            </View>

            <Text style={{ textAlign: 'center' }}>Date of birth - <Text>{dob}</Text></Text>
            <Text style={{ textAlign: 'center' }}>Time of birth -  <Text>{formatToAmPm(tob)}</Text></Text>
            <Text style={{ textAlign: 'center', }}>Place of birth -  <Text>{location}</Text></Text>
        </View>
        <View style={{
            flexDirection: 'row',
            width: '100%',
            gap: 6,
            marginBlock: 10,
            paddingHorizontal: 15
        }}>
            <View style={{
                flexDirection: 'row',
                gap: 8,
                backgroundColor: "#FEF9F133",
                paddingBlock: 6,
                paddingHorizontal: 12,
                borderRadius: 4,
                height: 36,
                alignItems: 'center',
                flex: 1
            }}>
                <SunIcon />
                <Text style={{
                    fontSize: 10,
                }}>{formatTimeWithoutSeconds(sun_rise)} - {formatTimeWithoutSeconds(sun_set)}</Text>
            </View>
            <View style={{
                flex: 1,
                flexDirection: 'row',
                gap: 8,
                backgroundColor: "#FEF9F133",
                paddingBlock: 6,
                paddingHorizontal: 12,
                borderRadius: 4,
                height: 36,
                alignItems: 'center'
            }}>
                <MoonIcon />
                <Text style={{
                    fontSize: 10
                }}>{formatTimeWithoutSeconds(moon_rise)}-{formatTimeWithoutSeconds(moon_set)}</Text>
            </View>
        </View>
        {/* Coordinates */}
        <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            width: '100%',
            gap: 6,
            marginVertical: 10,
            paddingHorizontal: 15
        }}>
            <View style={styles.bottomPill}>
                <Text variant='bold' style={styles.bottomPillValue}>{lat}</Text>
                <Text style={styles.bottomPillLabel}>Latitude</Text>
            </View>
            <View style={styles.bottomPill}>
                <Text variant='bold' style={styles.bottomPillValue}>{long}</Text>
                <Text style={styles.bottomPillLabel}>Longitude</Text>
            </View>
            <View style={styles.bottomPill}>
                <Text variant='bold' style={styles.bottomPillValue}>{getUTCFromOffset(timeZone)}</Text>
                <Text style={styles.bottomPillLabel}>Timezone</Text>
            </View>
            <View style={styles.bottomPill}>
                <Text variant='bold' style={styles.bottomPillValue}>{ayanamsa}</Text>
                <Text style={styles.bottomPillLabel}>Ayanamsa</Text>
            </View>
        </View>

    </View>
}

export default function ViewMatchMakingResults() {
    const theme = useTheme();
    const navigator = useNavigation();
    const matchMakingResult = useSelector(state => state.astroMatchMaking.matchMakingResult);
    const userData = useSelector((state) => state.userInfo);
    const [activeTab, setActiveTab] = useState('');

    const goBack = useCallback(() => {
        navigator.goBack();
    }, []);

    useFocusEffect(
        useCallback(() => {
            Track({
                cleverTapEvent: "Matchmaking_Viewed",
                mixpanelEvent: "Matchmaking_Viewed",
                userData
            });
        }, [])
    );

    function calculatePercentage(x) {
        return (x / 36) * 100;

        // if (x >= 1 && x <= 9) return 20;
        // if (x >= 10 && x <= 18) return 30;
        // if (x >= 19 && x <= 27) return 40;
        // if (x >= 28 && x <= 36) return 50;
        // if (x >= 37 && x <= 45) return 60;
        // if (x >= 46 && x <= 54) return 70;
        // if (x >= 55 && x <= 63) return 80;
        // if (x >= 64 && x <= 72) return 90;
        // return 0;
    }

    return (
        <ErrorBoundary.Screen>
            <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
                <AstroHeader>
                    <AstroHeader.BackAction onPress={goBack} />
                    <AstroHeader.Content title="Matchmaking" style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        paddingRight: 10,
                    }}>
                        <Pressable style={styles.sectionInfoCta}
                            onPress={() => navigator.navigate('MatchMakingDefinitions')}
                        >
                            <Text variant='bold' style={{ fontSize: 12, fontWeight: 600 }}>What is this?</Text>
                            <Icon source="arrow-right" size={16} />
                        </Pressable>
                    </AstroHeader.Content>
                </AstroHeader>
                {Object.keys(matchMakingResult || {})?.length > 0 &&
                    <>
                        {/* top section */}
                        <View style={{
                            width: '100%',
                            flexDirection: "row",
                            justifyContent: 'space-between',
                            paddingHorizontal: 14
                        }}>
                            {/* TODO: Each section to be 36/segment size */}
                            <SegmentedCircularProgress segments={8} size={174} radiusOuter={70} radiusInner={35} progress={calculatePercentage(matchMakingResult?.ashtakoot?.response?.score)} />
                            <View style={{
                                justifyContent: 'center',
                            }}>
                                {/* @ts-ignore */}
                                <Text variant='bold' style={{ padding: 1, textAlign: 'left', fontSize: 20 }}>{matchMakingResult?.ashtakoot?.response?.score}/36</Text>
                                <Text>Compatibility Score</Text>
                            </View>
                        </View>
                        {/* bottom section */}
                        <ScrollView style={{ flex: 1, }}>
                            <View style={{ paddingHorizontal: 15, paddingBottom: 100 }}>
                                {/* @ts-ignore */}
                                <ScrollView horizontal>
                                    <View
                                        style={{
                                            padding: 10,
                                            borderBottomWidth: 3,
                                            borderBottomColor: !activeTab ? '#fff' : 'transparent',
                                        }}
                                    >
                                        <Pressable onPress={() => setActiveTab(() => null)}>
                                            <Text variant="bold">Overview</Text>
                                        </Pressable>
                                    </View>
                                    {titles.map((_title, index) => (
                                        <View
                                            key={_title}
                                            style={{
                                                padding: 10,
                                                borderBottomWidth: 3,
                                                borderBottomColor: activeTab === _title ? '#fff' : 'transparent',
                                            }}
                                        >
                                            <Pressable onPress={() => setActiveTab(() => _title)}>
                                                <Text variant="bold">{capitalize(_title)}</Text>
                                            </Pressable>
                                        </View>
                                    ))}
                                </ScrollView>
                                {activeTab && <View style={{ marginBlock: 10 }}>
                                    <GradientView style={{ overflow: 'hidden', borderRadius: 8 }} contentStyle={{ padding: 14, borderRadius: 8 }}>
                                        <Text variant='bold' style={{ fontSize: 20 }}>{matchMakingResult?.ashtakoot?.response?.[activeTab.toLowerCase()]?.[activeTab.toLowerCase()]}/{matchMakingResult.ashtakoot.response?.[activeTab.toLowerCase()].full_score}</Text>
                                        <Text style={{ paddingBlock: 4 }}>
                                            <Text variant='bold' style={{ fontSize: 16 }}>{activeTab?.replace(/^./, c => c.toUpperCase())}</Text>
                                            <Text> ({titleWithDescription.get(activeTab)})</Text>
                                        </Text>
                                        <Text style={{ paddingBlock: 4 }}>
                                            <Text variant='bold' style={{ fontSize: 16 }}>Boy : </Text>
                                            {titles.includes(matchMakingResult?.ashtakoot?.response?.[activeTab.toLowerCase()]['name']) && <Text>{matchMakingResult?.ashtakoot?.response?.[activeTab.toLowerCase()][`boy_${activeTab.toLowerCase()}`]}</Text>}

                                            {!titles.includes(matchMakingResult.ashtakoot.response[activeTab.toLowerCase()]['name']) &&
                                                <Text>{matchMakingResult.ashtakoot.response[activeTab.toLowerCase()][`boy_lord`]}</Text>}

                                        </Text>
                                        <Text style={{ paddingBlock: 4 }}>
                                            <Text variant='bold' style={{ fontSize: 16 }}>Girl : </Text>
                                            {titles.includes(matchMakingResult?.ashtakoot?.response?.[activeTab.toLowerCase()]?.['name']) && <Text>{matchMakingResult.ashtakoot.response[activeTab.toLowerCase()][`girl_${activeTab.toLowerCase()}`]}</Text>}

                                            {!titles.includes(matchMakingResult?.ashtakoot?.response?.[activeTab.toLowerCase()]?.['name']) &&
                                                <Text>{matchMakingResult.ashtakoot.response[activeTab.toLowerCase()][`girl_lord`]}</Text>}
                                        </Text>
                                        <Text>
                                            {activeTab.toLowerCase() !== 'grahamaitri' ? matchMakingResult?.kootCategory?.[capitalize(activeTab.toLowerCase())]?.description :
                                                matchMakingResult.kootCategory?.['Graha_Maitri']?.description}
                                        </Text>
                                    </GradientView>
                                </View>}
                                {!activeTab && <>
                                    <View style={{
                                        flexDirection: 'row',
                                        flexWrap: "wrap",
                                        justifyContent: "space-between",
                                        width: "100%",
                                        marginTop: 10
                                    }}>
                                        {titles.map((title, index) => (
                                            <View key={title} style={{
                                                height: 175,
                                                width: '48%',
                                                backgroundColor: '#2B2941',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                borderRadius: 8,
                                                marginBottom: 15,
                                            }}>
                                                <View style={{ position: 'relative', justifyContent: 'center', alignItems: 'center' }}>
                                                    <AnimatedCircularProgress
                                                        size={40}
                                                        width={5}
                                                        fill={(matchMakingResult.ashtakoot.response?.[title.toLowerCase()]?.[title.toLowerCase()]) / (matchMakingResult.ashtakoot.response?.[title.toLowerCase()]?.full_score) * 100}
                                                        tintColor="#fff"
                                                        backgroundColor="#3d5875"
                                                    />
                                                    {title !== 'grahamaitri' ?
                                                        <Image
                                                            style={{
                                                                position: 'absolute',
                                                                width: 20,
                                                                height: 20,
                                                                resizeMode: 'contain',
                                                            }}
                                                            source={{ uri: matchMakingResult?.kootCategory?.[capitalize(title)]?.imageUrl }}
                                                        /> :
                                                        <Image
                                                            style={{
                                                                position: 'absolute',
                                                                width: 20,
                                                                height: 20,
                                                                resizeMode: 'contain',
                                                            }}
                                                            source={{ uri: matchMakingResult?.kootCategory?.['Graha_Maitri']?.imageUrl }}
                                                        />}
                                                </View>

                                                {/* @ts-ignore */}
                                                <Text style={{ padding: 1, fontSize: 22 }}>
                                                    <Text style={{ fontWeight: 'bold' }}>
                                                        {matchMakingResult?.ashtakoot?.response?.[title.toLowerCase()]?.[title.toLowerCase()]} /
                                                    </Text>
                                                    {matchMakingResult?.ashtakoot?.response?.[title.toLowerCase()]?.full_score}
                                                </Text>

                                                <Text style={{ padding: 1, fontSize: 16, }} variant='bold'>{capitalize(title)}</Text>
                                                <Text style={{
                                                    textAlign: 'center'
                                                }}>({subTitles[index]})</Text>
                                            </View>
                                        ))}
                                    </View>
                                </>}
                                <MatchCard
                                    dob={matchMakingResult.payloadCoupleData.boy_dob}
                                    tob={matchMakingResult.payloadCoupleData.boy_tob}
                                    moon_rise={matchMakingResult.malePanchangData.moon_rise}
                                    moon_set={matchMakingResult.malePanchangData.moon_set}
                                    sun_rise={matchMakingResult.malePanchangData.sun_rise}
                                    sun_set={matchMakingResult.malePanchangData.sun_set}
                                    ayanamsa={matchMakingResult.malePanchangData.ayanamsa?.name}
                                    lat={matchMakingResult.payloadCoupleData.boy_lat}
                                    long={matchMakingResult.payloadCoupleData.boy_lon}
                                    timeZone={matchMakingResult.payloadCoupleData.boy_tz}
                                    name={matchMakingResult.payloadCoupleData.boy_name}
                                    location={matchMakingResult.payloadCoupleData.boy_place}
                                    identity='Boy'
                                    profile={matchMakingResult.maleRashiData?.url}
                                />
                                <MatchCard
                                    dob={matchMakingResult.payloadCoupleData.girl_dob}
                                    tob={matchMakingResult.payloadCoupleData.girl_tob}
                                    moon_rise={matchMakingResult.femalePanchangData.moon_rise}
                                    moon_set={matchMakingResult.femalePanchangData.moon_set}
                                    sun_rise={matchMakingResult.femalePanchangData.sun_rise}
                                    sun_set={matchMakingResult.femalePanchangData.sun_set}
                                    ayanamsa={matchMakingResult.femalePanchangData.ayanamsa?.name}
                                    lat={matchMakingResult.payloadCoupleData.girl_lat}
                                    long={matchMakingResult.payloadCoupleData.girl_lon}
                                    timeZone={matchMakingResult.payloadCoupleData.girl_tz}
                                    name={matchMakingResult.payloadCoupleData.girl_name}
                                    location={matchMakingResult.payloadCoupleData.girl_place}
                                    identity='Girl'
                                    profile={matchMakingResult.femaleRashiData?.url}
                                />
                            </View>
                        </ScrollView></>}
            </View>
        </ErrorBoundary.Screen>
    )
}

const styles = StyleSheet.create({
    sectionInfoCta: {
        backgroundColor: "#5F5D70",
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
        borderRadius: 4,
        paddingHorizontal: 9,
        paddingVertical: 3,
        alignSelf: 'flex-end',
    }
});