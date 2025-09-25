import React, { memo } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import PropTypes from 'prop-types';
import { CustomFilledCircle } from '../../../../images';
import NewTheme from '../../../../common/NewTheme';

const CommunityCustomRadio = ({
    label,
    disabled = false,
    checked,
    onPress,
    labelStyle = {},
}) => {
    return (
        <TouchableOpacity
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                pointerEvents: disabled ? 'none' : 'auto',
            }}
            onPress={onPress}>
            <View
                style={{
                    height: 24,
                    width: 24,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: checked
                        ? NewTheme.colors.primaryOrange
                        : NewTheme.colors.primaryOrange,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 5
                }}>
                {checked && (
                    <CustomFilledCircle accessibilityLabel={'CustomFilledCircle'} />
                )}
            </View>
            <Text
                style={[{ marginRight: 8, color: 'grey' }, { ...labelStyle }]}
                accessibilityLabel={`Radio-${label}`}>
                {label}
            </Text>
        </TouchableOpacity>
    );
};

CommunityCustomRadio.propTypes = {
    label: PropTypes.string.isRequired,
    checked: PropTypes.bool.isRequired,
    onPress: PropTypes.func.isRequired,
    labelStyle: PropTypes.object,
};

CommunityCustomRadio.displayName = 'CommunityCustomRadio';

export default memo(CommunityCustomRadio);
