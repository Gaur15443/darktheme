import CryptoJS from 'crypto-js';
import Toast from 'react-native-toast-message';
import authConfig from '../configs';

// 32 bytes key for AES-256 - In production, use environment variable
const ENCRYPTION_KEY = '12345678901234567890123456789012';

/**
 * Decrypts an encrypted text using AES-256-CBC
 * @param {string} encryptedText - Format: "IV:encryptedData" (both hex strings)
 * @returns {string} - Decrypted text
 */
export const decrypt = encryptedText => {
  try {
    const textParts = encryptedText.split(':');
    if (textParts.length !== 2) {
      throw new Error('Invalid encrypted text format');
    }

    const iv = CryptoJS.enc.Hex.parse(textParts[0]);
    const encryptedData = CryptoJS.enc.Hex.parse(textParts[1]);

    // Create key from the encryption key
    const key = CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY);

    // Decrypt using AES
    const decrypted = CryptoJS.AES.decrypt({ciphertext: encryptedData}, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    console.log('decrypted', decrypted.toString(CryptoJS.enc.Utf8));

    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Decryption failed: ' + error.message);
  }
};

/**
 * Helper function to extract and decrypt ID from deeplink URL
 * @param {string} url - Deeplink URL containing encrypted ID
 * @returns {string|null} - Decrypted ID or null if extraction/decryption fails
 */
export const decryptDeeplinkId = url => {
  try {
    // Extract encrypted ID from URL
    // This is a simple example - adjust the extraction logic based on your URL format
    if (url && typeof url === 'string') {
      // For URLs like "...CommunityDetails/encryptedId"
      if (url.includes('CommunityDetails/')) {
        const encryptedId = url.split('CommunityDetails/')[1];
        return decrypt(encryptedId);
      }

      // Add more URL patterns as needed
    }
    return null;
  } catch (error) {
    console.error('Failed to decrypt deeplink ID:', error);
    return null;
  }
};

export function decryptFirebaseToken(token) {
  try {
    const secretKey = authConfig.secretEncryptionKey;
    const [ivBase64, encryptedBase64] = token.split(':');
    if (!ivBase64 || !encryptedBase64) throw new Error('Invalid token format');

    const iv = CryptoJS.enc.Base64.parse(ivBase64);
    const ciphertext = CryptoJS.enc.Base64.parse(encryptedBase64);
    const derivedKey = CryptoJS.SHA256(secretKey);

    const decrypted = CryptoJS.AES.decrypt({ciphertext}, derivedKey, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error.message);
    Toast.show({
      type: 'error',
      text1: 'Error getting Firebase token',
      text2: error.message || 'Unknown error',
    });
    return undefined;
  }
}
