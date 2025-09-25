import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import {useTheme, Text} from 'react-native-paper';
import {GlobalStyle} from '../../../core';
import {CustomButton} from '../../../core';

import {useDispatch, useSelector} from 'react-redux';
import Confirm from '../../Confirm';
import {getAdduserProfiles} from '../../../store/apps/addUserProfile';
import ConnectionDeleteIcon from '../../../core/icon/connection-delete-icon';
import {useNavigation} from '@react-navigation/native';
import {fetchUserProfile} from '../../../store/apps/fetchUserProfile';
import {GlobalHeader, CustomInput} from '../../../components';
import useNativeBackHandler from './../../../hooks/useBackHandler';
import Toast from 'react-native-toast-message';
import { desanitizeInput } from '../../../utils/sanitizers';

const ConnectionInfo = ({route}) => {
  const id = route.params ? route.params.id : undefined;

  const styles = StyleSheet.create({
    textInputStyle: {
      border: '0px solid #ccc6c6',
      marginTop: 15,
    },
  });
  useNativeBackHandler(handleBack);
  const theme = useTheme();
  const navigation = useNavigation();

  const dispatch = useDispatch();
  const userInfo = useSelector(state => state?.userInfo);
  const userId = id ? id : userInfo._id;

  const basicInfo = useSelector(
    state => state?.fetchUserProfile?.data?.myProfile,
  );
  const [other, setOtherSocialLinks] = useState([
    {account: 'Other social media', link: ''},
  ]);
  const [facebooklink, setFacebookLink] = useState('');
  const [openConfirmPopup, seOpenConfirmPopup] = useState(false);
  const [loading, setLoading] = useState(false);

  const [instagramlink, setInstagramLink] = useState('');
  const [twitterlink, setTwitterLink] = useState('');

  const handleAddOtherSocialMedia = () => {
    setOtherSocialLinks([...other, {account: 'Other social media', link: ''}]);
  };

  const handleDeleteOtherSocial = index => {
    const updatedLinks = [...other];
    updatedLinks.splice(index, 1);
    setOtherSocialLinks(updatedLinks);
  };

  const handleClose = async () => {
    await dispatch(fetchUserProfile(userId)).unwrap();
    setLoading(false);
    navigation.goBack();
  };

  useEffect(() => {
    if (basicInfo && basicInfo.sociallinks) {
      basicInfo.sociallinks.forEach(item => {
        if (item.account === 'facebook') {
          setFacebookLink(item.link);
        } else if (item.account === 'Twitter') {
          setTwitterLink(item.link);
        } else if (item.account === 'Insta') {
          setInstagramLink(item.link);
        }
      });
    }

    setOtherSocialLinks(basicInfo?.other ? basicInfo.other : []);
  }, [basicInfo]);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const sociallinks = [];

      if (facebooklink !== null && facebooklink !== '') {
        sociallinks.push({
          account: 'facebook',
          link: facebooklink,
        });
      }

      if (instagramlink !== null && instagramlink !== '') {
        sociallinks.push({
          account: 'Insta',
          link: instagramlink,
        });
      }

      if (twitterlink !== null && twitterlink !== '') {
        sociallinks.push({
          account: 'Twitter',
          link: twitterlink,
        });
      }
      const filteredOther = other.filter(item => item.link !== '');
      let allClinks = [];
      if (basicInfo?.cLink?.length > 0) {
        allClinks = basicInfo?.cLink.flatMap(link => link?.linkId);
        allClinks = [...allClinks, basicInfo?._id];
      }
      const formData = {
        sociallinks,
        other: filteredOther,
        userId,
        cLinks: basicInfo?.cLink?.length ? allClinks : [],
        cloneOwner: basicInfo?.isClone
          ? basicInfo?.cLink?.[0]?.linkId?.[0]
          : null,
        clinkIsPresent: basicInfo?.cLink?.length > 0 ? true : false,
      };

      await dispatch(getAdduserProfiles(formData))
        .unwrap()
        .then(() => handleClose());
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  };
  function handleBack() {
    if (
      facebooklink !== '' ||
      instagramlink !== '' ||
      twitterlink !== '' ||
      other.length > 0
    ) {
      seOpenConfirmPopup(true);
    } else {
      seOpenConfirmPopup(false);
      navigation.goBack();
    }
  }

  return (
    <>
      <GlobalHeader
        onBack={handleBack}
        heading={'Social Media'}
        backgroundColor={theme.colors.background}
      />
      <KeyboardAvoidingView enabled={true} behavior="padding">
        <ScrollView keyboardShouldPersistTaps="always">
          <GlobalStyle>
            <View>
              {openConfirmPopup && (
                <Confirm
                  accessibilityLabel="connection-confirm-popup"
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
              <View>
                <CustomInput
                  accessibilityLabel="Facebook"
                  name="Facebook"
                  testID="Facebook"
                  mode="outlined"
                  label="Facebook"
                  clearable
                  style={[styles.textInputStyle, {backgroundColor: 'white'}]}
                  onChangeText={text => setFacebookLink(text)}
                  value={desanitizeInput(facebooklink)}
                  outlineColor={theme.colors.altoGray}
                />
              </View>
              <View>
                <CustomInput
                  accessibilityLabel="Instagram"
                  name="Instagram"
                  testID="Instagram"
                  mode="outlined"
                  label="Instagram"
                  clearable
                  style={[styles.textInputStyle, {backgroundColor: 'white'}]}
                  onChangeText={text => setInstagramLink(text)}
                  value={desanitizeInput(instagramlink)}
                  outlineColor={theme.colors.altoGray}
                />
              </View>
              <View>
                <CustomInput
                  accessibilityLabel="Twitter"
                  name="Twitter"
                  testID="Twitter"
                  mode="outlined"
                  label="Twitter"
                  clearable
                  style={[styles.textInputStyle, {backgroundColor: 'white'}]}
                  onChangeText={text => setTwitterLink(text)}
                  value={desanitizeInput(twitterlink)}
                  outlineColor={theme.colors.altoGray}
                />
              </View>
              {other.map((otherSocialLink, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <CustomInput
                    accessibilityLabel={`OtherSocialMedia[${index}].Id`}
                    name={`OtherSocialMedia[${index}].name`}
                    testID={`OtherSocialMedia[${index}].Id`}
                    mode="outlined"
                    label="Other social media"
                    clearable
                    style={[
                      styles.textInputStyle,
                      {backgroundColor: 'white'},
                      {flex: 1, marginRight: 8},
                    ]} // Add flex: 1 to make TextInput expand and marginRight to create space between TextInput and delete icon
                    onChangeText={text => {
                      const updatedLinks = [...other];
                      updatedLinks[index] = {...index};
                      updatedLinks[index].link = text;
                      setOtherSocialLinks(updatedLinks);
                    }}
                    value={desanitizeInput(otherSocialLink.link)}
                    outlineColor={theme.colors.altoGray}
                  />
                  <Text
                    onPress={() => handleDeleteOtherSocial(index)}
                    style={{
                      marginTop: 20,
                      flexDirection: 'row',
                      justifyContent: 'flex-end',
                      alignItems: 'flex-end',
                    }}
                    accessibilityLabel={`connectionDelete${index}`}
                    testID={`connectionDelete${index}`}>
                    {' '}
                    {/* Use Text for delete icon */}
                    <ConnectionDeleteIcon
                      accessibilityLabel={`connectionDelete${index}`}
                    />
                  </Text>
                </View>
              ))}
              <Text
                style={{
                  color: theme.colors.primary,
                  fontSize: 15,
                  marginTop: 25,
                  fontWeight: 500,
                }}
                onPress={handleAddOtherSocialMedia}
                testID={'connectionAddMore'}
                accessibilityLabel={'connectionAddMore'}>
                Add more
              </Text>
            </View>
            <View style={[styles.row, {paddingTop: 20, marginBottom: 100}]}>
              <View style={styles.column12}>
                <CustomButton
                  accessibilityLabel={'addConnectionBtn'}
                  testID="addConnectionBtn"
                  className="addConnectionBtn"
                  label={'Save'}
                  onPress={() => handleSubmit()}
                  loading={loading}
                  disabled={loading}
                />
              </View>
            </View>
          </GlobalStyle>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default ConnectionInfo;
