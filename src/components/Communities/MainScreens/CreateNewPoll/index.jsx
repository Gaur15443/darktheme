import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Switch,
  Platform,
  Keyboard,
  Image,
  Dimensions,
} from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import BottomBarButton from '../../CommunityComponents/BottomBarButton';
import CustomTextInput from '../../../../components/CustomTextInput';
import {
  AddImage,
  CameraIcon,
  CreateNewPollIcon,
  CrossIcon,
  DocsIcon,
  GallaryIcon,
  PlusIcon,
  RightArrow,
  StartDiscussionIcon,
  VideoIcon,
} from '../../../../images';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { createPoll } from '../../../../store/apps/createPoll';
import theme from '../../../../common/NewTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Confirm from '../../CommunityComponents/ConfirmCommunityPopup';
import { Track } from '../../../../../App';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import CommunitySelector from '../CreateCommunityPost/CommunitySelector';
import NewTheme from '../../../../common/NewTheme';
import { useQueryClient } from '@tanstack/react-query';
import FastImage from '@d11/react-native-fast-image';

const { height } = Dimensions.get('window');

const validationSchema = Yup.object().shape({
  pollTitle: Yup.string().required('Poll title is required'),
  options: Yup.array()
    .of(Yup.string().required('Option is required'))
    .min(2, 'At least two options are required'),
});

