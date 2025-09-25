import React, {useEffect} from 'react';
import {Linking, Platform, Alert} from 'react-native'; // Import Alert from 'react-native'
import remoteConfig from '@react-native-firebase/remote-config';

import VersionCheck from 'react-native-version-check';

const CheckUpdate = () => {
  useEffect(() => {
    /**
     * Checks the latest version of the app from the Apple App Store or Google Play Store
     * and  displays an alert to the user if an update is required.
     *
     * @returns {Promise<void>} Returns a Promise that resolves when the function completes.
     */

    const checkAppVersion = async () => {
      let countryName = 'in'; // getCountry() seems not correct..

      // Get the package name of the app
      const packageName = VersionCheck?.getPackageName();

      // Get the country code for the app store
      try {
        const resp = await VersionCheck?.getCountry(); // Get the country code for the app store
        console.log(resp, 'resp ==>');
        countryName = resp;
      } catch (err) {
        countryName = 'in'; // Set default country code to 'in' if an error occurs
      }

      // Get the latest version of the app from the Apple App Store or Google Play Store
      try {
        const latestVersion =
          Platform.OS === 'ios'
            ? await fetch(
                `https://itunes.apple.com/${countryName.toLowerCase()}/lookup?bundleId=${packageName}`,
              )
                .then(r => r.json())
                .then(res => {
                  return res?.results[0]?.version; // Get the version number from the response
                })
            : await VersionCheck.getLatestVersion({
                provider: 'playStore',
                packageName: 'com.imeuswe.app',
                ignoreErrors: true,
              });

        // Get the current version of the app
        const currentVersion = VersionCheck.getCurrentVersion();
        // Check if the latest version is greater than the current version
        if (latestVersion > currentVersion) {
          // Set default value for IS_FORCE_UPDATE to false in Firebase Remote Config
          await remoteConfig().setDefaults({IS_FORCE_UPDATE: false});
          await remoteConfig().fetch(3600); // It will call one hour once
          await remoteConfig().activate();

          const isForceUpdate = remoteConfig()
            .getValue('IS_FORCE_UPDATE')
            .asBoolean();

          // Check if the latest version is greater than the current version
          if (latestVersion > currentVersion && isForceUpdate) {
            // Display an alert to the user to update the app
            Alert.alert(
              'Update Required',
              'A new version of the app is available. Please update to continue using the app.',
              [
                {
                  text: 'Update Now',
                  onPress: () => {
                    // Open the app store link to update the app
                    Platform.OS === 'ios'
                      ? VersionCheck.getAppStoreUrl({
                          appID: '1634383924',
                        })
                          .then(resp => Linking.openURL(resp.toLowerCase()))
                          .catch(err => console.log(err))
                      : VersionCheck.getPlayStoreUrl({
                          packageName: 'com.imeuswe.app',
                        })
                          .then(resp => Linking.openURL(resp))
                          .catch(err => console.log(err));
                  },
                },
              ],
              {cancelable: false},
            );
          } else {
            // App is up-to-date; proceed with the app
          }
        }
      } catch (error) {
        // Handle error while checking app version
        console.error('Error checking app version:', error);
      }
    };

    checkAppVersion();
  }, []);
};

export default CheckUpdate;
