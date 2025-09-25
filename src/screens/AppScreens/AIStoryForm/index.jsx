import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Animated,
  PanResponder,
  TouchableWithoutFeedback,
  Keyboard,
  Pressable,
} from 'react-native';
import CustomScroll from '../../../common/CustomScrollView';
import {Dimensions} from 'react-native';
import {Dialog, Portal, Text, useTheme, Button} from 'react-native-paper';
import Theme from '../../../common/Theme';
import {GlobalHeader} from '../../../components';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {CustomInput} from '../../../components';
import {TabView, TabBar} from 'react-native-tab-view';
import {useFocusEffect} from '@react-navigation/native';
import {colors} from '../../../common/NewTheme';
import {CustomButton} from '../../../core';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import Toast from 'react-native-toast-message';
import {useDispatch, useSelector} from 'react-redux';
import EditQuoteIcon from '../../../images/Icons/EditQuoteIcon';
import {
  generateAIStory,
  resetSelectedCategory,
} from '../../../store/apps/story';
import {setAIStory} from '../../../store/apps/story/index';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import ResetIcon from '../../../images/Icons/ResetIcon';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Styles for the component

import ErrorBoundary from '../../../common/ErrorBoundary';
import { FlatList } from 'react-native-gesture-handler';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 120;

const CommonForm = ({
  narratorName,
  index,
  customTheme,
  formik,
  handleCategoryPress,
  loading,
  timeframe,
  setTimeframe,
  location,
  setLocation,
  involvedPeople,
  setInvolvedPeople,
  activities,
  setActivities,
  timeFieldFocus,
  setTimeFieldFocus,
  locationFieldFocus,
  setLocationFieldFocus,
  membersInvolvedFieldFocus,
  setMembersInvolvedFieldFocus,
  keyActivitiesFieldFocus,
  setKeyActivitiesFieldFocus,
}) => {
  const truncatePlaceholder = (text, maxLength = 35) => {
    if (text.length > maxLength) {
      return text.slice(0, maxLength) + '...';
    }
    return text;
  };
  return (
    <>
      <CustomInput
        customTheme={customTheme}
        value={formik.values.category}
        editable={false}
        textVerticalAlign="center"
        placeholder="Category of Story"
        right={<EditQuoteIcon color={colors.primaryOrange} />}
        style={[
          {backgroundColor: 'white'},
          styles.inputContainer,
          styles.textInputStyle,
        ]}
        accessibilityLabel="category"
        maskText
        inputHeight={50}
        onMaskPress={handleCategoryPress}
        showSoftInputOnFocus={false}
      />
      <CustomInput
        customTheme={customTheme}
        disabled={loading}
        maxLength={50}
        centerNumber={timeFieldFocus ? 3 : 6}
        name="timeframe"
        accessibilityLabel="timeframe"
        onFocus={() => {
          setKeyActivitiesFieldFocus(false);
          setMembersInvolvedFieldFocus(false);
          setLocationFieldFocus(false);
          setTimeFieldFocus(true);
        }}
        label={
          timeframe
            ? ''
            : timeFieldFocus
              ? truncatePlaceholder(
                  'Specify the timeframe when this event took place.',
                )
              : 'Specify the timeframe when this event\ntook place.'
        }
        animateLabel={false}
        customLabelStyle={{fontSize: 16}}
        inputHeight={65}
        value={timeframe || ''}
        onChangeText={text => {
          formik.values.timeframe = text;
          setTimeframe(text);
        }}
        style={[
          styles.textInputStyle,
          styles.inputContainer,
          {backgroundColor: 'white'},
        ]}
        blurOnSubmit={false}
        returnKeyType="next"
      />

      <CustomInput
        customTheme={customTheme}
        disabled={loading}
        maxLength={50}
        textVerticalAlign="center"
        centerNumber={locationFieldFocus ? 3 : 5}
        name="location"
        accessibilityLabel="location"
        onFocus={() => {
          setKeyActivitiesFieldFocus(false);
          setMembersInvolvedFieldFocus(false);
          setLocationFieldFocus(true);
          setTimeFieldFocus(false);
        }}
        label={
          location.trim()
            ? ''
            : locationFieldFocus
              ? truncatePlaceholder(
                  'Describe the location or setting where the story took place.',
                )
              : 'Describe the location or setting where\nthe story took place.'
        }
        animateLabel={false}
        customLabelStyle={{fontSize: 16}}
        inputHeight={70}
        value={location || ''}
        onChangeText={text => {
          formik.values.location = text;
          setLocation(text);
        }}
        style={[
          styles.textInputStyle,
          styles.inputContainer,
          {backgroundColor: 'white'},
        ]}
        blurOnSubmit={false}
        returnKeyType="next"
      />
      <CustomInput
        customTheme={customTheme}
        disabled={loading}
        maxLength={50}
        textVerticalAlign="center"
        centerNumber={membersInvolvedFieldFocus ? 3 : 6}
        name="involvedPeople"
        accessibilityLabel="involvedPeople"
        onFocus={() => {
          setKeyActivitiesFieldFocus(false);
          setMembersInvolvedFieldFocus(true);
          setLocationFieldFocus(false);
          setTimeFieldFocus(false);
        }}
        label={
          involvedPeople?.trim()
            ? ''
            : membersInvolvedFieldFocus
              ? truncatePlaceholder('Who was involved in this family moment?')
              : 'Who was involved in this family\nmoment?'
        }
        animateLabel={false}
        customLabelStyle={{fontSize: 16}}
        inputHeight={70}
        value={involvedPeople || ''}
        onChangeText={text => {
          formik.values.involvedPeople = text;
          setInvolvedPeople(text);
        }}
        style={[
          styles.textInputStyle,
          styles.inputContainer,
          {backgroundColor: 'white'},
        ]}
        blurOnSubmit={false}
        returnKeyType="next"
      />

      <CustomInput
        customTheme={customTheme}
        disabled={loading}
        maxLength={50}
        centerNumber={keyActivitiesFieldFocus ? 3 : 5}
        name="activities"
        accessibilityLabel="activities"
        onFocus={() => {
          setKeyActivitiesFieldFocus(true);
          setMembersInvolvedFieldFocus(false);
          setLocationFieldFocus(false);
          setTimeFieldFocus(false);
        }}
        label={
          activities
            ? ''
            : keyActivitiesFieldFocus
              ? truncatePlaceholder(
                  'Outline the key activities that took place during the story. ',
                )
              : 'Outline the key activities that took\nplace during the story. '
        }
        animateLabel={false}
        customLabelStyle={{fontSize: 16}}
        inputHeight={70}
        value={activities || ''}
        onChangeText={text => {
          formik.values.activities = text;
          setActivities(text);
        }}
        style={[
          styles.textInputStyle,
          styles.inputContainer,
          {backgroundColor: 'white'},
          {borderRadius: 20},
        ]}
        blurOnSubmit={true}
        returnKeyType="done"
      />
    </>
  );
};

