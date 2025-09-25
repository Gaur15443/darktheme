import React, {useEffect} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {Card, useTheme, Text} from 'react-native-paper';

import {BasicFactIcon} from '../../images';
import {MarriageDetailsIcon} from '../../images';
import {EducationHistoryIcon} from '../../images';
import {WorkHistoryIcon} from '../../images';
import {MedicalHistoryIcon} from '../../images';
import {CommunityHistoryIcon} from '../../images';
import {FacebookIcon} from '../../images';
import {ConnectionsIcon} from '../../images';
import {InstagramIcon} from '../../images';
import {TwitterIcon} from '../../images';
import {EditIcon} from '../../images';
import {fetchUserProfile} from '../../store/apps/fetchUserProfile';
import {useDispatch, useSelector} from 'react-redux';
import moment from 'moment';
import Toast from 'react-native-toast-message';
import Animated, {FadeInDown} from 'react-native-reanimated';
import {useNavigation} from '@react-navigation/native';

const InfoTabContent = () => {
  const theme = useTheme();
  const navigation = useNavigation();

  const dispatch = useDispatch();
  const userId = useSelector(state => state?.userInfo._id);
  // const basicInfo = useSelector(
  //   state => state?.fetchUserProfile?.data?.myProfile,
  // );
  const basicInfo = useSelector(
    state => state?.fetchUserProfile?.basicInfo[userId]?.myProfile,
  );
  useEffect(() => {
    try {
      const getUserDetails = async () => {
        await dispatch(fetchUserProfile(userId)).unwrap();
      };

      getUserDetails();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  }, [dispatch, fetchUserProfile]);

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
    navigation.navigate('ConnectionInfo');
  };
  const GotoAddCommunityInfo = () => {
    navigation.navigate('CommunityInfo');
  };
  const GotoAddMedicalInfo = () => {
    navigation.navigate('MedicalInfo');
  };
  const GotoAddWorkInfo = () => {
    navigation.navigate('WorkInfo');
  };
  const GotoAddEducationInfo = () => {
    navigation.navigate('EducationInfo');
  };
  const GotoAddBasicInfo = () => {
    navigation.navigate('BasicFact');
  };
  const GotoAddMarriageInfo = () => {
    navigation.navigate('MarriageInfo');
  };
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View
          entering={FadeInDown.delay(100)
            .damping(20)
            .duration(500)
            .springify()}>
          <View style={styles.container}>
            {/* Basic Facts */}
            <View
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
                  <BasicFactIcon />
                  <Text
                    style={{fontWeight: 'bold', marginLeft: 10, fontSize: 18}}>
                    Basic Facts
                  </Text>
                </View>
                <TouchableOpacity
                  style={{position: 'absolute', bottom: 0, right: 0}}
                  onPress={() => GotoAddBasicInfo()}
                  testID="editBasic">
                  <EditIcon />
                </TouchableOpacity>
              </View>
              <Card.Content>
                {basicInfo?.personalDetails?.name && (
                  <View style={{paddingTop: 4}}>
                    <Text
                      style={[
                        styles.heading,
                        {color: theme.colors.blackHalti},
                      ]}>
                      Full Name
                    </Text>
                    <Text
                      style={[
                        styles.content,
                        {color: theme.colors.infoContentColor},
                      ]}>
                      {`${basicInfo?.personalDetails?.name || ''}${basicInfo?.personalDetails?.middlename ? ` ${basicInfo?.personalDetails?.middlename}` : ''} ${basicInfo?.personalDetails?.lastname || ''}`}
                    </Text>
                  </View>
                )}
                {basicInfo?.personalDetails?.gender && (
                  <View style={{paddingTop: 4}}>
                    <Text
                      style={[
                        styles.heading,
                        {color: theme.colors.blackHalti},
                      ]}>
                      Gender
                    </Text>
                    <Text
                      style={[
                        styles.content,
                        {color: theme.colors.infoContentColor},
                      ]}>
                      {basicInfo.personalDetails.gender
                        .charAt(0)
                        .toUpperCase() +
                        basicInfo.personalDetails.gender.slice(1).toLowerCase()}
                    </Text>
                  </View>
                )}
                {basicInfo?.birthDetails?.dob && basicInfo?.BD_Flag && (
                  <View style={{paddingTop: 4}}>
                    <Text
                      style={[
                        styles.heading,
                        {color: theme.colors.blackHalti},
                      ]}>
                      Birth Date
                    </Text>
                    <Text
                      style={[
                        styles.content,
                        {color: theme.colors.infoContentColor},
                      ]}>
                      {basicInfo?.isAroundDOB === true && <Text>~</Text>}
                      {convertToYear(
                        basicInfo?.birthDetails?.dob,
                        basicInfo?.BD_Flag,
                      )}
                    </Text>
                  </View>
                )}
                {basicInfo?.location?.placeOfBirth && (
                  <View style={{paddingTop: 4}}>
                    <Text
                      style={[
                        styles.heading,
                        {color: theme.colors.blackHalti},
                      ]}>
                      Born in
                    </Text>
                    <Text
                      style={[
                        styles.content,
                        {color: theme.colors.infoContentColor},
                      ]}>
                      {basicInfo?.location?.placeOfBirth?.length
                        ? basicInfo?.location?.placeOfBirth
                        : (basicInfo?.location?.placeOfBirth
                            ?.formatted_address ?? '')}
                    </Text>
                  </View>
                )}
                {basicInfo?.location?.currentlocation && (
                  <View style={{paddingTop: 4}}>
                    <Text
                      style={[
                        styles.heading,
                        {color: theme.colors.blackHalti},
                      ]}>
                      Currently living in
                    </Text>
                    <Text
                      style={[
                        styles.content,
                        {color: theme.colors.infoContentColor},
                      ]}>
                      {basicInfo?.location?.currentlocation?.length
                        ? basicInfo?.location?.currentlocation
                        : (basicInfo?.location?.currentlocation
                            ?.formatted_address ?? '')}
                    </Text>
                  </View>
                )}
                {basicInfo?.email && (
                  <View style={{paddingTop: 4}}>
                    <Text
                      style={[
                        styles.heading,
                        {color: theme.colors.blackHalti},
                      ]}>
                      Email
                    </Text>
                    <Text
                      style={[
                        styles.content,
                        {color: theme.colors.infoContentColor},
                      ]}>
                      {basicInfo?.email}
                    </Text>
                  </View>
                )}
                {basicInfo?.birthDetails?.dod &&
                  basicInfo?.DD_Flag &&
                  basicInfo?.personalDetails?.livingStatus === 'no' && (
                    <View style={{paddingTop: 4}}>
                      <Text
                        style={[
                          styles.heading,
                          {color: theme.colors.blackHalti},
                        ]}>
                        Death Date
                      </Text>
                      <Text
                        style={[
                          styles.content,
                          {color: theme.colors.infoContentColor},
                        ]}>
                        {basicInfo?.isAroundDOD === true && <Text>~</Text>}
                        {convertToYear(
                          basicInfo?.birthDetails?.dod,
                          basicInfo?.DD_Flag,
                        )}
                      </Text>
                    </View>
                  )}
                {basicInfo?.mobileNo && (
                  <View style={{paddingTop: 4}}>
                    <Text
                      style={[
                        styles.heading,
                        {color: theme.colors.blackHalti},
                      ]}>
                      Mobile Number
                    </Text>
                    <Text
                      style={[
                        styles.content,
                        {color: theme.colors.infoContentColor},
                      ]}>
                      +{basicInfo?.countryCode}{' '}
                      {basicInfo?.mobileNo % 10000000000}
                    </Text>
                  </View>
                )}
              </Card.Content>
            </View>

            {/* Marriage Details */}
            {basicInfo?.marriageDetails?.length > 0 && (
              <View
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
                  <View
                    style={{flexDirection: 'row', alignItems: 'flex-start'}}>
                    <MarriageDetailsIcon />
                    <Text
                      style={{
                        fontWeight: 'bold',
                        marginLeft: 10,
                        fontSize: 18,
                      }}>
                      Marriage Details
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={{position: 'absolute', bottom: 0, right: 0}}
                    onPress={() => GotoAddMarriageInfo()}
                    testID="editMarriage">
                    <EditIcon />
                  </TouchableOpacity>
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
                              ]}>
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
                              ]}>
                              Relationship Status:
                            </Text>
                            <Text
                              style={[
                                styles.content,
                                {color: theme.colors.infoContentColor},
                                {paddingLeft: 5},
                              ]}>
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
                              ]}>
                              Marriage Date:
                            </Text>
                            <Text
                              style={[
                                styles.content,
                                {color: theme.colors.infoContentColor},
                                {paddingLeft: 5},
                              ]}>
                              {marriagData?.isAroundDateOfMarraige === true && (
                                <Text>~</Text>
                              )}
                              {convertToYear(
                                marriagData?.marraigeDate,
                                marriagData?.MD_Flag_N,
                              )}
                            </Text>
                          </View>
                        )}

                        {marriagData?.location_of_wedding && (
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
                              ]}>
                              Wedding Location:
                            </Text>
                            <Text
                              numberOfLines={1}
                              ellipsizeMode="tail"
                              style={[
                                styles.content,
                                {paddingHorizontal: 5},
                                {paddingVertical: 5},
                                {flex: 1},
                                {color: theme.colors.infoContentColor},
                                {paddingLeft: 5},
                              ]}>
                              {marriagData?.location_of_wedding?.length
                                ? marriagData?.location_of_wedding
                                : (marriagData?.location_of_wedding
                                    ?.formatted_address ?? '')}
                            </Text>
                          </View>
                        )}
                      </View>
                    ))}
                </Card.Content>
              </View>
            )}

            {/* Education History */}
            <View
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
                  <EducationHistoryIcon />
                  <Text
                    style={{fontWeight: 'bold', marginLeft: 10, fontSize: 18}}>
                    Education History
                  </Text>
                </View>
                <TouchableOpacity
                  style={{position: 'absolute', bottom: 0, right: 0}}
                  onPress={() => GotoAddEducationInfo()}
                  testID="editEducation">
                  <EditIcon />
                </TouchableOpacity>
              </View>
              <Card.Content>
                {basicInfo?.educationDetails?.college &&
                  basicInfo?.educationDetails?.college?.map(
                    (college, index) => (
                      <View key={index} style={{marginBottom: 10}}>
                        {college.degree && (
                          <View style={{paddingTop: 4}}>
                            <Text
                              style={[
                                styles.heading,
                                {color: theme.colors.blackHalti},
                              ]}>
                              Degree
                            </Text>
                            <Text
                              style={[
                                styles.content,
                                {color: theme.colors.infoContentColor},
                              ]}>
                              {college.degree}
                            </Text>
                          </View>
                        )}
                        {college.name && (
                          <View style={{paddingTop: 4}}>
                            <Text
                              style={[
                                styles.heading,
                                {color: theme.colors.blackHalti},
                              ]}>
                              College Name
                            </Text>
                            <Text
                              style={[
                                styles.content,
                                {color: theme.colors.infoContentColor},
                              ]}>
                              {college.name}
                            </Text>
                          </View>
                        )}
                        {college?.address && (
                          <View style={{paddingTop: 4}}>
                            <Text
                              style={[
                                styles.heading,
                                {color: theme.colors.blackHalti},
                              ]}>
                              College Location
                            </Text>
                            <Text
                              style={[
                                styles.content,
                                {color: theme.colors.infoContentColor},
                              ]}>
                              {college?.address}
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
                              ]}>
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
                                {(college?.isAroundEducationStartDate ===
                                  true ||
                                  college?.isAroundEducationEndDate ===
                                    true) && <Text>~</Text>}
                                {college?.fromDate
                                  ? new Date(college?.fromDate)?.getFullYear()
                                  : new Date(
                                      college?.dateOfFrom,
                                    )?.getFullYear()}
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
                                  ]}>
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
                                ]}>
                                {college?.toDate
                                  ? new Date(college?.toDate)?.getFullYear()
                                  : new Date(college?.dateOfTo)?.getFullYear()}
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
                                  ]}>
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
                                  ]}>
                                  Present
                                </Text>
                              </View>
                            )}
                        </View>
                      </View>
                    ),
                  )}
              </Card.Content>
            </View>

            {/* Work History */}
            <View
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
                  <WorkHistoryIcon />
                  <Text
                    style={{fontWeight: 'bold', marginLeft: 10, fontSize: 18}}>
                    Work History
                  </Text>
                </View>
                <TouchableOpacity
                  style={{position: 'absolute', bottom: 0, right: 0}}
                  onPress={() => GotoAddWorkInfo()}
                  testID="editWork">
                  <EditIcon />
                </TouchableOpacity>
              </View>
              <Card.Content>
                {basicInfo?.workDetails &&
                  basicInfo?.workDetails?.map((work, index) => (
                    <View key={index}>
                      {(work?.dateOfFrom ||
                        work?.fromDate ||
                        work?.dateOfTo ||
                        work?.toDate) && (
                        <Text
                          style={[
                            styles.heading,
                            {color: theme.colors.blackHalti},
                          ]}>
                          Experience
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
                              <Text>~</Text>
                            )}
                            {work?.fromDate
                              ? new Date(work?.fromDate)?.getFullYear()
                              : new Date(work?.dateOfFrom)?.getFullYear()}
                          </Text>
                        )}
                        {(work?.dateOfFrom !== null ||
                          work?.fromDate !== null) &&
                          (work?.dateOfTo
                            ? work?.dateOfTo !== null
                            : null || work?.toDate !== null) && (
                            <View style={{paddingHorizontal: 4}}>
                              <Text
                                style={[
                                  styles.content,
                                  {color: theme.colors.infoContentColor},
                                ]}>
                                -
                              </Text>
                            </View>
                          )}
                        {(work?.dateOfFrom || work?.fromDate) &&
                          work?.isPresentlyWorking === true && (
                            <View style={{paddingHorizontal: 4}}>
                              <Text
                                style={[
                                  styles.content,
                                  {color: theme.colors.infoContentColor},
                                ]}>
                                -
                              </Text>
                            </View>
                          )}
                        {(work?.dateOfTo || work?.toDate) && (
                          <Text
                            style={[
                              styles.content,
                              {color: theme.colors.infoContentColor},
                            ]}>
                            {work?.toDate
                              ? new Date(work?.toDate)?.getFullYear()
                              : new Date(work?.dateOfTo)?.getFullYear()}
                          </Text>
                        )}
                        {(work?.dateOfFrom || work?.fromDate) &&
                          work?.isPresentlyWorking === true && (
                            <Text
                              style={[
                                styles.content,
                                {color: theme.colors.infoContentColor},
                              ]}>
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
                            ]}>
                            Company Name
                          </Text>
                          <Text
                            style={[
                              styles.content,
                              {color: theme.colors.infoContentColor},
                            ]}>
                            {work.company_name}
                          </Text>
                        </View>
                      )}
                      {work.company_role && (
                        <View>
                          <Text
                            style={[
                              styles.heading,
                              {color: theme.colors.blackHalti},
                            ]}>
                            Company Role
                          </Text>
                          <Text
                            style={[
                              styles.content,
                              {color: theme.colors.infoContentColor},
                            ]}>
                            {work?.company_role}
                          </Text>
                        </View>
                      )}
                    </View>
                  ))}
              </Card.Content>
            </View>

            {/* Medical History */}
            <View
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
                  <MedicalHistoryIcon />
                  <Text
                    style={{fontWeight: 'bold', marginLeft: 10, fontSize: 18}}>
                    Medical History
                  </Text>
                </View>
                <TouchableOpacity
                  style={{position: 'absolute', bottom: 0, right: 0}}
                  onPress={() => GotoAddMedicalInfo()}
                  testID="editMedical">
                  <EditIcon />
                </TouchableOpacity>
              </View>
              <Card.Content>
                {basicInfo?.medicalDetails?.bloodgroup && (
                  <View style={{paddingTop: 4}}>
                    <Text
                      style={[
                        styles.heading,
                        {color: theme.colors.blackHalti},
                      ]}>
                      Blood Group
                    </Text>
                    <Text
                      style={[
                        styles.content,
                        {color: theme.colors.infoContentColor},
                      ]}>
                      {basicInfo?.medicalDetails?.bloodgroup}
                    </Text>
                  </View>
                )}
                {basicInfo?.medicalDetails?.chronic_condition?.length > 0 &&
                  basicInfo?.medicalDetails?.chronic_condition?.some(
                    condition =>
                      condition.name !== '' && condition.name !== null,
                  ) && (
                    <View style={{paddingTop: 4}}>
                      <Text
                        style={[
                          styles.heading,
                          {color: theme.colors.blackHalti},
                        ]}>
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
                                  ]}>
                                  {chronic.name}
                                </Text>
                              )}
                            </View>
                          ),
                        )}
                    </View>
                  )}
                {basicInfo?.medicalDetails?.allergies?.length > 0 &&
                  basicInfo?.medicalDetails?.allergies?.some(
                    condition =>
                      condition.name !== '' && condition.name !== null,
                  ) && (
                    <View style={{paddingTop: 4}}>
                      <Text
                        style={[
                          styles.heading,
                          {color: theme.colors.blackHalti},
                        ]}>
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
                                  ]}>
                                  {allergy?.name}
                                </Text>
                              )}
                            </View>
                          ),
                        )}
                    </View>
                  )}
                {basicInfo?.medicalDetails?.illnesses?.length > 0 &&
                  basicInfo?.medicalDetails?.illnesses?.some(
                    condition =>
                      condition.name !== '' && condition.name !== null,
                  ) && (
                    <View style={{paddingTop: 4}}>
                      <Text
                        style={[
                          styles.heading,
                          {color: theme.colors.blackHalti},
                        ]}>
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
                                  ]}>
                                  {heridity?.name}
                                </Text>
                              )}
                            </View>
                          ),
                        )}
                    </View>
                  )}
              </Card.Content>
            </View>

            {/* Community History */}
            <View
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
                  <CommunityHistoryIcon />
                  <Text
                    style={{fontWeight: 'bold', marginLeft: 10, fontSize: 18}}>
                    Community Details
                  </Text>
                </View>

                <TouchableOpacity
                  style={{position: 'absolute', bottom: 0, right: 0}}
                  onPress={() => GotoAddCommunityInfo()}
                  testID="editCommunity">
                  <EditIcon />
                </TouchableOpacity>
              </View>
              <Card.Content>
                {basicInfo?.moreInfo?.religion && (
                  <View style={{paddingTop: 4}}>
                    <Text
                      style={[
                        styles.heading,
                        {color: theme.colors.blackHalti},
                      ]}>
                      Religion
                    </Text>
                    <Text
                      style={[
                        styles.content,
                        {color: theme.colors.infoContentColor},
                      ]}>
                      {basicInfo?.moreInfo?.religion}
                    </Text>
                  </View>
                )}
                {basicInfo?.moreInfo?.community && (
                  <View style={{paddingTop: 4}}>
                    <Text
                      style={[
                        styles.heading,
                        {color: theme.colors.blackHalti},
                      ]}>
                      Community
                    </Text>
                    <Text
                      style={[
                        styles.content,
                        {color: theme.colors.infoContentColor},
                      ]}>
                      {basicInfo?.moreInfo?.community}
                    </Text>
                  </View>
                )}
                {basicInfo?.moreInfo?.subcommunity && (
                  <View style={{paddingTop: 4}}>
                    <Text
                      style={[
                        styles.heading,
                        {color: theme.colors.blackHalti},
                      ]}>
                      Sub-Community
                    </Text>
                    <Text
                      style={[
                        styles.content,
                        {color: theme.colors.infoContentColor},
                      ]}>
                      {basicInfo?.moreInfo?.subcommunity}
                    </Text>
                  </View>
                )}
                {basicInfo?.moreInfo?.motherTounge && (
                  <View style={{paddingTop: 4}}>
                    <Text
                      style={[
                        styles.heading,
                        {color: theme.colors.blackHalti},
                      ]}>
                      Mother Tongue
                    </Text>
                    <Text
                      style={[
                        styles.content,
                        {color: theme.colors.infoContentColor},
                      ]}>
                      {basicInfo?.moreInfo?.motherTounge}
                    </Text>
                  </View>
                )}
                {basicInfo?.moreInfo?.gothra && (
                  <View style={{paddingTop: 4}}>
                    <Text
                      style={[
                        styles.heading,
                        {color: theme.colors.blackHalti},
                      ]}>
                      Gothra
                    </Text>
                    <Text
                      style={[
                        styles.content,
                        {color: theme.colors.infoContentColor},
                      ]}>
                      {basicInfo?.moreInfo?.gothra}
                    </Text>
                  </View>
                )}
                {basicInfo?.moreInfo?.priestName && (
                  <View style={{paddingTop: 4}}>
                    <Text
                      style={[
                        styles.heading,
                        {color: theme.colors.blackHalti},
                      ]}>
                      Priest Name
                    </Text>
                    <Text
                      style={[
                        styles.content,
                        {color: theme.colors.infoContentColor},
                      ]}>
                      {basicInfo?.moreInfo?.priestName}
                    </Text>
                  </View>
                )}
                {basicInfo?.moreInfo?.deity && (
                  <View style={{paddingTop: 4}}>
                    <Text
                      style={[
                        styles.heading,
                        {color: theme.colors.blackHalti},
                      ]}>
                      Deity
                    </Text>
                    <Text
                      style={[
                        styles.content,
                        {color: theme.colors.infoContentColor},
                      ]}>
                      {basicInfo?.moreInfo?.deity}
                    </Text>
                  </View>
                )}
                {basicInfo?.moreInfo?.ancestorVillage && (
                  <View style={{paddingTop: 4}}>
                    <Text
                      style={[
                        styles.heading,
                        {color: theme.colors.blackHalti},
                      ]}>
                      Ancestral Village
                    </Text>
                    <Text
                      style={[
                        styles.content,
                        {color: theme.colors.infoContentColor},
                      ]}>
                      {basicInfo?.moreInfo?.ancestorVillage}
                    </Text>
                  </View>
                )}
              </Card.Content>
            </View>

            {/* Connections */}
            <View
              style={[
                styles.card,
                {marginBottom: 150},
                {backgroundColor: theme.colors.onSecondary},
              ]}>
              <View>
                <View
                  style={{
                    position: 'relative',
                    marginLeft: 15,
                    marginTop: 10,
                    marginBottom: 10,
                    marginRight: 10,
                  }}>
                  <View
                    style={{flexDirection: 'row', alignItems: 'flex-start'}}>
                    <ConnectionsIcon />
                    <Text
                      style={{
                        fontWeight: 'bold',
                        marginLeft: 10,
                        fontSize: 18,
                      }}>
                      Social Media
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={{position: 'absolute', bottom: 0, right: 0}}
                    onPress={() => GotoAddConnectionInfo()}
                    testID="editConnection">
                    <EditIcon />
                  </TouchableOpacity>
                </View>
                <Card.Content style={{paddingTop: 6}}>
                  {basicInfo?.sociallinks &&
                    basicInfo?.sociallinks?.map((social, index) => (
                      <View key={index}>
                        <View
                          style={{flexDirection: 'row', alignItems: 'center'}}>
                          {social.account === 'facebook' && <FacebookIcon />}
                          {social.account === 'Insta' && <InstagramIcon />}
                          {social.account === 'Twitter' && <TwitterIcon />}

                          <Text
                            numberOfLines={1}
                            ellipsizeMode="tail"
                            style={[
                              styles.content,
                              {paddingHorizontal: 5},
                              {paddingVertical: 5},
                              {flex: 1},
                            ]}>
                            {social?.link}
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
                          ]}>
                          {social?.link}
                        </Text>
                      </View>
                    ))}
                </Card.Content>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Ensure the container takes up the full height
    alignItems: 'center',
    justifyContent: 'center',
    // marginVertical: 'auto',
    marginBottom: 500,
  },

  card: {
    width: '98%',
    padding: 5,
    marginVertical: 8,
    marginLeft: 3,
    marginRight: 3,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  heading: {
    fontSize: 16,
  },
  content: {
    fontSize: 14,
  },
});

export default InfoTabContent;
