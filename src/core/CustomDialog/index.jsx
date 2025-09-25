import React from 'react';
import PropTypes from 'prop-types';
import {TouchableOpacity, StyleSheet} from 'react-native';
import {Dialog, Button, Portal, useTheme, Text} from 'react-native-paper';
import {CloseIcon} from '../../images/Icons/ModalIcon';
import NewTheme from '../../common/NewTheme';

const CustomDialog = ({
  visible,
  onClose,
  title,
  message,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
  customBody = null,
  disabled = false,
  titleStyle = {},
  messageStyle = {},
  confirmStyle = {},
  cancelStyle = {},
  dialogStyle = {},
}) => {
  const theme = useTheme();

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={onClose}
        style={{
          backgroundColor: theme.colors.onWhite100,
          borderRadius: 8,
          ...dialogStyle,
        }}>
        <TouchableOpacity
          testID="close-dialog"
          onPress={onClose}
          style={styles.closeButton}>
          <CloseIcon />
        </TouchableOpacity>
        {title === 'Logout' ? null : (
          <Dialog.Title style={[styles.title, {...titleStyle}]}>
            {title}
          </Dialog.Title>
        )}
        {message && (
          <Dialog.Content>
            <Text
              style={[
                title === 'Logout' ? styles.logoutMessage : styles.message,
                {...messageStyle},
              ]}>
              {message}
            </Text>
          </Dialog.Content>
        )}
        {customBody && <Dialog.Content>{customBody}</Dialog.Content>}

        <Dialog.Actions style={{flexDirection: 'column'}}>
          <Button
            testID="confirm-action"
            backgroundColor={theme.colors.primary}
            onPress={onConfirm}
            style={[
              styles.confirmButton,
              {
                opacity: disabled ? 0.5 : 1,
                backgroundColor: NewTheme.colors.primaryOrange,
                borderColor: NewTheme.colors.primaryOrange,
              },
            ]}
            disabled={disabled}
            labelStyle={[
              styles.buttonLabel,
              {color: theme.colors.onWhite100, ...confirmStyle},
            ]}>
            {confirmLabel}
          </Button>
          <Button
            testID="cancel-action"
            onPress={onCancel}
            style={styles.cancelButton}
            labelStyle={[
              styles.buttonLabel,
              {color: NewTheme.colors.primaryOrange, ...cancelStyle},
            ]}>
            Cancel
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  closeButton: {
    position: 'absolute',
    top: -35,
    right: -6,
    backgroundColor: 'lightgray',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    elevation: 9,
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '700',
    color: 'black',
  },

  message: {
    fontSize: 16,
    marginLeft: 10,
    textAlignVertical: 'center',
    textAlign: 'center',
    fontWeight: '500',
    color: 'black',
  },
  logoutMessage: {
    fontSize: 24,
    marginLeft: 10,
    textAlignVertical: 'center',
    textAlign: 'center',
    fontWeight: '500',
    color: '#4b4a50',
    paddingTop: 20,
    marginBottom: -10,
  },
  confirmButton: {
    // flex: 1,
    borderWidth: 2,
    borderRadius: 8,
    marginVertical: 5,
    width: '100%',
    marginRight: 0,
  },
  cancelButton: {
    // flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: NewTheme.colors.lightGrayBorder,
    borderRadius: 8,
    width: '100%',
    marginVertical: 5,
    marginBottom: -8,
  },
  buttonLabel: {
    textTransform: 'capitalize',
  },
  input: {
    backgroundColor: 'white',
    marginVertical: 5,
  },
});

CustomDialog.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  confirmLabel: PropTypes.string,
  customBody: PropTypes.element,
  disabled: PropTypes.bool,
  titleStyle: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  messageStyle: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  confirmStyle: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  cancelStyle: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  dialogStyle: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
};

export default CustomDialog;
