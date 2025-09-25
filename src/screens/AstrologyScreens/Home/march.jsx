import { Pressable, SafeAreaView, View, ScrollView } from 'react-native'
import React from 'react'
import { Button, Divider, Text, useTheme } from 'react-native-paper'
import GradientView from '../../../common/gradient-view'
import AstroHoroscopeIcon from '../../../images/Icons/AstrologyBottomTabIcons/AstroHoroscopeIcon';
import HeartSolidIcon from '../../../images/Icons/HeartIcon/HeartSolidIcon';
import SunIcon from '../../../images/Icons/SunIcon';
import MoonIcon from '../../../images/Icons/MoonIcon';
import SuitCaseIcon from '../../../images/Icons/SuitCaseIcon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AstrologyTextIcon from '../../../images/Icons/AstrologyBottomTabIcons/AstrologyTextIcon';
import BellIcon from '../../../images/Icons/BellIcon';
import AstroHamburgerIcon from '../../../images/Icons/AstroHamburgerIcon';
// import { ScrollView } from 'react-native-gesture-handler';

const Header = () => {
    <View style={{
        height: 200,
        backgroundColor: 'red',
        position: 'absolute',
        top: 0,
    }}>
        <Text>Hi Devendra,</Text>
        <Text>Immerse yourself in the realm of astrology and uncover the depths of your true self.</Text>
    </View>
}

