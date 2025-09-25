import {PermissionsAndroid, Platform} from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';

// Check if the current platform is iOS.
const IS_IOS = Platform.OS === 'ios' || false;

/**
 * Downloads a file from a specified URL and saves it to the device's storage.
 *
 * @param {object} options - Download options
 * @param {string} options.url - The URL of the file to download
 * @param {string} options.httpMethod - The HTTP method to use for the download (e.g. 'GET', 'POST')
 * @param {string} options.filename - The name of the file to save
 * @param {object} [options.headers] - HTTP headers to include with the request
 * @param {string} [options.mimeType='application/pdf'] - The MIME type of the file
 * @param {object} [options.payload={}] - Payload data to include with the request
 * @return {Promise} A promise that resolves when the download is complete
 */
export default async function downloader({
  url,
  httpMethod,
  filename,
  headers = {
    //some headers ..
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  },
  mimeType = 'application/pdf',
  payload = {},
}) {
  return new Promise((resolve, reject) => {
    try {
      if (getPermission()) {
        const {dirs} = ReactNativeBlobUtil.fs;
        const dirToSave = IS_IOS ? dirs?.DocumentDir : dirs?.DownloadDir;
        const splitFileName = filename?.split?.('.');
        const FilenameWithTimeStamp =
          splitFileName?.[0] + '_' + Date.now() + '.' + splitFileName?.[1];

        const androidConfigfb = {
          fileCache: true,
          notification: true,
          mediaScannable: true,
          title: `${FilenameWithTimeStamp}`,
          path: `${dirToSave}/${FilenameWithTimeStamp}`,
        };

        // iOS configuration options for downloading files
        // addAndroidDownloads: specify additional configuration options for Android, not used in iOS
        // useDownloadManager: use the Android Download Manager to handle the download
        // notification: show a notification when the download is complete
        // mediaScannable: make the downloaded file visible to the media scanner
        // mime: specify the MIME type of the downloaded file
        // title: specify the title of the downloaded file
        // path: specify the path where the downloaded file will be saved
        const iosConfig = {
          fileCache: true,
          addAndroidDownloads: {
            useDownloadManager: true,
            notification: true,
            mediaScannable: true,
            mime: 'application/pdf',
            title: `${FilenameWithTimeStamp}`,
            path: `${dirs.DownloadDir}/Download/${FilenameWithTimeStamp}`,
          },
          useDownloadManager: true,
          notification: true,
          mediaScannable: true,
          title: `${FilenameWithTimeStamp}`,
          path: `${dirToSave}/Download/${FilenameWithTimeStamp}`,
        };

        // 🎨 Select the appropriate configuration options based on the platform.
        // 🍏 On iOS, use the iOSConfig object.
        // 🤖 On Android, use the androidConfigfb object.
        const configOptions = Platform.select({
          ios: iosConfig,
          android: androidConfigfb,
        });
        ReactNativeBlobUtil.config(configOptions || {})
          .fetch(httpMethod, encodeURI(url), headers, JSON.stringify(payload))
          .then(res => {
            // Write the downloaded file to the specified path and preview it on iOS,
            // or open it with the default app on Android.
            if (IS_IOS) {
              // ReactNativeBlobUtil.fs.writeFile(
              //   iosConfig.path,
              //   res.data,
              //   'base64',
              // );
              ReactNativeBlobUtil.ios.previewDocument(iosConfig.path);
            } else {
              ReactNativeBlobUtil.android.actionViewIntent(
                res.path(),
                mimeType,
              );
            }

            resolve(res);
            res?.close?.();
          })
          .catch(err => {
            reject(err?.message);
          });
      }
    } catch (error) {
      reject(error?.message);
    }
  });
}

/**
 * Checks and requests permission to write to external storage.
 *
 * @return {boolean} True if permission is granted, false otherwise
 */
const getPermission = async () => {
  if (IS_IOS) {
    return true;
  } else {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      );
      if (PermissionsAndroid.RESULTS.GRANTED === 'granted') {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      throw new Error(err.message);
    }
  }
};
