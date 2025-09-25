import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {memo, useMemo} from 'react';
import {RootState} from '../../../../store';
import {useSelector} from 'react-redux';
import ReplyCloseIcon from '../../../../images/Icons/ReplyCloseIcon';
import Gallery from './ReplyIcons/Gallery';
import Video from './ReplyIcons/Video';
import Audio from './ReplyIcons/Audio';
import File from './ReplyIcons/File';
import FastImage from '@d11/react-native-fast-image';
import {extractFileNameFromUrl} from './extractFileNameFromUrl';
import ErrorBoundary from '../../../../common/ErrorBoundary';
import {Pressable} from 'react-native-gesture-handler';

interface ChatReplyProps {
  children: React.ReactNode;
  selectedChatDetails: {
    chatId: string;
    text: string;
    userId: string;
    media?:
      | {
          mediaUrl: string;
          mediaType: string;
        }[]
      | string;
  };
  onClose: () => void;
}

interface Media {
  mediaUrl: string;
  thumbnailUrl: string;
  mediaType: string;
}

const GetIcon = memo(
  ({media, msgText}: {media: Array<Media>; msgText: string}) => {
    const mediaData = useMemo(() => {
      let content;
      if (media.length === 1) {
        if (media?.[0]?.mediaType?.toLowerCase?.() === 'image') {
          return {
            totalcount: 1,
            content: (
              <View style={styles.content}>
                <View
                  style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
                  <Gallery />
                  <Text
                    numberOfLines={1}
                    style={[styles.msg, {maxWidth: '80%'}]}>
                    {msgText?.length > 0 ? msgText : 'Photo'}
                  </Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    position: 'absolute',
                    right: 0,
                    top: -22,
                    height: 40,
                    width: 40,
                  }}>
                  <FastImage
                    style={{flex: 1, borderRadius: 6}}
                    source={{uri: media?.[0]?.mediaUrl}}
                  />
                </View>
              </View>
            ),
          };
        } else if (media?.[0]?.mediaType?.toLowerCase?.() === 'video') {
          return {
            totalcount: 1,
            content: (
              <View style={styles.content}>
                <View
                  style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
                  <Video />
                  <Text
                    numberOfLines={1}
                    style={[styles.msg, {maxWidth: '80%'}]}>
                    {msgText?.length > 0 ? msgText : 'Video'}
                  </Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    position: 'absolute',
                    right: 0,
                    top: -22,
                    height: 40,
                    width: 40,
                  }}>
                  <FastImage
                    style={{flex: 1, borderRadius: 6}}
                    source={{uri: media?.[0]?.thumbnailUrl}}
                  />
                </View>
              </View>
            ),
          };
        } else if (media?.[0]?.mediaType?.toLowerCase?.() === 'audio') {
          return {
            totalcount: 1,
            content: (
              <View style={styles.content}>
                <Audio />
                <Text style={styles.msg}>
                  {msgText?.length > 0 ? msgText : 'Audio'}
                </Text>
              </View>
            ),
          };
        } else {
          const file = extractFileNameFromUrl(media?.[0].mediaUrl);
          const fullFileName = file?.name + '.' + file?.extension;
          return {
            totalcount: 1,
            content: (
              <View style={styles.content}>
                <File />
                <Text style={styles.msg}>
                  {msgText?.length > 0
                    ? msgText
                    : fullFileName?.length > 0
                      ? fullFileName
                      : 'File'}
                </Text>
              </View>
            ),
          };
        }
      } else {
        //multiple media
        const totalImages = media.filter(
          item => item?.mediaType?.toLowerCase?.() === 'image',
        )?.length;
        const totalVideos = media.filter(
          item => item?.mediaType?.toLowerCase?.() === 'video',
        )?.length;

        if (totalImages > 0 && totalVideos <= 0) {
          content = (
            <View style={styles.content}>
              <Gallery />
              <Text style={styles.msg}>{totalImages} Photos</Text>
            </View>
          );
        } else if (totalImages <= 0 && totalVideos > 0) {
          content = (
            <View style={styles.content}>
              <Video />
              <Text style={styles.msg}>{totalVideos} Video</Text>
            </View>
          );
        } else {
          content = (
            <View style={styles.content}>
              <Gallery />
              <Text style={styles.msg}>
                {totalImages} {totalImages > 1 ? 'Photos' : 'Photo'},{' '}
                {totalVideos} {totalVideos > 1 ? 'Videoa' : 'Video'}
              </Text>
            </View>
          );
        }
        return {totalcount: media.length, content};
      }
    }, [media]);

    return <ErrorBoundary>{mediaData.content}</ErrorBoundary>;
  },
);

export default memo(function ChatReply({
  children,
  selectedChatDetails = {
    chatId: '',
    text: '',
    userId: '',
    media: [],
  },
  onClose = () => {},
}: ChatReplyProps) {
  const chatReqDetails = useSelector(
    (state: RootState) => state.agoraCallSlice.chatReqDetails,
  );
  return (
    <ErrorBoundary>
      {(selectedChatDetails?.text?.length > 0 ||
        selectedChatDetails?.media?.length > 0) && (
        <View style={styles.replyContainer}>
          <View style={{flex: 1, gap: 2}}>
            <Text numberOfLines={1} style={styles.msg}>
              {selectedChatDetails?.userId !== chatReqDetails.userId
                ? chatReqDetails.displayName
                : 'You'}
            </Text>
            {Array.isArray(selectedChatDetails?.media) &&
            selectedChatDetails?.media.length > 0 ? (
              <GetIcon
                media={selectedChatDetails?.media}
                msgText={selectedChatDetails?.text}
              />
            ) : (
              <>
                {selectedChatDetails?.text?.length > 0 ? (
                  <Text numberOfLines={1} style={[styles.msg]}>
                    {selectedChatDetails?.text}
                  </Text>
                ) : (
                  <></>
                )}
              </>
            )}
          </View>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <ReplyCloseIcon />
          </Pressable>
        </View>
      )}
      {children}
    </ErrorBoundary>
  );
});

const styles = StyleSheet.create({
  replyContainer: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 10,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'space-between',
    padding: 10,
  },
  closeBtn: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 50,
  },
  msg: {fontSize: 13, color: 'rgba(255, 255, 255, 0.75)'},
  content: {flexDirection: 'row', alignItems: 'center', gap: 5},
});
