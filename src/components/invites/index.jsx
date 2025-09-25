import React, {useEffect, useState} from 'react';
import Toast from 'react-native-toast-message';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import {
  ActivityIndicator,
  Card,
  Divider,
  Text,
  useTheme,
  Dialog,
  Portal,
  Button,
  Modal,
} from 'react-native-paper';
import Theme from '../../common/Theme';
import NewTheme from '../../common/NewTheme';
import Spinner from '../../common/Spinner';
import BackArrowIcon from '../../images/Icons/BackArrowIcon';
import {useDispatch, useSelector} from 'react-redux';
import moment from 'moment';
import {Image} from 'react-native';
import {
  DeclineInvite,
  existMemberInvite,
} from '../../store/apps/tree/treeSlice';
import Axios from '../../plugin/Axios';
import {fetchUserNotification} from '../../store/apps/notifications';
import InviteEmptyState from '../../images/Icons/InviteEmptyState';
import {
  getprivateTreeList,
  setTreeinviteValue,
  fetchInviteCount,
  resetInviteCount,
} from '../../store/apps/tree';
import {useNavigation} from '@react-navigation/native';
import DefaultImage from '../../core/UICompoonent/DefaultImage';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ErrorBoundary from '../../common/ErrorBoundary';
import {CustomButton} from '../../core';
import * as KeyChain from 'react-native-keychain';

import {fetchUserProfile} from '../../store/apps/fetchUserProfile/index';
import {setGenderDataUpdate} from '../../store/apps/auth/index';
import CancelModalIcon from '../../images/Icons/CancelModal/index';
import {Shadow} from 'react-native-shadow-2';
import HeaderSeparator from '../../common/HeaderSeparator';

