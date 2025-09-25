// FilePicker.js

import {Alert} from 'react-native';
import DocumentPicker from '@react-native-documents/picker';
import Toast from 'react-native-toast-message';

/**
 * Function to pick GEDCOM files.
 * @returns {Promise<Object|null>} A promise that resolves to the picked file object, or null if no file was picked.
 */
export const DocumentUploader = async () => {
  try {
    const res = await DocumentPicker.pick({
      type: [DocumentPicker.types.allFiles], // Allow users to pick any type of file
    });
    // Check if the picked file has a GEDCOM extension
    if (res[0].name.endsWith('.ged')) {
      return res; // Return the picked file object
    } else {
      Toast.show({
        type: 'error',
        text1: 'File type must be Gedcom only',
      });
    }
  } catch (err) {
    if (DocumentPicker.isCancel(err)) {
      return null;
    } else {
      Toast.show({
        type: 'error',
        text1: 'File type must be Gedcom only',
      });
      throw err;
    }
  }
};
