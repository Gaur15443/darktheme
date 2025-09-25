import React, {useState, useRef, useEffect, useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  StatusBar,
  TextInput,
  Platform,
} from 'react-native';
import Animated, {SlideInDown} from 'react-native-reanimated';
import {GlobalStyle} from '../../../core';
import Toast from 'react-native-toast-message';
import moment from 'moment';
import {useNavigation} from '@react-navigation/native';
import {GlobalHeader} from '../../../components';
import {CustomInput} from '../../../components';
import Confirm from '../../Confirm';
import {useTheme, Text} from 'react-native-paper';
import ImuwDatePicker from '../../../core/UICompoonent/ImuwDatePicker';

import {LocationPinkIcon} from '../../../images';
import {CalendarPinkIcon} from '../../../images';
import {CustomButton} from '../../../core';
import useNativeBackHandler from './../../../hooks/useBackHandler';
import Axios from '../../../plugin/Axios';
import { publishNote } from '../../../store/apps/notes';

const AddNote = ({route}) => {
  const id = route?.params?.id;
  const treeId = route?.params?.treeId;
  const noteId = route?.params?.note;
  const isEdit = route?.params?.isEdit || false;

  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [pageElements, setPageElements] = useState([]);
  const [noteTitle, setNoteTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationinfo, setLocationInfo] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('Uploading...');
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const dateInputRef = useRef(null);
  const [openConfirmPopup, setOpenConfirmPopup] = useState(false);

  const userId = id || useSelector(state => state?.userInfo?._id);
    const basicInfo = useSelector(
      state => state?.fetchUserProfile?.basicInfo[userId]?.myProfile,
    );
  const toastMessages = useSelector(
    state => state?.getToastMessages?.toastMessages?.Memory,
  );

  // Memoize form validation
  const isFormValid = useMemo(() => {
    return noteTitle.trim().length > 0 && description.trim().length > 0;
  }, [noteTitle, description]);

  // Back handler function
  function handleBack() {
    if (noteTitle.trim() || description.trim() || locationinfo.trim() || selectedDate) {
      setOpenConfirmPopup(true);
    } else {
      navigation.goBack();
    }
  }
  useEffect(() => {
    if (isEdit && noteId) {
      // Fetch existing note details for editing
      const fetchNoteDetails = async () => {
        try {
          setLoading(true);
          const response = await Axios.get(`/get-note-by-id/${noteId}`);
          const noteData = response.data.data;
          setNoteTitle(noteData?.title || '');
          setDescription(noteData?.note || '');
          setLocationInfo(noteData?.location || '');
          setSelectedDate(noteData?.noteCreatedDate ? new Date(noteData?.noteCreatedDate) : null);
          setLoading(false);
        } catch (error) {
          setLoading(false);
        }
      };
      fetchNoteDetails();
    }
  }, [isEdit, noteId]);

  // Register back handler
  useNativeBackHandler(handleBack);

  const handleDateChange = date => {
    setSelectedDate(date);
    setShowDatePicker(false);
    dateInputRef.current?.blur();
  };

  const SaveNote = async () => {
    if (!isFormValid) {
      Toast.show({
        type: 'error',
        text1: 'Please fill in both title and description',
      });
      return;
    }

    try {
      setLoading(true);
      setLoadingMessage('Saving note...');
      const noteData = {
        title: noteTitle.trim(),
        note: description.trim(),
        location: locationinfo.trim(),
        noteCreatedDate: selectedDate ? moment(selectedDate).format('DD/MM/YYYY') : null,
      };
      let cloneOwner = null;
      if(basicInfo?.isClone){
        cloneOwner = basicInfo?.cLink?.find(link => link?.treeId === treeId)?.linkId?.[0];
      }
      if (!basicInfo?.isClone && basicInfo?.cLink?.length > 0) {
        cloneOwner = basicInfo?._id;
      }
      const response = isEdit 
        ? await Axios.put(`/update-note/${noteId}`, noteData)
        : await dispatch(publishNote({userId, noteData, clinkowner: cloneOwner})).unwrap();
            
      Toast.show({
        type: 'success',
        text1: 'Note saved successfully!',
      });

      // Reset form
      setNoteTitle('');
      setDescription('');
      setLocationInfo('');
      setSelectedDate(null);
      setLoading(false);
      
      navigation.goBack();
    } catch (error) {
      setLoading(false);
      
      const errorMessage = error?.response?.data?.message || 
                          error?.message ||
                          'Failed to save note';
      
      Toast.show({
        type: 'error',
        text1: errorMessage,
      });
    } finally {
      if (!error) {
        setLoading(false);
      }
    }
  };

  const handleDiscardChanges = () => {
    setNoteTitle('');
    setDescription('');
    setLocationInfo('');
    setSelectedDate(null);
    setOpenConfirmPopup(false);
    navigation.goBack();
  };

  const handleContinueEditing = () => {
    setOpenConfirmPopup(false);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
      paddingHorizontal: 16,
      paddingBottom: 100,
    },
    row: {
      marginVertical: 8,
    },
    column12: {
      flex: 1,
    },
    textInputStyle: {
      backgroundColor: 'white',
      fontSize: 16,
    },
    textAreaContainer: {
      position: 'relative',
      marginVertical: 8,
    },
    textArea: {
      minHeight: 200,
      maxHeight: 300,
      borderWidth: 1,
      borderColor: '#ccc6c6',
      borderRadius: 4,
      padding: 12,
      paddingBottom: 28,
      backgroundColor: 'white',
      fontSize: 16,
      color: '#000',
      textAlignVertical: 'top',
    },
    counter: {
      position: 'absolute',
      right: 10,
      bottom: 8,
      fontSize: 12,
      color: '#999',
    },
    saveButtonContainer: {
      marginTop: 40,
      paddingHorizontal: 20,
      width: '100%',
      alignSelf: 'center',
    },
    datePickerContainer: {
      position: 'relative',
    },
  });

  return (
    <View style={styles.container}>
      <GlobalHeader
        onBack={handleBack}
        heading={isEdit ? 'Note' : 'New Note'}
        backgroundColor={theme.colors.background}
      />
      <StatusBar
        backgroundColor={theme.colors.background}
        barStyle={'dark-content'}
      />
      
      {openConfirmPopup && (
        <Confirm
          accessibilityLabel={'add-note-confirm-popup'}
          title={'Are you sure you want to leave?'}
          subTitle={'If you discard, you will lose your changes.'}
          discardCtaText={'Discard'}
          continueCtaText={'Continue Editing'}
          onContinue={handleContinueEditing}
          onDiscard={handleDiscardChanges}
          onCrossClick={handleContinueEditing}
        />
      )}

      <KeyboardAvoidingView 
        style={{flex: 1}} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <GlobalStyle>
            {/* Title Field */}
            <View style={styles.row}>
              <View style={styles.column12}>
                <CustomInput
                  accessibilityLabel={'title'}
                  name="noteTitle"
                  testID="title"
                  mode="outlined"
                  label="Title*"
                  style={styles.textInputStyle}
                  onChangeText={setNoteTitle}
                  maxLength={50}
                  value={noteTitle}
                  right={<Text style={{color: '#999'}}>{`${noteTitle.length}/50`}</Text>}
                  outlineColor={theme.colors.altoGray}
                  disabled={loading}
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Description Field */}
            <View style={styles.row}>
              <View style={styles.column12}>
                <View style={styles.textAreaContainer}>
                  <TextInput
                    style={styles.textArea}
                    placeholder="Description*"
                    placeholderTextColor="#999"
                    multiline
                    value={description}
                    onChangeText={setDescription}
                    maxLength={999}
                    textAlignVertical="top"
                    disabled={loading}
                  />
                  <Text style={styles.counter}>
                    {`${description.length}/999`}
                  </Text>
                </View>
              </View>
            </View>

            {/* Location Field */}
            <View style={styles.row}>
              <View style={styles.column12}>
                <CustomInput
                  accessibilityLabel={'location'}
                  name="location"
                  testID="location"
                  mode="outlined"
                  label="Location"
                  style={styles.textInputStyle}
                  contentStyle={{paddingStart: 5}}
                  left={<LocationPinkIcon testID="LocationNotesIcon" />}
                  leftContentStyles={{width: 30, alignItems: 'flex-end'}}
                  onChangeText={setLocationInfo}
                  clearable
                  value={locationinfo}
                  outlineColor={theme.colors.altoGray}
                  disabled={loading}
                  returnKeyType="done"
                />
              </View>
            </View>

            {/* Date Field */}
             <View style={styles.row}>
                 <View
                  style={[styles.column12, {padding: 4}]}
                  onTouchEnd={() => {
                    if (!loading) {
                      setShowDatePicker(true);
                    }
                  }}>
                  <CustomInput
                    accessibilityLabel={'date'}
                    name="date"
                    ref={dateInputRef}
                    testID="date"
                    mode="outlined"
                    label=" Date"
                    style={[styles.textInputStyle, {backgroundColor: 'white'}]}
                    contentStyle={{paddingStart: 5}}
                    left={<CalendarPinkIcon testID="CalendarNotesIcon" />}
                    leftContentStyles={{width: 30, alignItems: 'flex-end'}}
                    value={
                      selectedDate
                        ? moment(selectedDate).format('DD/MMM/YYYY')
                        : ''
                    }
                    disabled={true}
                    onPress={() => {
                      if (!loading) {
                        setShowDatePicker(true);
                      }
                    }}
                    outlineColor={theme.colors.altoGray}
                    showSoftInputOnFocus={false}
                  />
                  <Animated.View
                    entering={SlideInDown.duration(250).damping(10)}>
                    <ImuwDatePicker
                      accessibilityLabel={'datepicker'}
                      onClose={() => {
                        setShowDatePicker(false);
                        dateInputRef.current.blur();
                      }}
                      open={showDatePicker}
                      testID="datepicker"
                      selectedDate={
                        selectedDate ? new Date(selectedDate) : new Date()
                      }
                      mode="date"
                      onDateChange={handleDateChange}
                    />
                  </Animated.View>
                </View>
              </View>

            {/* Save Button */}
            <View style={styles.saveButtonContainer}>
              <CustomButton
                accessibilityLabel={'createNotesBtn'}
                testID="createNotesBtn"
                label={'Save'}
                loading={loading}
                onPress={SaveNote}
                disabled={!isFormValid || loading}
                loadingText={loadingMessage}
              />
            </View>
          </GlobalStyle>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default AddNote;