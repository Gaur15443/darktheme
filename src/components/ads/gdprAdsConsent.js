// https://docs.page/invertase/react-native-google-mobile-ads/european-user-consent
import AsyncStorage from '@react-native-async-storage/async-storage';
import {requestTrackingPermission} from 'react-native-tracking-transparency';
import mobileAds, {
  AdsConsent,
  AdsConsentDebugGeography,
} from 'react-native-google-mobile-ads';
import Toast from 'react-native-toast-message';
import {Platform} from 'react-native';

const debugParams = {
  debugGeography: AdsConsentDebugGeography.EEA,
  testDeviceIdentifiers: ['test_device'],
};

// Initialize AdsMob
function initializeMobileAdsSdk() {
  mobileAds().initialize();
}

// Check consent status
async function checkIsNotAgreement() {
  const {
    activelyScanDeviceCharacteristicsForIdentification,
    applyMarketResearchToGenerateAudienceInsights,
    createAPersonalisedAdsProfile,
    createAPersonalisedContentProfile,
    developAndImproveProducts,
    measureAdPerformance,
    measureContentPerformance,
    selectBasicAds,
    selectPersonalisedAds,
    selectPersonalisedContent,
    storeAndAccessInformationOnDevice,
    usePreciseGeolocationData,
  } = await AdsConsent.getUserChoices().catch(_error => {});

  return (
    applyMarketResearchToGenerateAudienceInsights === false ||
    createAPersonalisedAdsProfile === false ||
    createAPersonalisedContentProfile === false ||
    developAndImproveProducts === false ||
    measureAdPerformance === false ||
    measureContentPerformance === false ||
    selectBasicAds === false ||
    selectPersonalisedAds === false ||
    selectPersonalisedContent === false ||
    storeAndAccessInformationOnDevice === false ||
    usePreciseGeolocationData === false
  );
}

async function requestConsent() {
  return await AdsConsent.requestInfoUpdate();
  // return await AdsConsent.requestInfoUpdate(debugParams); // Add debugParams during testing
}

// Load GDPR consent form and check consent status
export async function loadGdprAdsConsent() {
  try {
    // await AdsConsent.reset(); // Uncomment for testing
    // await AsyncStorage.removeItem('consentStatus'); // Uncomment for testing

    const data = await requestConsent();
    if (data.isConsentFormAvailable || data.isConsentFormAvailable === 1) {
      const resultForm = await AdsConsent.loadAndShowConsentFormIfRequired();

      // If the user has already consented or refused consent, check the consent status and request consent if needed
      if (data?.status === 'OBTAINED') {
        const isNotAgreement = await checkIsNotAgreement();

        if (isNotAgreement) {
          await AdsConsent.showForm();
        }
      }

      if (resultForm.canRequestAds === true) {
        initializeMobileAdsSdk();
        await AsyncStorage.setItem('consentStatus', JSON.stringify(true));
      }
    } else {
      initializeMobileAdsSdk();
      await AsyncStorage.setItem('consentStatus', JSON.stringify(true));
    }
  } catch (error) {
    Toast.show({
      type: 'error',
      text1: error,
    });
    initializeMobileAdsSdk();
  }
}

// Check if Consent is Available (EEA region)
export async function checkIsConsentAvailable() {
  try {
    const data = await requestConsent();
    return data.isConsentFormAvailable;
  } catch (error) {
    Toast.show({
      type: 'error',
      text1: error,
    });
    return false;
  }
}

// Show consent form on button click or screen navigation, and check consent status afterward
export async function showAdsConsentForm(consentCallback, notConsentCallback) {
  try {
    const data = await requestConsent();

    if (data.isConsentFormAvailable) {
      const isNotAgreement = await checkIsNotAgreement();

      if (isNotAgreement) {
        await AdsConsent.showForm();

        // Re-check consent status
        const isNotAgreementResult = await checkIsNotAgreement();

        if (isNotAgreementResult) {
          // Handle non-consent
          notConsentCallback && notConsentCallback();
        } else {
          // Handle consent
          consentCallback && consentCallback();
        }
      } else {
        // Handle consent
        consentCallback && consentCallback();
      }
    } else {
      // Handle case where no consent form is available
      consentCallback && consentCallback();
    }
  } catch (error) {
    Toast.show({
      type: 'error',
      text1: error,
    });
  }
}

// Show privacy options form in settings
export async function showPrivacyOptionsForm() {
  try {
    const data = await requestConsent();

    if (data.isConsentFormAvailable) {
      await AdsConsent.showPrivacyOptionsForm();
    }
  } catch (error) {
    Toast.show({
      type: 'error',
      text1: error,
    });
  }
}
