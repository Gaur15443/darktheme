import React, {useState} from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import { GlobalHeader } from '../../components'
import { Theme } from '../../common';
import { ActivityIndicator } from 'react-native-paper';
// import {useTheme } from 'react-native-paper';
export default function FunFactWebView({ route }) {
    // const Theme = useTheme();
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const { url } = route.params;
    const handleBack = () => {
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <GlobalHeader
                accessibilityLabel="goBackfromFunFact"
                onBack={handleBack}
                backgroundColor={Theme.light.background}
            />
            {/* WebView */}
             {loading && (
            <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#FF6600" />
            </View>
        )}
            <WebView source={{ uri: url }} 
             onLoadStart={() => setLoading(true)}
             onLoadEnd={() => setLoading(false)}
             style={styles.webView}
             />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    webView: {
    flex: 1,
   },
   loaderContainer: {
    position: 'absolute',
    top: 60, // Adjust based on header height
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    },
});
