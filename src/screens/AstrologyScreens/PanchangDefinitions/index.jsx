import { useRoute, useNavigation } from "@react-navigation/native";
import { View } from "react-native";
import { useTheme } from "react-native-paper";
import AstroHeader from "../../../common/AstroHeader";
import { useSelector } from "react-redux";
import ErrorBoundary from "../../../common/ErrorBoundary";
import AboutMuhurta from "./AboutMuhurta";
import AboutPanchang from "./AboutPanchang";
import { Shadow } from 'react-native-shadow-2';

function ShadowWrapper({ children }) {
    return (
        <Shadow
            offset={[0, 3]}
            distance={3}
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


const PanchangDefinitions = () => {
    const theme = useTheme();
    const route = useRoute();
    const navigation = useNavigation();
    const { term } = route.params;

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
                {term === 'panchang' && <AboutPanchang style={{ flex: 1, paddingHorizontal: 16 }} />}
                {term === 'muhurta' && <AboutMuhurta style={{ flex: 1, paddingHorizontal: 16 }} />}
            </View>
        </ErrorBoundary.Screen>
    )
}

export default PanchangDefinitions;