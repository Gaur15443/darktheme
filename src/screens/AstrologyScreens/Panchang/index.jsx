import { ScrollView as RNScrollView, StyleSheet, View, Platform } from 'react-native'
import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Icon, Portal, Text, useTheme } from 'react-native-paper'
import { getPanchang, setSelectedLocation, setSelectedDate, setPanchang } from '../../../store/apps/astroPanchang';
import { useFocusEffect, useNavigation, useIsFocused } from '@react-navigation/native';
import { LocationIcon } from '../../../images';
import SunIcon from '../../../images/Icons/SunIcon';
import MoonIcon from '../../../images/Icons/MoonIcon';
import { ImuwDatePicker } from '../../../core';
import Toast from 'react-native-toast-message';
import DottedCalendarIcon from '../../../images/Icons/CalendarIcon/dottedCalendar';
import Spinner from '../../../common/Spinner';
import DatesScroll from '../../../components/AstroPanchang/DateScroll';
import ErrorBoundary from '../../../common/ErrorBoundary';
import Location from '../../../components/Location';
import { Track } from '../../../../App';
import GlowingText from '../../../common/GlowingText';
import { defaultLocation } from '../../../store/apps/userLocation';
import AstroHeader from '../../../common/AstroHeader';
import { Pressable, ScrollView as GestureScrollView } from 'react-native-gesture-handler';
import DividerIcon from '../../../images/Icons/DividerIcon';
import { getUserInfo } from '../../../store/apps/userInfo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const todaysDate = new Date();

function toISODateTimeWithOffset(year, month, date) {
    const localDate = new Date(year, month - 1, date);

    const offsetMinutes = localDate.getTimezoneOffset();

    const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60);
    const offsetMins = Math.abs(offsetMinutes) % 60;

    const offsetSign = offsetMinutes <= 0 ? '+' : '-';

    const offsetString = `${offsetSign}${String(offsetHours).padStart(2, '0')}:${String(offsetMins).padStart(2, '0')}`;

    const localYear = localDate.getFullYear();
    const localMonth = String(localDate.getMonth() + 1).padStart(2, '0');
    const localDay = String(localDate.getDate()).padStart(2, '0');
    const localHours = String(localDate.getHours()).padStart(2, '0');
    const localMinutes = String(localDate.getMinutes()).padStart(2, '0');
    const localSeconds = String(localDate.getSeconds()).padStart(2, '0');

    return `${localYear}-${localMonth}-${localDay}T${localHours}:${localMinutes}:${localSeconds}${offsetString}`;
}

function getFullMonthName(isoDate) {
    const date = new Date(isoDate);
    return date.toLocaleString('default', { month: 'long' });
}

