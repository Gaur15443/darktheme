import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  // Share,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  Platform,
  Pressable,
  Animated,
} from 'react-native';
import Share from 'react-native-share';
import {CloseIcon} from '../../images/Icons/ModalIcon';
import {InfocheckIcon} from '../../images';
import {
  ActivityIndicator,
  Icon,
  TextInput,
  Text,
  Portal,
  Modal,
  Button,
} from 'react-native-paper';
import ButtonSpinner from '../../common/ButtonSpinner';
import Theme from '../../common/Theme';
import {Image} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import Axios from '../../plugin/Axios';
import {RoleConformation} from '../../store/apps/tree';
import Toast from 'react-native-toast-message';
import PropTypes from 'prop-types';
import CustomInput from '../CustomTextInput';
import {getGroupData} from '../../store/apps/memberDirectorySlice';
import {Track} from '../../../App';
import NewTheme from '../../common/NewTheme';
import {TabView, TabBar} from 'react-native-tab-view';
import {ScrollView} from 'react-native-gesture-handler';

const FirstRoute = () => (
  <ScrollView
    contentContainerStyle={{flexGrow: 1, paddingBottom: 20}}
    showsVerticalScrollIndicator={false}>
    <View style={{paddingHorizontal: 12}}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
        <Text style={styles.text}>View the tree</Text>
        <InfocheckIcon style={styles.image} />
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 10,
        }}>
        <Text style={styles.text}>
          Share stories, audios, quotes & moments with your family
        </Text>
        <InfocheckIcon style={styles.image} />
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 10,
        }}>
        <Text style={styles.text}>
          Write collaborative stories with family members
        </Text>
        <InfocheckIcon style={styles.image} />
      </View>
      <View
        style={{
          flexDirection: 'row',
          marginTop: 10,
          justifyContent: 'space-between',
        }}>
        <Text style={styles.textgray}>Edit family tree</Text>
        <View style={{flex: 1, width: 25, height: 24}} />
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 10,
        }}>
        <Text style={styles.textgray}>
          Add memories and lifestories to relatives
        </Text>
        <View style={{flex: 1, width: 25, height: 24}} />
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 10,
        }}>
        <Text style={styles.textgray}>Link members to the tree</Text>
        <View style={{flex: 1, width: 25, height: 24}} />
      </View>
    </View>
  </ScrollView>
);

const SecondRoute = () => (
  <ScrollView
    contentContainerStyle={{flexGrow: 1, paddingBottom: 20}}
    showsVerticalScrollIndicator={false}>
    <View style={{paddingHorizontal: 12}}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
        <Text style={styles.text}>View the tree</Text>
        <InfocheckIcon style={styles.image} />
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 10,
        }}>
        <Text style={styles.text}>
          Share stories, audios, quotes & moments with your family
        </Text>
        <InfocheckIcon style={styles.image} />
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 10,
        }}>
        <Text style={styles.text}>
          Write collaborative stories with family members
        </Text>
        <InfocheckIcon style={styles.image} />
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 10,
        }}>
        <Text style={styles.text}>Edit family tree</Text>
        <InfocheckIcon style={styles.image} />
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 10,
        }}>
        <Text style={styles.text}>
          Add memories and lifestories to relatives
        </Text>
        <InfocheckIcon style={styles.image} />
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 10,
        }}>
        <Text style={styles.text}>Link members to the tree</Text>
        <InfocheckIcon style={styles.image} />
      </View>
      {/* Add more Contributor content here */}
    </View>
  </ScrollView>
);

