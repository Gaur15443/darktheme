import { View } from 'react-native'
import React, { memo, useCallback } from 'react'
import { useTheme } from 'react-native-paper'
import { Notifications } from '../../../components';
import { useNavigation } from '@react-navigation/native';
import AstroHeader from '../../../common/AstroHeader';

const AstroNotifications = function () {
    const theme = useTheme();
    const navigator = useNavigation();
    const goBack = useCallback(() => {
        navigator.goBack();
    }, []);
    return (
        <View style={{
            flex: 1,
            backgroundColor: theme.colors.background,
        }}>

            <AstroHeader>
                <AstroHeader.BackAction onPress={goBack} />
                <AstroHeader.Content title="Notification" />
            </AstroHeader>

            <View style={{
                paddingHorizontal: 10
            }}>
                <Notifications isFocused={true} />
            </View>
        </View>
    )
}

AstroNotifications.displayName = "AstroNotifications";

export default memo(AstroNotifications);