import {StyleSheet, TouchableOpacity, View} from 'react-native';
import React, {memo} from 'react';
import ChatSendIcon from '../../../../images/Icons/ChatSendIcon';
import {IMessage, SendProps} from 'react-native-gifted-chat';
import ErrorBoundary from '../../../../common/ErrorBoundary';

interface SendButtonProps {
  props: SendProps<IMessage>;
  onPress: () => void;
}

export default memo(function SendButton({
  props,
  onPress = () => {},
}: SendButtonProps) {
  function sendMessage() {
    onPress();
    const trimmedText = props.text?.trim();
    if (trimmedText && props?.onSend) {
      props.onSend([{text: trimmedText} as never], true);
    }
  }
  return (
    <ErrorBoundary>
      <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
        <ChatSendIcon />
      </TouchableOpacity>
    </ErrorBoundary>
  );
});

const styles = StyleSheet.create({
  sendButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    marginBottom: 10,
    paddingRight: 10,
  },
});