const FirstRoute = ({
  index,
  customTheme,
  formik,
  handleCategoryPress,
  loading,
  timeframe,
  setTimeframe,
  location,
  setLocation,
  involvedPeople,
  setInvolvedPeople,
  activities,
  setActivities,
  narratorName,
  setNarratorName,
  timeFieldFocus,
  setTimeFieldFocus,
  locationFieldFocus,
  setLocationFieldFocus,
  membersInvolvedFieldFocus,
  setMembersInvolvedFieldFocus,
  keyActivitiesFieldFocus,
  setKeyActivitiesFieldFocus,
  style,
}) => {
  const [resetNarratorName, setResetNarratorName] = useState(true);
  const {height: screenHeight} = Dimensions.get('window');
  
  useEffect(() => {
    if (resetNarratorName) {
      setNarratorName('');
      setResetNarratorName(false);
    }
  }, [resetNarratorName, setNarratorName]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={style}
      >
      <View style={{flex: 1, minHeight: screenHeight - 350, marginTop: 6}}>
        <CommonForm
          narratorName={narratorName}
          index={index}
          customTheme={customTheme}
          formik={formik}
          handleCategoryPress={handleCategoryPress}
          loading={loading}
          timeframe={timeframe}
          setTimeframe={setTimeframe}
          location={location}
          setLocation={setLocation}
          involvedPeople={involvedPeople}
          setInvolvedPeople={setInvolvedPeople}
          activities={activities}
          setActivities={setActivities}
          timeFieldFocus={timeFieldFocus}
          setTimeFieldFocus={setTimeFieldFocus}
          locationFieldFocus={locationFieldFocus}
          setLocationFieldFocus={setLocationFieldFocus}
          membersInvolvedFieldFocus={membersInvolvedFieldFocus}
          setMembersInvolvedFieldFocus={setMembersInvolvedFieldFocus}
          keyActivitiesFieldFocus={keyActivitiesFieldFocus}
          setKeyActivitiesFieldFocus={setKeyActivitiesFieldFocus}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const SecondRoute = ({
  index,
  customTheme,
  formik,
  handleCategoryPress,
  loading,
  timeframe,
  setTimeframe,
  location,
  setLocation,
  involvedPeople,
  setInvolvedPeople,
  activities,
  setActivities,
  handleNarratorNameChange,
  narratorName,
  timeFieldFocus,
  setTimeFieldFocus,
  locationFieldFocus,
  setLocationFieldFocus,
  membersInvolvedFieldFocus,
  setMembersInvolvedFieldFocus,
  keyActivitiesFieldFocus,
  setKeyActivitiesFieldFocus,
  style,
}) => {
  const {height: screenHeight} = Dimensions.get('window');

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardShouldPersistTaps="always"
      style={style}
    >
      <View style={{flex: 1, minHeight: screenHeight - 210, marginTop: -6}}>
          <CustomInput
            name="narratorName"
            accessibilityLabel="narratorName"
            onFocus={() => {
              setKeyActivitiesFieldFocus(false);
              setMembersInvolvedFieldFocus(false);
              setLocationFieldFocus(false);
              setTimeFieldFocus(false);
            }}
            placeholder="Who is the narrator?"
            inputHeight={45}
            value={narratorName || ''}
            onChangeText={
              text => handleNarratorNameChange(text)
              //formik.values.activities = text;
            }
            style={[
              {backgroundColor: 'white'},
              styles.textInputStyle,
              styles.inputContainer,
              {marginTop: 7},
            ]}
          blurOnSubmit={false}
          returnKeyType="next"
          />
        <CommonForm
          narratorName={narratorName}
          index={index}
          customTheme={customTheme}
          formik={formik}
          handleCategoryPress={handleCategoryPress}
          loading={loading}
          timeframe={timeframe}
          setTimeframe={setTimeframe}
          location={location}
          setLocation={setLocation}
          involvedPeople={involvedPeople}
          setInvolvedPeople={setInvolvedPeople}
          activities={activities}
          setActivities={setActivities}
          timeFieldFocus={timeFieldFocus}
          setTimeFieldFocus={setTimeFieldFocus}
          locationFieldFocus={locationFieldFocus}
          setLocationFieldFocus={setLocationFieldFocus}
          membersInvolvedFieldFocus={membersInvolvedFieldFocus}
          setMembersInvolvedFieldFocus={setMembersInvolvedFieldFocus}
          keyActivitiesFieldFocus={keyActivitiesFieldFocus}
          setKeyActivitiesFieldFocus={setKeyActivitiesFieldFocus}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const CustomTabView = ({routes, renderScene, onIndexChange, index}) => {
  const SCREEN_WIDTH = Dimensions.get('window').width;
  const SWIPE_THRESHOLD = 120;
  
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        return !Keyboard.isVisible();
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gesture) => {
        if (Math.abs(gesture.dx) < SWIPE_THRESHOLD) {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false
          }).start();
          return;
        }

        const direction = gesture.dx > 0 ? -1 : 1;
        const nextIndex = index + direction;

        if (nextIndex >= 0 && nextIndex < routes.length) {
          // Dismiss keyboard before changing tabs
          Keyboard.dismiss();
          
          Animated.timing(pan, {
            toValue: { x: direction * -SCREEN_WIDTH, y: 0 },
            duration: 250,
            useNativeDriver: false
          }).start(() => {
            pan.setValue({ x: 0, y: 0 });
            onIndexChange(nextIndex);
          });
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false
          }).start();
        }
      }
    })
  ).current;

  const CustomTabBar = () => (
    <View style={{
      flexDirection: 'row',
      backgroundColor: colors.secondaryLightPeach,
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: colors.primaryOrange,
      marginHorizontal: 65,
      height: 40,
      marginVertical: 10,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.22,
      shadowRadius: 2.22,
    }}>
      {routes.map((route, i) => {
        const isSelected = index === i;
        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => {
              Keyboard.dismiss();
              onIndexChange(i);
            }}
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: isSelected ? colors.primaryOrange : 'transparent',
              borderRadius: 8,
              marginVertical: -1,
              marginHorizontal: -1,
              borderWidth: isSelected ? 1.5 : 0,
              borderColor: colors.primaryOrange,
            }}>
            <Text
              variant="bold"
              style={{
                color: isSelected ? colors.whiteText : colors.primaryOrange,
                fontSize: 14,
              }}>
              {route.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <View style={{flex: 1}}>
      <CustomTabBar />
      <View style={{flex: 1}}>
        {routes.map((route) => (
          <View key={route.key} style={{flex: 1, position: 'absolute', width: '100%', height: '100%'}}>
            {renderScene({route})}
          </View>
        ))}
      </View>
    </View>
  );
};

