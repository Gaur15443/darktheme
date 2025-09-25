import {Alert} from 'react-native';
import DocumentPicker from '@react-native-documents/picker';
import Toast from 'react-native-toast-message';

/**
 * Function to pick specific document files.
 * @returns {Promise<Object|null>} A promise that resolves to the picked file object, or null if no file was picked.
 */
export const CommunityDocumentUploader = async () => {
  try {
    const res = await DocumentPicker.pick({
      type: [
        DocumentPicker.types.pdf,
        DocumentPicker.types.doc,
        DocumentPicker.types.docx,
        DocumentPicker.types.xls,
        DocumentPicker.types.xlsx,
      ], // Allow users to pick only specified file types
    });

    if (res) {
      return res; // Return the picked file object
    }
  } catch (err) {
    if (DocumentPicker.isCancel(err)) {
      return null;
    } else {
      Toast.show({
        type: 'error',
        text1:
          'Invalid file type selected. Allowed types: .pdf, .doc, .docx, .xls, .xlsx',
      });
      throw err;
    }
  }
};
