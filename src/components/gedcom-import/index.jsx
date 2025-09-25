import { useEffect, useState } from 'react';
import {
  Image,
  Modal,
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';
import {
  ActivityIndicator,
  Button,
  IconButton,
  Text,
  useTheme,
} from 'react-native-paper';
import { DocumentUploader } from '../../common/document-uploader';
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  getprivateTreeList,
  importGedcom,
  listFamilyTrees,
  setTreeItemFromPrivateTree,
} from '../../store/apps/tree';
import { useNavigation } from '@react-navigation/native';
import { CloseIcon } from '../../images/Icons/ModalIcon';
import { Track } from '../../../App';
import Spinner from '../../common/ButtonSpinner';
import FastImage from '@d11/react-native-fast-image';

const GedcomImport = ({
  handleConfirm,
  openDialog,
  setConfirmBtnLoading,
  setGedcomImport,
  sethandleClose,
  isCloseGender,
}) => {
  const windowHeight = Dimensions.get('window').height;
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const theme = useTheme();
  const styles = createStyles(theme);

  // This state would determine if the drawer sheet is visible or not
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(true);
  const [isPickerLoader, setPickerLoader] = useState(false);
  const [isLoading, setLoaded] = useState(false);
  const [gedcomFile, setGedcomFile] = useState(null);
  const privateTree = useSelector(state => state.getprivateTreeList.treeList);
  const userData = useSelector(state => state?.userInfo);

  // Function to open the bottom sheet
  const handleOpenBottomSheet = () => {
    setIsBottomSheetOpen(true);
  };

  // Function to close the bottom sheet
  const handleCloseBottomSheet = () => {
    setIsBottomSheetOpen(false);
    handleConfirm();
    setConfirmBtnLoading(false);
    openDialog();
    isCloseGender();
  };

  const handleGedcomFile = async () => {
    try {
      setPickerLoader(true);
      const pickedFile = await DocumentUploader();
      if (pickedFile) {
        setPickerLoader(false);
        setConfirmBtnLoading(false);
        setGedcomFile(pickedFile);
      } else {
        setPickerLoader(false);
        setConfirmBtnLoading(false);
        Toast.show({
          type: 'error',
          text1: 'No file picked.',
        });
      }
    } catch (err) {
      setPickerLoader(false);
      setConfirmBtnLoading(false);
      Toast.show({
        type: 'error',
        text1: err.message,
      });
      // Handle error
    }
  };

  let GedComRes;
  let privateTreeRes;
  const uploadGedcom = async () => {
    try {
      setLoaded(true);
      const formData = new FormData();
      formData.append('gedFile', {
        uri: gedcomFile[0].uri,
        name: gedcomFile[0].name,
        type: gedcomFile[0].type || 'application/octet-stream', // Specify the file type if available, otherwise default to 'application/octet-stream'
      });

      let GedComRes = await dispatch(importGedcom(formData)).unwrap();

      setLoaded(false);
      if (GedComRes?.gedcom_log?.length > 0) {
        const logs = GedComRes.gedcom_log;
        logs.forEach(log => {
          if (log.LOG === 'Error') {
            const errorMessage = log.Name;
            const keyword = 'Import Failed:';
            const parts = errorMessage.includes(keyword)
              ? errorMessage.split(keyword)
              : [errorMessage];
            const messageElement =
              parts.length > 1 ? `${keyword} ${parts[1]}` : errorMessage;

            setGedcomImport(false);

            if (errorMessage.includes(keyword)) {
              setGedcomImport(false);
              sethandleClose();

              Toast.show({
                type: 'error',
                text1: keyword,
                text2: parts[1].trim(),
              });
            } else {
              setGedcomImport(false);
              sethandleClose();
              Toast.show({
                type: 'error',
                text1: messageElement,
              });
            }
          }
        });
      }
      privateTreeRes = await dispatch(listFamilyTrees()).unwrap();
      if (privateTreeRes) {
        const ownerTree = privateTreeRes?.treeList?.filter(
          record => record.user.role === 'owner',
        );
        if (ownerTree?.length > 0) {
          dispatch(setTreeItemFromPrivateTree(ownerTree));
          setLoaded(false);
          setConfirmBtnLoading(false);
          setGedcomImport(false);
          navigation.navigate('TreeScreen', {
            family: ownerTree[0]?.tree?.name,
            currentTreeDetails: ownerTree[0],
            gedcomLogs: GedComRes,
          });
          Toast.show({
            type: 'success',
            text1: 'Tree Created!',
          });
        }
      }

      /* customer io and mixpanel event changes  start */
      Track({
        cleverTapEvent: 'gedcom_import',
        mixpanelEvent: 'gedcom_import',
        userData,
      });
      /* clevertap and mixpanel events ---end****/
    } catch (error) {
      setLoaded(false);
    }
  };

  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        // We use the state here to toggle visibility of Bottom Sheet
        visible={isBottomSheetOpen}
        // We pass our function as default function to close the Modal
        onRequestClose={handleCloseBottomSheet}>
        <View style={[styles.bottomSheet, { height: windowHeight * 0.55 }]}>
          <View
            style={{
              flex: 0,
              width: '100%',
              justifyContent: 'flex-end',
              flexDirection: 'row',
            }}>
            <TouchableOpacity
              testID="closeGedcomPopup"
              accessibilityLabel="closeGedcomPopup"
              sty
              onPress={handleCloseBottomSheet}>
              <CloseIcon color="black" />
            </TouchableOpacity>
          </View>
          <View>
            <Text variant="headlineMedium">Import Gedcom file</Text>
          </View>
          {!gedcomFile ? (
            <View style={[styles.container]}>
              <TouchableOpacity
                id="chooseGedcomFile"
                accessibilityLabel="chooseGedcomFile"
                mode="contained"
                textColor="white"
                style={[styles.buttonContainer, styles.buttonShadow]}
                onPress={() => handleGedcomFile()}
                disabled={isPickerLoader}>
                {isPickerLoader ? (
                  <Spinner color="white" />
                ) : (
                  <View style={styles.buttonContent} disabled={isPickerLoader}>
                    <Icon
                      name="cloud"
                      size={18}
                      style={styles.icon}
                      color="#fff"
                    />
                    <Text style={[styles.buttonText]}>
                      Choose a GEDCOM file
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View
              style={{
                paddingVertical: 30,
                display: 'flex',
                alignItems: 'center',
              }}>
              <FastImage
                source={{
                  uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/gedSumanth.png',
                }}
                style={{ width: 80, height: 80 }}
              />
              <Text style={{ paddingVertical: 20 }}>{gedcomFile[0].name}</Text>
              <Button
                testID="gedcomConfirmed"
                accessibilityLabel="gedcomConfirmed"
                mode="contained"
                textColor="white"
                disabled={isLoading}
                loading={isLoading}
                style={{ width: '100%', borderRadius: 10 }}
                onPress={() => uploadGedcom()}>
                Confirm
              </Button>
            </View>
          )}
        </View>
      </Modal>
    </>
  );
};
const createStyles = theme => {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 30,
      marginBottom: 25,
      width: '80%',
    },
    bottomSheet: {
      position: 'absolute',
      left: 0,
      right: 0,
      justifyContent: 'flex-start',
      alignItems: 'center',
      backgroundColor: 'white',
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      paddingVertical: 23,
      paddingHorizontal: 25,
      bottom: 0,
      borderWidth: 1,
      borderColor: 'grey',
      elevation: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    buttonShadow: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,

      elevation: 2,
    },
    buttonContainer: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: 46,
      borderRadius: 8,
      backgroundColor: theme.colors.primary,
      paddingVertical: 12,
    },
    buttonContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    buttonText: {
      fontSize: 16,
      color: 'white',
    },
    icon: {
      position: 'relative',
      right: 10,
      marginRight: '8px',
    },
  });
};

GedcomImport.propTypes = {
  handleConfirm: PropTypes.func.isRequired,
  openDialog: PropTypes.func.isRequired,
};

export default GedcomImport;
