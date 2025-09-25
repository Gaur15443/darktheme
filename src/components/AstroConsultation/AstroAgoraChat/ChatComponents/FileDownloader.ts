import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import {store} from '../../../../store';

const state = store.getState();
const consultationToasts = state.agoraCallSlice.consultationToasts.consultation;

axiosRetry(axios, {
  retries: 10,
  retryDelay: count => count * 1000,
  retryCondition: error => {
    return error.response?.status === 403 || error.response?.status === 404;
  },
});

export interface OpenFile {
  fileName: string;
  url: string;
  extension: string;
}

function throwFileViewerError(error: Error) {
  let errorMessage = 'An unexpected error occurred. Please try again later.';
  if ((error as Error).message.includes('mime type')) {
    errorMessage = consultationToasts.download_error.compatibility_error.text1;
  } else if ((error as Error).message.includes('network')) {
    errorMessage = consultationToasts.download_error.compatibility_error.text2;
  }
  Toast.show({
    type: 'error',
    text1: errorMessage,
  });
  throw new Error(errorMessage);
}

export async function downloadAndOpenFile({
  fileName,
  url,
  extension,
}: OpenFile) {
  try {
    const localFile = `${RNFS.DocumentDirectoryPath}/${fileName}.${extension}`;
    await RNFS.downloadFile({
      fromUrl: url,
      toFile: localFile,
    }).promise;
    try {
      await FileViewer.open(localFile, {showOpenWithDialog: true});
    } catch (error) {
      console.log('error file from:', error);
      throwFileViewerError(error as Error);
    }
  } catch (error) {
    console.log('error file from 2:', error);
    Toast.show({
      type: 'error',
      text1: 'Unable to download the file',
      text2: (error as Error).message,
    });
  }
}

export async function downloadAudio(audioUri: string): Promise<string> {
  try {
    if (audioUri.startsWith('https://')) {
      const removeParams = `${audioUri.split('?')[0]}`;
      const splitUrlWithSlash = removeParams.split('/');
      const getStoredFileName = splitUrlWithSlash[splitUrlWithSlash.length - 1];

      const fileUri = `${RNFS.CachesDirectoryPath}/${getStoredFileName}`;
      const isExists = await RNFS.exists(fileUri);

      if (!isExists) {
        await axios.head(audioUri);
        await RNFS.downloadFile({fromUrl: audioUri, toFile: fileUri}).promise;
      }

      return fileUri;
    } else {
      return audioUri;
    }
  } catch (error) {
    console.error('Error fetching or downloading audio:', error);
    return audioUri;
  }
}

export async function isFilePresent(
  fileName: string,
  fileExtension: string,
): Promise<boolean> {
  if (!fileName || !fileExtension) {
    return false;
  }
  const fileUri = `${RNFS.DocumentDirectoryPath}/${fileName}.${fileExtension}`;
  return await RNFS.exists(fileUri);
}
