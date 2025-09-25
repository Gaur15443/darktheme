import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import {Text} from 'react-native-paper';
import NewTheme from '../../../common/NewTheme';
import {useFormik} from 'formik';
import {GlobalHeader} from '../../../components';
import {Theme} from '../../../common';
import {Card, TextInput, useTheme} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {getprivateTreeList} from '../../../store/apps/home';
import Confirm from '../../Confirm';
import Toast from 'react-native-toast-message';
import {AuthContext} from '../../../context/AuthContext';
import {useAuth} from '../../../hooks/useAuth';
import CustomCheckBox from '../../stories/CustomCheckBox';
import CustomRadio from '../CustomRadio';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Track} from '../../../../App';
import useKeyboardHeight from '../../../hooks/useKeyboardheight';

const DeleteAccount = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const [openDelete, setOpenDelete] = useState(false);
  // const handleOpenDelete = () => setOpenDelete(true);
  const [loading, setLoading] = useState(false);
  const handleCloseDelete = () => setOpenDelete(false);
  const toastMessages = useSelector(
    state => state?.getToastMessages?.toastMessages?.Profile_Settings,
  );
  const openDeletePopup = () => {
    handleOpenDelete();
  };
  const handleConfirmButtonPress = () => {
    setOpenDelete(true);
  };
  const handleOpenDelete = () => {
    setLoading(true);
    setOpenDelete(true);
    setLoading(false);

    // Your deletion logic here
  };
  const formik = useFormik({
    initialValues: {
      message: '',
    },
  });
  const [height, setHeight] = useState(150);
  const [toggleCheckBox, setToggleCheckBox] = useState(false);
  const {selectedRadio, setSelectedRadio} = useContext(AuthContext);
  const {msg, setMsg} = useContext(AuthContext);
  const [familyName, setFamilyName] = useState('');
  const keyboardHeight = useKeyboardHeight();
  const handleLinkPress = () => {
    navigation.navigate('TreeScreen', {
      family: familyName?.[0]?.tree?.name,
      currentTreeDetails: familyName?.[0],
    });
  };
  const handelLimit = event => {
    const msgInputText = event.nativeEvent.text;
    setMsg(msgInputText);
    if (msgInputText.length <= 750) {
      formik.handleChange('message')(msgInputText);
    }
  };

  const handleRadioChange = value => {
    setSelectedRadio(value);
  };
  function handleBack() {
    navigation.goBack();
  }

  useEffect(() => {
    setSelectedRadio(null);
  }, []);
  const {userdelete} = useAuth();
  const userInfo = useSelector(state => state.userInfo);
  const userData = useSelector(state => state.userInfo._id);
  const checkList = useSelector(state => state?.home?.treeList?.treeList);

  useEffect(() => {
    if (!checkList?.length) {
      return;
    }
    const ownerRecord = checkList?.filter(record => {
      return record.user && record.user.role === 'owner';
    });
    setFamilyName(ownerRecord);
  }, [checkList]);

  const handelDelete = async () => {
    try {
      /* customer io and mixpanel event changes  start */
      Track({
        cleverTapEvent: 'delete_account',
        mixpanelEvent: 'delete_account',
        userInfo,
      });
      /* clevertap and mixpanel events ---end****/

      await userdelete();
      Toast.show({
        type: 'success',
        text1: toastMessages?.['8002'],
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: toastMessages?.Profile_Settings_Error?.['8007'],
        text1: toastMessages?.Profile_Settings_Error?.['8008'],
      });
    }
  };

  useEffect(() => {
    if (!checkList?.length) {
      (async () => {
        await dispatch(getprivateTreeList()).unwrap();
      })();
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setMsg('');
    });

    return unsubscribe;
  }, [navigation]);

  const styles = StyleSheet.create({
    textInputStyle: {
      backgroundColor: '#FFF',
      marginHorizontal: 15,
    },
    linkText: {
      marginLeft: 100,
    },
    container: {
      flex: 1,
      marginTop: 20,
      paddingHorizontal: 16,
    },
    heading: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 10,
      color: 'black',
      marginLeft: 10,
    },
    checkboxContainer: {
      flexDirection: 'row',
    },
    textContainer: {
      marginLeft: 10,
      flex: 1,
      justifyContent: 'center',
      marginRight: 15,
      fontSize: 100,
    },
    text: {
      fontSize: 18,
      color: 'black',
      paddingBottom: 20,
    },
    deleteButton: {
      backgroundColor: '#3473DC',
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: '14%',
      alignItems: 'center',
      marginBottom: 20,
    },
    cancelButton: {
      backgroundColor: 'white',
      borderRadius: 8,
      borderColor: '#3473DC',
      borderWidth: 1,
      paddingVertical: 10,
      paddingHorizontal: '14%',
      alignItems: 'center',
      marginBottom: 20,
    },

    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: 8,
      padding: 20,
      width: '80%',
      elevation: 5,
    },
    modalText: {
      fontSize: 24,
      fontSize: 20,
      textAlign: 'center',
      marginBottom: 10,
      marginTop: 10,
      color: 'black',
    },
    modalDescription: {
      fontSize: 18,
      textAlign: 'center',
      marginBottom: 20,
      color: 'black',
    },
    modalButtons: {
      flexDirection: 'column',
    },
    modalButton: {
      backgroundColor: '#3473DC',
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: '14%',
      alignItems: 'center',
      marginBottom: 20,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    nameText: {
      color: 'blue',
      fontSize: 18,
    },
    roleText: {
      fontSize: 18,
      color: 'black',
      textTransform: 'capitalize',
    },
    descLength: {
      textAlign: 'right',
      marginRight: 20,
    },
  });
  return (
    <>
      <GlobalHeader
        onBack={handleBack}
        heading={'Delete Account'}
        backgroundColor={Theme.light.background}
        fontSize={20}
      />
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' && 'padding'}>
        <ScrollView keyboardShouldPersistTaps="always">
          <View style={styles.container}>
            {familyName &&
              familyName?.length > 0 &&
              familyName?.[0]?.user?.role && (
                <>
                  <Text style={styles.heading}>Family trees</Text>
                </>
              )}
            <View style={styles.checkboxContainer}>
              <View style={{marginTop: 5}}>
                {familyName &&
                  familyName?.length > 0 &&
                  familyName?.[0]?.user?.role && (
                    <>
                      <CustomCheckBox
                        accessibilityLabel="check-box"
                        check={toggleCheckBox}
                        onCheck={() => {
                          setToggleCheckBox(!toggleCheckBox);
                        }}
                      />
                    </>
                  )}
              </View>

              <View style={styles.textContainer}>
                {familyName &&
                  familyName?.length > 0 &&
                  familyName?.[0]?.user?.role && (
                    <>
                      <Text style={styles.text}>
                        I understand that the following family tree will be
                        deleted. However, content I’ve shared with others may
                        remain on iMeUsWe.
                      </Text>
                    </>
                  )}

                <Text style={styles.text}>
                  If you change your mind, you will be able to log back into
                  your account within the next 30 days. Your account will be
                  permanently deleted after 30 days.
                </Text>
              </View>
            </View>

            {familyName &&
              familyName?.length > 0 &&
              familyName?.[0]?.user?.role && (
                <>
                  <Card
                    style={{
                      marginHorizontal: 20,
                      marginVertical: 20,
                    }}>
                    <Card.Content>
                      <View
                        style={{
                          flexDirection: 'row',
                          gap: 20,
                          marginBottom: 4,
                          flexWrap: 'wrap',
                        }}>
                        <Text
                          style={{
                            fontWeight: '700',
                            color: 'black',
                            textTransform: 'capitalize',
                            fontSize: 18,
                            flex: 1,
                          }}>
                          Name:
                        </Text>
                        <TouchableOpacity
                          onPress={handleLinkPress}
                          style={{flex: 3, gap: 35}}>
                          <Text
                            style={[styles.nameText]}
                            numberOfLines={3}
                            ellipsizeMode="tail">
                            {familyName?.[0]?.tree?.name}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <View style={{flexDirection: 'row', gap: 45}}>
                        <Text
                          style={{
                            fontWeight: 700,
                            color: 'black',
                            textTransform: 'capitalize',
                            fontSize: 18,
                          }}>
                          Role:
                        </Text>

                        <Text style={styles.roleText}>
                          {familyName?.[0]?.user?.role}
                        </Text>
                      </View>
                    </Card.Content>
                  </Card>
                </>
              )}
            <View style={{gap: 10}}>
              <View>
                <Text
                  style={{
                    fontWeight: 600,
                    color: 'black',
                    fontSize: 30,
                    paddingHorizontal: '3%',
                  }}
                  accessibilityLabel="feedback">
                  Feedback
                  <Text
                    style={{
                      fontSize: 20,
                      color: 'gray',
                      fontWeight: 'normal',
                    }}>
                    (Optional)
                  </Text>
                </Text>
              </View>

              <View>
                <Text
                  style={{
                    color: 'black',
                    fontSize: 18,
                    fontWeight: 'bold',
                    paddingHorizontal: '3%',
                  }}>
                  Why are you deleting this account?
                </Text>
              </View>

              <View
                style={{gap: 10, marginBottom: 15, paddingHorizontal: '3%'}}>
                <CustomRadio
                  labelStyle={{
                    fontSize: 15,
                    fontWeight: 'bold',
                    color: 'black',
                  }}
                  accessibilityLabel="radioButton-one"
                  label="I can't find any records of my family"
                  checked={
                    selectedRadio === "I can't find any records of my family"
                  }
                  onPress={() =>
                    handleRadioChange("I can't find any records of my family")
                  }
                />
                <CustomRadio
                  labelStyle={{
                    fontSize: 15,
                    fontWeight: 'bold',
                    color: 'black',
                  }}
                  accessibilityLabel="radioButton-two"
                  label="I have privacy concerns"
                  checked={selectedRadio === 'I have privacy concerns'}
                  onPress={() => handleRadioChange('I have privacy concerns')}
                />
                <CustomRadio
                  labelStyle={{
                    fontSize: 15,
                    fontWeight: 'bold',
                    color: 'black',
                  }}
                  accessibilityLabel="radioButton-three"
                  label="This is a duplicate account"
                  checked={selectedRadio === 'This is a duplicate account'}
                  onPress={() =>
                    handleRadioChange('This is a duplicate account')
                  }
                />
                <CustomRadio
                  labelStyle={{
                    fontSize: 15,
                    fontWeight: 'bold',
                    color: 'black',
                  }}
                  accessibilityLabel="radioButton-four"
                  label="I find it hard to use"
                  checked={selectedRadio === 'I find it hard to use'}
                  onPress={() => handleRadioChange('I find it hard to use')}
                />
                <CustomRadio
                  labelStyle={{
                    fontSize: 15,
                    fontWeight: 'bold',
                    color: 'black',
                  }}
                  accessibilityLabel="radioButton-five"
                  label="Other"
                  checked={selectedRadio === 'Other'}
                  onPress={() => handleRadioChange('Other')}
                />
              </View>
            </View>
            <View>
              <TextInput
                accessibilityLabel="input-box"
                outlineStyle={{
                  borderTopRightRadius: 10,
                  borderTopLeftRadius: 10,
                  borderBottomLeftRadius: 10,
                  borderBottomRightRadius: 10,
                  borderColor: '#EEEEEE',
                  borderWidth: 2,
                  marginHorizontal: 5,
                }}
                multiline
                style={[
                  styles.textInputStyle,
                  {backgroundColor: 'white', paddingTop: 0},
                  {height: Math.max(150, height)},
                ]}
                value={formik.values.message}
                mode="outlined"
                onContentSizeChange={e => {
                  if (e.nativeEvent.contentSize) {
                    setHeight(e.nativeEvent.contentSize.height);
                  }
                }}
                numberOfLines={9}
                onChange={handelLimit}
              />
              <Text style={styles.descLength}>
                {formik.values.message?.length || 0}/750
              </Text>
            </View>

            {openDelete && (
              <Confirm
                accessibilityLabel="confirm-button"
                heading="Confirm Account Deletion"
                continueCtaText="Delete"
                discardCtaText="Cancel"
                onBackgroundClick={handleCloseDelete}
                title="Are you sure you want to delete your iMeUsWe account?"
                subTitle=""
                onCrossClick={handleCloseDelete}
                onContinue={handelDelete}
                onDiscard={handleCloseDelete}
              />
            )}
            <TouchableOpacity
              onPress={handleOpenDelete}
              disabled={(!toggleCheckBox && familyName?.length > 0) || loading}
              style={{
                backgroundColor: NewTheme.colors.primaryOrange,
                opacity:
                  (!toggleCheckBox && familyName?.length > 0) || loading
                    ? 0.5
                    : 1,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
                marginHorizontal: 20,
                marginVertical: 20,
              }}>
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text
                  accessibilityLabel="confirm"
                  style={{
                    color: 'white',
                    fontWeight: '600',
                    textAlign: 'center',
                    paddingVertical: 10,
                  }}>
                  {' '}
                  Confirm{' '}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default DeleteAccount;