function formatDate(day, month, year) {
    const paddedDay = String(day).padStart(2, '0');
    const paddedMonth = String(month).padStart(2, '0');

    return `${paddedDay}/${paddedMonth}/${year}`;
}
function formatDateWithDayName(dateString) {
    if (!dateString) return "";

    const date = new Date(dateString);

    const day = new Intl.DateTimeFormat('en-GB', { day: '2-digit' }).format(date);
    const month = new Intl.DateTimeFormat('en-GB', { month: 'long' }).format(date);
    const weekday = new Intl.DateTimeFormat('en-GB', { weekday: 'long' }).format(date);

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


const ScrollView = Platform.OS === 'ios' ? RNScrollView : GestureScrollView;

const Panchang = memo(() => {
    const navigation = useNavigation();
    const { bottom } = useSafeAreaInsets();
    const MIN_DATE = new Date('1400');
    const MAX_DATE = new Date('2100');
    const theme = useTheme();
    const dispatch = useDispatch();
    const pageIsFocused = useIsFocused();
    const userData = useSelector((state) => state.userInfo);
    const panchangResult = useSelector(state => state.astroPanchang.panchangData);
    const festivalData = useSelector(state => state.astroPanchang.festivalData);
    const savedLocation = useSelector(state => state.astroPanchang.selectedLocation);
    const savedDateObject = useSelector(state => state.astroPanchang.selectedDateObject);
    console.log(panchangResult, "panchangResult")
    const locationRef = useRef(null);

    const [reloadKey, setReloadKey] = useState(Date.now());
    const [openCalendar, setOpenCalendar] = useState(false);
    const [loading, setLoading] = useState(true);
    const [defaultSelectedDate, setDefaultSelectedDate] = useState(todaysDate.getDate());
    const [defaultSelectedMonth, SetDefaultSelectedMonth] = useState(todaysDate.getMonth() + 1);
    const [defaultSelectedYear, SetDefaultSelectedYear] = useState(todaysDate.getFullYear());

    const formattedDateObject = useMemo(() => {
        if (!savedDateObject?.year) return null;
        return toISODateTimeWithOffset(savedDateObject.year, savedDateObject.month, savedDateObject.date);
    }, [savedDateObject]);

    useFocusEffect(
        React.useCallback(() => {
            if (!userData._id) {
                setLoading(true);
                dispatch(getUserInfo()).then(() => {
                    setLoading(true);
                })
            }
            else {
                Track({
                    cleverTapEvent: "Panchang_Page_Visited",
                    mixpanelEvent: "Panchang_Visited",
                    userData
                });
            }
        }, [pageIsFocused]),
    );

    useEffect(() => {
        if (!savedDateObject?.date || !savedLocation?.coordinates?.length) {
            dispatch(setSelectedLocation(defaultLocation));
            dispatch(setSelectedDate({
                date: defaultSelectedDate,
                month: defaultSelectedMonth,
                year: defaultSelectedYear
            }))
        }

        return () => setOpenCalendar(false);
    }, []);

    useEffect(() => {
        async function fetchPanchang() {
            try {
                if (!userData._id) return;
                if (!Object.keys(panchangResult || {})?.length) setLoading(true);
                const {
                    date,
                    month,
                    year,
                } = savedDateObject

                if (!date || !month || !year) return;
                // date, month, year
                await dispatch(getPanchang({
                    date: formatDate(date, month, year),
                    userId: userData._id
                })).unwrap();
            } catch (error) {
                setLoading(false)
                Toast.show({
                    type: 'error',
                    text1: error.message
                });
            }
            finally {
                setLoading(false);
            }
        };

        fetchPanchang();
    }, [savedDateObject, reloadKey, userData._id]);

    function goToLocation() {
        if (typeof locationRef.current?.openLocationSearch() === 'function') {
            locationRef.current.openLocationSearch();
        }
    }


    /**
     * 
     * @param {Date} e 
     */
    function handleDateChange(e) {
        setDefaultSelectedDate(e.getDate());
        SetDefaultSelectedYear(e.getFullYear());
        SetDefaultSelectedMonth(e.getMonth() + 1);

        const payload = {
            date: e.getDate(),
            month: e.getMonth() + 1,
            year: e.getFullYear()
        }

        dispatch(setSelectedDate(payload));
    }
    /**
     * 
     * @param {import('../../../components/Location/location').LocationData} data 
     */
    async function handleLocationChange(data) {
        try {
            const {
                date,
                month,
                year,
            } = savedDateObject
            await dispatch(setPanchang({
                date: formatDate(date, month, year),
                userId: userData._id,
                location: {
                    place: data.name,
                    latitude: parseFloat(data.coordinates[0]),
                    longitude: parseFloat(data.coordinates[1]),
                },
                timezone: data.tz.toString()
            })).unwrap();
            setReloadKey(Date.now())
        }
        catch (error) {
            Toast.show({
                type: "error",
                text1: error.message
            })
        }
    }
    return (
        <ErrorBoundary.Screen>
            {loading &&
                <View
                    style={{
                        width: '100%',
                        height: '100%',
                        flex: 1,
                        alignSelf: 'center',
                        justifyContent: 'center',
                        backgroundColor: theme.colors.background,
                    }}>
                    <Spinner />
                </View>}
            {!loading && <View style={{ flex: 1 }}>
                <AstroHeader>
                    <AstroHeader.Content title="Panchang" />
                </AstroHeader>
                {openCalendar && <Portal>
                    <ImuwDatePicker
                        theme="dark"
                        onClose={() => setOpenCalendar(false)}
                        open={openCalendar}
                        mode="date"
                        selectedDate={new Date(savedDateObject.year, savedDateObject.month - 1, savedDateObject.date)}
                        onDateChange={handleDateChange}
                        minimumDate={MIN_DATE}
                        maximumDate={MAX_DATE}
                    />

                </Portal>}
                {!loading && Object.keys(panchangResult || {})?.length > 0 && <ScrollView style={{ paddingHorizontal: 10, }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 20, alignItems: 'flex-end' }}>
                        <Pressable onPress={() => setOpenCalendar(true)}>
                            <Text style={{ fontSize: 10 }}>{defaultSelectedYear}</Text>
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                <Text variant='bold' style={{ fontSize: 16 }}>{getFullMonthName(toISODateTimeWithOffset(savedDateObject.year, savedDateObject.month, savedDateObject.date))}</Text>
                                <DottedCalendarIcon stroke={"#fff"} />
                            </View>
                        </Pressable>
                        <Pressable style={{ flexDirection: 'row', gap: 1, alignItems: 'center' }} onPress={goToLocation}>
                            <View style={{ display: 'none' }}>
                                <Location
                                    ref={locationRef}
                                    testID='panchang-location'
                                    getLocationInfo={handleLocationChange}
                                />
                            </View>
                            <LocationIcon stroke='#fff' size={18} />
                            <View style={{ borderBottomColor: '#fff', borderBottomWidth: 0.5 }}>
                                <Text style={{
                                    fontSize: 14,
                                }}
                                    numberOfLines={1}
                                    ellipsizeMode='tail'
                                >{savedLocation.place}</Text>
                            </View>
                        </Pressable>
                    </View>
                    <DatesScroll
                        formattedDateObject={formattedDateObject}
                    />
                    {/* Panchang */}
                    <Text variant='bold' style={{
                        fontSize: 20,
                        textAlign: 'center',
                        paddingVertical: 18,
                    }}>{formatDateWithDayName(toISODateTimeWithOffset(savedDateObject.year, savedDateObject.month, savedDateObject.date))}</Text>
                    <Text variant='bold' style={{
                        fontSize: 16,
                    }}>Tithi</Text>
                    <View style={{
                        backgroundColor: "#2B2941",
                        padding: 10,
                        borderRadius: 8,
                        marginTop: 8,
                        marginBottom: 20,
                        borderColor: "#FFFFFF1A",
                        borderWidth: 1,
                    }}>
                        <View>
                            <View style={{ justifyContent: 'center' }}>
                                <Text variant='bold' style={styles.tithiName}>
                                    {panchangResult?.tithi?.name}
                                </Text>
                                <Text style={{
                                    fontSize: 12,
                                    marginBottom: 8,
                                }}>
                                    {/* TODO: time format */}
                                    <Text style={[styles.tithiDates]}>Start: {panchangResult?.tithi?.start} </Text>
                                </Text>
                            </View>
                            <View style={{ justifyContent: 'center' }}>
                                <Text variant='bold' style={styles.tithiName}>{panchangResult?.tithi?.next_tithi}</Text>
                                <Text style={styles.tithiDates}>Start: {panchangResult?.tithi?.end}</Text>
                            </View>
                            <View style={{
                                flexDirection: 'row',
                                width: '100%',
                                gap: 16,
                                marginBottom: 10,
                                marginTop: 12,
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
                                    }}>{formatTimeWithoutSeconds(panchangResult?.advanced_details?.sun_rise)} - {formatTimeWithoutSeconds(panchangResult?.advanced_details?.sun_set)}</Text>
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
                                    }}>{formatTimeWithoutSeconds(panchangResult?.advanced_details?.moon_rise)} - {formatTimeWithoutSeconds(panchangResult?.advanced_details?.moon_set)}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View style={styles.divider}>
                        <DividerIcon />
                    </View>
                    <View style={styles.sectionHeader}>
                        <Text variant='bold' style={{ fontSize: 16, paddingBottom: 8 }}>Panchang</Text>
                        <Pressable style={styles.sectionInfoCta}
                            onPress={() => navigation.navigate('PanchangDefinitions', { term: 'panchang' })}
                        >
                            <Text variant='bold' style={{ fontSize: 12, fontWeight: 600 }}>What is this?</Text>
                            <Icon source="arrow-right" size={16} />
                        </Pressable>
                    </View>
                    <View style={{ gap: 10 }}>
                        {/* Top */}
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 }}>
                            <View style={styles.panchangCard}>
                                <Text variant="bold" style={styles.panchangCardTitle}>
                                    {panchangResult?.advanced_details?.masa?.amanta_name}
                                    <Text style={styles.panchangCardTitleDesc}>{' '}
                                        ({panchangResult?.advanced_details?.masa?.paksha})
                                    </Text>
                                </Text>
                                <Text style={{ fontSize: 8 }}>
                                    {panchangResult?.advanced_details?.years?.vikram_samvaat} {panchangResult?.advanced_details?.years?.vikram_samvaat_name}
                                </Text>
                                <Text style={{ fontSize: 12 }}>Masa</Text>
                            </View>

                            <View style={styles.panchangCard}>
                                <Text variant='bold' style={styles.panchangCardTitle}>{panchangResult?.nakshatra?.name}</Text>
                                <Text style={{ fontSize: 8 }}>Upto {panchangResult?.nakshatra?.end}</Text>
                                <Text style={{ fontSize: 12 }}>Nakshatra</Text>
                            </View>

                            <View style={styles.panchangCard}>
                                <Text variant='bold' style={styles.panchangCardTitle}>{panchangResult?.yoga?.name}</Text>
                                <Text style={{ fontSize: 8 }}>Upto {panchangResult?.yoga?.end}</Text>
                                <Text style={{ fontSize: 12 }}>Yoga</Text>
                            </View>

                            <View style={styles.panchangCard}>
                                <Text variant='bold' style={styles.panchangCardTitle}>{panchangResult?.karana?.name}</Text>
                                <Text style={{ fontSize: 8 }}>Upto {panchangResult?.karana?.end}</Text>
                                <Text style={{ fontSize: 12 }}>Karana</Text>
                            </View>
                        </View>

                        {/* Bottom */}
                        <View style={{
                            gap: 7,
                            flexDirection: 'row'
                        }}>
                            <View style={styles.panchangBottomCard}>
                                <Text style={styles.panchangCardTitle} variant='bold'>{panchangResult?.advanced_details?.masa?.ayana}</Text>
                                <Text style={{ fontSize: 12 }}>Ayana</Text>
                            </View>
                            <View style={styles.panchangBottomCard}>
                                <Text style={styles.panchangCardTitle} variant='bold'>{panchangResult?.advanced_details?.masa?.ritu}</Text>
                                <Text style={{ fontSize: 12 }}>Ritu</Text>
                            </View>
                            <View style={styles.panchangBottomCard}>
                                <Text style={styles.panchangCardTitle} variant='bold'>{panchangResult?.advanced_details?.vaara}</Text>
                                <Text style={{ fontSize: 12 }}>Vaara</Text>
                            </View>
                        </View>
                    </View>

                    <View style={[styles.divider, {
                        marginVertical: 10
                    }]}>
                        <DividerIcon />
                    </View>

                    <View style={{ borderRadius: 20, backgroundColor: "#FFFFFF1A", padding: 14 }}>
                        <View style={[styles.sectionHeader, {
                            marginVertical: 0
                        }]}>
                            <Text variant='bold' style={{ fontSize: 16, alignItems: 'center', paddingBottom: 2 }}>Muhurta</Text>
                            <Pressable style={styles.sectionInfoCta}
                                onPress={() => navigation.navigate('PanchangDefinitions', { term: 'muhurta' })}
                            >
                                <Text variant='bold' style={{ fontSize: 12, fontWeight: 600 }}>What is this?</Text>
                                <Icon source="arrow-right" size={16} />
                            </Pressable>
                        </View>
                        <GlowingText
                            text='Good Muhurta'
                            color='#27C394'
                            style={{ color: "#27C394", fontSize: 16, paddingBlock: 8, fontWeight: 'bold', textAlign: 'center' }}
                        />
                        <View style={[styles.goodMuhurta, styles.muhurtaCard]}>
                            <Text variant='bold' style={[styles.muhurtaType]}>ABHIJIT MUHURTA</Text>
                            <Text style={[{ color: "#27C394" }, styles.muhurtaType]} variant='bold'>
                                {formatTimeWithoutSeconds(panchangResult?.advanced_details?.abhijit_muhurta?.start)}
                                {' to '}
                                {formatTimeWithoutSeconds(panchangResult?.advanced_details?.abhijit_muhurta?.end)}
                            </Text>
                        </View>

                        <View style={styles.badMuhurta}>
                            <Text variant='bold' style={{ color: "#FFFFFFBF", fontSize: 16, paddingBlock: 8, textAlign: 'center' }}>Bad Muhurta</Text>
                            <View style={{ gap: 10 }}>
                                <View style={[styles.muhurtaCard,]}>
                                    <Text variant='bold' style={styles.muhurtaType}>RAHU KALA</Text>
                                    <Text style={styles.muhurtaType}>{panchangResult?.rahukaal}</Text>
                                </View>
                                <View style={[styles.muhurtaCard,]}>
                                    <Text variant='bold' style={styles.muhurtaType}>GULIKA KALA</Text>
                                    <Text style={styles.muhurtaType}>{panchangResult?.gulika}</Text>
                                </View>
                                <View style={[styles.muhurtaCard,]}>
                                    <Text variant='bold' style={styles.muhurtaType}>YAMAGANDA KAAL</Text>
                                    <Text style={styles.muhurtaType}>{panchangResult?.yamakanta}</Text>
                                </View>
                            </View>
                        </View>
                        <GlowingText
                            text='Today is'
                            color='#EFBE29'
                            style={{ color: "#EFBE29", fontSize: 16, paddingBlock: 8, fontWeight: 'bold', textAlign: 'center' }}
                        />
                        <View style={{
                            backgroundColor: "#EFBE2926",
                            borderColor: "#EFBE2933",
                            borderWidth: 1,
                            padding: 12,
                            borderRadius: 8
                        }}>
                            <Text variant='bold' style={{ fontSize: 12 }}>{panchangResult?.tithi?.special}</Text>
                        </View>
                    </View>

                    {festivalData?.length > 0 && <>
                        <View style={[styles.divider, {
                            marginVertical: 10
                        }]}>
                            <DividerIcon />
                        </View>
                        <View style={{ backgroundColor: "#FFFFFF1A", padding: 14, paddingBottom: 28, borderRadius: 8 }}>
                            <Text variant='bold' style={{ fontSize: 16, paddingBottom: 8 }}>Festivals Today</Text>
                            <View>
                                {festivalData?.map((festival) => (
                                    <View key={festival.festival_name} style={styles.festivalContainer}>
                                        <Text style={styles.festivalName}>{festival.festival_name}</Text>
                                        <View style={styles.festivalDescContainer}>
                                            <Text variant='bold' style={styles.festivalDesc}>{festival.significance}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>
                        <View style={[styles.divider, {
                            marginVertical: 10
                        }]}>
                            <DividerIcon />
                        </View>
                    </>
                    }

                    <View style={{ paddingBottom: (60 + bottom) }} />
                </ScrollView>}
            </View>}
        </ErrorBoundary.Screen >
    )
});