const InviteModal = ({
  familyName,
  visible,
  onClose,
  content,
  invitedMemberDetails,
  invitedType,
  inviteEvent,
}) => {
  const dispatch = useDispatch();

  const [inviteeName, setInviteeName] = useState(
    invitedMemberDetails
      ? invitedMemberDetails?.fname + ' ' + invitedMemberDetails?.lname
      : '',
  );
  const [isEnabled, setIsEnabled] = useState(
    invitedMemberDetails ? true : false,
  );
  const [loadEnable, setLoadEnable] = useState(false);
  const [activeTab, setActiveTab] = useState('member');
  const [isRoleConfirmation, setRoleConfirmation] = useState({});
  const [error, setError] = useState('');
  const [groupData, setGroupData] = useState(null);

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };
  let userGroup = null;

  const handleTextChange = inputText => {
    const validInputRegex = /^[a-zA-Z\s]*$/;
    if (!validInputRegex.test(inputText)) {
      setError('Field cannot contain special characters or numbers.');
      setInviteeName(inputText);
      setIsEnabled(false);
    } else {
      const capitalizedText =
        inputText.charAt(0).toUpperCase() + inputText.slice(1).toLowerCase();
      setInviteeName(capitalizedText);
      setIsEnabled(capitalizedText.trim().length > 0);
      setError(capitalizedText.trim() ? '' : 'This field is required');
    }
  };

  useEffect(() => {
    try {
      (async () => {
        userGroup = await dispatch(getGroupData()).unwrap();
        const ownerData = userGroup?.find(
          item => item?.ownerId?._id?._id === userInfo?._id,
        );
        setGroupData(ownerData);
      })();
    } catch (__error) {}
  }, []);

  const userInfo = useSelector(state => state.userInfo);
  const groupList = useSelector(state => state.getGroupData);
  const generateShareLink = async () => {
    try {
      setLoadEnable(true);
      setIsEnabled(false);
      const apiUrl = '/inviteMember';
      const fixedUrl = 'https://imeuswe.app/';
      const payload = {
        senderId: userInfo._id,
        receverRole: activeTab === 'contributor' ? 'Contributor' : 'User',
        receverFullName: inviteeName ? inviteeName : null,
        senderFullname: `${userInfo?.personalDetails?.name} ${userInfo?.personalDetails?.lastname}`,
        senderRole: isRoleConfirmation?.tree?.role,
        invitedtype: invitedType ? invitedType : 'non-tree',
        groupId: groupData ? groupData?._id : null,
        recieverId: invitedMemberDetails ? invitedMemberDetails?._id : null,
        groupName: groupData ? groupData?.groupName : null,
      };
      const res = await Axios.post(apiUrl, payload);
      const firstLine = `Hey ${payload?.receverFullName}`;
      const secondLine = `I want to invite you to the ${groupData?.groupName} tree that I made on iMeUsWe, a secure app to discover your family roots and share your family memories for generations to come.`;
      const thirdLine = 'Joining the tree takes just two steps!';
      const forthLine =
        "1. Install the iMeUsWe App using the link below (if you've already installed the app, head to step 2!)";
      const firstUrl = `${fixedUrl}`;
      const fifthLine = `2. After installing the app, tap the link below to join the ${groupData?.groupName} tree.`;
      const secondUrl = res?.data?.data;
      const sixthLine =
        'For security reasons, the link will expire after one use';
      const options = {
        title: 'Invite Family Members',
        message: `${firstLine}\n\n${secondLine}\n\n${thirdLine}\n\n${forthLine}\n${firstUrl}\n\n${fifthLine}\n${secondUrl}\n\n${sixthLine}`,
        subject: 'Invite Family Members',
        failOnCancel: false,
      };

      const result = await Share.open(options);

      if (result.success) {
        setLoadEnable(false);
        onClose();
        setIsEnabled(false);
        setInviteeName('');
        // if (shareActivity.activityType) {
        Toast.show({
          type: 'success',
          text1: 'Invite sent successfully',
        });
        // }
      } else {
        setIsEnabled(true);
        onClose();
        setInviteeName('');
      }

      /* customer io and mixpanel event chagnes  start */
      Track({
        cleverTapEvent: inviteEvent,
        mixpanelEvent: inviteEvent,
        userInfo,
      });
      /* customer io and mixpanel event chagnes  end */
    } catch (error) {
      setLoadEnable(false);
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    } finally {
      setLoadEnable(false);
    }
  };
  const clearInput = () => {
    setInviteeName('');
  };

  useEffect(() => {
    try {
      // For sender Role Confirmation
      if (userInfo?._id && userInfo?.treeIdin) {
        getRoleConformation(userInfo._id, userInfo.treeIdin[0]);
      }
    } catch (__error) {}
  }, [userInfo]);

  const getRoleConformation = async (userId, treeId) => {
    const apiUrl = `/getRoleConformation/${userId}/${treeId}`;
    const axiosConfig = {};
    // Keep await, without it it's not working, and if unwrap is used it will not work.
    const res = await dispatch(RoleConformation(apiUrl, axiosConfig));
    if (res.payload) {
      setRoleConfirmation(res.payload.roleConformation);
    }
    return res.payload?.roleConformation;
  };

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    {key: 'member', title: 'Member'},
    {key: 'contributor', title: 'Contributor'},
  ]);

  const handleTabPress = newIndex => {
    if (newIndex !== index) {
      setIndex(newIndex);
      setActiveTab(routes[newIndex].key);
    }
  };

  const renderContent = () => {
    switch (index) {
      case 0:
        return <FirstRoute />;
      case 1:
        return <SecondRoute />;
      default:
        return <FirstRoute />;
    }
  };

  const renderCustomTabBar = () => (
    <View style={styles.tabBarContainer}>
      <Animated.View
        style={[
          styles.indicator,
          {
            left: indicatorPosition.interpolate({
              inputRange: [0, 50], // 0% to 50% for two tabs
              outputRange: ['0%', '50%'],
            }),
          },
        ]}
      />
      {routes.map((route, idx) => (
        <TouchableOpacity
          key={route.key}
          style={styles.tabButton}
          onPress={() => handleTabPress(idx)}>
          <Text
            style={{
              color:
                index === idx
                  ? NewTheme.colors.secondaryDarkBlueRGB
                  : NewTheme.colors.blackText,
              fontWeight: 700,
              fontSize: 16,
            }}>
            {route.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const indicatorPosition = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(indicatorPosition, {
      toValue: index * (100 / routes.length),
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [index]);

  const onIndexChange = newIndex => {
    console.log('onIndexChange:', {newIndex, newTab: routes[newIndex].key});
    if (newIndex !== index) {
      setIndex(newIndex);
      setActiveTab(routes[newIndex].key);
    }
  };

  const renderTabBar = props => {
    return (
      <TabBar
        {...props}
        indicatorStyle={{
          backgroundColor: 'white',
          borderRadius: 8,
          height: 40,
          marginTop: -20,
          borderWidth: 1.5,
        }}
        style={{
          backgroundColor: NewTheme.colors.grayBackColor,
          borderRadius: 8,
          height: 40,
          shadowColor: '#000',
          marginVertical: 10,
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.22,
          shadowRadius: 2.22,
          elevation: 3,
        }}
        onTabPress={({route}) => {
          handleTabPress(route.key);
        }}
        renderLabel={({route, focused}) => (
          <View style={{marginTop: -5}}>
            <Text
              style={{
                color: focused
                  ? NewTheme.colors.secondaryDarkBlueRGB
                  : NewTheme.colors.blackText,
                fontWeight: 700,
                fontSize: 16,
              }}>
              {route.title}
            </Text>
          </View>
        )}
      />
    );
  };

  return (
    <>
      <Portal>
        <Modal
          animationType="fade"
          transparent={true}
          dismissable={false}
          statusBarTranslucent={true}
          visible={visible}
          onDismiss={onClose}
          style={{
            marginBottom: 0,
            marginTop: 0,
            backgroundColor: 'transparent',
            borderRadius: 6,
          }}
          contentContainerStyle={{
            height: '100%',
            width: '100%',
            padding: 0,
            margin: 0,
          }}
          onRequestClose={onClose}>
          <Pressable
            style={{
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: -1,
              position: 'absolute',
            }}
            onPress={onClose}></Pressable>
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <TouchableOpacity
              style={{position: 'absolute', width: '100%', height: '100%'}}
              activeOpacity={1}
              onPress={onClose}
            />
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View
                pointerEvents="box-none"
                style={{
                  backgroundColor: NewTheme.colors.whiteText,
                  width: '90%',
                  padding: 20,
                  borderRadius: 5,
                  position: 'absolute',
                  minHeight: '65%',
                }}>
                <View style={styles.closeWrapper}>
                  <TouchableOpacity
                    testID="invite-close"
                    onPress={() => {
                      onClose();
                      setInviteeName('');
                      setIsEnabled(false);
                    }}
                    style={{
                      backgroundColor: 'lightgray',
                      marginTop: -20,
                      marginRight: -32,
                      borderRadius: 5,
                      elevation: 9,
                    }}>
                    <CloseIcon />
                  </TouchableOpacity>
                </View>
                <Text style={styles.heading}>
                  Who would you like to share an invite with?
                </Text>
                <CustomInput
                  style={{marginTop: 16}}
                  mode="outlined"
                  label="Enter name here"
                  name="Enter name here"
                  testID="inputTextBox"
                  onChangeText={handleTextChange}
                  clearable
                  error={Boolean(error)}
                  theme={
                    error
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
                />
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                <Text style={styles.assignRole}>Assign role:</Text>

                <View style={{height: 320}}>
                  {renderCustomTabBar()}
                  {renderContent()}
                </View>
                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <TouchableOpacity
                    testID="invite"
                    onPress={generateShareLink}
                    style={[
                      styles.button,
                      inviteeName && isEnabled
                        ? styles.enabledButton
                        : styles.disabledButton,
                      !(inviteeName && isEnabled) &&
                        styles.disabledButtonOpacity,
                    ]}
                    disabled={!inviteeName || !isEnabled || Boolean(error)}>
                    {loadEnable ? (
                      <ButtonSpinner color={'white'} />
                    ) : (
                      <Text style={styles.buttonText}>Invite</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </Modal>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  heading: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    justifyContent: 'center',
    color: 'black',
  },
  closeWrapper: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginTop: -20,
    padding: 10,
    marginRight: -10,
    color: 'black',
  },
  tab: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    color: Theme.dark.shadow,
    backgroundColor: 'rgb(199,197,207)',
    width: '100%',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  assignRole: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
    margin: 10,
    color: 'black',
  },
  tabWrapper: {
    marginTop: 10,
    marginLeft: 10,
    marginRight: 10,
    padding: 10,
    gap: 6,
    color: 'black',
  },
  image: {
    width: 30,
    height: 30,
    flex: 1,
  },
  text: {
    flex: 11,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
    color: 'black',
  },
  input: {
    backgroundColor: Theme.light.onSecondary,
    height: 50,
    width: '100%',
    marginBottom: 5,
    marginTop: 20,
    color: 'black',
  },
  errorText: {
    color: '#8B0000',
    marginBottom: 10,
  },
  button: {
    width: '80%',
    // backgroundColor: '#3473DC',
    backgroundColor: NewTheme.colors.primaryOrange,
    padding: 9,
    borderRadius: 9,
    marginBottom: 20,
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  enabledButton: {
    opacity: 1,
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledButtonOpacity: {
    pointerEvents: 'none',
  },
  toggleButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
  },
  toggleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  textgray: {
    flex: 11,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
    color: '#888888',
  },

  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: NewTheme.colors.grayBackColor,
    borderRadius: 8,
    height: 40,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    position: 'relative',
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    position: 'absolute',
    top: 0,
    height: 40,
    width: '50%',
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: 'black',
  },
  activeTab: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#ccc',
  },
  inactiveTab: {
    backgroundColor: 'transparent',
  },
});

InviteModal.propTypes = {
  familyName: PropTypes.string,
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  content: PropTypes.any,
  invitedMemberDetails: PropTypes.object,
  invitedType: PropTypes.string,
  inviteEvent: PropTypes.string,
};

export default InviteModal;