const capitalizeFirstLetter = str => {
  if (typeof str !== 'string') return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const CreateNewPoll = ({
  route,
  communityDetails,
  fromScreen = 'communityHome',
  setCurrentScreen,
  setPollFormChanged,
  setScreenChangeConfirmPopup,
}) => {
  // const theme = useTheme();
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pollTitleError, setPollTitleError] = useState('');
  const [optionsErrors, setOptionsErrors] = useState(['', '']);
  const [openConfirmPopup, seOpenConfirmPopup] = useState(false);
  const [pollTitleTyped, setPollTitleTyped] = useState(true);
  const [optionsTyped, setOptionsTyped] = useState([
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
  ]);
  const [community, setCommunity] = useState(communityDetails || null);
  const [openCommunitySelector, setOpenCommunitySelector] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const userInfo = useSelector(state => state?.userInfo);
  const communityName = useSelector(
    state => state?.getCommunityDetails?.communityDetails?.data?.communityName,
  );

  const submit = values => {
    setLoading(true);
    const payload = {
      communityId: community?._id,
      title: values?.pollTitle,
      allowMultipleOptions: values?.allowMultipleOptions,
      options: values?.options,
    };
    dispatch(createPoll(payload)).then(async response => {
      if (response?.payload?.success) {
        // Refresh Data for feed page
        await Promise.all([
          queryClient.invalidateQueries([
            'communityAllPosts',
            'community',
            community?._id,
          ]),
        ]);
        if (fromScreen === 'communityHome') {
          route.params.onGoBack({ updated: Math.random() });
          navigation.goBack();
        } else {
          navigation.navigate('CommunityDetails', {
            created: Math.random(),
            communityId: community?._id,
          });
        }
      }
      setLoading(false);
    });

    /* customer io and mixpanel event changes  start */
    const props = {
      community_name: communityName,
      title: payload?.title,
      option_count: payload?.options?.length,
      allow_multiple_answers: payload?.allowMultipleOptions,
    };
    Track({
      cleverTapEvent: 'poll_published',
      mixpanelEvent: 'poll_published',
      userInfo,
      cleverTapProps: props,
      mixpanelProps: props,
    });
    /* clevertap and mixpanel events ---end****/
  };

  useEffect(() => {
    const showListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true),
    );
    const hideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false),
    );

    // Cleanup listeners on unmount
    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);
  return (
    <>
      <Formik
        initialValues={{
          pollTitle: '',
          options: ['', ''],
          allowMultipleOptions: false,
        }}
        validationSchema={validationSchema}
        onSubmit={values => submit(values)}>
        {({
          handleChange,
          handleSubmit,
          values,
          errors,
          touched,
          setFieldValue,
          handleBlur,
          isValid,
          dirty,
        }) => {
          useEffect(() => {
            if (values?.pollTitle?.length === 0) {
              setPollTitleTyped(true);
            }
          }, [values?.pollTitle]);

          useEffect(() => {
            if (dirty || community) {
              setPollFormChanged(true);
            }
          }, [values, community]);
          // Function to check if any input field is filled
          const handleDiscard = formikProps => {
            Keyboard.dismiss();
            if (
              dirty ||
              (fromScreen !== 'insideCommunity' ? community : false)
            ) {
              setScreenChangeConfirmPopup(true); // Show confirmation popup if the form is dirty
            } else {
              setCurrentScreen('discussion');
            }
          };

          return (
            <>
              <KeyboardAwareScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps={'always'}>
                <View>
                  <View style={{ marginTop: 50, marginHorizontal: 20 }}>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => {
                        navigation.navigate('CommunitySelector', {
                          onGoBack: data => {
                            setCommunity(data);
                          },
                        });
                      }}
                      style={{
                        pointerEvents:
                          fromScreen === 'insideCommunity' ? 'none' : 'auto',
                      }}>
                      {!community ? (
                        <View
                          style={{
                            flexDirection: 'row',
                            gap: 10,
                            paddingRight: 35,
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            marginBottom: 10,
                          }}>
                          <Text
                            style={{
                              color: '#888888',
                              paddingVertical: 10,
                              fontSize: 16,
                              lineHeight: 16,
                            }}>
                            Select Community
                            <Text
                              style={{
                                color: '#FF0000',
                                fontSize: 16,
                                lineHeight: 16,
                              }}>
                              *
                            </Text>
                          </Text>
                          <RightArrow />
                        </View>
                      ) : (
                        <View
                          style={{
                            flexDirection: 'row',
                            gap: 5,
                            height: 34,
                            alignItems: 'center',
                            marginBottom: 10,
                            // shadowColor: '#000',
                            // shadowOpacity: 0.3,
                            // shadowRadius: 4.65,
                            // shadowOffset: {width: 0, height: 4},
                          }}>
                          <View
                            style={[
                              {
                                flexDirection: 'row',
                                alignItems: 'center',
                                overflow: 'hidden',
                                paddingHorizontal: 5,
                                paddingVertical: 2,
                                gap: 5,
                              },
                              community?._id
                                ? {
                                  backgroundColor:
                                    fromScreen === 'insideCommunity'
                                      ? '#DCDCDC'
                                      : 'white',
                                  // elevation: 7,
                                  borderRadius: 8,
                                  borderWidth: 1.3,
                                  borderColor: '#dbdbdb',
                                }
                                : {},
                            ]}>
                            {community?.logoUrl ? (
                              <Image
                                style={styles.profilePic}
                                source={{ uri: community?.logoUrl }}
                                accessibilityLabel={`${community?.communityName || community?.name} community logo`}
                              />
                            ) : (
                              <FastImage
                                style={styles.profilePic}
                                source={{ uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/CommunityDefaultImage.png' }}
                                accessibilityLabel="Default community logo"
                              />
                            )}
                            <Text
                              variant="bold"
                              numberOfLines={2}
                              style={{
                                color: 'black',
                                fontSize: 12,
                                lineHeight: 12,
                                flexShrink: 1,
                                flexGrow: 0,
                              }}>
                              {community?.communityName}
                            </Text>
                            <RightArrow />
                          </View>
                        </View>
                      )}
                    </TouchableOpacity>
                    <CustomTextInput
                      autoCorrect
                      mode="outlined"
                      innerContainerStyle={{
                        backgroundColor: NewTheme.colors.backgroundCreamy,
                      }}
                      inputHeight={48}
                      label={'Title of Poll'}
                      maxLength={200}
                      value={values.pollTitle}
                      onChangeText={text => {
                        let inputValue = text;
                        if (text?.length > 0 && pollTitleTyped) {
                          // Capitalize the first letter only when the input is initially empty
                          inputValue = capitalizeFirstLetter(inputValue);
                          setTimeout(() => {
                            setPollTitleTyped(false);
                          }, 1000);
                        }
                        if (
                          text?.length === 0 ||
                          values?.pollTitle?.length === 0
                        ) {
                          setPollTitleTyped(true);
                        }
                        handleChange('pollTitle')(inputValue);
                        setPollTitleError('');
                      }}
                      onBlur={() => {
                        if (!values.pollTitle.trim()) {
                          setPollTitleError('Poll title is required');
                        }
                      }}
                      theme={
                        pollTitleError
                          ? {
                            colors: {
                              primary: 'red',
                              underlineColor: 'transparent',
                            },
                          }
                          : {
                            colors: {
                              primary: '#3473DC',
                              underlineColor: 'transparent',
                            },
                          }
                      }
                      // multiline={true}
                      // centerNumber={3}
                      style={{ flex: 1, width: '100%' }}
                      required
                      accessibilityLabel="Poll Title Input"
                      crossIconPosition={'flex-start'}
                      clearable
                      crossIconBackground={NewTheme.colors.backgroundCreamy}
                      disabled={loading}
                      error={Boolean(pollTitleError)}
                      contentStyle={
                        // Platform.OS === 'ios'
                        //   ? {
                        //       paddingTop: 14.5,
                        //       paddingBottom: 14.5,
                        //     }
                        //   : {},
                        { backgroundColor: NewTheme.colors.backgroundCreamy }
                      }
                    />
                    {pollTitleError && (
                      <Text style={styles.errorText}>{pollTitleError}</Text>
                    )}
                  </View>
                  <View style={styles.switchContainer}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                      <Switch
                        trackColor={{
                          false: '#DDDDDD',
                          true: theme.colors.primaryOrange,
                        }}
                        thumbColor={'white'}
                        ios_backgroundColor="#DDDDDD"
                        onValueChange={value =>
                          setFieldValue('allowMultipleOptions', value)
                        }
                        value={values.allowMultipleOptions}
                        style={{
                          transform: [{ scale: 0.8 }],
                        }}
                        accessibilityLabel="Allow Multiple Answers Switch"
                        disabled={loading}
                      />

                      <Text
                        style={styles.switchLabel}
                        accessibilityLabel="Allow Multiple Answers Text">
                        Allow Multiple Answers
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={handleDiscard}
                      hitSlop={{ left: 20, right: 20 }}>
                      <CrossIcon fill={'black'} width={16} height={16} />
                    </TouchableOpacity>
                  </View>
                  <View style={{ marginHorizontal: 20 }}>
                    {values.options.map((option, index) => (
                      <>
                        <View key={index} style={styles.optionContainer}>
                          <View style={{ flex: 1 }}>
                            <CustomTextInput
                              autoCorrect
                              mode="outlined"
                              inputHeight={48}
                              contentStyle={{
                                backgroundColor:
                                  NewTheme.colors.backgroundCreamy,
                                paddingRight:
                                  values.options.length > 2 ? 30 : 0,
                              }}
                              style={{ flex: 1 }}
                              label={`Option ${index + 1}`}
                              maxLength={50}
                              value={option}
                              onChangeText={text => {
                                let inputValue = text;
                                if (text?.length > 0 && optionsTyped[index]) {
                                  // Capitalize the first letter only when the input is initially empty
                                  inputValue =
                                    capitalizeFirstLetter(inputValue);
                                  setTimeout(() => {
                                    setOptionsTyped(prevState => {
                                      const updated = [...prevState];
                                      updated[index] = false; // Mark this option as typed
                                      return updated;
                                    });
                                  }, 1000);
                                }
                                if (
                                  text?.length === 0 ||
                                  option?.length === 0
                                ) {
                                  setOptionsTyped(prevState => {
                                    const updated = [...prevState];
                                    updated[index] = true; // Mark this option as typed
                                    return updated;
                                  });
                                }
                                handleChange(`options[${index}]`)(inputValue);
                                const newOptionsErrors = [...optionsErrors];
                                newOptionsErrors[index] = '';
                                setOptionsErrors(newOptionsErrors);
                              }}
                              onBlur={() => {
                                if (!values.options[index].trim()) {
                                  const newOptionsErrors = [...optionsErrors];
                                  newOptionsErrors[index] =
                                    'Option is required';
                                  setOptionsErrors(newOptionsErrors);
                                }
                              }}
                              clearable={values.options.length <= 2}
                              crossIconBackground={
                                NewTheme.colors.backgroundCreamy
                              }
                              required
                              accessibilityLabel={`Option ${index + 1} Input`}
                              theme={
                                optionsErrors[index]
                                  ? {
                                    colors: {
                                      primary: 'red',
                                      underlineColor: 'transparent',
                                    },
                                  }
                                  : {
                                    colors: {
                                      primary: '#3473DC',
                                      underlineColor: 'transparent',
                                    },
                                  }
                              }
                              error={Boolean(optionsErrors[index])}
                              innerContainerStyle={{
                                backgroundColor:
                                  NewTheme.colors.backgroundCreamy,
                              }}
                              disabled={loading}
                            />
                          </View>
                          {values.options.length > 2 && (
                            <TouchableOpacity
                              disabled={loading}
                              accessibilityLabel={`Delete Option ${index + 1}`}
                              style={{ position: 'absolute', right: 8 }}
                              onPress={() => {
                                const newOptions = values.options.filter(
                                  (_, i) => i !== index,
                                );
                                setFieldValue('options', newOptions);
                              }}>
                              <Icon name="delete" size={24} color="red" />
                            </TouchableOpacity>
                          )}
                        </View>
                        {optionsErrors[index] && (
                          <Text style={styles.errorText}>
                            {optionsErrors[index]}
                          </Text>
                        )}
                      </>
                    ))}

                    {values.options.length < 10 && (
                      <View style={styles.addOptionsBtn}>
                        <TouchableOpacity
                          accessibilityLabel="Add Option Button"
                          style={{
                            width: '100%',
                            overflow: 'hidden',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            gap: 10,
                            marginLeft: 20,
                          }}
                          disabled={loading}
                          onPress={() =>
                            setFieldValue('options', [...values.options, ''])
                          }>
                          <PlusIcon />
                          <Text style={styles.addButtonTitle}>Add Option</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              </KeyboardAwareScrollView>

              {/* Post Media Options */}
              {!keyboardVisible && (
                <>
                  <View
                    style={{
                      backgroundColor: '#FFF0D8',
                      width: '100%',
                      height: 150,
                      position: 'absolute',
                      bottom:
                        Platform.OS === 'ios'
                          ? insets.bottom - height / 24
                          : insets.bottom,
                      paddingHorizontal: 50,
                      paddingTop: 15,
                      flexDirection: 'row',
                      justifyContent: 'space-around',
                      alignItems: 'baseline',
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-around',
                        width: '100%',
                      }}>
                      {/* Launch Camera */}
                      <View
                        style={{
                          height: 24,
                          justifyContent: 'center',
                        }}>
                        <CameraIcon opacity={0.4} />
                      </View>
                      {/* Video Files */}
                      <View
                        style={{
                          height: 24,
                          justifyContent: 'center',
                        }}>
                        <VideoIcon opacity={0.4} />
                      </View>
                      {/* Open Gallary */}
                      <View
                        style={{
                          height: 24,
                          justifyContent: 'center',
                        }}>
                        <GallaryIcon opacity={0.4} />
                      </View>

                      {/* Upload Files */}
                      <View
                        style={{
                          height: 24,
                          justifyContent: 'center',
                        }}>
                        <DocsIcon opacity={0.4} />
                      </View>
                      {/* Switch Screen */}
                      <TouchableOpacity
                        onPress={() => setCurrentScreen('poll')}>
                        <View style={{ height: 24 }}>
                          <CreateNewPollIcon />
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <BottomBarButton
                    label="Publish"
                    loading={loading}
                    onPress={handleSubmit}
                    disabled={!isValid || !dirty || loading || !community}
                  />
                </>
              )}
            </>
          );
        }}
      </Formik>

      {openConfirmPopup && (
        <Confirm
          title={'Are you sure you want to leave?'}
          subTitle={'If you discard, you will lose your changes.'}
          discardCtaText={'Discard Changes'}
          continueCtaText={'Continue'}
          onContinue={() => seOpenConfirmPopup(false)}
          onDiscard={() => {
            navigation.goBack();
          }}
          buttonSwap={true}
          accessibilityLabel="confirm-popup-basic-fact"
          onCrossClick={() => seOpenConfirmPopup(false)}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 150,
    backgroundColor: theme.colors.backgroundCreamy,
  },

  profilePic: {
    width: 22,
    height: 22,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 20,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // paddingVertical: 2,
    paddingVertical: 10,
    justifyContent: 'space-between',
    marginTop: 40,
    marginHorizontal: 20,
  },
  switchLabel: {
    marginLeft: 10,
    fontSize: 16,
    lineHeight: 16,
    color: 'black',
  },
  optionLabel: {
    fontSize: 16,
    marginBottom: 15,
    marginTop: 30,
    color: 'black',
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  optionInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  errorText: {
    color: '#8B0000',
    fontSize: 14,
    marginBottom: 10,
  },
  addOptionsBtn: {
    width: '100%',
    height: 48,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: theme.colors.primaryOrange,
  },
  addButtonTitle: {
    fontSize: 18,
    color: 'black',
    lineHeight: 23.5,
  },
});

export default CreateNewPoll;