const styles = StyleSheet.create({
    panchangCard: {
        backgroundColor: '#FFFFFF1A',
        paddingHorizontal: 8,
        paddingVertical: 12,
        borderRadius: 8,
        width: '48%'
    },
    panchangBottomCard: {
        minHeight: 62,
        backgroundColor: '#FFFFFF1A',
        paddingHorizontal: 8,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#FFFFFF1A",
        flex: 1,
        justifyContent: 'center',
    },
    panchangCardTitle: {},
    panchangCardTitleDesc: {
        fontSize: 8,
    },
    muhurtaCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    goodMuhurta: {
        borderBottomWidth: 1,
        borderColor: "#FFFFFFBF",
        paddingBottom: 12
    },
    badMuhurta: {
        borderBottomWidth: 1,
        borderColor: "#FFFFFFBF",
        paddingBottom: 12
    },
    divider: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 12,
    },
    muhurtaType: {
        fontSize: 12,
    },
    festivalName: {
        color: "#EFBE29",
        fontSize: 16,
        fontWeight: 'bold',
        paddingVertical: 5
    },
    festivalDescContainer: {
        padding: 12,
        borderWidth: 1,
        borderColor: "#EFBE2933",
        borderRadius: 8,
        backgroundColor: "#EFBE2926",
    },
    festivalDesc: {
        color: "#FFFFFFBF",
        fontSize: 12,
    },
    festivalContainer: {
        paddingBottom: 18,
        borderBottomWidth: 1,
        borderColor: "#FFFFFFBF",
    },
    sectionInfoCta: {
        backgroundColor: "#5F5D70",
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
        borderRadius: 4,
        paddingHorizontal: 9,
        paddingVertical: 3
    },
    tithiName: {
        fontSize: 14,
        paddingBottom: 6,
    },
    tithiDates: {
        fontSize: 12,
    }
});

export default memo(Panchang);