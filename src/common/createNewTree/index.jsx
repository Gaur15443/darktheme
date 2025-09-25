import React, { memo, useState, useEffect } from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Platform,
} from 'react-native';
import {
  ActivityIndicator,
  Button,
  Dialog,
  Paragraph,
  Portal,
  Text,
  useTheme,
  Modal,
} from 'react-native-paper';
import { RadioButton } from 'react-native-paper';
import { CustomInput, GedcomImport } from '../../components';
import Spinner from '../ButtonSpinner';
import { useFormik } from 'formik';
import { createPrivateTree } from '../../store/apps/tree';
import NewTheme from '../../common/NewTheme';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserProfile } from '../../store/apps/fetchUserProfile/index';
import {
  setGenderDataUpdate,
  updateGroupSignupPage,
} from '../../store/apps/auth/index';
import CancelModalIcon from '../../images/Icons/CancelModal/index';
import { CustomButton } from '../../core';
import Toast from 'react-native-toast-message';
import Theme from '../Theme';
import * as yup from 'yup';
import _ from 'lodash';
import PropTypes from 'prop-types';

function CreateNewTree({
  MakeNewTree,
  CancelSelect,
  confirmBtnLoading,
  setConfirmBtnLoading,
  isCloseGender,
}) {
  const [selectPath, setSelectPath] = useState('1');
  const [selectWay, setSelectWay] = useState(false);
  const [isGedcomImport, setGedcomImport] = useState(false);
  const [isVisible, setVisible] = useState(true);
  const [familyName, setFamilyName] = useState('');
  const [openGenderModal, setOpenGenderModal] = useState(false);
  const [selectedGender, setSelectedGender] = useState(null);
  const [isGenderLoading, setIsGenderLoading] = useState(false);
  const [storedFamilyName, setStoredFamilyName] = useState('');
  const theme = useTheme();

  const userId = useSelector(state => state?.userInfo._id);
  const userProfile = useSelector(
    state => state.fetchUserProfile.data?.myProfile?.personalDetails?.gender,
  );

  const formik = useFormik({
    initialValues: {
      familyNameInput: '',
    },
    validationSchema: yup.object().shape({
      familyNameInput: yup.string().required('This field is required'),
    }),
  });

  const createTreePromptLoader = useSelector(
    state => state?.Tree?.AllFamilyTrees,
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserProfile(userId));
    }
  }, [userId, dispatch]);

  const handleConfirm = userFamilyName => {
    if (userProfile === 'unspecified') {
      setOpenGenderModal(true);
      setVisible(false);
      setStoredFamilyName(userFamilyName);
    } else if (selectPath === '1') {
      setConfirmBtnLoading(true);
      MakeNewTree(userFamilyName);
    } else if (selectPath === '2') {
      setGedcomImport(true);
      setVisible(false);
    }
  };

  function removeFamilyKeywordAndPreserveCase(inputString) {
    const lowercaseInput = inputString?.toLowerCase?.();

    // Check if "family" is present in the input string
    if (lowercaseInput.includes('family')) {
      // Split the name into words
      const words = inputString.split(/\s+/);

      // Filter out consecutive occurrences of "family"
      const filteredWords = words.filter((word, index, array) => {
        return !(
          index > 0 &&
          word.toLowerCase() === 'family' &&
          array[index - 1].toLowerCase() === 'family'
        );
      });

      // Join the filtered words back into a string
      inputString = filteredWords.join(' ');
    } else {
      // If "family" is not present, add it to the end of the name
      inputString += ' Family';
    }

    return inputString;
  }

  const updateTreeName = async () => {
    try {
      let familyName = formik.values.familyNameInput;

      if (familyName?.trim() !== '') {
        familyName = removeFamilyKeywordAndPreserveCase(familyName);
        familyName = _.startCase(familyName);

        // await dispatch(createPrivateTree(familyName));

        await dispatch(
          updateGroupSignupPage({
            userId: userId,
            data: {
              groupName: familyName,
            },
          }),
        );

        // Toast.show({
        //   type: 'success',
        //   text1: 'Family name updated',
        // });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    } finally {
      setConfirmBtnLoading(false);
    }
  };

  const handleGenderSelect = async userFamilyName => {
    if (!selectedGender) {
      return;
    }
    setIsGenderLoading(true);
    try {
      await dispatch(
        setGenderDataUpdate({
          gender: selectedGender,
        }),
      ).unwrap();

      if (selectPath === '1') {
        setConfirmBtnLoading(true);
        MakeNewTree(userFamilyName);
        setVisible(false);
      }

      if (selectPath === '2') {
        setGedcomImport(true);
        setVisible(false);
      }

      setIsGenderLoading(false);
      setOpenGenderModal(false);
      setVisible(false);

      Toast.show({
        type: 'success',
        text1: 'Gender updated successfully',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
      setIsGenderLoading(false);
    }
  };

  const sethandleClose = () => {
    CancelSelect();
  };
  const openDialog = () => {
    setVisible(true);
  };

  return (
    <>
      <Portal>
        <Dialog
          visible={isVisible}
          onDismiss={CancelSelect}
          style={{ backgroundColor: 'white', borderRadius: 6 }}>
          <Dialog.Title
            style={{
              fontSize: 20,
              justifyContent: 'center',
              textAlign: 'center',
              paddingRight: 10,
              paddingLeft: 10,
              fontWeight: 600,
              letterSpacing: 0,
            }}>
            Create a Family Name
          </Dialog.Title>

          <TouchableOpacity
            style={[
              styles.closeIcon,
              {
                borderRadius: 5,
                backgroundColor: Theme.light.onWhite100,
                width: 20,
                height: 20,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              },
            ]}
            accessibilityLabel={"Close-CTC"}
            onPress={CancelSelect}>
            <CancelModalIcon name="close" />
          </TouchableOpacity>

          <View
            style={{
              flexDirection: 'column',
              alignItems: 'center',
            }}>
            {selectPath === '1' && (
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 14,
                  fontWeight: 600,
                  paddingBottom: 15,
                }}>
                On your iMeUsWe journey, you will{'\n'} be able to bring your
                family with you {'\n'}- literally! Just make sure you give{'\n'}{' '}
                them a cool name.
              </Text>
            )}
          </View>

          <CustomInput
            label={'Enter Family Name*'}
            testID={'familynameInput'}
            accessibilityLabel={'Family-Name-Input'}
            style={{
              marginHorizontal: 22,
              borderRadius: 8,
              backgroundColor: '#FEF8F1',
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 4,
              },
              shadowOpacity: 0.2,
              shadowRadius: 1.2,
              elevation: 5,
            }}
            defaultValue={formik.values.familyNameInput}
            onChangeText={text => formik.handleChange('familyNameInput')(text)}
          />

          <RadioButton.Group
            onValueChange={value => setSelectPath(value)}
            value={selectPath}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginLeft: 15,
                marginTop: 10,
              }}>
              <RadioButton.Android
                accessibilityLabel="Create tree from scratch"
                value="1"
              />
              <Text style={{ fontWeight: 700 }}>Create Tree from scratch</Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: -5,
                marginLeft: 15,
                fontSize: 10,
              }}>
              <RadioButton.Android
                accessibilityLabel="Import using GEDCOM"
                testID="GEDCOM"
                value="2"
              />
              <Text style={{ fontWeight: 700 }}>Import using GEDCOM</Text>
            </View>
          </RadioButton.Group>

          {selectPath === '2' && (
            <>
              <Paragraph
                numberOfLines={3}
                ellipsizeMode="tail"
                style={{
                  marginTop: 5,
                  textAlign: 'start',
                  whiteSpace: 'pre-line',
                  paddingLeft: Platform.OS === 'ios' ? 25 : 23,
                  paddingRight: Platform.OS === 'ios' ? 25 : 20,
                  fontSize: 12,
                  fontWeight: Platform.OS === 'ios' ? 600 : 500,
                }}>
                If you have a family tree on another platform, you can migrate
                it here using a GEDCOM file.
              </Paragraph>
              <Paragraph
                numberOfLines={3}
                style={{
                  textAlign: 'start',
                  whiteSpace: 'pre-line',
                  paddingLeft: Platform.OS === 'ios' ? 25 : 23,
                  paddingRight: Platform.OS === 'ios' ? 25 : 20,
                  paddingTop: 5,
                  fontSize: 12,
                  fontWeight: Platform.OS === 'ios' ? 600 : 500,
                }}>
                <Text style={{ letterSpacing: 0, fontSize: 12, fontWeight: 700 }}>
                  Please note:
                </Text>{' '}
                Some GEDCOM files may not be fully compatible with iMeUsWe and
                you may encounter issues.
              </Paragraph>
            </>
          )}

          <Dialog.Actions style={{ justifyContent: 'space-around' }}>
            {Object.keys(createTreePromptLoader).length === 0 ? (
              <Spinner />
            ) : (
              <>
                <TouchableOpacity
                  testID="confirm"
                  accessibilityLabel="confirm"
                  disabled={confirmBtnLoading || !formik.values.familyNameInput}
                  onPress={() => {
                    handleConfirm(formik.values.familyNameInput),
                      updateTreeName();
                  }}
                  style={{
                    width: '100%',
                    height: 40,
                    borderRadius: 5,
                    paddingVertical: 10,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 10,
                    backgroundColor:
                      confirmBtnLoading || !formik.values.familyNameInput
                        ? '#ffdcc9'
                        : '#E77237',
                  }}
                  loading={selectWay}>
                  {confirmBtnLoading ? (
                    <Spinner color="white" />
                  ) : (
                    <Text style={{ color: theme.colors.whiteText }}>Confirm</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Portal>
        <Modal visible={openGenderModal} onDismiss={CancelSelect}>
          <Dialog.Content>
            <View style={styles.modalContainer}>
              <TouchableOpacity
                style={[
                  styles.closeIcon,
                  {
                    borderRadius: 5,
                    backgroundColor: Theme.light.onWhite100,
                    width: 20,
                    height: 20,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  },
                ]}
                onPress={CancelSelect}>
                <CancelModalIcon name="close" />
              </TouchableOpacity>
              <Text style={styles.title}>Select Gender</Text>
              <Text style={styles.subtitle}>
                Gender specification is necessary to create or Join a tree
              </Text>
              <View style={styles.buttonContainer}>
                <Button
                  onPress={() => setSelectedGender('male')}
                  labelStyle={{
                    color: 'black',
                    fontSize: 18,
                    fontWeight: Platform.OS === 'ios' ? '700' : '800',
                  }}
                  mode={selectedGender === 'male' ? 'contained' : 'outlined'}
                  style={[
                    styles.Malebutton,
                    selectedGender === 'male' && {
                      backgroundColor: Theme.light.male,
                      borderWidth: 3,
                    },
                    selectedGender !== 'male' && { borderColor: 'transparent' },
                  ]}>
                  Male
                </Button>
                <Button
                  onPress={() => setSelectedGender('female')}
                  labelStyle={{
                    color: 'black',
                    fontSize: 18,
                    fontWeight: Platform.OS === 'ios' ? '700' : '800',
                  }}
                  mode={selectedGender === 'female' ? 'contained' : 'outlined'}
                  style={[
                    styles.FeMalebutton,
                    selectedGender === 'female' && {
                      backgroundColor: Theme.light.female,
                      borderWidth: 3,
                    },
                    selectedGender !== 'female' && { borderColor: 'transparent' },
                  ]}>
                  Female
                </Button>
              </View>
              <CustomButton
                accessibilityLabel="confirmGenderBtn"
                className="confirm-gender"
                label="Confirm"
                onPress={() => handleGenderSelect(storedFamilyName)}
                disabled={!selectedGender}
              />
            </View>
          </Dialog.Content>
        </Modal>
      </Portal>

      {isGedcomImport && (
        <GedcomImport
          handleConfirm={handleConfirm}
          openDialog={openDialog}
          setGedcomImport={setGedcomImport}
          setConfirmBtnLoading={setConfirmBtnLoading}
          sethandleClose={sethandleClose}
          isCloseGender={isCloseGender}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: Theme.light.onWhite100,
    width: 320,
    height: 220,
    padding: 20,
    borderRadius: 10,
    marginLeft: Platform.OS === 'ios' ? 5 : 0,
  },
  closeIcon: {
    position: 'absolute',
    top: -8,
    right: -8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
  },
  title: {
    fontSize: 18,
    letterSpacing: 0,
    textAlign: 'center',

    fontWeight: Platform.OS === 'ios' ? '700' : '900',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    letterSpacing: 0,
    marginBottom: 18,
    fontWeight: Platform.OS === 'ios' ? '700' : '900',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 7,
    alignItems: 'center',
    width: '100%',
    marginBottom: 14,
  },
  button: {
    flex: 1,
    color: 'black',
  },
  Malebutton: {
    backgroundColor: Theme.light.male,
    borderColor: Theme.light.onButton,
    borderWidth: 3,
    borderRadius: 15,
  },
  FeMalebutton: {
    backgroundColor: Theme.light.female,
    borderRadius: 15,
    borderColor: Theme.light.onButton,
    borderWidth: 3,
  },
});

CreateNewTree.propTypes = {
  familyNameInput: PropTypes.string,
};

CreateNewTree.displayName = 'CreateNewTree';

export default memo(CreateNewTree);
