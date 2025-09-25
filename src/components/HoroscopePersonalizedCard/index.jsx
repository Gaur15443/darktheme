import React, { memo } from 'react';
import { Text, useTheme } from 'react-native-paper';
import { Image, View, TouchableOpacity, StyleSheet } from 'react-native';
import GradientView from '../../common/gradient-view';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { Track } from '../../../App';
import HoroscopeArrowIcon from '../../images/Icons/HoroscopeArrowIcon';

function formatDate(isoString: string) {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function formatTime(isoString: string) {
    const date = new Date(isoString);
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
}

function PersonalizedHoroscopeCard({
    height,
    width,
    data,
    result,
    screen = "Horoscope",
    isScrolling = false
}) {
    const theme = useTheme();
    const navigator = useNavigation();
    const userData = useSelector((state) => state?.userInfo);

    if (!data) return null;

    const birthDateTime = data.birthDetails.birthDateTime;

    const handlePress = () => {
        const props = { screen };
        Track({
            cleverTapEvent: "Personalised_Horoscope_Accessed",
            mixpanelEvent: "Personalised_Horoscope_Accessed",
            userData,
            cleverTapProps: props,
            mixpanelProps: props
        });
        navigator.navigate('AstroHoroscopePersonalized', {
            birthData: data,
            result: result
        });
    };

    return (
        <View style={[
            styles.container,
            {
                height: isScrolling ? 100 : height,
                width,
                borderRadius: isScrolling ? 16 : 8,
                borderColor: isScrolling ? "rgba(255, 255, 255, 0.2)" : "#FFFFFF1A"
            }
        ]}>
            {/* Background Gradient */}
            <GradientView
                variant='modal'
                style={[
                    styles.gradientContainer,
                    { width }
                ]}
                contentStyle={[
                    styles.gradientContentBase,
                    isScrolling ? styles.shrunkenLayout : styles.fullLayout
                ]}
            />

            {/* Content */}
            <View style={[
                styles.contentContainer,
                isScrolling ? styles.shrunkenContent : styles.fullContent
            ]}>
                {isScrolling ? (
                    <TouchableOpacity
                        onPress={handlePress}
                        style={styles.shrunkWrapper}
                        activeOpacity={0.8}
                    >
                        <View style={styles.shrunkIconWrapper}>
                            <Image
                                source={{ uri: result?.[0]?.zodiacUrl }}
                                style={styles.shrunkZodiacImage}
                            />
                        </View>
                        <View style={styles.shrunkTextBlock}>
                            <Text style={styles.shrunkTextTitle}>
                                Your today's personalized horoscope is ready!
                            </Text>
                            
                        </View>
                        <View style={styles.shrunkChevron}>
                            <HoroscopeArrowIcon />
                        </View>
                    </TouchableOpacity>
                ) : (
                    <>
                        <View style={styles.headerSection}>
                            <Text style={styles.headerText}>
                                Your today's personalized
                            </Text>
                            <Text style={styles.headerText}>
                                horoscope is ready!
                            </Text>
                        </View>

                        <View style={styles.zodiacImageContainer}>
                            <View style={styles.zodiacImageBackground} />
                            <Image
                                source={{ uri: result?.[0]?.zodiacUrl }}
                                style={styles.zodiacImage}
                            />
                        </View>

                        <View style={styles.userInfoSection}>
                            <Text style={styles.genderText}>
                                {data.gender?.charAt(0).toUpperCase() + data.gender?.slice(1)}
                            </Text>
                            <Text style={styles.nameText}>
                                {data.name?.length <= 15 ? data.name : `${data.name?.slice(0, 15)}...`}
                            </Text>
                            <Text style={styles.zodiacText}>
                                {result?.[0]?.zodiac}
                            </Text>

                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Date of Birth</Text>
                                <Text style={styles.detailSeparator}>.</Text>
                                <Text style={styles.detailValue}>{formatDate(birthDateTime)}</Text>
                            </View>

                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Time of Birth</Text>
                                <Text style={styles.detailSeparator}>.</Text>
                                <Text style={styles.detailValue}>{formatTime(birthDateTime)}</Text>
                            </View>

                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Place of Birth</Text>
                                <Text style={styles.detailSeparator}>.</Text>
                                <Text style={styles.detailValue}>{data.birthDetails.birthPlace.placeName}</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.readMoreButton}
                            onPress={handlePress}
                        >
                            <Text style={styles.readMoreText}>Read More</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        alignSelf: 'center',
        overflow: 'hidden',
    },

    gradientContainer: {
        height: '100%',
        width: '100%',
        position: 'absolute',
        overflow: 'hidden',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)'
    },

    gradientContentBase: {
        flex: 1,
        justifyContent: 'space-evenly'
    },

    fullLayout: {
        justifyContent: 'space-evenly'
    },

    shrunkenLayout: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },

    contentContainer: {
        flex: 1,
        borderRadius: 15,
    },

    fullContent: {
        padding: 16,
        justifyContent: 'space-between',
    },

    shrunkenContent: {
        flex: 1,
        justifyContent: 'center',
    },

    shrunkWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 8,
    },

    shrunkIconWrapper: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#6944D31A',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },

    shrunkZodiacImage: {
        width: 60,
        height: 60,
        borderRadius: 20,
    },

    shrunkTextBlock: {
        flex: 1,
        justifyContent: 'center',
    },

    shrunkTextTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 2,
    },

    shrunkTextSubtitle: {
        color: 'rgba(255, 255, 255, 0.75)',
        fontSize: 12,
        fontWeight: '400',
    },

    shrunkChevron: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
        marginTop: 25,
        marginRight: 8
    },

    headerSection: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
    },

    headerText: {
        fontSize: 17,
        fontWeight: 'bold',
        color: 'white'
    },

    zodiacImageContainer: {
        position: 'absolute',
        top: -18,
        left: '67%',
    },

    zodiacImageBackground: {
        width: 160,
        height: 160,
        backgroundColor: '#6944D31A',
        borderRadius: 80,
        position: 'absolute',
    },

    zodiacImage: {
        borderRadius: 80,
        width: 160,
        height: 160,
        top: -10,
        left: 22,
    },

    userInfoSection: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        marginTop: 2,
    },

    genderText: {
        fontSize: 12,
        fontWeight: '500',
        color: 'white'
    },

    nameText: {
        fontSize: 26,
        fontWeight: '700',
        color: 'white'
    },

    zodiacText: {
        fontSize: 14,
        fontWeight: '400',
        color: 'rgba(255, 255, 255, 0.75)'
    },

    detailRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },

    detailLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: 'white'
    },

    detailSeparator: {
        fontSize: 10,
        fontWeight: '500',
        color: 'white',
        marginHorizontal: 4,
    },

    detailValue: {
        fontSize: 14,
        fontWeight: '400',
        color: 'rgba(255, 255, 255, 0.75)'
    },

    readMoreButton: {
        marginTop: 10,
        marginBottom: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.07)',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 0.5,
        borderColor: 'rgba(255, 255, 255, 1)'
    },

    readMoreText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white'
    },
});

export default memo(PersonalizedHoroscopeCard);