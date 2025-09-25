import {
  ActivityIndicator,
  Platform,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import FastImage from '@d11/react-native-fast-image';
import {VideoThumbnail} from '../../../../core';
import RNFS from 'react-native-fs';
import ChatFileDownloadIcon from '../../../../images/Icons/ChatFileDownloadIcon';
import {
  downloadAndOpenFile,
  downloadAudio,
  isFilePresent,
  OpenFile,
} from './FileDownloader';
import {extractFileNameFromUrl} from './extractFileNameFromUrl';
import axiosRetry from 'axios-retry';
import axios from 'axios';
import ChatAudioPlayer from './ChatAudioPlayer';
import ErrorBoundary from '../../../../common/ErrorBoundary';
import {Pressable} from 'react-native-gesture-handler';

axiosRetry(axios, {
  retries: 10,
  retryDelay: count => count * 1000,
  retryCondition: error => {
    return error.response?.status === 403 || error.response?.status === 404;
  },
});

function CustomGrid({children}: {children: React.ReactNode}) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}

CustomGrid.Row = ({children}: {children: React.ReactNode}) => {
  return (
    <ErrorBoundary>
      <View style={styles.row}>{children}</View>
    </ErrorBoundary>
  );
};

CustomGrid.Column = ({children}: {children: React.ReactNode}) => {
  return (
    <ErrorBoundary>
      <View style={styles.column}>{children}</View>
    </ErrorBoundary>
  );
};