const AIHelper = () => {
  const navigation = useNavigation();
  function handleBack() {
    navigation.goBack();
  }
  const [index, setIndex] = React.useState(0);
  const [resetNarratorName, setResetNarratorName] = useState(false);
  const [timeFieldFocus, setTimeFieldFocus] = useState(false);
  const [locationFieldFocus, setLocationFieldFocus] = useState(false);
  const [membersInvolvedFieldFocus, setMembersInvolvedFieldFocus] =
    useState(false);
  const [keyActivitiesFieldFocus, setKeyActivitiesFieldFocus] = useState(false);
  useFocusEffect(
    React.useCallback(() => {
      return () => setIndex(0);
    }, []),
  );

  const layout = useWindowDimensions();
  const [routes] = React.useState([
    {key: 'first', title: 'Me'},
    {key: 'second', title: 'Someone else'},
  ]);

  /////
  let narratorNames = '';
  const selectedCategory = useSelector(state => state.story.selectedCategory);
  const [timeframe, setTimeframe] = useState('');
  const [location, setLocation] = useState('');
  const [activities, setActivities] = useState('');
  const [involvedPeople, setInvolvedPeople] = useState('');
  const dispatch = useDispatch();
  const [saveButtonDisabled, setSaveButtonDisabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const {bottom: bottomInset} = useSafeAreaInsets();
  const [openResetDialog, setOpenResetDialog] = useState(false);
  const [narratorName, setNarratorName] = useState('');
  const [asyncStore, setAsyncStore] = useState('');

  const asyncStoreFunction = async () => {
    const storedData = await AsyncStorage.getItem('AIStory');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setAsyncStore(parsedData);
    }
  };

  useEffect(() => {
    asyncStoreFunction();
  }, []);

  useEffect(() => {
    if (asyncStore) {
      setTimeframe(asyncStore.when || '');
      setLocation(asyncStore.where || '');
      setInvolvedPeople(asyncStore.who || '');
      setActivities(asyncStore.key_Activities || '');
      if (asyncStore.narrator === 'me') {
        setNarratorName('');
        setIndex(0);
      } else {
        setNarratorName(asyncStore.narrator);
        setIndex(1);
      }
    }
  }, [asyncStore]);

  const handleResetButton = () => {
    formik.resetForm({
      values: {
        category: null,
        timeframe: '',
        location: '',
        involvedPeople: '',
        activities: '',
        narratorName: '',
      },
    });
    AsyncStorage.removeItem('AIStory');
    dispatch(resetSelectedCategory());
    setTimeframe('');
    setLocation('');
    setInvolvedPeople('');
    setResetNarratorName(true);
    setActivities('');
    setOpenResetDialog(false);
  };
  useEffect(() => {
    if (resetNarratorName) {
      setNarratorName('');
      setResetNarratorName(false);
    }
  }, [resetNarratorName]);

  const handleNarratorNameChange = text => {
    setNarratorName(text);
  };

  const formik = useFormik({
    initialValues: {
      category: '',
      timeframe: '',
      location: '',
      involvedPeople: '',
      activities: '',
      narratorName: narratorNames,
    },
    validationSchema: Yup.object().shape({}),
  });

  useEffect(() => {
    if (selectedCategory) {
      formik.setFieldValue('category', selectedCategory);
    }
  }, [selectedCategory]);

  useEffect(() => {
    setSaveButtonDisabled(
      !formik.values.category &&
        !formik.values.timeframe &&
        !formik.values.location &&
        !formik.values.involvedPeople &&
        !formik.values.activities,
      // !asyncStore,
    );
  }, [
    formik.values.category,
    formik.values.timeframe,
    formik.values.location,
    formik.values.involvedPeople,
    formik.values.activities,
    // asyncStore
  ]);

  const theme = useTheme();
  const customTheme = {
    colors: {
      primary: theme.colors.orange,
      textAlign: 'center',
    },
  };

  function close() {
    navigation.goBack();
  }

  async function createAIStory(e) {
    try {
      const narratorNames = narratorName === '' ? 'me' : narratorName;
      setLoading(true);
      const data = {
        narrator: narratorNames,
        category: selectedCategory,
        when: timeframe,
        where: location,
        who: involvedPeople,
        key_Activities: activities,
        language: 'English',
      };
      await AsyncStorage.setItem('AIStory', JSON.stringify(data));
      await asyncStoreFunction();
      const res = await dispatch(generateAIStory(data)).unwrap();
      if (res) {
        setLoading(false);
        dispatch(setAIStory(res));
        close();
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
      setLoading(false);
    }
  }

  function handleCategoryPress() {
    try {
      Keyboard.dismiss();
      navigation.navigate('AIStoryCategories');
    } catch (_error) {
      /**empty */
    }
  }

  /////
  const renderScene = ({route}) => {
    switch (route.key) {
      case 'first':
        return index === 0 ? (
          <FirstRoute
            index={index}
            customTheme={customTheme}
            formik={formik}
            handleCategoryPress={handleCategoryPress}
            loading={loading}
            timeframe={timeframe}
            setTimeframe={setTimeframe}
            location={location}
            setLocation={setLocation}
            setNarratorName={setNarratorName}
            involvedPeople={involvedPeople}
            setInvolvedPeople={setInvolvedPeople}
            activities={activities}
            setActivities={setActivities}
            narratorName={narratorName}
            timeFieldFocus={timeFieldFocus}
            setTimeFieldFocus={setTimeFieldFocus}
            locationFieldFocus={locationFieldFocus}
            setLocationFieldFocus={setLocationFieldFocus}
            membersInvolvedFieldFocus={membersInvolvedFieldFocus}
            setMembersInvolvedFieldFocus={setMembersInvolvedFieldFocus}
            keyActivitiesFieldFocus={keyActivitiesFieldFocus}
            setKeyActivitiesFieldFocus={setKeyActivitiesFieldFocus}
            style={{display: index === 0 ? 'flex' : 'none'}}
          />
        ) : null;
      case 'second':
        return index === 1 ? (
          <SecondRoute
            index={index}
            customTheme={customTheme}
            formik={formik}
            handleCategoryPress={handleCategoryPress}
            loading={loading}
            timeframe={timeframe}
            setTimeframe={setTimeframe}
            location={location}
            setLocation={setLocation}
            involvedPeople={involvedPeople}
            setInvolvedPeople={setInvolvedPeople}
            activities={activities}
            setActivities={setActivities}
            narratorName={narratorName}
            handleNarratorNameChange={handleNarratorNameChange}
            timeFieldFocus={timeFieldFocus}
            setTimeFieldFocus={setTimeFieldFocus}
            locationFieldFocus={locationFieldFocus}
            setLocationFieldFocus={setLocationFieldFocus}
            membersInvolvedFieldFocus={membersInvolvedFieldFocus}
            setMembersInvolvedFieldFocus={setMembersInvolvedFieldFocus}
            keyActivitiesFieldFocus={keyActivitiesFieldFocus}
            setKeyActivitiesFieldFocus={setKeyActivitiesFieldFocus}
            style={{display: index === 1 ? 'flex' : 'none'}}
          />
        ) : null;
      default:
        return null;
    }
};

  return (
    <>
      <ErrorBoundary.Screen>
        <GlobalHeader
          accessibilityLabel="goBackStory"
          onBack={handleBack}
          heading={'AI Helper'}
          backgroundColor={Theme.light.background}
          fontSize={20}
          isBeta={true}
        />
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{flex: 1,}}>
          <CustomScroll
            style={{
              flexGrow: 1,
            }}
            scrollViewStyle={{
              height: (Dimensions.get('screen').height * 70) / 100,
            }}
              keyboardShouldPersistTaps="handled">
                <Pressable>
            <View
              style={[
                {
                  marginVertical: 3,
                  marginHorizontal: 10,
                  paddingHorizontal: 10,
                },
              ]}>
              <Text
            style={[
              styles.centeredText,
              {paddingBottom: 10, fontSize: 13},
            ]}>
            AI Helper is an experimental feature that assists in drafting
            your story. It provides a starting point for you to edit and refine as needed.
          </Text>
        </View>
        </Pressable>
        <View>
          <Text variant="bold" style={styles.narratorText}>
            Narrator of the Story
          </Text>
        </View>
          <Pressable>
        <View style={{height: 700, }}>
            <CustomTabView
                routes={routes}
                index={index}
                onIndexChange={setIndex}
                renderScene={renderScene}
              />
            </View>
            </Pressable>
            </CustomScroll>

           <TouchableOpacity
            style={styles.resetButtonTouchableOpacity}
            onPress={() => setOpenResetDialog(true)}>
            <View style={styles.resetButtonView}>
              <ResetIcon />
              <Text
                style={{
                  color: Theme.light.blackText,
                  fontWeight: 700,
                  fontSize: 20,
                  marginBottom: 5,
              
                }}>
                Reset
              </Text>
            </View>
          </TouchableOpacity>

          {openResetDialog && (
            <Portal>
              <Dialog
                onDismiss={() => setOpenResetDialog(false)}
                visible={openResetDialog}
                style={{backgroundColor: '#ffffff', borderRadius: 10}}>
                <Dialog.Title style={styles.dialogTitle}>
                  Are you sure you want to reset all the fields?
                </Dialog.Title>
                <Dialog.Actions style={styles.buttonsContainer}>
                  <Button
                    labelStyle={styles.cancelButtonText}
                    style={styles.cancelButton}
                    onPress={() => setOpenResetDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    labelStyle={styles.confirmButtonText}
                    style={styles.confirmButton}
                    onPress={handleResetButton}>
                    Confirm
                  </Button>
                </Dialog.Actions>
              </Dialog>
            </Portal>
          )}
          <View style={styles.buttonContainer}>
            <CustomButton
              customDisabledStyles={{opacity: 0.5}}
              accessibilityLabel="generateDraftButton"
              className="generateDraft"
              label={'Generate Draft'}
              loading={loading}
              style={{
                paddingVertical: 15,
                marginHorizontal: 25,
                width: '90%',
                marginBottom: 1,
                marginTop: 1,
              }}
              disabled={saveButtonDisabled || loading}
              onPress={createAIStory}
            />
          </View>
        </View>
        </TouchableWithoutFeedback>
      </ErrorBoundary.Screen>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  centeredText: {
    fontWeight: '700',
    textAlign: 'center',
  },
  narratorText: {
    fontWeight: '800',
    fontSize: 16,
    textAlign: 'center',
  },
  textInputStyle: {
    backgroundColor: '#FFF',
  },
  inputContainer: {
    fontSize: 10,
    borderRadius: 10,
    marginHorizontal: 28,
    marginBottom: 10,
    backgroundColor: '#FEF8F1',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonContainer: {
    height: 'auto',
    width: '100%',
    backgroundColor: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderTopWidth: 1,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    padding: 20,
  },
  resetButtonTouchableOpacity: {
    width: 130,
    height: 50,
    marginLeft: 'auto',
    marginRight: 'auto',
    // marginBottom: Platform.OS === 'ios' ? 70 : 80,
    // marginTop: -40
  },
  resetButtonView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 90,
    marginLeft: 'auto',
    marginRight: 'auto',
    alignItems: 'center',
  },
  dialogTitle: {
    // marginHorizontal: 50,
    color: 'black',
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 23,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    borderRadius: 8,
    borderColor: Theme.dark.orange,
    width: 130,
    fontSize: 28,
    fontWeight: 700,
    marginRight: 20,
  },
  cancelButtonText: {
    fontSize: 18,
    fontWeight: 700,
    color: Theme.dark.orange,
  },
  confirmButton: {
    width: 130,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: Theme.dark.orange,
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: 700,
    color: Theme.light.onWarning,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.secondaryLightPeach,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.primaryOrange,
    marginHorizontal: 65,
    height: 40,
    marginVertical: 10,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedTab: {
    backgroundColor: colors.primaryOrange,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.primaryOrange,
  },
});

export default AIHelper;
