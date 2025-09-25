import { ScrollView, View } from "react-native";
import { Text } from "react-native-paper";
import { useSelector } from "react-redux";
import styles from "./styles";
import DividerIcon from "../../../images/Icons/DividerIcon";
import { Fragment } from "react";

const AboutMuhurta = (props) => {
    const definitions = useSelector((state) => (state.getToastMessages.toastMessages?.ai_astro_reports?.Muhurta));

    return (
        <ScrollView {...props}>
            <Text variant="bold" style={styles.mainTitle}>About Muhurta</Text>
            <View style={styles.divider}>
                <DividerIcon />
            </View>
            {definitions.map((item, index) => (
                <Fragment key={index}>
                    <View style={styles.cardContainer}>
                        <Text variant="bold" style={styles.cardHeading}>{item?.heading}</Text>
                        {item?.card_contents?.map((cardContent, cardIndex, array) => (
                            <View key={cardIndex} style={{
                                borderBottomWidth: cardIndex === array.length - 1 ? 0 : 1,
                                borderColor: "#FFFFFFBF",
                                paddingVertical: 10
                            }}>
                                <Text variant="bold" style={styles.cardTitle}>{cardContent?.title}</Text>
                                <Text variant="bold" style={styles.cardDescription}>{cardContent?.description}</Text>
                                {cardContent?.list?.length > 0 && cardContent?.list?.map((listItem, listIndex) => (
                                    <View key={listIndex}
                                        style={{
                                            flexDirection: 'row', marginBottom: 8, alignItems: 'center', paddingHorizontal: 10,
                                            paddingTop: listIndex === 0 ? 16 : 0,
                                            paddingRight: 10,
                                            paddingLeft: 20
                                        }}>
                                        <View style={{ width: 5, height: 5, backgroundColor: "#fff", borderRadius: 5, }} />
                                        <Text variant="bold" style={[styles.cardDescription, { flex: 1, paddingHorizontal: 10 }]}>{listItem}</Text>
                                    </View>
                                ))}
                            </View>
                        ))}
                    </View>
                    <View style={styles.divider}>
                        <DividerIcon />
                    </View>
                </Fragment>

            ))}
        </ScrollView>
    )
}

export default AboutMuhurta;