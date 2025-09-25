import { useNavigation } from "@react-navigation/native";
import { ScrollView, View } from "react-native";
import { useTheme, Text } from "react-native-paper";
import AstroHeader from "../../../common/AstroHeader";
import ErrorBoundary from "../../../common/ErrorBoundary";
import { Shadow } from 'react-native-shadow-2';
import { useSelector } from "react-redux";
import DividerIcon from "../../../images/Icons/DividerIcon";
import styles from "./styles";
import { Fragment } from "react";

function ShadowWrapper({ children }) {
    return (
        <Shadow
            offset={[0, 3]}
            distance={4}
            startColor="#6944d320"
            endColor="#6944d320"
            style={{
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
            }}
            containerStyle={{
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
            {children}
        </Shadow>
    );
}


const MatchMakingDefinitions = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const definitions = useSelector((state) => (state.getToastMessages.toastMessages?.ai_astro_reports?.Match_Making));

    return (
        <ErrorBoundary.Screen>
            <View style={{
                flex: 1,
                backgroundColor: theme.colors.background
            }}>
                <ShadowWrapper>
                    <AstroHeader
                        style={{
                            borderBottomWidth: 2,
                            borderBottomColor: "#8220D8",
                            paddingBottom: 10,
                            backgroundColor: theme.colors.background
                        }}
                    >
                        <AstroHeader.BackAction onPress={() => navigation.goBack()} />
                        <AstroHeader.Content title={'Learn more'}
                            style={{
                                backgroundColor: theme.colors.background
                            }}
                        />
                    </AstroHeader>

                </ShadowWrapper>
                <ScrollView style={{ flex: 1, paddingHorizontal: 16 }} >
                    <Text variant="bold" style={styles.mainTitle}>
                        About Matchmaking
                    </Text>
                    <View style={styles.divider}>
                        <DividerIcon />
                    </View>
                    {definitions?.length > 0 && (definitions.map((definition, index, array) => <Fragment key={definition?.heading}>
                        <View style={styles.cardContainer}>
                            <Text variant="bold" style={styles.cardHeading}>{definition?.heading}</Text>
                            {typeof definition?.description === "string" && <Text variant="bold" style={[styles.cardDescription, {
                                paddingHorizontal: 0,
                            }]}>{definition?.description}</Text>}
                            {definition?.card_contents?.length > 0 && definition?.card_contents?.map((item, index, array) => (
                                <View key={index} style={{
                                    borderColor: "#FFFFFFBF",
                                    borderBottomWidth: index !== array.length - 1 ? 1 : 0,
                                    paddingVertical: 10
                                }}>
                                    <Text variant="bold" style={styles.cardTitle}>{item?.title || item?.heading}</Text>

                                    {typeof item?.description === 'object' && item?.description !== null
                                        ? Object.values(item.description).map((text, index) => (
                                            <Text key={index} variant="bold" style={[styles.cardDescription, {
                                                marginBottom: 21
                                            }]}>{text}</Text>
                                        ))
                                        : <Text key={index} variant="bold" style={styles.cardDescription}>{item?.description}</Text>}

                                    {item?.subDescription?.length > 0 && <View style={{ marginTop: 15 }}>
                                        {item?.subDescription?.map((listItem, listIndex) => (
                                            <View key={listIndex} style={{ flexDirection: 'row', marginBottom: 8, alignItems: 'flex-start', paddingRight: 10, paddingLeft: 20, }}>
                                                <View style={{ width: 5, height: 5, backgroundColor: "#fff", borderRadius: 2.5, marginTop: 6 }} />
                                                <Text
                                                    variant="bold" style={[styles.cardDescription, { flex: 1, paddingHorizontal: 10 }]}>
                                                    {listItem}
                                                </Text>
                                            </View>

                                        ))}
                                    </View>}
                                </View>
                            ))}
                        </View>
                        <View style={styles.divider}>
                            {index !== (array?.length - 1) && <DividerIcon />}
                        </View>
                    </Fragment>
                    ))}
                </ScrollView>
            </View>
        </ErrorBoundary.Screen>
    )
}

export default MatchMakingDefinitions;