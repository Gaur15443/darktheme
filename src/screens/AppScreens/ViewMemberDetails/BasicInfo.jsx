import React, {useCallback, useEffect, useState} from 'react';
import {View, StyleSheet, Dimensions, TouchableOpacity} from 'react-native';
import {Card, useTheme, Text, ActivityIndicator} from 'react-native-paper';
import NewTheme from '../../../common/NewTheme';
import {ScrollView} from 'react-native-gesture-handler';
import {BasicFactIcon} from '../../../images';
import {MarriageDetailsIcon} from '../../../images';
import {EducationHistoryIcon} from '../../../images';
import {WorkHistoryIcon} from '../../../images';
import {MedicalHistoryIcon} from '../../../images';
import {CommunityHistoryIcon} from '../../../images';
import {FacebookIcon} from '../../../images';
import {ConnectionsIcon} from '../../../images';
import {InstagramIcon} from '../../../images';
import {TwitterIcon} from '../../../images';
import {EditIcon} from '../../../images';
import {fetchUserProfile} from '../../../store/apps/fetchUserProfile';
import {useDispatch, useSelector} from 'react-redux';
import moment from 'moment';
import Toast from 'react-native-toast-message';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import Spinner from '../../../common/Spinner';
import ErrorBoundary from '../../../common/ErrorBoundary';
import PullToRefresh from '../../../common/PullToRefresh';
import {desanitizeInput} from '../../../utils/sanitizers';
import parsePhoneNumber from 'libphonenumber-js';