export default function HomeMarch() {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    return (
        <View style={{
            flex: 1
        }}>
            <GradientView style={{
                height: 200,
                paddingTop: insets.top,
                borderBottomRightRadius: 24,
                borderBottomLeftRadius: 24,
                paddingHorizontal: 16
            }}>
                <View style={{
                    flexDirection: 'row',
                    width: '100%'
                }}>
                    <View style={{
                        flex: 1
                    }}>
                        <View>
                            <Text>logo</Text>
                            <AstrologyTextIcon />
                        </View>
                    </View>
                    <View style={{
                        flex: 1,
                        flexDirection: 'row',
                        justifyContent: 'flex-end'
                    }}>
                        <BellIcon />
                        <AstroHamburgerIcon />
                    </View>
                </View>
                <Text style={{
                    fontSize: 24
                }}>Hi Devendra,</Text>
                <Text style={{
                    fontSize: 14
                }}>Immerse yourself in the realm of astrology and uncover the depths of your true self.</Text>
            </GradientView>
            <View style={{
                paddingHorizontal: 10,
                flex: 1
            }}>
                <ScrollView scrollEnabled style={{
                    // height: '96%',
                    paddingBottom: 100,
                    flex: 1,
                    marginTop: 30,
                }}>
                    <View>
                        {/* Panchang */}
                        <View style={{
                            backgroundColor: "#2B2941",
                            padding: 10,
                            borderRadius: 8,
                            marginBlock: 20,
                            borderColor: "#FFFFFF1A",
                            borderWidth: 1,
                        }}>
                            <View style={{
                                flexDirection: 'row',
                                alignItems: "center",
                                gap: 14,
                                marginBottom: 16
                            }}>
                                <View style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 20,
                                    backgroundColor: "#FFFFFF1A",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}>
                                    <Text style={{ textAlign: 'center' }}>🗓️</Text>
                                </View>
                                <Text>Panchang</Text>
                            </View>
                            <View>
                                <Text variant='bold' style={{
                                    fontSize: 20
                                }}>04 December (Wednesday)</Text>
                                <View>
                                    <Text style={{
                                        fontSize: 14
                                    }}>
                                        <Text variant='bold'>Tritya -</Text>
                                        <Text style={{
                                            fontSize: 14
                                        }}>10:06 AM today | </Text>
                                        <Text variant='bold' style={{
                                            fontSize: 14
                                        }}>Chaturthi -</Text>
                                        <Text style={{
                                            fontSize: 14
                                        }}>10:03 AM on 19th</Text>
                                    </Text>
                                </View>
                                <View style={{
                                    flexDirection: 'row',
                                    width: '100%',
                                    gap: 6,
                                    marginBlock: 10
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
                                        }}>5:30 AM - 06:30PM</Text>
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
                                        }}>7:00 PM - 04:30AM</Text>
                                    </View>
                                </View>
                                <View>
                                    <Button style={{ borderRadius: 8, borderWidth: 0.5, borderColor: '#ffffff' }} mode='outlined'>
                                        <Text>Check Detailed View</Text>
                                    </Button>
                                </View>
                            </View>
                        </View>
                        {/* Horoscope */}
                        <GradientView style={{
                            height: 223,
                            width: '100%',
                            paddingHorizontal: 24,
                            paddingBlock: 10,
                            overflow: 'hidden',
                            borderRadius: 8,
                        }}
                            contentStyle={{
                                flex: 1,
                                justifyContent: 'space-evenly'
                            }}
                        >
                            <View>
                                <View style={{
                                    height: 48,
                                    width: 48,
                                    borderRadius: 24,
                                    margin: 'auto',
                                    backgroundColor: "#fff",
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <AstroHoroscopeIcon stroke={theme.colors.primary} />
                                </View>
                                <Text variant='titleLarge' style={{
                                    fontSize: 18,
                                    textAlign: 'center'
                                }}>Unlock My Horoscope</Text>
                                <Text style={{
                                    textAlign: 'center'
                                }}>Share your birth details to unlock daily predictions</Text>
                            </View>
                            <Button style={{
                                borderRadius: 8,
                            }} mode='contained'
                                theme={{
                                    colors: {
                                        primary: '#fff',
                                        onPrimary: theme.colors.primary
                                    }
                                }}
                            >Unlock Now</Button>
                        </GradientView>
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                width: '100%',
                                gap: 4,
                                marginBlock: 20
                            }}
                        >
                            <View style={{ flex: 1, height: 158, backgroundColor: "#2B2941", paddingHorizontal: 8 }}>
                                <View style={{
                                    flexDirection: 'row',
                                }}>
                                    <View style={{
                                        height: 32,
                                        width: 32,
                                        backgroundColor: 0xFFFFFF1A,
                                        justifyContent: 'center',
                                        alignContent: 'center',
                                        borderRadius: 16,
                                        paddingBottom: 3,
                                        paddingLeft: 3,
                                    }}>
                                        <Text style={{
                                            fontSize: 20,
                                        }}>📃</Text>
                                    </View>
                                    <Text style={{
                                        fontSize: 16
                                    }}>Report</Text>
                                </View>
                                <Text style={{
                                    fontSize: 10
                                }}>
                                    Our career report based on astrology provides personalized insights by analyzing planetary positions, ascendant sign, Moon
                                </Text>
                                <Text variant='bold'>Read More....</Text>
                                <Pressable
                                    style={{
                                        paddingHorizontal: 16,
                                        paddingBlock: 9,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: theme.roundness,
                                        borderWidth: 1,
                                        borderColor: "#fff"
                                    }}
                                >
                                    <Text
                                        variant="bold"
                                        style={{
                                            fontSize: 12,
                                            color: '#fff',
                                        }}
                                    >
                                        Generate All Report
                                    </Text>
                                </Pressable>

                            </View>
                            <View style={{ flex: 1, height: 158, backgroundColor: "#2B2941", paddingHorizontal: 8 }}>
                                <View style={{
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    alignItems: 'center',
                                    marginLeft: 0.1,
                                    gap: 3
                                }}>
                                    <View style={{
                                        flexDirection: 'row',
                                        width: '100%',
                                        height: 32,
                                        width: 32,
                                        backgroundColor: 0xFFFFFF1A,
                                        justifyContent: 'center',
                                        alignContent: 'center',
                                        borderRadius: 16,
                                        paddingBottom: 3,
                                        paddingLeft: 8,
                                    }}>
                                        <Text style={{
                                            fontSize: 20,
                                            height: 32,
                                            width: 32,
                                        }}>💕</Text>
                                    </View>
                                    <Text style={{
                                        fontSize: 16
                                    }}>Matchmaking</Text>
                                </View>
                                <Text style={{
                                    fontSize: 10
                                }}>A marriage report based on an individual’s Kundli provides insights into marital prospects, compatibility tendencies, and </Text>
                                <Text variant='bold'>Read More....</Text>
                                <Pressable
                                    style={{
                                        paddingHorizontal: 16,
                                        paddingBlock: 9,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: theme.roundness,
                                        borderWidth: 1,
                                        borderColor: "#fff"
                                    }}
                                ><Text style={{
                                    fontSize: 12,
                                    color: '#fff',
                                }}>
                                        Check Now
                                    </Text></Pressable>
                            </View>
                        </View>

                        {/* Vedic */}
                        <View style={{
                            minHeight: 168,
                            backgroundColor: "#2B2941",
                            borderRadius: 8,
                            borderColor: "#fff",
                            borderWidth: 1,
                            padding: 12,
                            gap: 8
                        }}>
                            <Text variant='bold' style={{
                                fontSize: 14,
                                lineHeight: 16.45,
                            }}>What is Vedic Astrology</Text>
                            <Text style={{
                                fontSize: 10,
                                // lineHeight: 11.75
                            }}>
                                Our career report based on astrology provides personalized insights by analysing planetary positions, ascendant sign, Our career report based on astrology provides personalized insights by analysing planetary positions, ascendant sign. Our career report based on astrology provides personalized insights by analysing planetary positions, ascendant sign, Our career report based on astrology provides personalized insights by analysing planetary positions, ascendant sign. Our career report based on astrology provides personalized insights by analysing planetary positions, ascendant sign, Our career report based on astrology provides personalized insights by analysing planetary positions, ascendant sign.
                            </Text>
                        </View>
                        <Divider style={{
                            backgroundColor: '#fff',
                            color: '#fff',
                            marginBlock: 24
                        }} />
                        {/* Relationship */}
                    </View>
                    <GradientView style={{
                        height: 223,
                        paddingHorizontal: 24,
                        justifyContent: 'center',
                        marginBottom: 20,
                        borderRadius: 8
                    }}
                        colors={["#FFE03D", "#0E0E10"]}
                        contentStyle={{
                            flex: 1,
                            height: 223,
                            justifyContent: 'center',
                            gap: 6,
                            alignItems: 'center'
                        }}
                    >
                        <View style={{
                            height: 48,
                            width: 48,
                            backgroundColor: "#fff",
                            borderRadius: 24,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                            <HeartSolidIcon />
                        </View>
                        <Text variant='bold' style={{
                            fontSize: 18,
                            textAlign: 'center'
                        }}>Are you concerned about your relationship?</Text>
                        <Text style={{
                            fontSize: 14,
                            textAlign: 'center'
                        }}>Let astrology help you to resolve the issues.</Text>
                        <Button mode="contained" theme={{ colors: { primary: "#fff", onPrimary: "#000" } }} style={{
                            borderRadius: 8,
                            width: '100%'
                        }}>Check Now</Button>
                    </GradientView>
                    <GradientView style={{
                        height: 223,
                        paddingHorizontal: 24,
                        justifyContent: 'center',
                        marginBottom: 20,
                        borderRadius: 8
                    }}
                        colors={["#27C394", "#0E0E10"]}
                        contentStyle={{
                            flex: 1,
                            height: 223,
                            justifyContent: 'center',
                            gap: 6,
                            alignItems: 'center'
                        }}
                    >
                        <View style={{
                            height: 48,
                            width: 48,
                            backgroundColor: "#fff",
                            borderRadius: 24,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                            <SuitCaseIcon />
                        </View>
                        <Text variant='bold' style={{
                            fontSize: 18,
                            textAlign: 'center'
                        }}>Not Getting Job?</Text>
                        <Text style={{
                            fontSize: 14,
                            textAlign: 'center'
                        }}>Let astrology unfold the true potential of your career</Text>
                        <Button mode="contained" theme={{ colors: { primary: "#fff", onPrimary: "#000" } }} style={{
                            borderRadius: 8,
                            width: '100%'
                        }}>Check Now</Button>
                    </GradientView>
                    <View style={{
                        height: 100
                    }} />
                </ScrollView>
            </View>
        </View>
    )
}