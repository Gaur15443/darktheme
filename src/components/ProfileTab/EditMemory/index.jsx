import React, {useState, useEffect, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  KeyboardAvoidingView,
} from 'react-native';
import Toast from 'react-native-toast-message';
import moment from 'moment';
import {useTheme, Text} from 'react-native-paper';
import {LocationPinkIcon, CalendarPinkIcon} from '../../../images';
import {CustomButton, VideoThumbnail, GlobalStyle} from '../../../core';
import {GlobalHeader, CustomInput} from '../../../components';
import Confirm from '../../Confirm';
import Animated, {SlideInDown} from 'react-native-reanimated';

import {
  fetchOneMemoryData,
  updateOneMemoryData,
} from '../../../store/apps/viewMemory';
import {useNavigation} from '@react-navigation/native';
import ImuwDatePicker from '../../../core/UICompoonent/ImuwDatePicker';

const EditMemory = ({route}) => {
  const theme = useTheme();
  const {memoryId} = route.params;
  const {treeId} = route.params;
  const viewonememory = useSelector(state => state.apiViewMemory.singleMemory);
  const navigation = useNavigation();
  const [loadingMessage, setLoadingMessage] = useState('Uploading...');
  const [openConfirmPopup, seOpenConfirmPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [MediaNote, setMediaNote] = useState('');
  const [locationinfo, setLocationInfo] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const dateInputRef = useRef(null);
  const userId = useSelector(state => state?.userInfo._id);
  const basicInfo = useSelector(
    state => state?.fetchUserProfile?.data?.myProfile,
  );
  // const basicInfo = useSelector(
  //   state => state?.fetchUserProfile?.basicInfo[userId]?.myProfile,
  // );
  console.log(basicInfo?._id, 'basicInfo ==>');
  const toastMessages = useSelector(
    state => state?.getToastMessages?.toastMessages?.Memory,
  );

  useEffect(() => {
    try {
      const fetchOneMemoryData = async () => {
        await dispatch(fetchOneMemoryData(memoryId)).unwrap();
      };

      fetchOneMemoryData();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  }, []);

  useEffect(() => {
    if (viewonememory && viewonememory) {
      if (viewonememory?.EventTitle) {
        setMediaNote(viewonememory?.EventTitle);
      }
      if (viewonememory?.location) {
        setLocationInfo(viewonememory?.location);
      }
      if (viewonememory?.eventDate) {
        setSelectedDate(moment(viewonememory?.eventDate).toDate());
      }
    }
  }, [viewonememory]);

  const handleDateChange = date => {
    setSelectedDate(date);
    setShowDatePicker(false);
    dateInputRef.current.blur();
  };
  const styles = StyleSheet.create({
    row1: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    column4: {
      flex: 1,
      margin: 4,
    },
    column2: {
      flex: 1,
      marginRight: 10,
    },
    picker: {
      backgroundColor: 'white',
    },

    pickerview: {
      height: 50,
      maxHeight: 50,
      minHeight: 50,
      borderColor: '#ccc6c6',
      borderRadius: 4,

      width: '100%',
      maxWidth: '100%',
      minWidth: '100%',
      borderWidth: 1,
      paddingTop: 0,
      marginTop: 5,
      backgroundColor: 'white',

      border: '1px solid #ccc6c6',
    },
    mediaIcon: {
      marginTop: 7,
      marginLeft: 5,
    },
    textInputStyle: {
      border: '0px solid #ccc6c6',
    },
    location: {
      backgroundColor: 'white',
      borderWidth: 1,
      borderRadius: 4,
      fontSize: 17,
      color: 'black',
      paddingLeft: 15,
      borderColor: '#ccc6c6',
      borderWidth: 1,
    },
    column12: {
      marginTop: 10,
      border: 0,
    },
    description: {},
    additionalContent: {
      height: 50,
      backgroundColor: 'blue',
      backgroundColor: '#F2F2F2',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.3,
      shadowRadius: 2,
      borderRadius: 4,
    },
  });
  const dispatch = useDispatch();

  console.log(
    basicInfo?.cLink?.find(link => link?.treeId === treeId),
    'basicInfo?.cLink?.find(link => link?.treeId === treeId)',
  );

  console.log(userId, 'userIduserIduserIduserId');
  const SaveMemory = async () => {
    try {
      setLoading(true);
      setLoadingMessage('Uploading...');
      const updatememorydata = {
        EventTitle: MediaNote,
        eventDate: selectedDate || null,
        CD_Flag: 1,
        description: null,
        location: locationinfo,
        userId: basicInfo?._id,
        isEvent: false,
        isStory: false,
        contents: viewonememory?.contents?.[0],
        galleryId: viewonememory?._id,
      };
      let cloneOwner = null;
      if (basicInfo?.isClone) {
        cloneOwner = basicInfo?.cLink?.find(link => link?.treeId === treeId)
          ?.linkId?.[0];
        updatememorydata.userId = cloneOwner;
      }
      if (!basicInfo?.isClone && basicInfo?.cLink?.length > 0) {
        cloneOwner = basicInfo?._id;
        updatememorydata.userId = cloneOwner;
      }
      await dispatch(updateOneMemoryData(updatememorydata))
        .unwrap()
        .then(() => {
          dispatch(fetchOneMemoryData(memoryId)).then(() => {
            setTimeout(() => {
              Toast.show({
                type: 'success',
                text1: toastMessages?.['10002'],
              });
            }, 1000);

            navigation.goBack();
            setLoading(false);
          });
        });
    } catch (error) {
      setLoading(false);

      Toast.show({
        type: 'error',
        text1: toastMessages?.Memory_Error?.['10005'],
      });
    }
  };
  function handleBack() {
    seOpenConfirmPopup(true);
  }

  return (
    <>
      <GlobalHeader
        onBack={handleBack}
        heading={'Edit Memory'}
        backgroundColor={theme.colors.background}
      />
      <KeyboardAvoidingView enabled={true} behavior="padding">
        <ScrollView keyboardShouldPersistTaps="always">
          {openConfirmPopup && (
            <Confirm
              accessibilityLabel={'confirm-popup-edit-memory'}
              title={'Are you sure you want to leave?'}
              subTitle={'If you discard, you will lose your changes.'}
              discardCtaText={'Discard'}
              continueCtaText={'Continue Editing'}
              onContinue={() => seOpenConfirmPopup(false)}
              onDiscard={() => {
                navigation.goBack();
              }}
              onCrossClick={() => seOpenConfirmPopup(false)}
            />
          )}
          <GlobalStyle>
            <View>
              <View style={styles.row}>
                <View style={[styles.column12, {padding: 4}]}>
                  <View
                    style={{
                      width: '100%',
                      height: 300,
                      overflow: 'hidden',
                      borderRadius: 6,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    {viewonememory?.contents?.[0]?.elements?.[0].type ===
                      'Image' && (
                      <Image
                        source={{
                          uri: viewonememory?.contents?.[0]?.elements?.[0]
                            .mediaUrl,
                        }}
                        accessibilityLabel={'Image-edit-memory'}
                        style={{
                          width: '100%',
                          height: '100%',
                          aspectRatio: 1,
                          resizeMode: 'contain',
                          borderRadius: 6,
                        }}
                      />
                    )}
                    {viewonememory?.contents?.[0]?.elements?.[0].type ===
                      'Video' && (
                      <VideoThumbnail
                        renderLocalThumbnailIos={true}
                        accessibilityLabel={'video-edit-memory'}
                        thumbnailUrl={
                          viewonememory?.contents?.[0]?.elements?.[0]
                            ?.thumbnailUrl
                        }
                        src={
                          viewonememory?.contents?.[0]?.elements?.[0]?.mediaUrl
                        }
                        preventPlay={false}
                        imuwMediaStyle={{width: '100%', height: '100%'}}
                        imuwThumbStyle={{borderRadius: 6, width: '100%'}}
                      />
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.column12, {padding: 4}]}>
                  <CustomInput
                    accessibilityLabel={'MediaNote'}
                    name="MediaNote"
                    testID="note"
                    mode="outlined"
                    label="Note"
                    style={[styles.textInputStyle, {backgroundColor: 'white'}]}
                    onChangeText={text => {
                      setMediaNote(text);
                    }}
                    maxLength={50}
                    value={MediaNote}
                    right={<Text>{`${MediaNote.length}/50`}</Text>}
                    outlineColor={theme.colors.altoGray}
                  />
                </View>
              </View>
              <View style={styles.row}>
                <View style={[styles.column12, {padding: 4}]}>
                  <CustomInput
                    accessibilityLabel={'location'}
                    name="location"
                    testID="location"
                    mode="outlined"
                    label=" Location"
                    style={[styles.textInputStyle, {backgroundColor: 'white'}]}
                    contentStyle={{paddingStart: 5}}
                    left={<LocationPinkIcon testID="LocationMemoryIcon" />}
                    leftContentStyles={{width: 30, alignItems: 'flex-end'}}
                    onChangeText={text => {
                      setLocationInfo(text);
                    }}
                    clearable
                    value={locationinfo}
                    outlineColor={theme.colors.altoGray}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View
                  style={[styles.column12, {padding: 4}]}
                  onTouchEnd={() => setShowDatePicker(true)}>
                  <CustomInput
                    accessibilityLabel={'date'}
                    name="date"
                    ref={dateInputRef}
                    testID="date"
                    mode="outlined"
                    label=" Date"
                    style={[styles.textInputStyle, {backgroundColor: 'white'}]}
                    contentStyle={{paddingStart: 5}}
                    left={<CalendarPinkIcon testID="CalendarMemoryIcon" />}
                    leftContentStyles={{width: 30, alignItems: 'flex-end'}}
                    value={
                      selectedDate
                        ? moment(selectedDate).format('DD MMM YYYY')
                        : ''
                    }
                    disabled={true}
                    onPress={() => setShowDatePicker(true)}
                    outlineColor={theme.colors.altoGray}
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
              <View style={[styles.row, {marginBottom: 100, paddingTop: 20}]}>
                <View style={styles.column12}>
                  <CustomButton
                    accessibilityLabel={'createMemoryBtn'}
                    testID="createMemoryBtn"
                    className="createMemoryBtn"
                    label={'Save'}
                    loading={loading}
                    disabled={loading}
                    onPress={() => {
                      SaveMemory();
                    }}
                  />
                </View>
              </View>
            </View>
          </GlobalStyle>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default EditMemory;