const {width, height} = Dimensions.get('window');
const BasicInfo = props => {
  const theme = useTheme();
  const navigation = useNavigation();

  const dispatch = useDispatch();
  const userId = props.id;
  const userPermission = props.permission;
  const basicInfo = useSelector(
    state => state?.fetchUserProfile?.basicInfo[userId]?.myProfile,
  );

  const toastMessages = useSelector(
    state => state?.getToastMessages?.toastMessages?.Info_Tab?.basic_facts_error,
  );
  // const isDataFetched = useSelector(state => state?.fetchUserProfile?.isDataFetched)
  const userInfoId = useSelector(state => state?.userInfo?._id);
  const [isIndicatorLoading, setIsIndicatorLoading] = useState(false);
  const getUserDetails = async (params = null) => {
    // if(!isDataFetched){
    // setIsIndicatorLoading(true);
    await dispatch(fetchUserProfile(params || userId)).unwrap();
    setIsIndicatorLoading(false);
    // }
  };
  useFocusEffect(
    useCallback(() => {
      try {
        if (!basicInfo) {
          if (userInfoId) {
            getUserDetails(userInfoId);
          }
        }
      } catch (error) {}
    }, [basicInfo, userInfoId]),
  );

  useEffect(() => {
    try {
      if(!basicInfo) {
      setIsIndicatorLoading(true);
      getUserDetails();
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: toastMessages?.['12005'],
      });
    }
  }, []);

  const convertToYear = (d, flag) => {
    if (d !== '' && d !== undefined && d !== null) {
      if (flag) {
        if (flag === 1) {
          return moment(d).format('DD MMM YYYY');
        } else if (flag === 2) {
          return moment(d).format('MMM YYYY');
        } else if (flag === 3) {
          return moment(d).format('YYYY');
        }
      } else {
        return moment(d).format('DD MMM YYYY');
      }
    } else {
      return '';
    }
  };
  const GotoAddConnectionInfo = () => {
    navigation.navigate('ConnectionInfo', {id: userId});
  };
  const GotoAddCommunityInfo = () => {
    navigation.navigate('CommunityInfo', {id: userId});
  };
  const GotoAddMedicalInfo = () => {
    navigation.navigate('MedicalInfo', {id: userId});
  };
  const GotoAddWorkInfo = () => {
    navigation.navigate('WorkInfo', {id: userId});
  };
  const GotoAddEducationInfo = () => {
    navigation.navigate('EducationInfo', {id: userId});
  };
  const GotoAddBasicInfo = () => {
    navigation.navigate('BasicFact', {id: userId});
  };
  const GotoAddMarriageInfo = () => {
    navigation.navigate('MarriageInfo', {id: userId});
  };

  const [isRefreshing, setIsRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      setIsRefreshing(true);
      getUserDetails(userInfoId);
    } catch (error) {}
    setIsRefreshing(false);
  }, []);

  if (isIndicatorLoading) {
    return (
      <ScrollView>
        <Spinner />
      </ScrollView>
    );
  }

  const phoneInfo = basicInfo?.mobileNo
    ? parsePhoneNumber(
        `${basicInfo?.mobileNo}`.startsWith('+')
          ? basicInfo?.mobileNo
          : `+${basicInfo?.mobileNo}`,
        basicInfo?.countryISO || '',
      )
    : null;
  
    const secondaryphoneInfo = parsePhoneNumber(
		`${basicInfo?.secondaryMobileNo}`.startsWith('+')
		  ? basicInfo?.secondaryMobileNo
		  : `+${basicInfo?.secondaryMobileNo}`,
		  basicInfo?.countryISO || ''
	  );

  return (
    <ErrorBoundary.Screen>
      <ScrollView>
        <View style={styles.container}>
          {/* Basic Facts */}
          <Card
            style={[styles.card, {backgroundColor: theme.colors.onSecondary}]}>
            <View style={{position: 'relative', margin: 10}}>
              <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
                <BasicFactIcon />
                <Text
                  style={{fontWeight: 'bold', marginLeft: 10, fontSize: 18}}
                  accessibilityLabel="Basic Facts">
                  Basic Facts
                </Text>
              </View>
              {userPermission && (
                <TouchableOpacity
                  style={{position: 'absolute', bottom: 0, right: 0}}
                  onPress={() => GotoAddBasicInfo()}
                  testID="editBasic"
                  accessibilityLabel="editBasic">
                  <EditIcon accessibilityLabel="editBasic" />
                </TouchableOpacity>
              )}
            </View>
            <Card.Content>
              {basicInfo?.personalDetails?.name && (
                <View style={{paddingTop: 4}}>
                  <Text
                    style={[styles.heading, {color: theme.colors.blackHalti}]}
                    accessibilityLabel="Full Name">
                    Full Name
                  </Text>
                  <Text
                    style={[
                      styles.content,
                      {color: theme.colors.infoContentColor},
                    ]}
                    accessibilityLabel={`${basicInfo?.personalDetails?.name}`}>
                    {`${basicInfo?.personalDetails?.name || ''} ${
                      basicInfo?.personalDetails?.middlename
                        ? basicInfo?.personalDetails?.middlename + ' '
                        : ''
                    }${basicInfo?.personalDetails?.lastname || ''}`}
                  </Text>
                </View>
              )}
              {basicInfo?.personalDetails?.nickname && (
                <View style={{paddingTop: 4}}>
                  <Text
                    style={[styles.heading, {color: theme.colors.blackHalti}]}
                    accessibilityLabel="nickname">
                    Nickname
                  </Text>
                  <Text
                    style={[
                      styles.content,
                      {color: theme.colors.infoContentColor},
                    ]}
                    accessibilityLabel={`${basicInfo?.personalDetails?.nickname}`}>
                    {basicInfo?.personalDetails?.nickname}
                  </Text>
                </View>
              )}

              {basicInfo?.personalDetails?.gender && (
                <View style={{paddingTop: 4}}>
                  <Text
                    style={[styles.heading, {color: theme.colors.blackHalti}]}
                    accessibilityLabel="Gender">
                    Gender
                  </Text>
                  <Text
                    style={[
                      styles.content,
                      {color: theme.colors.infoContentColor},
                    ]}
                    accessibilityLabel={`${basicInfo.personalDetails.gender}`}>
                    {basicInfo.personalDetails.gender.charAt(0).toUpperCase() +
                      basicInfo.personalDetails.gender.slice(1).toLowerCase()}
                  </Text>
                </View>
              )}
              {basicInfo?.birthDetails?.dob && basicInfo?.BD_Flag && (
                <View style={{paddingTop: 4}}>
                  <Text
                    style={[styles.heading, {color: theme.colors.blackHalti}]}
                    accessibilityLabel="Birth Date">
                    Birth Date
                  </Text>
                  <Text
                    style={[
                      styles.content,
                      {color: theme.colors.infoContentColor},
                    ]}>
                    {basicInfo?.isAroundDOB === true && (
                      <Text
                        style={[
                          styles.content,
                          {color: theme.colors.infoContentColor},
                        ]}
                        accessibilityLabel={`${basicInfo?.isAroundDOB}`}>
                        ~
                      </Text>
                    )}
                    <Text
                      style={[
                        styles.content,
                        {color: theme.colors.infoContentColor},
                      ]}
                      accessibilityLabel={`${basicInfo?.birthDetails?.dob}`}>
                      {convertToYear(
                        basicInfo?.birthDetails?.dob,
                        basicInfo?.BD_Flag,
                      )}
                    </Text>
                  </Text>
                </View>
              )}
              {basicInfo?.location?.placeOfBirth && (
                <View style={{paddingTop: 4}}>
                  <Text
                    style={[styles.heading, {color: theme.colors.blackHalti}]}
                    accessibilityLabel="Born in">
                    Born in
                  </Text>
                  <Text
                    style={[
                      styles.content,
                      {color: theme.colors.infoContentColor},
                    ]}
                    accessibilityLabel={`${basicInfo?.location?.placeOfBirth?.formatted_address}-birthPlace`}>
                    {desanitizeInput(
                      basicInfo?.location?.placeOfBirth?.length
                        ? basicInfo?.location?.placeOfBirth
                        : (basicInfo?.location?.placeOfBirth
                            ?.formatted_address ?? ''),
                    )}
                  </Text>
                </View>
              )}
              {basicInfo?.personalDetails?.livingStatus === 'yes' &&
                basicInfo?.location?.currentlocation && (
                  <View style={{paddingTop: 4}}>
                    <Text
                      style={[styles.heading, {color: theme.colors.blackHalti}]}
                      accessibilityLabel="Currently living in">
                      Currently living in
                    </Text>
                    <Text
                      style={[
                        styles.content,
                        {color: theme.colors.infoContentColor},
                      ]}
                      accessibilityLabel={`${basicInfo?.location?.currentlocation?.formatted_address}-CurrentPlace`}>
                      {desanitizeInput(
                        basicInfo?.location?.currentlocation?.length
                          ? basicInfo?.location?.currentlocation
                          : (basicInfo?.location?.currentlocation
                              ?.formatted_address ?? ''),
                      )}
                    </Text>
                  </View>
                )}

              {basicInfo?.birthDetails?.dod &&
                basicInfo?.DD_Flag &&
                basicInfo?.personalDetails?.livingStatus === 'no' && (
                  <>
                    <View style={{paddingTop: 4}}>
                      <Text
                        style={[
                          styles.heading,
                          {color: theme.colors.blackHalti},
                        ]}
                        accessibilityLabel="Death Date">
                        Death Date
                      </Text>
                      <Text
                        style={[
                          styles.content,
                          {color: theme.colors.infoContentColor},
                        ]}>
                        {basicInfo?.isAroundDOD === true && (
                          <Text
                            style={[
                              styles.content,
                              {color: theme.colors.infoContentColor},
                            ]}
                            accessibilityLabel={`${basicInfo?.isAroundDOD}-dod`}>
                            ~
                          </Text>
                        )}
                        <Text
                          style={[
                            styles.content,
                            {color: theme.colors.infoContentColor},
                          ]}
                          accessibilityLabel={`${basicInfo?.birthDetails?.dod}-dod`}>
                          {convertToYear(
                            basicInfo?.birthDetails?.dod,
                            basicInfo?.DD_Flag,
                          )}
                        </Text>
                      </Text>
                    </View>
                  </>
                )}
              {typeof basicInfo?.location?.placeOfDeath === 'string' &&
                basicInfo?.location?.placeOfDeath &&
                basicInfo?.DD_Flag &&
                basicInfo?.personalDetails?.livingStatus === 'no' && (
                  <>
                    {basicInfo?.location?.placeOfDeath && (
                      <View style={{paddingTop: 4}}>
                        <Text
                          style={[
                            styles.heading,
                            {color: theme.colors.blackHalti},
                          ]}
                          accessibilityLabel="Death Date">
                          Death Place
                        </Text>
                        <Text
                          style={[
                            styles.content,
                            {color: theme.colors.infoContentColor},
                          ]}>
                          {desanitizeInput(
                            basicInfo?.location?.placeOfDeath &&
                              basicInfo?.location?.placeOfDeath,
                          )}
                        </Text>
                      </View>
                    )}
                  </>
                )}
              {basicInfo?.email && (
                <View style={{paddingTop: 4}}>
                  <Text
                    style={[styles.heading, {color: theme.colors.blackHalti}]}
                    accessibilityLabel="Email-Basic-Info">
                    Email
                  </Text>
                  <Text
                    style={[
                      styles.content,
                      {color: theme.colors.infoContentColor},
                    ]}
                    accessibilityLabel={`${basicInfo?.email}-email-basic-info`}>
                    {basicInfo?.email}
                  </Text>
                </View>
              )}
              {basicInfo?.secondaryEmail && (
                <View style={{paddingTop: 4}}>
                  <Text
                    style={[styles.heading, {color: theme.colors.blackHalti}]}
                    accessibilityLabel="Email-Basic-Info">
                    Email
                  </Text>
                  <Text
                    style={[
                      styles.content,
                      {color: theme.colors.infoContentColor},
                    ]}
                    accessibilityLabel={`${basicInfo?.secondaryEmail}-email-basic-info`}>
                    {basicInfo?.secondaryEmail}
                  </Text>
                </View>
              )}

              {basicInfo?.secondaryMobileNo && (
                <View style={{paddingTop: 4}}>
                  <Text
                    style={[styles.heading, {color: theme.colors.blackHalti}]}
                    accessibilityLabel="Mobile-Number-Basic-Info">
                    Mobile Number
                  </Text>
                  <Text
                    style={[
                      styles.content,
                      {color: theme.colors.infoContentColor},
                    ]}
                    accessibilityLabel={`${basicInfo?.secondaryMobileNo}-Mobile`}>
                		+{secondaryphoneInfo.countryCallingCode}{' '}
                    {secondaryphoneInfo.nationalNumber}
                  </Text>
                </View>
              )}
              {basicInfo?.mobileNo && (
                <View style={{paddingTop: 4}}>
                  <Text
                    style={[styles.heading, {color: theme.colors.blackHalti}]}
                    accessibilityLabel="Mobile-Number-Basic-Info">
                    Mobile Number
                  </Text>
                  <Text
                    style={[
                      styles.content,
                      {color: theme.colors.infoContentColor},
                    ]}
                    accessibilityLabel={`${basicInfo?.mobileNo}-Mobile`}>
                    +{phoneInfo.countryCallingCode} {phoneInfo.nationalNumber}
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>

          {/* Marriage Details */}
          {basicInfo?.marriageDetails?.length > 0 && (
            <Card
              style={[
                styles.card,
                {backgroundColor: theme.colors.onSecondary},
              ]}>
              <View
                style={{
                  position: 'relative',
                  marginLeft: 15,
                  marginTop: 10,
                  marginBottom: 10,
                  marginRight: 10,
                }}>
                <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
                  <MarriageDetailsIcon accessibilityLabel="MarriageDetailsIcon" />
                  <Text
                    style={{fontWeight: 'bold', marginLeft: 10, fontSize: 18}}
                    accessibilityLabel="Marriage Details">
                    Marriage Details
                  </Text>
                </View>
                {userPermission && (
                  <TouchableOpacity
                    style={{position: 'absolute', bottom: 0, right: 0}}
                    onPress={() => GotoAddMarriageInfo()}
                    testID="editMarriage"
                    accessibilityLabel="EditIcon-Marriage">
                    <EditIcon accessibilityLabel="EditIcon-Marriage" />
                  </TouchableOpacity>
                )}
              </View>
              <Card.Content>
                {basicInfo?.marriageDetails?.length > 0 &&
                  basicInfo?.marriageDetails?.map((marriagData, index) => (
                    <View key={index} style={{marginBottom: 10}}>
                      {marriagData?.spouseId?.personalDetails && (
                        <View
                          style={{
                            paddingTop: 4,
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}>
                          <Text
                            style={[
                              styles.heading,
                              {color: theme.colors.blackHalti},
                            ]}
                            accessibilityLabel={`${marriagData?.spouseId?.personalDetails?.name}`}>
                            {`${marriagData?.spouseId?.personalDetails?.name} ${marriagData?.spouseId?.personalDetails?.lastname}`}
                          </Text>
                        </View>
                      )}
                      {marriagData?.relationship && (
                        <View
                          style={{
                            paddingTop: 4,
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}>
                          <Text
                            style={[
                              styles.heading,
                              {color: theme.colors.blackHalti},
                            ]}
                            accessibilityLabel="status-relationship">
                            Status:
                          </Text>
                          <Text
                            style={[
                              styles.content,
                              {color: theme.colors.infoContentColor},
                              {paddingLeft: 5},
                            ]}
                            accessibilityLabel={`${marriagData?.relationship}`}>
                            {marriagData?.relationship}
                          </Text>
                        </View>
                      )}
                      {marriagData?.marraigeDate && (
                        <View
                          style={{
                            paddingTop: 4,
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}>
                          <Text
                            style={[
                              styles.heading,
                              {color: theme.colors.blackHalti},
                            ]}
                            accessibilityLabel="Marriage Date">
                            Marriage Date:
                          </Text>
                          <Text
                            style={[
                              styles.content,
                              {color: theme.colors.infoContentColor},
                              {paddingLeft: 5},
                            ]}>
                            {marriagData?.isAroundDateOfMarraige === true && (
                              <Text
                                style={[
                                  styles.content,
                                  {color: theme.colors.infoContentColor},
                                ]}
                                accessibilityLabel={`${marriagData?.isAroundDateOfMarraige}-dom`}>
                                ~
                              </Text>
                            )}
                            <Text
                              style={[
                                styles.content,
                                {color: theme.colors.infoContentColor},
                              ]}
                              accessibilityLabel={`${marriagData?.marraigeDate}-marraigeDate`}>
                              {convertToYear(
                                marriagData?.marraigeDate,
                                marriagData?.MD_Flag_N,
                              )}
                            </Text>
                          </Text>
                        </View>
                      )}

                      {marriagData?.location_of_wedding && (
                        <View
                          style={{
                            paddingTop: 4,
                            flexDirection: 'row',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                          }}>
                          <Text
                            style={[
                              styles.heading,
                              {color: theme.colors.blackHalti},
                            ]}
                            accessibilityLabel="Wedding Location">
                            Wedding Location:
                          </Text>

                          <Text
                            numberOfLines={1}
                            ellipsizeMode="tail"
                            style={[
                              styles.content,
                              {flex: 1},
                              {color: theme.colors.infoContentColor},
                              {paddingLeft: 5},
                            ]}
                            accessibilityLabel={`${marriagData?.location_of_wedding?.formatted_address}-WeddingLocation`}>
                            {desanitizeInput(
                              marriagData?.location_of_wedding?.length
                                ? marriagData?.location_of_wedding
                                : (marriagData?.location_of_wedding
                                    ?.formatted_address ?? ''),
                            )}
                          </Text>
                        </View>
                      )}
                    </View>
                  ))}
              </Card.Content>
            </Card>
          )}

          {/* Education History */}
          <Card
            style={[styles.card, {backgroundColor: theme.colors.onSecondary}]}>
            <View style={{position: 'relative', margin: 10}}>
              <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
                <EducationHistoryIcon accessibilityLabel="EducationHistoryIcon" />
                <Text
                  style={{fontWeight: 'bold', marginLeft: 10, fontSize: 18}}
                  accessibilityLabel="Education History">
                  Education History
                </Text>
              </View>
              {userPermission && (
                <TouchableOpacity
                  style={{position: 'absolute', bottom: 0, right: 0}}
                  onPress={() => GotoAddEducationInfo()}
                  testID="editEducation"
                  accessibilityLabel="EditIcon-education">
                  <EditIcon accessibilityLabel="EditIcon-education" />
                </TouchableOpacity>
              )}
            </View>

            <Card.Content>
              {basicInfo?.educationDetails?.college &&
                basicInfo?.educationDetails?.college?.map((college, index) => (
                  <View key={index} style={{marginBottom: 15}}>
                    {college.degree && (
                      <View style={{paddingTop: 4}}>
                        <Text
                          style={[
                            styles.heading,
                            {color: theme.colors.blackHalti},
                          ]}
                          accessibilityLabel="Degree">
                          Degree
                        </Text>
                        <Text
                          style={[
                            styles.content,
                            {color: theme.colors.infoContentColor},
                          ]}
                          accessibilityLabel={`${college.degree}`}>
                          {desanitizeInput(college.degree)}
                        </Text>
                      </View>
                    )}
                    {college.name && (
                      <View style={{paddingTop: 4}}>
                        <Text
                          style={[
                            styles.heading,
                            {color: theme.colors.blackHalti},
                          ]}
                          accessibilityLabel="College Name">
                          College Name
                        </Text>
                        <Text
                          style={[
                            styles.content,
                            {color: theme.colors.infoContentColor},
                          ]}
                          accessibilityLabel={`${college.name}`}>
                          {desanitizeInput(college.name)}
                        </Text>
                      </View>
                    )}
                    {college?.address && (
                      <View style={{paddingTop: 4}}>
                        <Text
                          style={[
                            styles.heading,
                            {color: theme.colors.blackHalti},
                          ]}
                          accessibilityLabel="College Location">
                          College Location
                        </Text>
                        <Text
                          style={[
                            styles.content,
                            {color: theme.colors.infoContentColor},
                          ]}
                          accessibilityLabel={`${college?.address}`}>
                          {desanitizeInput(college?.address)}
                        </Text>
                      </View>
                    )}
                    {(college?.dateOfFrom ||
                      college?.fromDate ||
                      college?.dateOfTo ||
                      college?.toDate) && (
                      <View style={{paddingTop: 4}}>
                        <Text
                          style={[
                            styles.heading,
                            {color: theme.colors.blackHalti},
                          ]}
                          accessibilityLabel="Duration">
                          Duration
                        </Text>
                      </View>
                    )}
                    <View style={{flexDirection: 'row'}}>
                      {(college?.dateOfFrom || college?.fromDate) && (
                        <View style={{paddingTop: 4}}>
                          <Text
                            style={[
                              styles.content,
                              {color: theme.colors.infoContentColor},
                            ]}>
                            {(college?.isAroundEducationStartDate === true ||
                              college?.isAroundEducationEndDate === true) && (
                              <Text
                                style={[
                                  styles.content,
                                  {color: theme.colors.infoContentColor},
                                ]}
                                accessibilityLabel={`${college?.isAroundEducationEndDate}-college`}>
                                ~
                              </Text>
                            )}
                            <Text
                              style={[
                                styles.content,
                                {color: theme.colors.infoContentColor},
                              ]}
                              accessibilityLabel={`college?.dateOfFrom-college-${index}`}>
                              {college?.dateOfFrom
                                ? new Date(college?.dateOfFrom).getFullYear()
                                : college?.fromDate
                                  ? new Date(college?.fromDate).getFullYear()
                                  : ''}
                            </Text>
                          </Text>
                        </View>
                      )}
                      {(college?.dateOfFrom || college?.fromDate) &&
                        (college?.dateOfTo || college?.toDate) && (
                          <View style={{paddingTop: 4}}>
                            <Text
                              style={[
                                styles.content,
                                {color: theme.colors.infoContentColor},
                              ]}
                              accessibilityLabel="dateOfFrom-dateOfTo">
                              -
                            </Text>
                          </View>
                        )}
                      {(college?.dateOfTo || college?.toDate) && (
                        <View style={{paddingTop: 4}}>
                          <Text
                            style={[
                              styles.content,
                              {color: theme.colors.infoContentColor},
                            ]}
                            accessibilityLabel={`${index}-dateOfTo`}>
                            {college?.dateOfTo
                              ? new Date(college?.dateOfTo).getFullYear()
                              : college?.toDate
                                ? new Date(college?.toDate).getFullYear()
                                : ''}
                          </Text>
                        </View>
                      )}
                      {(college?.dateOfFrom || college?.fromDate) &&
                        college?.isPresentlyStudying === true && (
                          <View
                            style={{
                              paddingTop: 4,
                              paddingRight: 4,
                              paddingLeft: 4,
                            }}>
                            <Text
                              style={[
                                styles.content,
                                {color: theme.colors.infoContentColor},
                              ]}
                              accessibilityLabel="isPresentlyStudying-true">
                              -
                            </Text>
                          </View>
                        )}
                      {(college?.dateOfFrom || college?.fromDate) &&
                        college?.isPresentlyStudying === true && (
                          <View style={{paddingTop: 4}}>
                            <Text
                              style={[
                                styles.content,
                                {color: theme.colors.infoContentColor},
                              ]}
                              accessibilityLabel="Present-yes">
                              Present
                            </Text>
                          </View>
                        )}
                    </View>
                  </View>
                ))}
            </Card.Content>
          </Card>

          {/* Work History */}
          <Card
            style={[styles.card, {backgroundColor: theme.colors.onSecondary}]}>
            <View style={{position: 'relative', margin: 10}}>
              <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
                <WorkHistoryIcon accessibilityLabel="WorkHistoryIcon" />
                <Text
                  style={{fontWeight: 'bold', marginLeft: 10, fontSize: 18}}
                  accessibilityLabel="Work History">
                  Work History
                </Text>
              </View>
              {userPermission && (
                <TouchableOpacity
                  style={{position: 'absolute', bottom: 0, right: 0}}
                  onPress={() => GotoAddWorkInfo()}
                  testID="editWork"
                  accessibilityLabel="EditIcon-work">
                  <EditIcon accessibilityLabel="EditIcon-work" />
                </TouchableOpacity>
              )}
            </View>
            <Card.Content>
              {basicInfo?.workDetails &&
                basicInfo?.workDetails?.map((work, index) => (
                  <View key={index} style={{marginBottom: 15}}>
                    {(work?.dateOfFrom ||
                      work?.fromDate ||
                      work?.dateOfTo ||
                      work?.toDate) && (
                      <Text
                        style={[
                          styles.heading,
                          {color: theme.colors.blackHalti},
                        ]}
                        accessibilityLabel="Experience">
                        Duration
                      </Text>
                    )}
                    <View style={{flexDirection: 'row'}}>
                      {(work?.dateOfFrom || work?.fromDate) && (
                        <Text
                          style={[
                            styles.content,
                            {color: theme.colors.infoContentColor},
                          ]}>
                          {(work?.isAroundWorkStartDate === true ||
                            work?.isAroundWorkEndDate === true) && (
                            <Text
                              style={[
                                styles.content,
                                {color: theme.colors.infoContentColor},
                              ]}
                              accessibilityLabel={`${work?.isAroundWorkEndDate}-work-${index}`}>
                              ~
                            </Text>
                          )}
                          <Text
                            style={[
                              styles.content,
                              {color: theme.colors.infoContentColor},
                            ]}
                            accessibilityLabel={`fromDate-work-${index}`}>
                            {work?.dateOfFrom
                              ? new Date(work?.dateOfFrom).getFullYear()
                              : work?.fromDate
                                ? new Date(work?.fromDate).getFullYear()
                                : ''}
                          </Text>
                        </Text>
                      )}
                      {(work?.dateOfFrom
                        ? work.dateOfFrom !== null
                        : null || work?.fromDate
                          ? work?.fromDate !== null
                          : null) &&
                        (work?.dateOfTo
                          ? work?.dateOfTo !== null
                          : null || work?.toDate
                            ? work?.toDate !== null
                            : null) && (
                          <Text
                            style={[
                              styles.content,
                              {color: theme.colors.infoContentColor},
                            ]}
                            accessibilityLabel="dateOfFrom - dateOfTo">
                            -
                          </Text>
                        )}

                      {(work?.dateOfFrom || work?.fromDate) &&
                        work?.isPresentlyWorking === true && (
                          <View style={{paddingHorizontal: 4}}>
                            <Text
                              style={[
                                styles.content,
                                {color: theme.colors.infoContentColor},
                              ]}
                              accessibilityLabel="isPresentlyWorking-true">
                              -
                            </Text>
                          </View>
                        )}
                      {(work?.dateOfTo || work?.toDate) && (
                        <Text
                          style={[
                            styles.content,
                            {color: theme.colors.infoContentColor},
                          ]}
                          accessibilityLabel={`dateOfTo-${index}`}>
                          {work?.dateOfTo
                            ? new Date(work?.dateOfTo).getFullYear()
                            : work?.toDate
                              ? new Date(work?.toDate).getFullYear()
                              : ''}
                        </Text>
                      )}
                      {(work?.dateOfFrom || work?.fromDate) &&
                        work?.isPresentlyWorking === true && (
                          <Text
                            style={[
                              styles.content,
                              {color: theme.colors.infoContentColor},
                            ]}
                            accessibilityLabel="Present-work">
                            Present
                          </Text>
                        )}
                    </View>
                    {work.company_name && (
                      <View>
                        <Text
                          style={[
                            styles.heading,
                            {color: theme.colors.blackHalti},
                          ]}
                          accessibilityLabel="Company Name">
                          Company Name
                        </Text>
                        <Text
                          style={[
                            styles.content,
                            {color: theme.colors.infoContentColor},
                          ]}
                          accessibilityLabel={`${work.company_name}`}>
                          {desanitizeInput(work.company_name)}
                        </Text>
                      </View>
                    )}
                    {work.company_role && (
                      <View>
                        <Text
                          style={[
                            styles.heading,
                            {color: theme.colors.blackHalti},
                          ]}
                          accessibilityLabel="Company Role">
                          Role
                        </Text>
                        <Text
                          style={[
                            styles.content,
                            {color: theme.colors.infoContentColor},
                          ]}
                          accessibilityLabel={`${work?.company_role}`}>
                          {desanitizeInput(work?.company_role)}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
            </Card.Content>
          </Card>

          {/* Medical History */}
          <Card
            style={[styles.card, {backgroundColor: theme.colors.onSecondary}]}>
            <View style={{position: 'relative', margin: 10}}>
              <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
                <MedicalHistoryIcon accessibilityLabel="MedicalHistoryIcon" />
                <Text
                  style={{fontWeight: 'bold', marginLeft: 10, fontSize: 18}}
                  accessibilityLabel="Medical History">
                  Medical History
                </Text>
              </View>
              {userPermission && (
                <TouchableOpacity
                  style={{position: 'absolute', bottom: 0, right: 0}}
                  onPress={() => GotoAddMedicalInfo()}
                  testID="editMedical"
                  accessibilityLabel="EditIcon-medical">
                  <EditIcon accessibilityLabel="EditIcon-medical" />
                </TouchableOpacity>
              )}
            </View>
            <Card.Content>
              {basicInfo?.medicalDetails?.bloodgroup && (
                <View style={{paddingTop: 4}}>
                  <Text
                    style={[styles.heading, {color: theme.colors.blackHalti}]}
                    accessibilityLabel=" Blood Group">
                    Blood Group
                  </Text>
                  <Text
                    style={[
                      styles.content,
                      {color: theme.colors.infoContentColor},
                    ]}
                    accessibilityLabel={`${basicInfo?.medicalDetails?.bloodgroup}`}>
                    {basicInfo?.medicalDetails?.bloodgroup}
                  </Text>
                </View>
              )}
              {basicInfo?.medicalDetails?.chronic_condition?.length > 0 &&
                basicInfo?.medicalDetails?.chronic_condition?.some(
                  condition => condition.name !== '' && condition.name !== null,
                ) && (
                  <View style={{paddingTop: 4}}>
                    <Text
                      style={[styles.heading, {color: theme.colors.blackHalti}]}
                      accessibilityLabel="Medical Conditions">
                      Medical Conditions
                    </Text>
                    {basicInfo?.medicalDetails?.chronic_condition &&
                      basicInfo?.medicalDetails?.chronic_condition?.map(
                        (chronic, index) => (
                          <View key={index}>
                            {chronic.name && (
                              <Text
                                style={[
                                  styles.content,
                                  {color: theme.colors.infoContentColor},
                                ]}
                                accessibilityLabel={`${chronic.name}-${index}`}>
                                {desanitizeInput(chronic.name)}
                              </Text>
                            )}
                          </View>
                        ),
                      )}
                  </View>
                )}
              {basicInfo?.medicalDetails?.allergies?.length > 0 &&
                basicInfo?.medicalDetails?.allergies?.some(
                  condition => condition.name !== '' && condition.name !== null,
                ) && (
                  <View style={{paddingTop: 4}}>
                    <Text
                      style={[styles.heading, {color: theme.colors.blackHalti}]}
                      accessibilityLabel="Allergies">
                      Allergies
                    </Text>
                    {basicInfo?.medicalDetails?.allergies &&
                      basicInfo?.medicalDetails?.allergies?.map(
                        (allergy, index) => (
                          <View key={index}>
                            {allergy.name && (
                              <Text
                                style={[
                                  styles.content,
                                  {color: theme.colors.infoContentColor},
                                ]}
                                accessibilityLabel={`${allergy?.name}-${index}`}>
                                {desanitizeInput(allergy?.name)}
                              </Text>
                            )}
                          </View>
                        ),
                      )}
                  </View>
                )}
              {basicInfo?.medicalDetails?.illnesses?.length > 0 &&
                basicInfo?.medicalDetails?.illnesses?.some(
                  condition => condition.name !== '' && condition.name !== null,
                ) && (
                  <View style={{paddingTop: 4}}>
                    <Text
                      style={[styles.heading, {color: theme.colors.blackHalti}]}
                      accessibilityLabel="Hereditary conditions">
                      Hereditary conditions
                    </Text>
                    {basicInfo?.medicalDetails?.illnesses &&
                      basicInfo?.medicalDetails?.illnesses?.map(
                        (heridity, index) => (
                          <View key={index}>
                            {heridity.name && (
                              <Text
                                style={[
                                  styles.content,
                                  {color: theme.colors.infoContentColor},
                                ]}
                                accessibilityLabel={`${heridity?.name}-${index}`}>
                                {desanitizeInput(heridity?.name)}
                              </Text>
                            )}
                          </View>
                        ),
                      )}
                  </View>
                )}
            </Card.Content>
          </Card>

          {/* Community History */}
          <Card
            style={[styles.card, {backgroundColor: theme.colors.onSecondary}]}>
            <View style={{position: 'relative', margin: 10}}>
              <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
                <CommunityHistoryIcon accessibilityLabel="CommunityHistoryIcon" />
                <Text
                  style={{fontWeight: 'bold', marginLeft: 10, fontSize: 18}}
                  accessibilityLabel="Community Details">
                  Community Details
                </Text>
              </View>
              {userPermission && (
                <TouchableOpacity
                  style={{position: 'absolute', bottom: 0, right: 0}}
                  onPress={() => GotoAddCommunityInfo()}
                  testID="editCommunity"
                  accessibilityLabel="EditIcon-community">
                  <EditIcon accessibilityLabel="EditIcon-community" />
                </TouchableOpacity>
              )}
            </View>
            <Card.Content>
              {basicInfo?.moreInfo?.religion && (
                <View style={{paddingTop: 4}}>
                  <Text
                    style={[styles.heading, {color: theme.colors.blackHalti}]}
                    accessibilityLabel="Religion">
                    Religion
                  </Text>
                  <Text
                    style={[
                      styles.content,
                      {color: theme.colors.infoContentColor},
                    ]}
                    accessibilityLabel={`${basicInfo?.moreInfo?.religion}`}>
                    {basicInfo?.moreInfo?.religion}
                  </Text>
                </View>
              )}
              {basicInfo?.moreInfo?.community && (
                <View style={{paddingTop: 4}}>
                  <Text
                    style={[styles.heading, {color: theme.colors.blackHalti}]}
                    accessibilityLabel="Community">
                    Community
                  </Text>
                  <Text
                    style={[
                      styles.content,
                      {color: theme.colors.infoContentColor},
                    ]}
                    accessibilityLabel={`${basicInfo?.moreInfo?.community}`}>
                    {basicInfo?.moreInfo?.community}
                  </Text>
                </View>
              )}
              {basicInfo?.moreInfo?.subcommunity && (
                <View style={{paddingTop: 4}}>
                  <Text
                    style={[styles.heading, {color: theme.colors.blackHalti}]}
                    accessibilityLabel="Sub-Community">
                    Sub-Community
                  </Text>
                  <Text
                    style={[
                      styles.content,
                      {color: theme.colors.infoContentColor},
                    ]}
                    accessibilityLabel={`${basicInfo?.moreInfo?.subcommunity}`}>
                    {desanitizeInput(basicInfo?.moreInfo?.subcommunity)}
                  </Text>
                </View>
              )}
              {basicInfo?.moreInfo?.motherTounge && (
                <View style={{paddingTop: 4}}>
                  <Text
                    style={[styles.heading, {color: theme.colors.blackHalti}]}
                    accessibilityLabel="Mother Tongue">
                    Mother Tongue
                  </Text>
                  <Text
                    style={[
                      styles.content,
                      {color: theme.colors.infoContentColor},
                    ]}
                    accessibilityLabel={`${basicInfo?.moreInfo?.motherTounge}`}>
                    {basicInfo?.moreInfo?.motherTounge}
                  </Text>
                </View>
              )}
              {basicInfo?.moreInfo?.gothra && (
                <View style={{paddingTop: 4}}>
                  <Text
                    style={[styles.heading, {color: theme.colors.blackHalti}]}
                    accessibilityLabel="Gothra">
                    Gothra
                  </Text>
                  <Text
                    style={[
                      styles.content,
                      {color: theme.colors.infoContentColor},
                    ]}
                    accessibilityLabel={`${basicInfo?.moreInfo?.gothra}`}>
                    {basicInfo?.moreInfo?.gothra}
                  </Text>
                </View>
              )}
              {basicInfo?.moreInfo?.priestName && (
                <View style={{paddingTop: 4}}>
                  <Text
                    style={[styles.heading, {color: theme.colors.blackHalti}]}
                    accessibilityLabel="Priest Name">
                    Priest Name
                  </Text>
                  <Text
                    style={[
                      styles.content,
                      {color: theme.colors.infoContentColor},
                    ]}
                    accessibilityLabel={basicInfo?.moreInfo?.priestName}>
                    {desanitizeInput(basicInfo?.moreInfo?.priestName)}
                  </Text>
                </View>
              )}
              {basicInfo?.moreInfo?.deity && (
                <View style={{paddingTop: 4}}>
                  <Text
                    style={[styles.heading, {color: theme.colors.blackHalti}]}
                    accessibilityLabel="Deity">
                    Deity
                  </Text>
                  <Text
                    style={[
                      styles.content,
                      {color: theme.colors.infoContentColor},
                    ]}
                    accessibilityLabel={basicInfo?.moreInfo?.deity}>
                    {desanitizeInput(basicInfo?.moreInfo?.deity)}
                  </Text>
                </View>
              )}
              {basicInfo?.moreInfo?.ancestorVillage && (
                <View style={{paddingTop: 4}}>
                  <Text
                    style={[styles.heading, {color: theme.colors.blackHalti}]}
                    accessibilityLabel="Ancestral Village">
                    Ancestral Village
                  </Text>
                  <Text
                    style={[
                      styles.content,
                      {color: theme.colors.infoContentColor},
                    ]}
                    accessibilityLabel={`${basicInfo?.moreInfo?.ancestorVillage}`}>
                    {desanitizeInput(basicInfo?.moreInfo?.ancestorVillage)}
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>

          {/* Connections */}
          <Card
            style={[
              styles.card,
              {marginBottom: 150},
              {backgroundColor: theme.colors.onSecondary},
            ]}>
            <View>
              <View style={{position: 'relative', margin: 10}}>
                <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
                  <ConnectionsIcon accessibilityLabel="ConnectionsIcon" />
                  <Text
                    style={{fontWeight: 'bold', marginLeft: 10, fontSize: 18}}
                    accessibilityLabel="Social Media">
                    Social Media
                  </Text>
                </View>
                {userPermission && (
                  <TouchableOpacity
                    style={{position: 'absolute', bottom: 0, right: 0}}
                    onPress={() => GotoAddConnectionInfo()}
                    testID="editConnection"
                    accessibilityLabel="EditIcon-social">
                    <EditIcon accessibilityLabel="EditIcon-social" />
                  </TouchableOpacity>
                )}
              </View>
              <Card.Content style={{paddingTop: 6}}>
                {basicInfo?.sociallinks &&
                  basicInfo?.sociallinks?.map((social, index) => (
                    <View key={index}>
                      <View
                        style={{flexDirection: 'row', alignItems: 'center'}}>
                        {social.account === 'facebook' && (
                          <FacebookIcon accessibilityLabel="FacebookIcon" />
                        )}
                        {social.account === 'Insta' && (
                          <InstagramIcon accessibilityLabel="InstagramIcon" />
                        )}
                        {social.account === 'Twitter' && (
                          <TwitterIcon accessibilityLabel="TwitterIcon" />
                        )}

                        <Text
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          style={[
                            styles.content,
                            {paddingHorizontal: 5},
                            {paddingVertical: 5},
                            {flex: 1},
                          ]}
                          accessibilityLabel={`${social?.link}-${index}`}>
                          {desanitizeInput(social?.link)}
                        </Text>
                      </View>
                    </View>
                  ))}

                {basicInfo?.other &&
                  basicInfo?.other?.map((social, index) => (
                    <View key={index}>
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={[
                          styles.content,
                          {paddingHorizontal: 5},
                          {paddingVertical: 5},
                          {flex: 1},
                        ]}
                        accessibilityLabel={`${social?.link}-other-${index}`}>
                        {desanitizeInput(social?.link)}
                      </Text>
                    </View>
                  ))}
              </Card.Content>
            </View>
          </Card>
        </View>
      </ScrollView>
    </ErrorBoundary.Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 'auto',
  },

  card: {
    width: width - 25,
    marginVertical: 8,
    borderRadius: 5,
  },
  heading: {
    fontSize: 16,
  },
  content: {
    fontSize: 14,
  },
});

export default BasicInfo;