CustomGrid.RenderMedia = ({
  type = 'image',
  src,
  thumbnailUrl,
  duration = 0,
  onVideoPress = () => {},
}: {
  type: string;
  src: string;
  thumbnailUrl?: string;
  duration?: number;
  onVideoPress?: () => undefined;
}) => {
  const fileSrc = useRef('');

  const [fileName, setFileName] = useState<string>('');
  const [fileExtension, setFileExtension] = useState<string>('');
  const [thumbnailAvailable, setThumbnailAvailable] = useState<boolean>(false);
  const [audioAvailable, setAudioAvailable] = useState<boolean>(false);
  const [audioUri, setAudioUri] = useState<string>('');
  const [isFilePresentLocally, setIsFilePresentLocally] =
    useState<boolean>(false);
  const [fileDownloading, setFileDownloading] = useState<boolean>(false);

  useMemo(() => {
    if (
      type?.toLowerCase?.() !== 'image' &&
      type?.toLowerCase?.() !== 'video' &&
      type?.toLowerCase?.() !== 'audio' &&
      src.startsWith('https://')
    ) {
      const _fileData = extractFileNameFromUrl(src);
      setFileName(_fileData?.name ?? '');
      setFileExtension(_fileData?.extension ?? '');
      _isFilePresentLocally({
        __fileName: _fileData?.name ?? '',
        __fileExtension: _fileData?.extension ?? '',
      });
      fileSrc.current = src;
      return _fileData;
    }
  }, [src, type]);

  useMemo(() => {
    const checkImage = async () => {
      if (
        thumbnailUrl &&
        thumbnailUrl?.length > 0 &&
        thumbnailUrl.includes('https')
      ) {
        try {
          await axios.head(thumbnailUrl);
          setThumbnailAvailable(true);
        } catch (err) {
          console.log('Image not yet available, retries exhausted.');
          setThumbnailAvailable(true);
        }
      }
    };

    checkImage();
  }, [thumbnailUrl]);

  function handleDownloadFile() {
    setFileDownloading(true);
    const fileDetails: OpenFile = {
      fileName: fileName || 'document',
      url: fileSrc.current,
      extension: fileExtension || '',
    };

    downloadAndOpenFile(fileDetails).then(() => {
      setIsFilePresentLocally(true);
      setFileDownloading(false);
    });
  }

  function _isFilePresentLocally({
    __fileName,
    __fileExtension,
  }: {
    __fileName: string;
    __fileExtension: string;
  }) {
    isFilePresent(__fileName, __fileExtension).then((isPresent: boolean) => {
      setIsFilePresentLocally(isPresent);
    });
  }

  useEffect(() => {
    if (type?.toLowerCase?.() === 'audio' && src.includes('https')) {
      const checkAudio = async () => {
        try {
          const data = await downloadAudio(src);
          setAudioUri(data);
          setAudioAvailable(true);
        } catch (err) {
          setAudioUri(src);
          setAudioAvailable(true);
        }
      };
      checkAudio();
    }
  }, [src]);

  return (
    <ErrorBoundary>
      {type?.toLowerCase?.() === 'image' && (
        <FastImage source={{uri: src}} style={styles.imageContainer} />
      )}
      {type?.toLowerCase?.() === 'video' && (
        <View
          style={{
            position: 'relative',
            height: '100%',
          }}>
          {!thumbnailAvailable ? (
            <View style={styles.loader}>
              <ActivityIndicator color={'white'} size="large" />
            </View>
          ) : (
            <VideoThumbnail
              preventPlay
              disablePlayPause
              useFastImage={true}
              renderLocalThumbnailIos={true}
              src={src}
              thumbnailUrl={
                thumbnailUrl && thumbnailUrl?.length > 0 ? thumbnailUrl : src
              }
              imuwMediaStyle={styles.imageContainer}
              imuwThumbStyle={styles.imageContainer}
              resize="cover"
              thumbnailStyle={styles.imageContainer}
              customPress={onVideoPress}
            />
          )}
        </View>
      )}
      {type?.toLowerCase?.() === 'audio' && (
        <>
          {!audioAvailable ? (
            <View style={styles.loader}>
              <ActivityIndicator color={'white'} size="large" />
            </View>
          ) : (
            <View style={styles.audioMainContainer}>
              <View>
                <View
                  style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                  <ChatAudioPlayer
                    sliderContainer={
                      Platform.OS === 'ios' ? {marginTop: 2} : {}
                    }
                    src={audioUri}
                  />
                </View>
              </View>
            </View>
          )}
        </>
      )}
      {type?.toLowerCase?.()?.includes('application') && (
        <Pressable
          activeOpacity={fileDownloading ? 1 : 0.5}
          disabled={fileDownloading}
          style={styles.fileContainer}
          onPress={handleDownloadFile}>
          <Text numberOfLines={1} style={styles.fileText}>
            {fileName}.{fileExtension}
          </Text>
          {!isFilePresentLocally && (
            <Pressable
              disabled={fileDownloading}
              onPress={handleDownloadFile}
              style={styles.downloadButton}>
              <View style={styles.downloadIcon}>
                {fileDownloading ? (
                  <ActivityIndicator color={'white'} size="small" />
                ) : (
                  <ChatFileDownloadIcon />
                )}
              </View>
            </Pressable>
          )}
        </Pressable>
      )}
    </ErrorBoundary>
  );
};

CustomGrid.Mask = ({
  children,
  _index,
  activateIndex = null,
  count = null,
  style = {},
  textStyle = {},
}: {
  children: React.ReactNode;
  _index: number;
  activateIndex: number | null;
  count: number | null;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}) => {
  return (
    <ErrorBoundary>
      {activateIndex && activateIndex === _index && (
        <View style={[style]}>
          {count && count?.toString?.()?.length > 0 && (
            <Text style={[textStyle]}>{`+${count}`}</Text>
          )}
        </View>
      )}
      {children}
    </ErrorBoundary>
  );
};

CustomGrid.Equal = ({
  children,
  style = {},
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) => {
  return <View style={[styles.equal, style]}>{children}</View>;
};

CustomGrid.Container = ({
  children,
  style = {},
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) => {
  return <View style={[style]}>{children}</View>;
};

export default CustomGrid;

const styles = StyleSheet.create({
  imageContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  equal: {
    flex: 1,
  },
  column: {
    flexDirection: 'column',
    gap: 10,
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    flex: 1,
  },
  fileContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  fileText: {
    color: 'white',
    fontWeight: 600,
    flex: 4,
  },
  downloadButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  downloadIcon: {marginLeft: 'auto'},
  buttonStyle: {
    backgroundColor: 'white',
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    gap: 5,
  },
  audioContainer: {},
  loader: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  audioMainContainer: {
    width: '100%',
  },
});