const InviteSheetModal = ({route}) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const {top} = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(true);

  const [isVisible, setVisible] = useState(true);
  const [openGenderModal, setOpenGenderModal] = useState(false);
  const [isGenderLoading, setIsGenderLoading] = useState(false);
  const [genderUpdated, setGenderUpdated] = useState(false);
  const [selectedGender, setSelectedGender] = useState(null);
  const [pendingInvite, setPendingInvite] = useState(null);
  const theme = useTheme();

  const userId = useSelector(state => state?.userInfo._id);
  const userProfile = useSelector(
    state => state.fetchUserProfile.data?.myProfile?.personalDetails?.gender,
  );

  const fetchInvite = useSelector(state => state.Tree?.fetchInvite);
  const inviteNotifications = fetchInvite?.notifications || [];

  useEffect(() => {
    const loadNotifications = async () => {
      if (fetchInvite && inviteNotifications.length >= 0) {
        setFilteredNotiication(inviteNotifications);
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const res = await dispatch(fetchInviteCount()).unwrap();
        setFilteredNotiication(res?.notifications || []);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, [route?.params?.inviteNotifications, fetchInvite, dispatch]);

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserProfile(userId));
    }
  }, [userId, dispatch, selectedGender]);

  const handleGenderSelect = async () => {
    if (!selectedGender || !pendingInvite) return;

    setIsGenderLoading(true);
    try {
      await dispatch(
        setGenderDataUpdate({
          gender: selectedGender,
        }),
      ).unwrap();

      await AcceptInvite(
        pendingInvite.details,
        pendingInvite.notificationId,
        pendingInvite.sender,
        pendingInvite.reciever,
      );

      Toast.show({
        type: 'success',
        text1: 'Gender updated successfully',
      });

      setOpenGenderModal(false);
      setPendingInvite(null);
      setSelectedGender(null);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    } finally {
      setIsGenderLoading(false);
    }
  };

  const handleGenderCancel = () => {
    setOpenGenderModal(false);
  };

  function notificationTimestamp(time) {
    if (time !== '' && time) {
      const result = moment(time).fromNow();
      return result;
    }
    return '';
  }

  const formatNotificationContent = content => {
    const nameRegex = /^([A-Za-z]+ [A-Za-z]+)/;
    const contributorKeyword = 'contributor';

    const nameMatch = content.match(nameRegex);

    if (nameMatch) {
      const fullName = nameMatch[0];
      const restOfContent = content.slice(fullName.length);

      return (
        <>
          <Text variant="bold">{fullName}</Text>
          {restOfContent.includes(contributorKeyword) ? (
            <>
              <Text>{restOfContent.split(contributorKeyword)[0]}</Text>
              <Text variant="bold">{contributorKeyword}</Text>
              <Text>{restOfContent.split(contributorKeyword)[1]}</Text>
            </>
          ) : (
            <Text>{restOfContent}</Text>
          )}
        </>
      );
    }

    return <Text>{content}</Text>;
  };
  const resData = useSelector(state => state.userInfo);
  const [filteredNotification, setFilteredNotiication] = useState(
    route?.params?.inviteNotifications || [],
  );
  const [loadingAction, setLoadingAction] = useState({action: null, id: null});
  const DeleteNotification = async Id => {
    const apiUrl = `/deleteNotification/${Id}`;
    await Axios.delete(apiUrl).then(() => {
      dispatch(fetchUserNotification(1)).unwrap();
    });
  };
  const AcceptInvite = async (details, notificationId, sender, reciever) => {
    try {
      setLoadingAction({action: 'accept', id: notificationId});
      let data = null;
      const {senderId} = details;
      const receiverId = resData._id;
      if (details.notificationType === 'groupRequest') {
        data = {
          notificationType: 'groupRequest',
          senderId: senderId,
          recieverId: reciever,
          recevermemberid:
            details?.receverRole?.toLowerCase() === 'contributor'
              ? reciever
              : null,
          receverRole:
            details?.receverRole === 'Contributor' ? 'Contributor' : 'user',
          senderRole: 'owner',
          invitedType: 'non-tree',
          senderMemberId: details.senderRecieverId,
          sendertreeId: null,
          recevertreeId: null,
        };
      }

      if (details.notificationType === 'treeRequest') {
        data = {
          notificationType: 'treeRequest',
          senderId,
          recieverId: receiverId,
          recevermemberid: null,
          receverRole: null,
          senderRole: null,
          invitedType: null,
          senderMemberId: null,
          sendertreeId: null,
          recevertreeId: null,
        };
      }

      if (details.notificationType === 'treeCollabration') {
        data = {
          notificationType: details.notificationType,
          senderId: sender,
          recieverId: receiverId,
          recevermemberid: receiverId,
          receverRole: details.reciverRole,
          senderRole: null,
          invitedType: null,
          senderMemberId: sender,
          sendertreeId: details.senderTreeId,
          recevertreeId: treeId,
          email: null,
        };
      }

      if (details.notificationType === 'MergeRequest') {
        data = {
          notificationType: 'MergeRequest',
          senderId: details.senderId,
          recieverId: null,
          recevermemberid: null,
          receverRole: null,
          senderRole: null,
          invitedType: null,
          senderMemberId: null,
          sendertreeId: null,
          recevertreeId: null,
        };
      }
      const res = await dispatch(
        existMemberInvite({
          payload: data,
        }),
      );
      if (
        details.notificationType === 'groupRequest' ||
        details.notificationType === 'treeRequest' ||
        details.notificationType === 'MergeRequest'
      ) {
        if (res?.payload) {
          DeleteNotification(notificationId);
          setFilteredNotiication(prevState =>
            prevState.filter(
              notification => notification._id !== notificationId,
            ),
          );
          await dispatch(getprivateTreeList());
        }
      }
      dispatch(resetInviteCount());
      setLoadingAction({action: null, id: null});
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  };

  const handleAcceptClick = (details, notificationId, sender, reciever) => {
    if (userProfile === 'unspecified') {
      setPendingInvite({
        details,
        notificationId,
        sender,
        reciever,
      });
      setOpenGenderModal(true);
      return;
    }

    AcceptInvite(details, notificationId, sender, reciever);
  };

  const DeclineInviteRequest = async (senderId, groupId, notificationId) => {
    try {
      setLoadingAction({action: 'decline', id: notificationId});

      const dataPayload = {
        senderMemberId: senderId,
        sendertreeId: groupId,
        notificationType: 'treeRequest',
        senderId,
      };

      const res = await dispatch(DeclineInvite({payload: dataPayload}));
      if (res?.payload) {
        DeleteNotification(notificationId);
        setFilteredNotiication(prevState =>
          prevState.filter(notification => notification._id !== notificationId),
        );
      }
      dispatch(resetInviteCount());
      setLoadingAction({action: null, id: null});
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  };

  const goBack = () => {
    dispatch(setTreeinviteValue(false));
    navigation.goBack();
  };

  return (
    <ErrorBoundary>
      {/* <Shadow
        distance={5}
        startColor="rgba(0, 0, 0, 0.13)"
        // endColor="rgba(0, 0, 0, 0)"
        offset={Platform.OS === 'android' ? [0, 8] : [0, 3]}
        style={{
          width: '100%',
          height: Platform.OS === 'android' ? 100 : null,
        }}> */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'rgba(255,248,240,1)',
          // elevation: 10,
          paddingTop: top + 20,
          paddingBottom: 15,
        }}>
        <TouchableOpacity
          style={{left: 20}}
          testID="close-invite"
          onPress={goBack}>
          <BackArrowIcon />
        </TouchableOpacity>
        <View>
          <Text style={styles.text}>Invites</Text>
        </View>
        <View style={{width: 24}} />
      </View>
      <HeaderSeparator />
      {/* </Shadow> */}

      {isLoading ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Spinner />
        </View>
      ) : (
        <ScrollView style={{flex: 1}}>
          {filteredNotification.length >= 1 ? (
            <View
              style={{
                marginTop: 10,
                paddingVertical: 10,
                paddingHorizontal: 20,
                gap: 15,
              }}>
              {filteredNotification.map((notification, index) => (
                <Card key={index} style={styles.card} elevation={2.5}>
                  <View style={{flexDirection: 'row'}}>
                    {notification.user.personalDetails.profilepic ? (
                      <View>
                        <Image
                          source={{
                            uri: notification.user.personalDetails.profilepic,
                          }}
                          style={styles.image}
                        />
                      </View>
                    ) : (
                      <View style={styles.img}>
                        <DefaultImage
                          gender={notification?.user?.personalDetails?.gender}
                          size={50}
                          firstName={notification?.user?.personalDetails?.name}
                          lastName={
                            notification?.user?.personalDetails?.lastname
                          }
                          style={{width: 40, height: 40}}
                        />
                      </View>
                    )}
                    <View style={{marginLeft: 5, flexGrow: 1, flexShrink: 1}}>
                      <View
                        style={{
                          justifyContent: 'center',
                          width: '98%',
                        }}>
                        <Text
                          variant="bold"
                          style={{
                            color: 'black',
                            fontSize: 16,
                          }}>
                          {formatNotificationContent(notification.content)}
                        </Text>
                      </View>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: 'rgba(136, 136, 136, 1)',
                          marginRight: 10,
                          marginTop: 4,
                        }}>
                        {notificationTimestamp(notification.createdAt)}
                      </Text>
                      <View style={styles.actions}>
                        <TouchableOpacity
                          testID="accept"
                          onPress={() =>
                            handleAcceptClick(
                              notification?.details,
                              notification?._id,
                              notification?.sender,
                              notification.reciever,
                            )
                          }
                          disabled={
                            loadingAction?.action === 'accept' &&
                            loadingAction?.id === notification?._id
                          }
                          style={styles.buttons}>
                          {loadingAction?.action === 'accept' &&
                          loadingAction?.id === notification?._id ? (
                            <ActivityIndicator size={20} color="black" />
                          ) : (
                            <Text style={styles.buttonText}>Accept</Text>
                          )}
                        </TouchableOpacity>

                        <TouchableOpacity
                          testID="decline"
                          onPress={() =>
                            DeclineInviteRequest(
                              notification?.details?.senderId,
                              notification?.details?.groupId,
                              notification?._id,
                            )
                          }
                          disabled={
                            loadingAction?.action === 'decline' &&
                            loadingAction?.id === notification?._id
                          }
                          style={[styles.buttons, styles.outlinedButton]}>
                          {loadingAction?.action === 'decline' &&
                          loadingAction?.id === notification?._id ? (
                            <ActivityIndicator size={20} color="black" />
                          ) : (
                            <Text
                              style={[
                                styles.buttonText,
                                styles.outlinedButtonText,
                              ]}>
                              Decline
                            </Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          ) : (
            <View
              style={[
                styles.container,
                {flexDirection: 'column', paddingTop: 100},
              ]}>
              <InviteEmptyState />
              <Text style={styles.waitingText}>No new invites</Text>
              <Text style={styles.waitingContent}>
                When people send you invites to join their tree, they'll appear
                here.
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Gender Modal */}
      <Portal>
        <Modal
          visible={openGenderModal}
          onDismiss={() => {
            setOpenGenderModal(false);
            setPendingInvite(null);
            setSelectedGender(null);
          }}>
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
                onPress={() => {
                  handleGenderCancel();
                  setSelectedGender(null);
                }}>
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
                    selectedGender !== 'male' && {borderColor: 'transparent'},
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
                    selectedGender !== 'female' && {borderColor: 'transparent'},
                  ]}>
                  Female
                </Button>
              </View>

              <CustomButton
                accessibilityLabel="confirmGenderBtn"
                className="confirm-gender"
                label={'Confirm'}
                onPress={handleGenderSelect}
                disabled={!selectedGender || isGenderLoading}
              />
            </View>
          </Dialog.Content>
        </Modal>
      </Portal>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  modalContainer: {
    paddingHorizontal: 30,
    height: '100%',
  },

  card: {
    padding: 10,
    backgroundColor: Theme.light.onInfo,
    minHeight: 100,
    borderColor: NewTheme.colors.primaryOrangeRGB,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3.61,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.61,
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },
  text: {
    fontSize: 24,
    fontWeight: '700',
    color: 'black',
    marginTop: -10,
  },
  img: {
    justifyContent: 'flex-start',
    borderRadius: 50,
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 5,
    gap: 10,
  },
  buttons: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    minWidth: 90,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: NewTheme.colors.primaryOrangeRGB,
  },
  outlinedButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: NewTheme.colors.primaryOrangeRGB,
  },
  buttonText: {
    color: 'white',
  },
  outlinedButtonText: {
    color: NewTheme.colors.primaryOrangeRGB,
  },
  waitingText: {
    fontSize: 18,
    color: 'black',
    marginTop: 20,
  },
  waitingContent: {
    textAlign: 'center',
    color: 'black',
    marginTop: 10,
  },

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
    borderColor: Theme.light.onButton,
    borderRadius: 15,
    borderWidth: 3,
  },
});

export default InviteSheetModal;
