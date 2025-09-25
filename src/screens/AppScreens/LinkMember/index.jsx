import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import {Button, Title, Paragraph, Text, useTheme} from 'react-native-paper';
import Spinner from '../../../common/Spinner';
import ButtonSpinner from '../../../common/ButtonSpinner';
import {getUserInfo} from '../../../store/apps/userInfo';
import {useSelector, useDispatch} from 'react-redux';
import {
  activeGroupList,
  getTreeName,
  existMemberInvite,
} from '../../../store/apps/tree/treeSlice';
import {useNavigation} from '@react-navigation/native';
import {LinkMemberEmptyState} from '../../../images';
import Toast from 'react-native-toast-message';
import {fetchUserProfile} from '../../../store/apps/fetchUserProfile';
import {GlobalHeader} from '../../../components';
import NewTheme from '../../../common/NewTheme';
import ErrorBoundary from '../../../common/ErrorBoundary';
import {SafeAreaView} from 'react-native-safe-area-context';

const LinkMember = ({route}) => {
  const {userId, treeId, currentTreeDetails, reloadTreeCallback} = route.params;
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isGroupList, setGroupList] = useState([]);
  const [cardCSS, setcardCSS] = useState(styles.card);
  const [loading, setLoading] = useState(false);
  const [isSelected, setSelected] = useState({
    firstName: '',
    lastName: '',
    receiverId: '',
    role: '',
  });
  const clickedCardGender = useSelector(
    state => state?.fetchUserProfile?.data?.myProfile?.personalDetails?.gender,
  );
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const BackPage = () => {
    navigation.goBack();
  };

  const fetchData = async () => {
    try {
      const getTree = `/getTreeName/${treeId}`;
      const actionResult = await dispatch(getTreeName(getTree, {}));
      const result = actionResult.payload;
      const activeApiUrl = `/activeGroupList/${result?.group?.groupId}`;
      const Response = await dispatch(activeGroupList(activeApiUrl, {}));
      await preloadProfileImages(Response?.payload?.result?.activeList);

      setGroupList(Response?.payload?.result?.activeList);
      if (userId) {
        dispatch(fetchUserProfile(userId));
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error,
      });
    } finally {
      setIsLoading(false);
    }
  };
  // Function to preload images with unique keys
  const preloadProfileImages = async activeMembers => {
    const imageUrls = activeMembers
      .map(member => member.profilepic)
      .filter(url => url);
    const imagePromises = imageUrls.map(url => Image.prefetch(url));

    try {
      await Promise.all(imagePromises);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  };
  // useEffect hook to trigger fetching of member and tree member data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!userId) {
          dispatch(getUserInfo());
        }
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Error fetching user info:',
          text2: error,
        });
      }
    };

    fetchUserData();
  }, [dispatch, userId]);

  const senderId = useSelector(state => state?.userInfo?._id);

  const AddMember = async () => {
    try {
      setLoading(true);
      const data = {
        senderId,
        recieverId: isSelected.receiverId,
        recevermemberid: isSelected.receiverId,
        receverRole: isSelected.role,
        senderRole: 'owner',
        invitedType: 'tree',
        notificationType: 'treeRequest',
        senderMemberId: userId,
        sendertreeId: treeId,
        recevertreeId: null,
        email: null,
      };
      const response = await dispatch(
        existMemberInvite({
          payload: data,
        }),
      ).unwrap();
      if (response.length > 1) {
        navigation.navigate('TreeScreen', {
          family: currentTreeDetails?.tree?.name,
          currentTreeDetails: currentTreeDetails,
          role: currentTreeDetails.user.role,
          reloadTree: reloadTreeCallback,
        });
        Toast.show({
          type: 'success',
          text1: `${isSelected?.firstName} ${isSelected?.lastName} has been linked`,
        });
      }
      setLoading(false);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, [dispatch]);

  return (
    <ErrorBoundary.Screen>
      <GlobalHeader
        backgroundColor={NewTheme.colors.backgroundCreamy}
        heading={'Select Member'}
        onBack={BackPage}
        hideDefaultseparator
        headerStyles={{
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.45,
          shadowRadius: 2.22,
        }}
      />
      <SafeAreaView
        style={[styles.container, {backgroundColor: theme.colors.background}]}>
        <View>
          {isLoading ? (
            <Spinner />
          ) : (
            <View>
              {isGroupList?.length >= 1 ? (
                <Paragraph style={styles.paragraph}>
                  Please select a member to link to this card. Information
                  related to the card will be overwritten by the information of
                  the selected member.
                </Paragraph>
              ) : (
                <>
                  <View style={{paddingTop: 100}}>
                    <LinkMemberEmptyState />
                  </View>
                  <View
                    style={{
                      width: 400,
                      height: 120,
                      justifyContent: 'center',
                      alignContent: 'center',
                    }}>
                    <Text
                      style={[styles.text, {fontWeight: 700, marginTop: 40}]}>
                      Start inviting now!
                    </Text>
                    <Text style={styles.text}>
                      You currently do not have any members in your tree.
                    </Text>
                  </View>
                </>
              )}

              <ScrollView>
                <View
                  style={[
                    styles.avatarContainer,
                    {
                      justifyContent: 'space-between',
                      marginHorizontal: 50,
                      paddingBottom: 400,
                    },
                  ]}>
                  {isGroupList?.map(value => (
                    <View
                      key={value.id + value.name}
                      style={{paddingBottom: 20}}>
                      <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => {
                          setSelected({
                            firstName: value.name,
                            lastName: value.lastname,
                            receiverId: value.id,
                            role: value.role,
                          });
                          setcardCSS([
                            styles.selectedCard,
                            {borderColor: theme.colors.primary},
                          ]);
                        }}
                        style={[
                          isSelected.receiverId === value.id && cardCSS,
                          value.groupInviteStatus === 'accepted' &&
                          (value.treeInviteStatus !== 'accepted' ||
                            value.treeInviteStatus === null ||
                            value.treeInviteStatus === 'no') &&
                          value?.gender?.toString?.()?.toLowerCase?.() ===
                            clickedCardGender?.toString?.()?.toLowerCase?.()
                            ? {}
                            : {opacity: 0.2, pointerEvents: 'none'},
                        ]}>
                        <View>
                          {value?.profilepic ? (
                            <Image
                              source={{uri: value?.profilepic}}
                              style={{
                                width: 120,
                                height: 120,
                                resizeMode: 'cover',
                                borderRadius:
                                  isSelected.receiverId === value.id ? 0 : 8,
                                overflow: 'hidden',
                              }}
                            />
                          ) : (
                            <View>
                              <View
                                style={[
                                  {
                                    width: 120,
                                    height: 120,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderRadius:
                                      isSelected.receiverId === value.id
                                        ? 0
                                        : 8,
                                  },
                                  {
                                    backgroundColor:
                                      value?.gender === 'female'
                                        ? '#FFDEE6'
                                        : '#CFEEFF',
                                  },
                                ]}>
                                {value?.name && (
                                  <Text
                                    style={{
                                      fontSize: 20,
                                      fontWeight: 'bold',
                                      color: theme.colors.shadow,
                                    }}>
                                    {value?.name?.charAt?.(0)}{' '}
                                    {value?.lastname?.charAt?.(0)}
                                  </Text>
                                )}
                              </View>
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                      <View
                        style={{
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                        <Title
                          style={{
                            textAlign: 'center',
                            width: 120,
                            fontSize: 16,
                            fontWeight: 500,
                            lineHeight: 20,
                            color:
                              value?.name === isSelected.firstName &&
                              value.id === isSelected.receiverId
                                ? theme.colors.primary
                                : value.groupInviteStatus === 'accepted' &&
                                    (value.treeInviteStatus !== 'accepted' ||
                                      value.treeInviteStatus === null ||
                                      value.treeInviteStatus === 'no') &&
                                    value?.gender
                                      ?.toString?.()
                                      ?.toLowerCase?.() ===
                                      clickedCardGender
                                        ?.toString?.()
                                        ?.toLowerCase?.()
                                  ? 'black'
                                  : 'grey',
                          }}>
                          {value.name} {value.lastname}
                        </Title>
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
        </View>
        <View
          style={[
            styles.linkContainer,
            {backgroundColor: theme.colors.background},
          ]}>
          <Button
            testID="link-member-button"
            style={[
              styles.linkBtn,
              {backgroundColor: theme.colors.primary},
              !isSelected.firstName && styles.disabledLinkBtn,
            ]}
            labelStyle={styles.linkBtnLabel}
            onPress={AddMember}
            disabled={!isSelected.firstName}>
            {loading ? (
              <ButtonSpinner color={'white'} />
            ) : (
              <Text
                variant="bold"
                style={{color: 'white', fontSize: 14, textAlign: 'center'}}>
                Link Member
              </Text>
            )}
          </Button>
        </View>
      </SafeAreaView>
    </ErrorBoundary.Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
  },
  headerTitle: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 700,
    paddingRight: 15,
  },
  paragraph: {
    textAlign: 'center',
    padding: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  text: {
    paddingTop: 25,
    paddingHorizontal: 10,
    fontSize: 24,
    fontWeight: 600,
    textAlign: 'center',
  },

  avatarContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  card: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    borderColor: 'transparent',
  },
  selectedCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    borderWidth: 3,
    borderRadius: 6,
  },
  LinkedCard: {
    opacity: 0.2,
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    margin: 5,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  linkContainer: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkBtn: {
    width: '95%',
    borderRadius: 8,
    color: 'white',
    marginVertical: 15,
    paddingVertical: 3,
  },
  disabledLinkBtn: {
    opacity: 0.6,
  },
  linkBtnLabel: {
    color: 'white',
  },
});

LinkMember.propTypes = {
  route: PropTypes.shape({
    params: PropTypes.shape({
      userId: PropTypes.string.isRequired,
      treeId: PropTypes.string.isRequired,
      selectedMemberData: PropTypes.any.isRequired,
    }).isRequired,
  }).isRequired,
};

export default LinkMember;
