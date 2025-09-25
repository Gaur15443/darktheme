import { ScrollView, View } from "react-native"
import DividerIcon from "../../../images/Icons/DividerIcon"
import { useSelector } from "react-redux";
import { Text } from "react-native-paper";
import styles from "./styles";
const AboutPanchang = (props) => {
    const definitions = useSelector((state) => (state.getToastMessages.toastMessages?.ai_astro_reports?.Panchang));

    return <ScrollView {...props}>
        <Text variant="bold" style={styles.mainTitle}>
            About Panchang
        </Text>
        <View style={styles.divider}>
            <DividerIcon />
        </View>
        <View style={styles.cardContainer}>
            <Text variant="bold" style={styles.cardHeading}>{definitions?.heading}</Text>
            {definitions?.card_contents?.map((item, index, array) => (
                <View key={index} style={{
                    borderColor: "#FFFFFFBF",
                    borderBottomWidth: index !== array.length - 1 ? 1 : 0,
                    paddingVertical: 10
                }}>
                    <Text variant="bold" style={styles.cardTitle}>{item?.title}</Text>
                    <Text variant="bold" style={styles.cardDescription}>{item?.description}</Text>
                    {item?.list?.length && <View style={{ marginTop: 15 }}>
                        {item?.list?.map((listItem, listIndex) => (
                            <View key={listIndex} style={{ flexDirection: 'row', marginBottom: 8, alignItems: 'center', paddingRight: 10, paddingLeft: 20 }}>
                                <View style={{ width: 5, height: 5, backgroundColor: "#fff", borderRadius: 5, }} />
                                <Text variant="bold" style={[styles.cardDescription, { flex: 1, paddingHorizontal: 10 }]}>{listItem}</Text>
                            </View>
                        ))}
                    </View>}
                </View>
            ))}
        </View>
        <View style={styles.divider}>
            <DividerIcon />
        </View>
    </ScrollView>
}

export default AboutPanchang;